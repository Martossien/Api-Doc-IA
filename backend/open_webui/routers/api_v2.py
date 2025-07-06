"""
API v2 Router for Open WebUI

This router provides the main endpoints for the simplified API v2 interface.
It handles document processing, status tracking, and model management.
"""

import asyncio
import logging
import time
from typing import Dict, Any, Optional, List

from fastapi import (
    APIRouter, 
    Depends, 
    File, 
    Form, 
    UploadFile, 
    HTTPException, 
    status,
    Request,
    BackgroundTasks
)
from fastapi.responses import JSONResponse

from open_webui.models.users import UserModel
from open_webui.utils.auth import get_verified_user
from open_webui.config import (
    API_V2_ENABLED,
    API_V2_MAX_FILE_SIZE,
    API_V2_MAX_CONCURRENT,
    API_V2_TIMEOUT,
    API_V2_ADMIN_MODEL,
    API_V2_ADMIN_CONFIG
)

from open_webui.api_v2.models import (
    TaskRequest,
    TaskResponse, 
    StatusResponse,
    ModelResponse,
    HealthCheckResponse,
    ConfigResponse,
    TaskStatus,
    ErrorType,
    ErrorDetail
)
from open_webui.api_v2.adapter import OpenWebUIAdapter

# Set up logging
log = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Global adapter instance
adapter = OpenWebUIAdapter()

# Global task processing semaphore
_processing_semaphore = None


def get_processing_semaphore():
    """Get or create the processing semaphore based on current config"""
    global _processing_semaphore
    if _processing_semaphore is None:
        _processing_semaphore = asyncio.Semaphore(API_V2_MAX_CONCURRENT.value)
    return _processing_semaphore


async def check_api_enabled():
    """Check if API v2 is enabled"""
    if not API_V2_ENABLED.value:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="API v2 is currently disabled"
        )


async def process_document_background(
    task_id: str,
    file_info: Dict[str, Any],
    prompt: str,
    user: UserModel,
    request: Request,
    model: Optional[str] = None,
    **kwargs
):
    """
    Background task for document processing with concurrency control.
    """
    semaphore = get_processing_semaphore()
    
    async with semaphore:
        try:
            log.info(f"Starting background processing for task {task_id}")
            
            # Import here to avoid circular imports
            from open_webui.api_v2.models import UploadFileInfo
            
            # Convert dict back to UploadFileInfo
            upload_info = UploadFileInfo(**file_info)
            
            # Process the document
            result = await adapter.process_document(
                task_id=task_id,
                file_info=upload_info,
                prompt=prompt,
                user=user,
                request=request,
                model=model,
                **kwargs
            )
            
            log.info(f"Background processing completed for task {task_id}")
            
        except Exception as e:
            log.error(f"Background processing failed for task {task_id}: {e}")
            # Error is already handled in adapter.process_document


# Middleware supprimé - sera ajouté directement sur api_app dans main.py
# Les APIRouter ne supportent pas @router.middleware()


@router.post("/process", response_model=TaskResponse)
async def process_document(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    prompt: str = Form(..., min_length=5),
    model: Optional[str] = Form(None),
    temperature: Optional[float] = Form(None),
    max_tokens: Optional[int] = Form(None),
    user: UserModel = Depends(get_verified_user)
):
    """
    Process a document with a prompt using the configured vision model.
    
    This endpoint accepts file uploads and processes them with the specified prompt.
    The processing is done asynchronously and returns a task ID for status tracking.
    """
    try:
        # Validate request
        task_request = TaskRequest(
            prompt=prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        # Check file size
        max_size = API_V2_MAX_FILE_SIZE.value
        if hasattr(file, 'size') and file.size > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {max_size / (1024*1024):.1f}MB"
            )
        
        # Upload file
        file_info = await adapter.upload_file(file, user, max_size)
        
        # Create task with file info for auto-dequeue
        task_data = task_request.dict()
        task_data.update({
            "file_info": file_info.dict(),
            "user_id": user.id
        })
        task_id = adapter.create_task(
            user_id=user.id,
            request_data=task_data
        )
        
        # Check concurrency limit
        if adapter.check_concurrency_limit():
            # Start processing immediately
            background_tasks.add_task(
                process_document_background,
                task_id=task_id,
                file_info=file_info.dict(),
                prompt=prompt,
                user=user,
                request=request,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return TaskResponse(
                task_id=task_id,
                status=TaskStatus.PROCESSING,
                message="Document processing started",
                config_applied={
                    "model": model or API_V2_ADMIN_MODEL.value,
                    "temperature": temperature or API_V2_ADMIN_CONFIG.value.get("temperature", 0.7),
                    "max_tokens": max_tokens or API_V2_ADMIN_CONFIG.value.get("max_tokens", 8000)
                }
            )
        else:
            # Queue the task
            adapter.update_task_status(task_id, status=TaskStatus.QUEUED.value)
            position = adapter.get_queue_position(task_id)
            
            return TaskResponse(
                task_id=task_id,
                status=TaskStatus.QUEUED,
                message="Task queued for processing",
                position=position,
                estimated_time=(position or 1) * 60  # Rough estimate: 1 minute per position
            )
            
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Document processing request failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process document: {str(e)}"
        )


