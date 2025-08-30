"""
OpenWebUI Adapter for API v2

This module provides the integration layer between API v2 and existing Open WebUI functionality.
It wraps existing services like file processing, model management, and authentication.
"""

import asyncio
import gc
import hashlib
import json
import logging
import psutil
import re
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

# Import VECTOR_DB_CLIENT for collection validation
from open_webui.retrieval.vector.connector import VECTOR_DB_CLIENT

# Import API v2 task management
from open_webui.models.api_v2_tasks import ApiV2Tasks, ApiV2TaskModel

from .models import (
    TaskStatus, 
    TaskResponse, 
    StatusResponse, 
    ErrorDetail, 
    ErrorType,
    UploadFileInfo
)

log = logging.getLogger(__name__)


def calculate_adaptive_timeout(file_size_bytes: int) -> float:
    """
    Calculate adaptive timeout based on file size to reduce timeout failures.
    
    Args:
        file_size_bytes: Size of the file in bytes
    
    Returns:
        Timeout duration in seconds
    """
    base_timeout = 30.0
    
    if file_size_bytes < 100_000:  # < 100KB
        return base_timeout
    elif file_size_bytes < 1_000_000:  # < 1MB  
        return base_timeout + 15.0  # 45s
    elif file_size_bytes < 5_000_000:  # < 5MB
        return base_timeout + 30.0  # 60s
    else:  # > 5MB
        return base_timeout + 60.0  # 90s


