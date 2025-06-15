"""
API v2 Module for Open WebUI

This module provides a simplified, production-ready API v2 interface for Open WebUI,
designed for document processing with vision models.

Key features:
- Document upload and processing with LLMs
- Vision model integration for multimodal content
- Concurrency control and memory management
- Authentication integration with existing Open WebUI system
- Background task processing with status tracking
"""

__version__ = "2.0.0"
__author__ = "Open WebUI Team"

from .models import (
    TaskRequest,
    TaskResponse,
    StatusResponse,
    ModelResponse,
    ProcessingSession,
    ErrorDetail,
)

from .adapter import OpenWebUIAdapter

__all__ = [
    "TaskRequest",
    "TaskResponse", 
    "StatusResponse",
    "ModelResponse",
    "ProcessingSession",
    "ErrorDetail",
    "OpenWebUIAdapter",
]