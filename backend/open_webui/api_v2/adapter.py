"""
OpenWebUI Adapter for API v2

This module provides the integration layer between API v2 and existing Open WebUI functionality.
It wraps existing services like file processing, model management, and authentication.
"""

import asyncio
import gc
import logging
import psutil
import time
from typing import Dict, Any, Optional, List, Tuple
from uuid import uuid4

from fastapi import UploadFile, HTTPException, Request
from open_webui.models.users import UserModel
from open_webui.models.files import Files, FileForm
import os
from open_webui.models.models import Models
from open_webui.storage.provider import Storage
from open_webui.config import (
    API_V2_ENABLED,
    API_V2_MAX_FILE_SIZE, 
    API_V2_MAX_CONCURRENT,
    API_V2_TIMEOUT,
    API_V2_ADMIN_MODEL,
    API_V2_ADMIN_CONFIG
)

# Import existing OpenWebUI processing functions
from open_webui.routers.retrieval import process_file, ProcessFileForm
from open_webui.retrieval.utils import get_sources_from_files
from open_webui.utils.task import rag_template

from .models import (
    TaskStatus, 
    TaskResponse, 
    StatusResponse, 
    ErrorDetail, 
    ErrorType,
    UploadFileInfo
)

log = logging.getLogger(__name__)