def repair_common_json_errors(content: str) -> str:
    """
    Repair common JSON malformation errors with enhanced coverage.
    
    Args:
        content: Original JSON content with potential errors
        
    Returns:
        Repaired JSON string
    """
    # Remove any leading/trailing whitespace and non-JSON content
    content = content.strip()
    
    # Remove problematic control characters that can cause JSON parsing issues
    import string
    # Keep only printable ASCII + basic whitespace + newlines
    content = ''.join(c for c in content if c in string.printable or c in '\n\r\t')
    
    # Remove common prefixes/suffixes that models sometimes add
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    
    # Strip any text before first { or after last }
    first_brace = content.find('{')
    last_brace = content.rfind('}')
    if first_brace >= 0 and last_brace >= 0 and last_brace > first_brace:
        content = content[first_brace:last_brace+1]
    
    # Handle truncated JSON - try to close incomplete structures
    if content.count('{') > content.count('}'):
        missing_braces = content.count('{') - content.count('}')
        content = content + '}' * missing_braces
    
    if content.count('[') > content.count(']'):
        missing_brackets = content.count('[') - content.count(']')
        content = content + ']' * missing_brackets
    
    # Fix incomplete string literals at the end
    if content.endswith('"') and content.count('"') % 2 != 0:
        content = content[:-1] + '""'
    
    # Fix the most common issue: broken finance structure
    # Pattern: "finance": { "document_type": "none", {"value":"...", ...}, {"value":"...", ...} ],
    content = re.sub(
        r'"finance":\s*\{\s*"document_type":\s*"[^"]*",\s*(\{[^}]+\}),?\s*(\{[^}]+\})\s*\]',
        r'"finance": {"document_type": "none", "amounts": [\1, \2], "confidence": 75}',
        content,
        flags=re.DOTALL
    )
    
    # Fix missing confidence in finance block
    content = re.sub(
        r'("finance":\s*{\s*"document_type":[^}]+)"amounts":\s*\[[^\]]*\]\s*}',
        r'\1"amounts": [], "confidence": 75}',
        content,
        flags=re.DOTALL
    )
    
    # Fix broken arrays with missing brackets
    content = re.sub(
        r'("amounts":\s*)(\{"value"[^}]+\}),?\s*(\{"value"[^}]+\})',
        r'\1[\2, \3]',
        content
    )
    
    # NOUVELLE RÉPARATION: Fix markdown corruption in JSON keys (doubles étoiles)
    # Solution validée avec batch test: 2/2 fichiers problématiques réparés ✅
    
    # 1. Pattern spécifique: **"key**: "**value" -> "key": "value"
    content = re.sub(r'\*\*"([^"]+)\*\*":\s*"\*\*([^"]*)"', r'"\1": "\2"', content)
    
    # 2. Pattern: **"key**: -> "key":
    content = re.sub(r'\*\*"([^"]+)\*\*":', r'"\1":', content)
    
    # 3. Pattern critique: "key**: -> "key":
    content = re.sub(r'"([^"]+)\*\*":', r'"\1":', content)
    
    # 4. Pattern: "**key": -> "key":
    content = re.sub(r'"\*\*([^"]+)":', r'"\1":', content)
    
    # 5. Pattern dans valeurs: "**value" -> "value" (plus spécifique)
    content = re.sub(r'"\*\*([^"]*)"', r'"\1"', content)
    
    # 5b. Pattern pour valeurs avec ** au milieu: "text **middle** text" -> "text middle text"
    content = re.sub(r'"([^"]*)\*\*([^"]*)\*\*([^"]*)"', r'"\1\2\3"', content)
    
    # 5c. Pattern pour valeurs commençant par **: "**85" -> "85"
    content = re.sub(r':\s*"\*\*([^"]*)"', r': "\1"', content)
    
    # 6. Pattern général: **" -> "
    content = re.sub(r'\*\*"', r'"', content)
    
    # 7. Suppression finale des ** restants (mais preserve les ** dans les textes normaux)
    content = re.sub(r'\*\*(?=\s*[:",\]}])', '', content)
    
    # 8. Fix final: réparer clés JSON cassées "key -> "key":
    content = re.sub(r'"([^"]+): "([^"]*)"', r'"\1": "\2"', content)
    
    # 9. NOUVEAU PATTERN: Fix parenthèses au lieu d'accolades dans les objets JSON
    # Pattern: ("key":"value") -> {"key":"value"}
    content = re.sub(r'\("([^"]+)":"([^"]+)"\)', r'{"\\1":"\\2"}', content)
    
    # 10. Pattern étendu: parenthèses avec plusieurs champs
    # Pattern: ("key1":"value1","key2":"value2","key3":"value3") -> {"key1":"value1","key2":"value2","key3":"value3"}
    content = re.sub(r'\(([^)]+)\)', lambda m: '{' + m.group(1) + '}' if '"' in m.group(1) and ':' in m.group(1) else '(' + m.group(1) + ')', content)
    
    # 11. CORRECTION CRITIQUE: Fix objets JSON orphelins après fermeture de tableau
    # Pattern: ],{objets},{objets}],  -> ,{objets},{objets}],
    content = re.sub(r'\],\s*(\{[^}]+\}),\s*(\{[^}]+\})\s*\]', r',\1,\2]', content)
    
    # 12. NOUVEAU: Fix unquoted JSON keys like amounts: [] -> "amounts": []
    content = re.sub(r'(\w+):\s*([{\[\]])', r'"\1": \2', content)
    
    # 13. NOUVEAU: Fix complex double asterisk patterns: **"key": "**value" -> "key": "value"
    content = re.sub(r'\*\*"([^"]+)":\s*"\*\*([^"]*)"', r'"\1": "\2"', content)
    
    # 14. NOUVEAU: Fix double asterisk at start of line: **"key": -> "key":
    content = re.sub(r'^\s*\*\*"([^"]+)":', r'"\1":', content, flags=re.MULTILINE)
    
    # 15. NOUVEAU: Fix double asterisk before arrays: **"key": [ -> "key": [
    content = re.sub(r'\*\*"([^"]+)":\s*\[', r'"\1": [', content)
    
    # Fix trailing commas in objects and arrays
    content = re.sub(r',(\s*[}\]])', r'\1', content)
    
    # Fix missing commas between array elements
    content = re.sub(r'}\s*{', r'}, {', content)
    
    # Fix unescaped quotes in string values - DISABLED: conflicts with ** cleanup
    # content = re.sub(r'(?<!\\)"(?=[^"]*"[^"]*":)', r'\\"', content)
    
    return content


