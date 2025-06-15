"""
Pydantic Models for API v2

This module defines all the request and response models for the API v2 endpoints.
"""

from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel, Field, validator
from enum import Enum
import time


class TaskStatus(str, Enum):
    """Task status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    QUEUED = "queued"


class ErrorType(str, Enum):
    """Error type enumeration"""
    VALIDATION_ERROR = "validation_error"
    PROCESSING_ERROR = "processing_error"
    AUTH_ERROR = "auth_error"
    RATE_LIMIT_ERROR = "rate_limit_error"
    SYSTEM_ERROR = "system_error"
    TIMEOUT_ERROR = "timeout_error"


class TaskRequest(BaseModel):
    """Request model for document processing"""
    prompt: str = Field(
        ..., 
        min_length=5, 
        max_length=4000,
        description="The prompt to apply to the uploaded document"
    )
    model: Optional[str] = Field(
        None,
        description="Override the default model for this request"
    )
    temperature: Optional[float] = Field(
        None,
        ge=0.0,
        le=2.0,
        description="Model temperature (0.0 to 2.0)"
    )
    max_tokens: Optional[int] = Field(
        None,
        ge=1,
        le=32000,
        description="Maximum tokens to generate"
    )
    stream: Optional[bool] = Field(
        False,
        description="Whether to stream the response"
    )

    @validator('prompt')
    def validate_prompt(cls, v):
        if not v.strip():
            raise ValueError('Prompt cannot be empty or whitespace only')
        return v.strip()


class TaskResponse(BaseModel):
    """Response model for task creation"""
    task_id: str = Field(..., description="Unique task identifier")
    status: TaskStatus = Field(..., description="Current task status")
    message: Optional[str] = Field(None, description="Status message")
    position: Optional[int] = Field(None, description="Position in queue if queued")
    estimated_time: Optional[int] = Field(None, description="Estimated processing time in seconds")
    config_applied: Optional[Dict[str, Any]] = Field(None, description="Applied configuration")
    created_at: float = Field(default_factory=time.time, description="Task creation timestamp")


class StatusResponse(BaseModel):
    """Response model for task status queries"""
    task_id: str = Field(..., description="Task identifier")
    status: TaskStatus = Field(..., description="Current task status")
    progress: Optional[float] = Field(None, ge=0.0, le=100.0, description="Progress percentage")
    result: Optional[Dict[str, Any]] = Field(None, description="Processing results")
    error: Optional[str] = Field(None, description="Error message if failed")
    error_type: Optional[ErrorType] = Field(None, description="Type of error")
    created_at: float = Field(..., description="Task creation timestamp")
    started_at: Optional[float] = Field(None, description="Processing start timestamp")
    completed_at: Optional[float] = Field(None, description="Completion timestamp")
    processing_time: Optional[float] = Field(None, description="Total processing time in seconds")
    model_used: Optional[str] = Field(None, description="Model used for processing")
    file_info: Optional[Dict[str, Any]] = Field(None, description="Information about processed file")
    memory_usage: Optional[Dict[str, float]] = Field(None, description="Memory usage statistics")


class ModelResponse(BaseModel):
    """Response model for available models list"""
    models: List[Dict[str, Any]] = Field(..., description="List of available models")
    default_model: str = Field(..., description="Default model for API v2")
    vision_models: List[str] = Field(..., description="Models with vision capabilities")
    model_configs: Dict[str, Dict[str, Any]] = Field(..., description="Model configurations")


class ProcessingSession(BaseModel):
    """Model for processing session tracking"""
    session_id: str = Field(..., description="Session identifier")
    user_id: str = Field(..., description="User identifier")
    task_ids: List[str] = Field(default_factory=list, description="Associated task IDs")
    status: TaskStatus = Field(TaskStatus.PENDING, description="Session status")
    created_at: float = Field(default_factory=time.time, description="Session creation timestamp")
    last_activity: float = Field(default_factory=time.time, description="Last activity timestamp")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Session metadata")


class ErrorDetail(BaseModel):
    """Detailed error information"""
    error_type: ErrorType = Field(..., description="Type of error")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    timestamp: float = Field(default_factory=time.time, description="Error timestamp")
    task_id: Optional[str] = Field(None, description="Associated task ID")
    user_id: Optional[str] = Field(None, description="User ID")
    request_id: Optional[str] = Field(None, description="Request ID for tracing")


class HealthCheckResponse(BaseModel):
    """Health check response model"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    timestamp: float = Field(default_factory=time.time, description="Health check timestamp")
    services: Dict[str, bool] = Field(..., description="Status of dependent services")
    memory_usage: Optional[Dict[str, float]] = Field(None, description="Memory usage statistics")
    active_tasks: int = Field(..., description="Number of active tasks")
    queue_length: int = Field(..., description="Number of queued tasks")


class UploadFileInfo(BaseModel):
    """File upload information"""
    filename: str = Field(..., description="Original filename")
    size: int = Field(..., description="File size in bytes")
    content_type: str = Field(..., description="File MIME type")
    file_id: str = Field(..., description="Internal file identifier")
    checksum: Optional[str] = Field(None, description="File checksum")
    uploaded_at: float = Field(default_factory=time.time, description="Upload timestamp")


class ConfigResponse(BaseModel):
    """API v2 configuration response"""
    enabled: bool = Field(..., description="Whether API v2 is enabled")
    max_file_size: int = Field(..., description="Maximum file size in bytes")
    max_concurrent: int = Field(..., description="Maximum concurrent tasks")
    timeout: int = Field(..., description="Request timeout in seconds")
    admin_model: str = Field(..., description="Admin configured model")
    supported_formats: List[str] = Field(..., description="Supported file formats")
    features: Dict[str, bool] = Field(..., description="Available features")


# Aliases for backward compatibility
TaskCreateRequest = TaskRequest
TaskCreateResponse = TaskResponse
TaskStatusResponse = StatusResponse