class OpenWebUIAdapter:
    """
    Adapter class that integrates API v2 with existing Open WebUI functionality.
    
    This class provides a clean interface for:
    - File upload and processing
    - Model management and selection
    - Task execution and monitoring
    - Memory and resource management
    """
    
    def __init__(self):
        self.tasks: Dict[str, Dict[str, Any]] = {}
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self._cleanup_interval = 3600  # 1 hour cleanup interval
        self._last_cleanup = time.time()
    
    async def upload_file(
        self, 
        file: UploadFile, 
        user: UserModel,
        max_size: Optional[int] = None
    ) -> UploadFileInfo:
        """
        Upload a file using the existing Open WebUI storage system.
        
        Args:
            file: The uploaded file
            user: The authenticated user
            max_size: Maximum file size override
            
        Returns:
            UploadFileInfo with file details
            
        Raises:
            HTTPException: If upload fails or file is too large
        """
        try:
            # Check file size
            max_file_size = max_size or API_V2_MAX_FILE_SIZE.value
            file_size = 0
            
            # Read file content to get size
            content = await file.read()
            file_size = len(content)
            
            if file_size > max_file_size:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size: {max_file_size / (1024*1024):.1f}MB"
                )
            
            # Reset file pointer
            await file.seek(0)
            
            # Generate unique filename
            file_id = str(uuid4())
            filename = f"{file_id}_{file.filename}"
            
            # Upload using existing Storage system
            contents, file_path = Storage.upload_file(file.file, filename)
            
            # Create file record in database
            file_form = FileForm(
                id=file_id,
                filename=file.filename,
                path=file_path,
                content_type=file.content_type or "application/octet-stream",
                size=file_size,
                user_id=user.id,
                data={
                    "api_v2": True,
                    "uploaded_via": "api_v2",
                    "original_filename": file.filename
                }
            )
            
            file_item = Files.insert_new_file(user.id, file_form)
            
            return UploadFileInfo(
                filename=file.filename,
                size=file_size,
                content_type=file.content_type or "application/octet-stream",
                file_id=file_id,
                uploaded_at=time.time()
            )
            
        except HTTPException:
            raise
        except Exception as e:
            log.error(f"File upload failed: {e}")
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    async def process_document(
        self,
        task_id: str,
        file_info: UploadFileInfo,
        prompt: str,
        user: UserModel,
        request: Request,
        model: Optional[str] = None,
        # Open WebUI native parameters
        pdf_extract_images: Optional[bool] = None,
        bypass_embedding_and_retrieval: Optional[bool] = None,
        rag_full_context: Optional[bool] = None,
        enable_hybrid_search: Optional[bool] = None,
        top_k: Optional[int] = None,
        top_k_reranker: Optional[int] = None,
        relevance_threshold: Optional[float] = None,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
        text_splitter: Optional[str] = None,
        content_extraction_engine: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Process a document using the existing Open WebUI pipeline.
        
        Args:
            task_id: Unique task identifier
            file_info: Information about the uploaded file
            prompt: User prompt for processing
            user: Authenticated user
            request: FastAPI request object
            model: Model override
            **kwargs: Additional processing parameters
            
        Returns:
            Processing results dictionary
        """
        try:
            # Update task status
            self.tasks[task_id]["status"] = TaskStatus.PROCESSING
            self.tasks[task_id]["started_at"] = time.time()
            
            # === LOAD FRESH CONFIG FROM DATABASE BEFORE PROCESSING ===
            
            # Load latest API v2 configuration from persistent storage
            from open_webui.config import API_V2_ADMIN_CONFIG
            current_api_v2_config = API_V2_ADMIN_CONFIG.value
            
            # Extract processing parameters from stored config
            stored_processing_config = {}
            if isinstance(current_api_v2_config, dict) and "processing" in current_api_v2_config:
                stored_processing_config = current_api_v2_config["processing"]
            
            log.info(f"🔄 Loaded fresh config from database: {stored_processing_config}")
            
            # === DYNAMIC CONFIGURATION WITH OPEN WEBUI NATIVE PARAMETERS ===
            
            # Save original configuration
            original_config = {}
            config_mappings = {
                'pdf_extract_images': 'PDF_EXTRACT_IMAGES',
                'bypass_embedding_and_retrieval': 'BYPASS_EMBEDDING_AND_RETRIEVAL', 
                'rag_full_context': 'RAG_FULL_CONTEXT',
                'enable_hybrid_search': 'ENABLE_RAG_HYBRID_SEARCH',
                'top_k': 'RAG_TOP_K',
                'top_k_reranker': 'RAG_TOP_K_RERANKER',
                'relevance_threshold': 'RAG_RELEVANCE_THRESHOLD',
                'chunk_size': 'CHUNK_SIZE',
                'chunk_overlap': 'CHUNK_OVERLAP',
                'text_splitter': 'TEXT_SPLITTER',
                'content_extraction_engine': 'CONTENT_EXTRACTION_ENGINE'
            }
            
            # Apply parameter overrides for this request
            local_vars = locals()
            for param_name, config_name in config_mappings.items():
                if hasattr(request.app.state.config, config_name):
                    original_config[config_name] = getattr(request.app.state.config, config_name)
                    
                    # Priority 1: Use explicit parameter from function call
                    param_value = local_vars.get(param_name)
                    if param_value is not None:
                        setattr(request.app.state.config, config_name, param_value)
                        log.info(f"🔧 Applied from parameter: {config_name} = {param_value}")
                    # Priority 2: Use value from database config
                    elif param_name in stored_processing_config:
                        stored_value = stored_processing_config[param_name]
                        setattr(request.app.state.config, config_name, stored_value)
                        log.info(f"🔧 Applied from database: {config_name} = {stored_value}")
            
            log.info(f"📁 Processing with dynamic config: OCR={getattr(request.app.state.config, 'PDF_EXTRACT_IMAGES', False)}, Bypass={getattr(request.app.state.config, 'BYPASS_EMBEDDING_AND_RETRIEVAL', False)}")
            
            # Update progress
            self.tasks[task_id]["progress"] = 10.0
            
            # OPTION 3: Get file from database and use Loader system directly
            file_item = Files.get_file_by_id(file_info.file_id)
            if not file_item:
                raise ValueError(f"File not found: {file_info.file_id}")
            
            log.info(f"🔍 Processing file: {file_item.filename}")
            log.info(f"🔍 File path: {file_item.path}")
            # Get content type from file metadata (same as web mode)
            content_type = file_item.meta.get("content_type") if file_item.meta else None
            log.info(f"🔍 Content type: {content_type}")
            
            # === ENHANCED VISION MODEL DETECTION AND PROCESSING ===
            file_ext = file_item.filename.lower().split('.')[-1] if '.' in file_item.filename else ""
            is_image = file_ext in ["png", "jpg", "jpeg", "gif", "bmp", "tiff", "webp"]
            # Use standard audio formats (relies on Open WebUI global audio configuration)
            is_audio = file_ext in ["mp3", "wav", "ogg", "m4a", "flac", "aac", "opus"]
            
            # Get current model from config
            from open_webui.config import API_V2_ADMIN_MODEL
            current_model = API_V2_ADMIN_MODEL.value if API_V2_ADMIN_MODEL.value else "auto"
            log.info(f"🔍 Current model: {current_model}, File type: {file_ext}, Is image: {is_image}")
            
            def detect_vision_capability(model_name):
                """Enhanced vision detection based on Open WebUI patterns"""
                if not model_name or model_name == "auto":
                    return False
                    
                model_lower = model_name.lower()
                
                # Known vision model patterns (same as web mode)
                vision_patterns = [
                    'llava', 'vision', 'minicpm', 'moondream', 'cogvlm',
                    'qwen.*vl', 'qwen2.*vl', 'qwen2\.5vl', 'internvl',
                    'yi.*vl', 'phi.*vision', 'pixtral',
                    'gemma.*vision', 'gemma3.*', 'gemma-3.*', 'nidum-gemma-3.*',
                    'mistral.*vision', 'mistral.*instruct.*2503', 'mistral-small.*instruct',
                    'llama.*vision', 'bakllava'
                ]
                
                import re
                for pattern in vision_patterns:
                    if re.search(pattern, model_lower):
                        return True
                        
                # Additional check for common vision models
                vision_keywords = ['vision', 'vl', 'visual', 'image', 'sight']
                return any(keyword in model_lower for keyword in vision_keywords)
            
            def validate_and_process_image(image_path):
                """Robust image processing with validation"""
                import base64
                import imghdr
                
                # Validate image file
                image_type = imghdr.what(image_path)
                if not image_type:
                    raise ValueError("Invalid image format or corrupted file")
                
                # Check file size (limit to 10MB)
                file_size = os.path.getsize(image_path)
                if file_size > 10 * 1024 * 1024:
                    raise ValueError(f"Image too large: {file_size} bytes (max 10MB)")
                
                # Read and encode image
                with open(image_path, "rb") as image_file:
                    image_bytes = image_file.read()
                    image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                    
                # Validate base64 encoding
                if not image_base64 or len(image_base64) < 100:
                    raise ValueError("Invalid base64 encoding")
                    
                return image_base64, image_type
            
            # Check vision mode configuration
            vision_mode = stored_processing_config.get("vision_mode", "auto")
            log.info(f"🔍 Vision mode config: {vision_mode}")
            
            # Determine if we should use vision processing
            if vision_mode == "force_vision":
                is_vision_model = True
                log.info(f"🔍 Vision mode FORCED: {current_model} -> True")
            elif vision_mode == "force_text":
                is_vision_model = False
                log.info(f"🔍 Vision mode DISABLED: {current_model} -> False (OCR forced)")
            else:  # auto
                is_vision_model = detect_vision_capability(current_model)
                log.info(f"🔍 Vision model auto-detection: {current_model} -> {is_vision_model}")
            
            # Track if vision processing was successful
            vision_processing_success = False
            
            if is_image and is_vision_model:
                try:
                    # Validate and process image
                    image_base64, detected_type = validate_and_process_image(file_item.path)
                    log.info(f"🖼️ Image validated: {detected_type}, size: {len(image_base64)} chars")
                    
                    # Create vision prompt
                    vision_prompt = f"Please analyze and describe this image in detail: {file_item.filename}"
                    
                    # Use Open WebUI unified format (supports all model sources: Ollama, OpenAI, etc.)
                    openai_message = {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": vision_prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/{detected_type};base64,{image_base64}"
                                }
                            }
                        ]
                    }
                    
                    log.info(f"🚀 Sending to {current_model} using Open WebUI native routing system...")
                    
                    # Use Open WebUI's native routing system (supports all configured servers)
                    from open_webui.routers.openai import generate_chat_completion as generate_openai_chat_completion
                    
                    # Format request using Open WebUI's format
                    chat_form_dict = {
                        "model": current_model,
                        "messages": [{
                            "role": "user",
                            "content": [
                                {"type": "text", "text": vision_prompt},
                                {
                                    "type": "image_url", 
                                    "image_url": {
                                        "url": f"data:image/{detected_type};base64,{image_base64}"
                                    }
                                }
                            ]
                        }],
                        "stream": False,
                        "temperature": stored_processing_config.get("temperature", 0.1),
                        "max_tokens": stored_processing_config.get("max_tokens", 4000)
                    }
                    
                    try:
                        # Use Open WebUI's native chat completion system
                        # This automatically handles routing to correct server (Ollama, OpenAI, etc.)
                        completion_result = await generate_openai_chat_completion(
                            request=request, 
                            form_data=chat_form_dict, 
                            user=user,
                            bypass_filter=True
                        )
                        
                        # Extract content from the completion result
                        if hasattr(completion_result, 'choices') and completion_result.choices:
                            vision_analysis = completion_result.choices[0].message.content
                        elif isinstance(completion_result, dict):
                            # Handle dict response format
                            choices = completion_result.get("choices", [])
                            if choices:
                                vision_analysis = choices[0].get("message", {}).get("content", "")
                            else:
                                vision_analysis = completion_result.get("content", "")
                        else:
                            # Fallback - try to get content directly
                            vision_analysis = str(completion_result)
                    
                    except Exception as routing_error:
                        log.warning(f"⚠️ Open WebUI routing failed: {routing_error}")
                        # Continue to raise the error for fallback handling
                        raise Exception(f"Vision routing error: {routing_error}")
                    
                    # Check if we got valid content
                    if vision_analysis and vision_analysis.strip():
                        log.info(f"✅ SUCCESS: Vision analysis completed. Length: {len(vision_analysis)} characters")
                        file_content = f"IMAGE ANALYSIS for {file_item.filename}:\n\n{vision_analysis}"
                        extraction_method = f"Vision Model Direct ({current_model})"
                        vision_processing_success = True
                    else:
                        raise Exception("Empty vision analysis response")
                        
                except Exception as vision_error:
                    log.warning(f"⚠️ Vision processing failed: {vision_error}")
                    log.info(f"🔄 Falling back to standard document processing...")
                    # Continue to standard processing below
                    file_content = ""
                    extraction_method = "Unknown"
            
            # === AUDIO PROCESSING WITH WHISPER ===
            audio_processing_success = False
            
            if is_audio and not vision_processing_success and file_item.path and os.path.exists(file_item.path):
                try:
                    log.info(f"🎵 Processing audio file: {file_item.filename} (using Open WebUI global audio config)")
                    
                    # Use Open WebUI's existing audio transcription system
                    from open_webui.routers.audio import transcribe
                    
                    # Transcribe audio using configured STT engine (Whisper Large v3)
                    transcription_result = transcribe(request, file_item.path)
                    
                    if transcription_result and transcription_result.get("text"):
                        audio_transcription = transcription_result["text"].strip()
                        log.info(f"✅ Audio transcription successful. Length: {len(audio_transcription)} characters")
                        
                        # Create content with audio metadata
                        file_content = f"TRANSCRIPTION AUDIO de {file_item.filename}:\n\n{audio_transcription}"
                        extraction_method = "Audio Transcription (Whisper)"
                        audio_processing_success = True
                        
                        # Update progress
                        self.tasks[task_id]["progress"] = 50.0
                        
                    else:
                        raise Exception("Empty transcription result")
                        
                except Exception as audio_error:
                    log.warning(f"⚠️ Audio transcription failed: {audio_error}")
                    log.info(f"🔄 Falling back to standard document processing...")
                    # Continue to standard processing below
                    file_content = ""
                    extraction_method = "Unknown"
            
            # STANDARD DOCUMENT PROCESSING (fallback or non-images/non-audio)
            if not vision_processing_success and not audio_processing_success and file_item.path and os.path.exists(file_item.path):
                try:
                    # Try standard loader first
                    from open_webui.retrieval.loaders.main import Loader
                    loader = Loader()
                    docs = loader.load(
                        filename=file_item.filename,
                        file_content_type=content_type or "application/octet-stream",
                        file_path=file_item.path
                    )
                    
                    # Extract content from documents
                    file_content = "\n".join([doc.page_content for doc in docs])
                    extraction_method = "Loader Direct"
                    
                    log.info(f"✅ SUCCESS: Content extracted via Loader. Length: {len(file_content)} characters")
                    
                except Exception as loader_error:
                    log.warning(f"⚠️ Loader failed: {loader_error}")
                    
                    # Fallback specifically for .doc files
                    if file_item.filename.lower().endswith('.doc'):
                        try:
                            log.info(f"🔄 Trying fallback for .doc file...")
                            from langchain_community.document_loaders import UnstructuredWordDocumentLoader
                            
                            fallback_loader = UnstructuredWordDocumentLoader(file_item.path)
                            docs = fallback_loader.load()
                            file_content = "\n".join([doc.page_content for doc in docs])
                            extraction_method = "UnstructuredWordDocumentLoader Fallback"
                            
                            log.info(f"✅ SUCCESS: .doc content extracted via fallback. Length: {len(file_content)} characters")
                            
                        except Exception as fallback_error:
                            log.error(f"❌ .doc fallback failed: {fallback_error}")
                            
                            # Last resort: try with pandoc if available
                            try:
                                log.info(f"🔄 Trying pandoc fallback for .doc...")
                                import subprocess
                                result = subprocess.run(
                                    ['pandoc', file_item.path, '-t', 'plain'],
                                    capture_output=True,
                                    text=True,
                                    timeout=30
                                )
                                if result.returncode == 0:
                                    file_content = result.stdout
                                    extraction_method = "Pandoc Fallback"
                                    log.info(f"✅ SUCCESS: .doc content extracted via pandoc. Length: {len(file_content)} characters")
                                else:
                                    raise Exception(f"Pandoc failed: {result.stderr}")
                            except Exception as pandoc_error:
                                log.error(f"❌ Pandoc fallback failed: {pandoc_error}")
                                file_content = ""
                                extraction_method = "All methods failed"
                    else:
                        # Re-raise error for non-.doc files
                        log.error(f"❌ Extraction failed for {file_item.filename}: {loader_error}")
                        file_content = ""
                        extraction_method = f"Failed: {str(loader_error)}"
            elif not vision_processing_success and not audio_processing_success:
                log.error(f"❌ File path not found or doesn't exist: {getattr(file_item, 'path', 'None')}")
                file_content = ""
                extraction_method = "File path not found"
            
            # Update progress
            self.tasks[task_id]["progress"] = 60.0
            
            # Get model configuration from admin settings
            from open_webui.config import API_V2_ADMIN_MODEL
            
            # Get available models using the same method as the web interface
            try:
                from open_webui.utils.models import get_all_models
                all_models = await get_all_models(request, user=user)
                
                # Handle both list and dict formats
                if isinstance(all_models, dict):
                    available_models = [model['id'] for model in all_models.get('data', [])]
                elif isinstance(all_models, list):
                    available_models = [model['id'] for model in all_models]
                else:
                    available_models = []
                
                if not available_models:
                    raise Exception("No models available in the system")
                    
                log.info(f"🤖 Found {len(available_models)} available models: {available_models[:3]}...")
                
            except Exception as e:
                log.error(f"Failed to get available models: {e}")
                raise Exception("No models available in the system")
            
            # Use specified model, fallback to admin config, then to first available
            admin_model = API_V2_ADMIN_MODEL.value
            selected_model = kwargs.get("model") or admin_model
            
            # Handle "auto" configuration or verify model exists
            if selected_model == "auto" or selected_model not in available_models:
                if available_models:
                    fallback_model = available_models[0]
                    if selected_model != "auto":
                        log.warning(f"Model '{selected_model}' not found. Using fallback: '{fallback_model}'")
                    selected_model = fallback_model
                else:
                    raise Exception("No models available in the system")
            
            admin_config = {"temperature": 0.7, "max_tokens": 8000}
            
            # Content injection (keep existing format)
            if file_content.strip():
                enriched_prompt = f"""Voici le contenu du document à analyser :

---
{file_content}
---

Question de l'utilisateur : {prompt}

Réponds en te basant sur le contenu du document ci-dessus."""
                
                log.info(f"✅ Content successfully injected. Method: {extraction_method}")
                log.info(f"✅ Format: {file_item.filename.split('.')[-1].upper()}")
                if file_content:
                    preview = file_content[:100].replace('\n', ' ')
                    log.info(f"✅ Content preview: {preview}...")
            else:
                log.warning(f"❌ No content extracted from {file_info.filename} using {extraction_method}")
                enriched_prompt = f"ATTENTION: Le fichier '{file_info.filename}' semble vide ou son contenu n'a pas pu être extrait.\n\nMéthode tentée: {extraction_method}\n\nQuestion de l'utilisateur : {prompt}\n\nJe ne peux pas traiter ce fichier car son contenu n'est pas accessible."
            
            # Prepare messages with enriched content
            messages = [
                {
                    "role": "user",
                    "content": enriched_prompt,  # ← PROMPT ENRICHI AVEC CONTENU
                    # Suppression de "files" car contenu inclus dans le prompt
                }
            ]
            
            # Generate response using existing chat completion
            chat_form = {
                "model": selected_model,
                "messages": messages,
                "temperature": kwargs.get("temperature", admin_config.get("temperature", 0.7)),
                "max_tokens": kwargs.get("max_tokens", admin_config.get("max_tokens", 8000)),
                "stream": False,
                "user_id": user.id,
                # Suppression de "files" car le contenu est maintenant inclus dans le prompt
            }
            
            # Execute chat completion using Open WebUI's native system
            from open_webui.utils.chat import generate_chat_completion
            completion_result = await generate_chat_completion(request, chat_form, user)
            
            # Update progress
            self.tasks[task_id]["progress"] = 100.0
            
            # Format results
            result = {
                "content": completion_result.get("choices", [{}])[0].get("message", {}).get("content", ""),
                "model_used": selected_model,
                "file_info": {
                    "filename": file_info.filename,
                    "size": file_info.size,
                    "type": content_type or file_info.content_type
                },
                "processing_metadata": {
                    "prompt_length": len(prompt),
                    "response_length": len(completion_result.get("choices", [{}])[0].get("message", {}).get("content", "")),
                    "extraction_method": extraction_method,
                    "content_length": len(file_content),
                    "model_config": {
                        "temperature": chat_form["temperature"],
                        "max_tokens": chat_form["max_tokens"]
                    }
                }
            }
            
            # Update task with completion
            self.tasks[task_id].update({
                "status": TaskStatus.COMPLETED,
                "result": result,
                "completed_at": time.time(),
                "processing_time": time.time() - self.tasks[task_id]["started_at"],
                "model_used": selected_model
            })
            
            # Cleanup memory
            await self._cleanup_task_memory(task_id)
            
            return result
            
        except Exception as e:
            log.error(f"Document processing failed for task {task_id}: {e}")
            
            # Update task with error
            self.tasks[task_id].update({
                "status": TaskStatus.FAILED,
                "error": str(e),
                "error_type": ErrorType.PROCESSING_ERROR,
                "failed_at": time.time()
            })
            
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
            
        finally:
            # === RESTORE ORIGINAL CONFIGURATION ===
            try:
                for config_name, original_value in original_config.items():
                    if hasattr(request.app.state.config, config_name):
                        setattr(request.app.state.config, config_name, original_value)
                        log.debug(f"🔄 Restored {config_name} = {original_value}")
            except Exception as restore_error:
                log.error(f"Failed to restore configuration: {restore_error}")
    
    def create_task(
        self, 
        user_id: str, 
        request_data: Dict[str, Any]
    ) -> str:
        """
        Create a new processing task.
        
        Args:
            user_id: User identifier
            request_data: Request parameters
            
        Returns:
            Task ID
        """
        task_id = str(uuid4())
        
        self.tasks[task_id] = {
            "task_id": task_id,
            "user_id": user_id,
            "status": TaskStatus.PENDING,
            "created_at": time.time(),
            "request_data": request_data,
            "progress": 0.0
        }
        
        return task_id
    
    def get_task_status(self, task_id: str) -> Optional[StatusResponse]:
        """
        Get the status of a task.
        
        Args:
            task_id: Task identifier
            
        Returns:
            StatusResponse or None if task not found
        """
        task_data = self.tasks.get(task_id)
        if not task_data:
            return None
        
        return StatusResponse(
            task_id=task_id,
            status=task_data["status"],
            progress=task_data.get("progress"),
            result=task_data.get("result"),
            error=task_data.get("error"),
            error_type=task_data.get("error_type"),
            created_at=task_data["created_at"],
            started_at=task_data.get("started_at"),
            completed_at=task_data.get("completed_at"),
            processing_time=task_data.get("processing_time"),
            model_used=task_data.get("model_used"),
            file_info=task_data.get("file_info"),
            memory_usage=task_data.get("memory_usage")
        )
    
    def get_available_models(self) -> List[Dict[str, Any]]:
        """
        Get list of available models from Open WebUI.
        
        Returns:
            List of model dictionaries
        """
        try:
            # Get models from Open WebUI Models table
            models = Models.get_models()
            
            # Filter for vision-capable models
            vision_models = []
            all_models = []
            
            for model in models:
                model_info = {
                    "id": model.id,
                    "name": model.name,
                    "meta": model.meta,
                    "capabilities": [],
                    "vision_capable": False
                }
                
                # Check if model supports vision
                if any(keyword in model.id.lower() for keyword in ["vision", "gpt-4", "claude-3", "llava", "gemini"]):
                    model_info["vision_capable"] = True
                    model_info["capabilities"].append("vision")
                    vision_models.append(model.id)
                
                all_models.append(model_info)
            
            return all_models
            
        except Exception as e:
            log.error(f"Failed to get available models: {e}")
            return []
    
    def check_concurrency_limit(self) -> bool:
        """
        Check if the current number of active tasks is below the limit.
        
        Returns:
            True if below limit, False otherwise
        """
        active_count = sum(
            1 for task in self.tasks.values() 
            if task["status"] == TaskStatus.PROCESSING
        )
        
        return active_count < API_V2_MAX_CONCURRENT.value
    
    def get_queue_position(self, task_id: str) -> Optional[int]:
        """
        Get the position of a task in the queue.
        
        Args:
            task_id: Task identifier
            
        Returns:
            Queue position or None
        """
        queued_tasks = [
            task for task in self.tasks.values()
            if task["status"] == TaskStatus.QUEUED
        ]
        
        # Sort by creation time
        queued_tasks.sort(key=lambda x: x["created_at"])
        
        for i, task in enumerate(queued_tasks):
            if task["task_id"] == task_id:
                return i + 1
        
        return None
    
    async def _cleanup_task_memory(self, task_id: str):
        """
        Clean up memory for a completed task.
        
        Args:
            task_id: Task identifier
        """
        try:
            # Force garbage collection
            gc.collect()
            
            # Get memory usage
            memory_info = psutil.virtual_memory()
            memory_usage = {
                "total_mb": memory_info.total / (1024 * 1024),
                "available_mb": memory_info.available / (1024 * 1024),
                "used_percent": memory_info.percent
            }
            
            # Store memory info in task
            if task_id in self.tasks:
                self.tasks[task_id]["memory_usage"] = memory_usage
            
            log.debug(f"Memory cleanup completed for task {task_id}. Memory usage: {memory_usage['used_percent']:.1f}%")
            
        except Exception as e:
            log.error(f"Memory cleanup failed for task {task_id}: {e}")
    
    async def cleanup_old_tasks(self):
        """
        Clean up old completed/failed tasks to prevent memory leaks.
        """
        try:
            current_time = time.time()
            cutoff_time = current_time - (24 * 3600)  # 24 hours
            
            tasks_to_remove = []
            for task_id, task_data in self.tasks.items():
                if (task_data["status"] in [TaskStatus.COMPLETED, TaskStatus.FAILED] and
                    task_data.get("completed_at", task_data.get("failed_at", current_time)) < cutoff_time):
                    tasks_to_remove.append(task_id)
            
            for task_id in tasks_to_remove:
                del self.tasks[task_id]
            
            if tasks_to_remove:
                log.info(f"Cleaned up {len(tasks_to_remove)} old tasks")
            
            self._last_cleanup = current_time
            
        except Exception as e:
            log.error(f"Task cleanup failed: {e}")
    
    def get_system_status(self) -> Dict[str, Any]:
        """
        Get current system status and metrics.
        
        Returns:
            System status dictionary
        """
        try:
            memory_info = psutil.virtual_memory()
            
            active_tasks = sum(
                1 for task in self.tasks.values()
                if task["status"] == TaskStatus.PROCESSING
            )
            
            queued_tasks = sum(
                1 for task in self.tasks.values()
                if task["status"] == TaskStatus.QUEUED
            )
            
            return {
                "enabled": API_V2_ENABLED.value,
                "active_tasks": active_tasks,
                "queued_tasks": queued_tasks,
                "max_concurrent": API_V2_MAX_CONCURRENT.value,
                "memory_usage": {
                    "used_percent": memory_info.percent,
                    "available_mb": memory_info.available / (1024 * 1024),
                    "total_mb": memory_info.total / (1024 * 1024)
                },
                "config": {
                    "max_file_size_mb": API_V2_MAX_FILE_SIZE.value / (1024 * 1024),
                    "timeout": API_V2_TIMEOUT.value,
                    "admin_model": API_V2_ADMIN_MODEL.value
                }
            }
            
        except Exception as e:
            log.error(f"Failed to get system status: {e}")
            return {"error": str(e)}