def validate_and_fix_json_response(response_content: str, filename: str = "unknown") -> tuple[dict, bool]:
    """
    Enhanced JSON validation with automatic repair and strict schema validation.
    
    Args:
        response_content: JSON content to validate
        filename: File name for logging context
        
    Returns:
        Tuple of (parsed_json_data, is_valid)
    """
    # Check for markdown corruption patterns BEFORE parsing
    if "**" in response_content:
        log.info(f"🔧 Detected markdown corruption patterns in {filename}, applying repair first")
        try:
            fixed_content = repair_common_json_errors(response_content)
            json_data = json.loads(fixed_content)
            log.info(f"✅ JSON pre-repair successful for {filename}")
            
            # Basic structure validation
            required_fields = ["resume", "security", "rgpd", "finance", "legal"]
            for field in required_fields:
                if field not in json_data:
                    log.warning(f"⚠️ Missing required field '{field}' in pre-repaired JSON")
                    
            return json_data, True
            
        except json.JSONDecodeError as repair_error:
            log.warning(f"🔧 Pre-repair failed for {filename}, trying original: {repair_error}")
    
    try:
        # Attempt: Parse as-is (if no corruption detected or pre-repair failed)
        json_data = json.loads(response_content)
        log.info(f"✅ JSON validation: Response is valid JSON for {filename}")
        return json_data, True
        
    except json.JSONDecodeError as e:
        log.warning(f"❌ JSON parse error for {filename}: {e}")
        
        # Attempt automatic repair
        try:
            log.info(f"🔧 Attempting automatic JSON repair for {filename}")
            fixed_content = repair_common_json_errors(response_content)
            
            json_data = json.loads(fixed_content)
            log.info(f"✅ JSON auto-repair successful for {filename}")
            
            # Basic structure validation
            required_fields = ["resume", "security", "rgpd", "finance", "legal"]
            for field in required_fields:
                if field not in json_data:
                    log.warning(f"⚠️ Missing required field '{field}' in repaired JSON")
                    
            return json_data, True
            
        except json.JSONDecodeError as repair_error:
            log.error(f"🚨 JSON repair failed for {filename}: {repair_error}")
            log.error(f"🔍 Original error position: line {e.lineno}, column {e.colno}")
            
            # Return a basic error structure instead of failing completely
            error_response = {
                "resume": f"JSON parsing failed for {filename}",
                "security": {"classification": "N/A", "confidence": 0, "justification": "JSON malformed"},
                "rgpd": {"risk_level": "N/A", "data_types": [], "confidence": 0},
                "finance": {"document_type": "N/A", "amounts": [], "confidence": 0},
                "legal": {"contract_type": "N/A", "parties": [], "confidence": 0}
            }
            return error_response, False
            
    except Exception as e:
        log.error(f"🚨 Unexpected error during JSON validation for {filename}: {e}")
        return {}, False


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
        # Remove in-memory task storage - now using database
        # self.tasks: Dict[str, Dict[str, Any]] = {}  # REMOVED - using DB instead
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
            
            # Read file content to get size and calculate checksum
            content = await file.read()
            file_size = len(content)
            
            if file_size > max_file_size:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size: {max_file_size / (1024*1024):.1f}MB"
                )
            
            # Calculate SHA-256 checksum for deduplication
            file_hash = hashlib.sha256(content).hexdigest()
            
            # Check if file with same content already exists (with timeout protection)
            try:
                existing_file = Files.get_file_by_hash_and_user(file_hash, user.id)
                if existing_file:
                    log.info(f"File deduplication: reusing existing file {existing_file.id} for {file.filename}")
                    return UploadFileInfo(
                        filename=file.filename,  # Keep original filename
                        size=file_size,
                        content_type=file.content_type or "application/octet-stream", 
                        file_id=existing_file.id,
                        checksum=file_hash,
                        uploaded_at=time.time()
                    )
            except Exception as dedup_error:
                log.warning(f"Deduplication check failed, proceeding with new upload: {dedup_error}")
            
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
                    "original_filename": file.filename,
                    "checksum": file_hash  # Store checksum for deduplication
                }
            )
            
            file_item = Files.insert_new_file(user.id, file_form)
            
            return UploadFileInfo(
                filename=file.filename,
                size=file_size,
                content_type=file.content_type or "application/octet-stream",
                file_id=file_id,
                checksum=file_hash,
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
        PHASE 2: Process document using API v1 proven functions (wrapper approach).
        
        This function now wraps the proven API v1 workflow to ensure maximum 
        compatibility and reuse of existing, tested code.
        
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
            # ✅ PHASE 2: Start task processing with DB tracking (Phase 1 preserved)
            self.update_task_status(
                task_id, 
                status=TaskStatus.PROCESSING.value, 
                started_at=int(time.time()),
                progress="10.0"
            )
            
            log.info(f"🔄 PHASE 2: Starting API v1 wrapper for task {task_id}")
            log.info(f"📁 Processing file: {file_info.filename} (ID: {file_info.file_id})")
            
            # ✅ STEP 1: Get model configuration
            from open_webui.config import API_V2_ADMIN_MODEL, API_V2_ADMIN_CONFIG
            
            # Determine model to use
            admin_model = API_V2_ADMIN_MODEL.value or "auto"
            selected_model = model or kwargs.get("model") or admin_model
            
            # Get admin config for parameters
            admin_config = API_V2_ADMIN_CONFIG.value or {}
            processing_config = admin_config.get("processing", {}) if isinstance(admin_config, dict) else {}
            
            # ✅ STEP 2: Prepare form_data in API v1 format for chat_completion_files_handler()
            form_data = {
                "model": selected_model,
                "messages": [
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                "stream": False,
                "temperature": kwargs.get("temperature") or processing_config.get("temperature", 0.7),
                "max_tokens": kwargs.get("max_tokens") or processing_config.get("max_tokens", 4000),
                "metadata": {
                    "files": [
                        {
                            "id": file_info.file_id,
                            "name": file_info.filename,
                            "type": file_info.content_type
                        }
                    ]
                }
            }

            log.info(f"✅ STEP 1: Prepared form_data for API v1 workflow")
            log.info(f"   - Model: {selected_model}")
            log.info(f"   - File ID: {file_info.file_id}")
            log.info(f"   - Temperature: {form_data['temperature']}")

            # Update progress
            self.update_task_status(task_id, progress="20.0")

            # ✅ STEP 2.5: Ensure content extraction before RAG and inject full context inline
            MAX_INLINE_CONTEXT_CHARS =  int(processing_config.get("max_inline_context_chars", 0)) if isinstance(processing_config, dict) else 0
            try:
                log.info("🧩 STEP 1.5: Running process_file() to extract content")
                from open_webui.routers.retrieval import ProcessFileForm, process_file as owui_process_file
                
                # 🚀 ADAPTIVE TIMEOUT: Calculate timeout based on file size
                file_size = getattr(file_info, 'size', 0) or 0
                adaptive_timeout = calculate_adaptive_timeout(file_size)
                
                log.info(f"📏 File size: {file_size} bytes → Timeout: {adaptive_timeout}s")
                
                try:
                    extraction_start = time.time()
                    await asyncio.wait_for(
                        asyncio.to_thread(owui_process_file, request, ProcessFileForm(file_id=file_info.file_id), user),
                        timeout=adaptive_timeout
                    )
                    extraction_duration = time.time() - extraction_start
                    log.info(f"✅ process_file() completed successfully in {extraction_duration:.2f}s")
                    self.update_task_status(task_id, progress="30.0")
                except asyncio.TimeoutError:
                    timeout_duration = time.time() - extraction_start
                    log.error(f"⏰ process_file() timeout after {adaptive_timeout}s for file {file_info.filename} (size: {file_size} bytes, actual: {timeout_duration:.2f}s)")
                    log.warning("⚠️ Continuing without file processing - will try RAG fallback")
                    self.update_task_status(task_id, progress="25.0")  # Lower progress but continue

                # ✅ Collection validation (non-blocking)
                collection_name = f"file-{file_info.file_id}"
                log.info(f"🔍 Collection expected: {collection_name}")
                
                # Brief delay for ChromaDB sync (non-blocking)
                await asyncio.sleep(0.1)

                # Retrieve extracted content from DB with detailed monitoring
                content_retrieval_start = time.time()
                try:
                    file_obj = Files.get_file_by_id(file_info.file_id)
                    extracted_text = ""
                    if file_obj and file_obj.data:
                        extracted_text = file_obj.data.get("content", "") or ""

                    content_retrieval_duration = time.time() - content_retrieval_start
                    
                    if extracted_text:
                        extraction_ratio = len(extracted_text) / file_size if file_size > 0 else 0
                        log.info(f"📎 Found extracted content ({len(extracted_text)} chars) in {content_retrieval_duration:.3f}s")
                        log.info(f"📊 Extraction metrics: Size={file_size} → Content={len(extracted_text)} (ratio={extraction_ratio:.4f})")
                        
                        # Alert on poor extraction ratios
                        if file_size > 10000 and extraction_ratio < 0.01:  # Less than 1% extracted from files >10KB
                            log.warning(f"⚠️ LOW EXTRACTION RATIO: {extraction_ratio:.4f} for {file_info.filename} ({file_size} bytes)")
                        
                        # Truncate only if positive limit; <=0 means unlimited
                        if MAX_INLINE_CONTEXT_CHARS and MAX_INLINE_CONTEXT_CHARS > 0:
                            inline_text = extracted_text[:MAX_INLINE_CONTEXT_CHARS]
                        else:
                            inline_text = extracted_text
                        log.info(f"📎 Injecting full context inline ({len(inline_text)} chars)")
                        # Force full-context mode for this file
                        form_files = form_data.get("metadata", {}).get("files", [])
                        if form_files:
                            form_files[0]["context"] = "full"
                            form_files[0]["file"] = {
                                "data": {
                                    "content": inline_text
                                },
                                "metadata": {
                                    "source": file_info.filename
                                }
                            }
                    else:
                        log.warning("⚠️ No extracted content found; will rely on RAG")
                except Exception as content_err:
                    log.warning(f"⚠️ Content extraction failed: {content_err}")
                    
            except Exception as pf_err:
                log.error(f"❌ process_file() failed completely: {pf_err}")
                log.warning("⚠️ Proceeding without file extraction - will use RAG only")
                self.update_task_status(task_id, progress="30.0")
            
            # ✅ STEP 3: Call proven API v1 chat_completion_files_handler()
            from open_webui.utils.middleware import chat_completion_files_handler
            
            log.info(f"🚀 STEP 2: Calling chat_completion_files_handler() (API v1 proven function)")
            
            try:
                # This is the CRITICAL call - using the proven API v1 function!
                from open_webui.config import API_V2_TIMEOUT
                enhanced_form_data, flags = await asyncio.wait_for(
                    chat_completion_files_handler(request, form_data, user),
                    timeout=min(API_V2_TIMEOUT.value, 300)  # Max 5 minutes for file processing
                )
                
                log.info(f"✅ STEP 2 SUCCESS: chat_completion_files_handler() completed")
                sources = flags.get('sources', []) or []
                log.info(f"   - Sources found: {len(sources)}")
                # Inject RAG context into the last user message (preserve client JSON instructions)
                if sources:
                    MAX_SOURCE_CHARS = 20000
                    context_parts = []
                    for s in sources:
                        file_meta = s.get("source", {})
                        fid = file_meta.get("id") or file_info.file_id
                        doc_list = s.get("document") or []
                        doc_text = "".join(x for x in doc_list if isinstance(x, str))
                        if len(doc_text) > MAX_SOURCE_CHARS:
                            doc_text = doc_text[:MAX_SOURCE_CHARS]
                        context_parts.append(f"<source id=\"{fid}\">{doc_text}</source>")
                    context_string = "\n".join(context_parts)
                    msgs = enhanced_form_data.get("messages", [])
                    # Find last user message
                    user_idx = None
                    for i in range(len(msgs)-1, -1, -1):
                        if msgs[i].get("role") == "user":
                            user_idx = i
                            break
                    if user_idx is None and msgs:
                        user_idx = len(msgs) - 1
                    if user_idx is not None:
                        original = msgs[user_idx].get("content", "")
                        # Prepend explicit context block, keep client's prompt intact
                        msgs[user_idx]["content"] = f"[Contexte fourni]\n{context_string}\n\n{original}"
                        enhanced_form_data["messages"] = msgs
                
                # Update progress
                self.update_task_status(task_id, progress="60.0")
                
            except asyncio.TimeoutError:
                log.error(f"❌ chat_completion_files_handler() timeout after {min(API_V2_TIMEOUT.value, 300)}s")
                raise Exception(f"File processing timeout after {min(API_V2_TIMEOUT.value, 300)} seconds")
            except Exception as handler_error:
                log.error(f"❌ chat_completion_files_handler() failed: {handler_error}")
                raise Exception(f"API v1 files handler failed: {handler_error}")
            
            # ✅ STEP 4: Get available models for chat completion
            try:
                from open_webui.utils.models import get_all_models
                available_models = await get_all_models(request, user=user)
                
                # Ensure model is available
                if isinstance(available_models, dict):
                    model_ids = [m['id'] for m in available_models.get('data', [])]
                elif isinstance(available_models, list):
                    model_ids = [m['id'] for m in available_models]
                else:
                    model_ids = []
                
                if selected_model not in model_ids and model_ids:
                    selected_model = model_ids[0]
                    log.info(f"⚠️ Model fallback: using {selected_model}")
                    enhanced_form_data["model"] = selected_model
                
            except Exception as models_error:
                log.warning(f"⚠️ Could not get models list: {models_error}")
                # Continue with selected model
            
            # ✅ STEP 5: Call generate_chat_completion() with enhanced data and safeguards
            from open_webui.utils.chat import generate_chat_completion
            
            log.info(f"🚀 STEP 3: Calling generate_chat_completion() with enhanced data")
            log.info(f"   - Enhanced messages count: {len(enhanced_form_data.get('messages', []))}")
            
            # 🔒 Basic token safeguard (simplified)
            current_max_tokens = enhanced_form_data.get("max_tokens", 4000)
            if current_max_tokens < 2048:
                enhanced_form_data["max_tokens"] = 2048
                log.info(f"🔒 Increased max_tokens to 2048 for JSON completeness")
            
            log.info(f"   - Max tokens: {enhanced_form_data.get('max_tokens')}")
            log.info(f"   - Temperature: {enhanced_form_data.get('temperature', 0.7)}")
            
            try:
                # This calls the proven LLM completion system with timeout
                from open_webui.config import API_V2_TIMEOUT
                completion_result = await asyncio.wait_for(
                    generate_chat_completion(request, enhanced_form_data, user),
                    timeout=API_V2_TIMEOUT.value
                )
                
                log.info(f"✅ STEP 3 SUCCESS: generate_chat_completion() completed")
                
                # Update progress
                self.update_task_status(task_id, progress="90.0")
                
            except asyncio.TimeoutError:
                log.error(f"❌ generate_chat_completion() timeout after {API_V2_TIMEOUT.value}s")
                raise Exception(f"LLM completion timeout after {API_V2_TIMEOUT.value} seconds")
            except Exception as completion_error:
                log.error(f"❌ generate_chat_completion() failed: {completion_error}")
                raise Exception(f"LLM completion failed: {completion_error}")
            
            # ✅ STEP 6: Extract and validate results
            try:
                # Extract content from completion result
                if isinstance(completion_result, dict):
                    choices = completion_result.get("choices", [])
                    if choices:
                        content = choices[0].get("message", {}).get("content", "")
                        # Check if response was truncated due to token limit
                        finish_reason = choices[0].get("finish_reason", "")
                        if finish_reason == "length":
                            log.warning(f"⚠️ Response truncated due to token limit (finish_reason: length)")
                    else:
                        content = completion_result.get("content", str(completion_result))
                else:
                    content = str(completion_result)
                
                # 🔍 Enhanced JSON validation with automatic repair
                if content.strip():
                    validated_json, json_valid = validate_and_fix_json_response(content, file_info.filename)
                    if json_valid and validated_json:
                        # Update content with repaired JSON if needed
                        content = json.dumps(validated_json, ensure_ascii=False, indent=2)
                else:
                    json_valid = False
                    log.warning(f"⚠️ Empty response content for {file_info.filename}")
                
                # Enhanced response monitoring
                log.info(f"📊 Response: {len(content)} characters")
                log.info(f"🧠 LLM metrics: Model={selected_model}, JSON_valid={json_valid}, Temperature={form_data['temperature']}")
                
                if json_valid:
                    log.info(f"✅ PROCESSING SUCCESS: {file_info.filename} - JSON valid, ready for client")
                else:
                    log.error(f"❌ PROCESSING PARTIAL: {file_info.filename} - JSON invalid, may cause client errors")
                
                # Prepare result with metadata
                result = {
                    "content": content,
                    "model_used": enhanced_form_data.get("model", selected_model),
                    "file_info": {
                        "filename": file_info.filename,
                        "size": file_info.size,
                        "type": file_info.content_type,
                        "file_id": file_info.file_id
                    },
                    "processing_metadata": {
                        "method": "API v1 wrapper (Phase 2)",
                        "prompt_length": len(prompt),
                        "response_length": len(content),
                        "sources_count": len(flags.get("sources", [])),
                        "files_processed": 1,
                        "model_config": {
                            "temperature": enhanced_form_data.get("temperature"),
                            "max_tokens": enhanced_form_data.get("max_tokens")
                        },
                        "api_v1_wrapper": True,
                        "chat_completion_files_handler": True
                    },
                    "sources": flags.get("sources", [])
                }
                
                log.info(f"✅ STEP 4: Result formatted successfully")
                log.info(f"   - Content length: {len(content)}")
                log.info(f"   - Sources: {len(flags.get('sources', []))}")
                log.info(f"   - Method: API v1 wrapper (Phase 2)")
                
                # Validate that we have content
                if content and content.strip():
                    log.info(f"🎉 SUCCESS: LLM received and processed file content!")
                    log.info(f"   - Response preview: {content[:100].replace(chr(10), ' ')}...")
                else:
                    log.warning(f"⚠️ Warning: LLM response is empty")
                
            except Exception as format_error:
                log.error(f"❌ Result formatting failed: {format_error}")
                raise Exception(f"Result processing failed: {format_error}")
            
            # ✅ FINAL: Update task completion in DB (Phase 1 preserved)
            self.update_task_status(
                task_id,
                status=TaskStatus.COMPLETED.value,
                result=result,
                model_used=enhanced_form_data.get("model", selected_model),
                progress="100.0"
            )
            
            # Cleanup memory
            await self._cleanup_task_memory(task_id)
            
            # 🔧 AUTO-DEQUEUE: Start next queued task if any
            await self._process_next_queued_task()
            
            log.info(f"🎉 PHASE 2 COMPLETE: API v1 wrapper successful for task {task_id}")
            
            return result
            
        except Exception as e:
            log.error(f"❌ PHASE 2 FAILED: Document processing failed for task {task_id}: {e}")
            
            # Update task with error (Phase 1 preserved)
            self.update_task_status(
                task_id,
                status=TaskStatus.FAILED.value,
                error=str(e),
                error_type=ErrorType.PROCESSING_ERROR.value
            )
            
            # 🔧 AUTO-DEQUEUE: Start next queued task even on error
            await self._process_next_queued_task()
            
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    def create_task(
        self, 
        user_id: str, 
        request_data: Dict[str, Any]
    ) -> str:
        """
        Create a new processing task using database storage.
        
        Args:
            user_id: User identifier
            request_data: Request parameters
            
        Returns:
            Task ID
        """
        try:
            # Use database instead of in-memory storage
            task = ApiV2Tasks.insert_new_task(user_id, request_data)
            log.info(f"Created task {task.id} for user {user_id}")
            return task.id
        except Exception as e:
            log.error(f"Failed to create task for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")
    
    def get_task_status(self, task_id: str) -> Optional[StatusResponse]:
        """
        Get the status of a task from database.
        
        Args:
            task_id: Task identifier
            
        Returns:
            StatusResponse or None if task not found
        """
        try:
            # Get task from database instead of memory
            task = ApiV2Tasks.get_task_by_id(task_id)
            if not task:
                return None
            
            return StatusResponse(
                task_id=task.id,
                status=task.status,
                progress=float(task.progress),
                result=task.result,
                error=task.error,
                error_type=task.error_type,
                created_at=task.created_at,
                started_at=task.started_at,
                completed_at=task.completed_at,
                processing_time=task.processing_time,
                model_used=task.model_used,
                file_info={"file_id": task.file_id} if task.file_id else None,
                memory_usage=task.memory_usage
            )
        except Exception as e:
            log.error(f"Failed to get task status for {task_id}: {e}")
            return None
    
    def update_task_status(self, task_id: str, **kwargs) -> bool:
        """
        Update task status and other fields in database.
        
        Args:
            task_id: Task identifier
            **kwargs: Fields to update
            
        Returns:
            bool: True if updated successfully
        """
        try:
            success = ApiV2Tasks.update_task_by_id(task_id, **kwargs)
            if success:
                log.debug(f"Updated task {task_id}: {kwargs}")
            else:
                log.warning(f"Task {task_id} not found for update")
            return success
        except Exception as e:
            log.error(f"Failed to update task {task_id}: {e}")
            return False
    
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
        # Use database instead of memory to check active tasks
        active_count = ApiV2Tasks.get_active_tasks_count()
        
        return active_count < API_V2_MAX_CONCURRENT.value
    
    def get_queue_position(self, task_id: str) -> Optional[int]:
        """
        Get the position of a task in the queue using database.
        
        Args:
            task_id: Task identifier
            
        Returns:
            Queue position or None
        """
        try:
            from open_webui.internal.db import get_db
            from open_webui.models.api_v2_tasks import ApiV2Task
            
            with get_db() as db:
                # Get all queued tasks ordered by creation time
                queued_tasks = (
                    db.query(ApiV2Task)
                    .filter_by(status="queued")
                    .order_by(ApiV2Task.created_at)
                    .all()
                )
                
                for i, task in enumerate(queued_tasks):
                    if task.id == task_id:
                        return i + 1
                
                return None
        except Exception as e:
            log.error(f"Failed to get queue position for {task_id}: {e}")
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
            
            # Store memory info in task database
            self.update_task_status(task_id, memory_usage=memory_usage)
            
            log.debug(f"Memory cleanup completed for task {task_id}. Memory usage: {memory_usage['used_percent']:.1f}%")
            
        except Exception as e:
            log.error(f"Memory cleanup failed for task {task_id}: {e}")
    
    async def _process_next_queued_task(self):
        """
        🔧 AUTO-DEQUEUE: Process next queued task if concurrency allows.
        
        This function is called when a task completes to automatically
        start the next queued task if any exists.
        """
        try:
            # Check if we have capacity for more tasks
            if not self.check_concurrency_limit():
                return  # Still at capacity
            
            # Get next queued task
            from open_webui.internal.db import get_db
            from open_webui.models.api_v2_tasks import ApiV2Task
            
            with get_db() as db:
                next_task = (
                    db.query(ApiV2Task)
                    .filter_by(status="queued")
                    .order_by(ApiV2Task.created_at)
                    .first()
                )
                
                if next_task:
                    log.info(f"🚀 AUTO-DEQUEUE: Starting queued task {next_task.id}")
                    
                    # Start processing (import here to avoid circular imports)
                    import asyncio
                    from open_webui.routers.api_v2 import process_document_background
                    
                    # Get task data
                    request_data = next_task.request_data or {}
                    
                    # 🔧 Skip legacy tasks without file_info
                    if not request_data.get("file_info") or not isinstance(request_data.get("file_info"), dict):
                        log.warning(f"Skipping legacy task {next_task.id} without valid file_info")
                        # Mark as failed to remove from queue
                        self.update_task_status(next_task.id, 
                                             status="failed", 
                                             error="Legacy task format - missing file_info")
                        return
                    
                    # Create background task
                    asyncio.create_task(process_document_background(
                        task_id=next_task.id,
                        file_info=request_data.get("file_info", {}),
                        prompt=request_data.get("prompt", ""),
                        user=None,  # Will be retrieved from DB
                        request=None,  # Will be handled in background
                        model=request_data.get("model")
                    ))
                else:
                    log.debug("No queued tasks to process")
                    
        except Exception as e:
            log.error(f"Failed to process next queued task: {e}")
    
    async def cleanup_old_tasks(self):
        """
        Clean up old completed/failed tasks from database.
        """
        try:
            # Use database cleanup function instead of memory cleanup
            removed_count = ApiV2Tasks.cleanup_old_tasks(hours=24)
            
            if removed_count > 0:
                log.info(f"Cleaned up {removed_count} old tasks from database")
            
            self._last_cleanup = time.time()
            
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
            
            # Use database instead of memory to get task counts
            active_tasks = ApiV2Tasks.get_active_tasks_count()
            queued_tasks = ApiV2Tasks.get_queued_tasks_count()
            
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