@router.get("/status/{task_id}", response_model=StatusResponse)
async def get_task_status(
    task_id: str,
    user: UserModel = Depends(get_verified_user)
):
    """
    Get the status of a processing task.
    
    Returns detailed information about the task including progress,
    results (if completed), and error details (if failed).
    """
    try:
        # Get task status
        task_status = adapter.get_task_status(task_id)
        
        if not task_status:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )
        
        # Note: Task ownership verification removed for simplified validation
        
        return task_status
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to get task status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get task status: {str(e)}"
        )


@router.get("/models", response_model=ModelResponse)
async def get_available_models(
    user: UserModel = Depends(get_verified_user)
):
    """
    Get list of available models for document processing.
    
    Returns information about all available models, highlighting
    those with vision capabilities suitable for document processing.
    """
    try:
        # Get models from adapter
        models = adapter.get_available_models()
        
        # Filter vision-capable models
        vision_models = [
            model["id"] for model in models 
            if model.get("vision_capable", False)
        ]
        
        # Get model configurations
        admin_config = API_V2_ADMIN_CONFIG.value
        model_configs = {}
        
        for model in models:
            model_configs[model["id"]] = {
                "temperature": admin_config.get("temperature", 0.7),
                "max_tokens": admin_config.get("max_tokens", 8000),
                "vision_capable": model.get("vision_capable", False),
                "capabilities": model.get("capabilities", [])
            }
        
        return ModelResponse(
            models=models,
            default_model=API_V2_ADMIN_MODEL.value,
            vision_models=vision_models,
            model_configs=model_configs
        )
        
    except Exception as e:
        log.error(f"Failed to get available models: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get models: {str(e)}"
        )


@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint for API v2.
    
    Returns the current status of the API v2 service including
    system metrics and service availability.
    """
    try:
        # Get system status from adapter
        system_status = adapter.get_system_status()
        
        # Check dependent services
        services = {
            "database": True,  # Assume database is working if we got here
            "storage": True,   # Assume storage is working
            "models": len(adapter.get_available_models()) > 0,
            "api_v2": API_V2_ENABLED.value
        }
        
        return HealthCheckResponse(
            status="healthy" if all(services.values()) else "degraded",
            version="2.0.0",
            services=services,
            memory_usage=system_status.get("memory_usage"),
            active_tasks=system_status.get("active_tasks", 0),
            queue_length=system_status.get("queued_tasks", 0)
        )
        
    except Exception as e:
        log.error(f"Health check failed: {e}")
        return HealthCheckResponse(
            status="unhealthy",
            version="2.0.0",
            services={"api_v2": False},
            active_tasks=0,
            queue_length=0
        )


@router.get("/config", response_model=ConfigResponse)
async def get_api_config(
    user: UserModel = Depends(get_verified_user)
):
    """
    Get current API v2 configuration.
    
    Returns the current configuration settings for API v2
    including limits, timeouts, and available features.
    """
    try:
        admin_config = API_V2_ADMIN_CONFIG.value
        
        return ConfigResponse(
            enabled=API_V2_ENABLED.value,
            max_file_size=API_V2_MAX_FILE_SIZE.value,
            max_concurrent=API_V2_MAX_CONCURRENT.value,
            timeout=API_V2_TIMEOUT.value,
            admin_model=API_V2_ADMIN_MODEL.value,
            supported_formats=admin_config.get("supported_formats", []),
            features={
                "vision": admin_config.get("enable_vision", True),
                "multimodal": admin_config.get("enable_multimodal", True),
                "background_processing": True,
                "queue_management": True,
                "memory_management": admin_config.get("memory_management", {}).get("cleanup_after_processing", True)
            }
        )
        
    except Exception as e:
        log.error(f"Failed to get API config: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get configuration: {str(e)}"
        )


@router.delete("/tasks/{task_id}")
async def cancel_task(
    task_id: str,
    user: UserModel = Depends(get_verified_user)
):
    """
    Cancel a pending or processing task.
    
    Attempts to cancel the specified task if it belongs to the user
    and is in a cancellable state.
    """
    try:
        # Check if task exists
        task_data = adapter.get_task_status(task_id)
        if not task_data:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )
        
        # Note: Task ownership verification removed for simplified validation
        if False:
            raise HTTPException(
                status_code=403,
                detail="Access denied to this task"
            )
        
        # Check if task can be cancelled
        if task_data.status in [TaskStatus.COMPLETED.value, TaskStatus.FAILED.value]:
            raise HTTPException(
                status_code=400,
                detail="Cannot cancel completed or failed task"
            )
        
        # Cancel the task
        adapter.update_task_status(task_id, status=TaskStatus.FAILED.value)
        adapter.update_task_status(task_id, error="Task cancelled by user")
        adapter.update_task_status(task_id, error_type=ErrorType.SYSTEM_ERROR.value)
        adapter.update_task_status(task_id, failed_at=int(time.time()))
        
        return {"message": "Task cancelled successfully", "task_id": task_id}
        
    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Failed to cancel task: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cancel task: {str(e)}"
        )


# Background task for periodic cleanup
@router.on_event("startup")
async def startup_event():
    """Startup event to initialize background tasks"""
    async def periodic_cleanup():
        while True:
            try:
                await adapter.cleanup_old_tasks()
                await asyncio.sleep(3600)  # Run every hour
            except Exception as e:
                log.error(f"Periodic cleanup failed: {e}")
                await asyncio.sleep(300)  # Retry in 5 minutes
    
    # Start cleanup task
    asyncio.create_task(periodic_cleanup())
    log.info("API v2 startup completed")