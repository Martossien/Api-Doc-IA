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
                log.info(f"   - Sources found: {len(flags.get('sources', []))}")
                if flags.get('sources'):
                    log.info(f"   - Content extracted: YES (sources available)")
                else:
                    log.info(f"   - Content extracted: Checking enhanced form_data...")
                
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
            
            # ✅ STEP 5: Call generate_chat_completion() with enhanced data
            from open_webui.utils.chat import generate_chat_completion
            
            log.info(f"🚀 STEP 3: Calling generate_chat_completion() with enhanced data")
            log.info(f"   - Enhanced messages count: {len(enhanced_form_data.get('messages', []))}")
            
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
            
            # ✅ STEP 6: Extract and format results
            try:
                # Extract content from completion result
                if isinstance(completion_result, dict):
                    choices = completion_result.get("choices", [])
                    if choices:
                        content = choices[0].get("message", {}).get("content", "")
                    else:
                        content = completion_result.get("content", str(completion_result))
                else:
                    content = str(completion_result)
                
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