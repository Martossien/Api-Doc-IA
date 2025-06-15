"""
Configuration models for API v2 administration interface.

This module defines Pydantic models for structured configuration management
of the API v2 system, providing validation and type safety.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from enum import Enum


class LogLevel(str, Enum):
    """Supported log levels"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


class FileFormat(str, Enum):
    """Supported file formats for processing"""
    PDF = "pdf"
    DOCX = "docx"
    DOC = "doc"
    TXT = "txt"
    MD = "md"
    RTF = "rtf"
    PNG = "png"
    JPG = "jpg"
    JPEG = "jpeg"
    GIF = "gif"
    WEBP = "webp"


class MemoryManagementConfig(BaseModel):
    """Memory management configuration for API v2"""
    
    cleanup_after_processing: bool = Field(
        default=True,
        description="Automatically cleanup memory after each processing task"
    )
    
    monitor_usage: bool = Field(
        default=True,
        description="Enable real-time memory usage monitoring"
    )
    
    emergency_stop_threshold: int = Field(
        default=95,
        ge=80,
        le=99,
        description="Emergency stop threshold for memory usage (percentage)"
    )
    
    garbage_collection_interval: int = Field(
        default=300,
        ge=60,
        le=3600,
        description="Garbage collection interval in seconds"
    )
    
    max_memory_per_task_mb: int = Field(
        default=512,
        ge=128,
        le=4096,
        description="Maximum memory per task in MB"
    )


class LLMConfig(BaseModel):
    """LLM configuration parameters"""
    
    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="Temperature for LLM responses (0.0 = deterministic, 2.0 = very creative)"
    )
    
    max_tokens: int = Field(
        default=8000,
        ge=1,
        le=32000,
        description="Maximum tokens per LLM response"
    )
    
    top_p: float = Field(
        default=0.9,
        ge=0.0,
        le=1.0,
        description="Top-p sampling parameter"
    )
    
    frequency_penalty: float = Field(
        default=0.0,
        ge=-2.0,
        le=2.0,
        description="Frequency penalty for token repetition"
    )
    
    presence_penalty: float = Field(
        default=0.0,
        ge=-2.0,
        le=2.0,
        description="Presence penalty for new topics"
    )



class ProcessingConfig(BaseModel):
    """File processing configuration - Uses Open WebUI native parameters"""
    
    # === OPEN WEBUI NATIVE PARAMETERS ===
    
    pdf_extract_images: bool = Field(
        default=False,
        description="Enable OCR for PDF images extraction (maps to PDF_EXTRACT_IMAGES)"
    )
    
    bypass_embedding_and_retrieval: bool = Field(
        default=False,
        description="Bypass embedding and use full document content as context (maps to BYPASS_EMBEDDING_AND_RETRIEVAL)"
    )
    
    rag_full_context: bool = Field(
        default=False,
        description="Use full context mode for RAG retrieval (maps to RAG_FULL_CONTEXT)"
    )
    
    enable_hybrid_search: bool = Field(
        default=False,
        description="Enable hybrid search combining vector and keyword search (maps to ENABLE_RAG_HYBRID_SEARCH)"
    )
    
    # === RAG RETRIEVAL PARAMETERS ===
    
    top_k: int = Field(
        default=3,
        ge=1,
        le=100,
        description="Number of chunks to retrieve (maps to RAG_TOP_K)"
    )
    
    top_k_reranker: int = Field(
        default=3,
        ge=1,
        le=100,
        description="Number of chunks for reranking in hybrid search (maps to RAG_TOP_K_RERANKER)"
    )
    
    relevance_threshold: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Minimum relevance score threshold (maps to RAG_RELEVANCE_THRESHOLD)"
    )
    
    # === DOCUMENT SEGMENTATION ===
    
    chunk_size: int = Field(
        default=1000,
        ge=100,
        le=8000,
        description="Chunk size for text splitting (maps to CHUNK_SIZE)"
    )
    
    chunk_overlap: int = Field(
        default=200,
        ge=0,
        le=1000,
        description="Overlap between chunks (maps to CHUNK_OVERLAP)"
    )
    
    text_splitter: str = Field(
        default="character",
        description="Text splitter type: character or token (maps to TEXT_SPLITTER)"
    )
    
    # === CONTENT EXTRACTION ===
    
    content_extraction_engine: str = Field(
        default="default",
        description="Content extraction engine: default, tika, docling, document_intelligence, mistral_ocr"
    )
    
    # === VISION PROCESSING ===
    
    vision_mode: str = Field(
        default="auto",
        description="Vision processing mode: auto (name detection), force_vision (always use vision), force_text (always use OCR)"
    )
    
    
    # === LEGACY PARAMETERS ===
    
    supported_formats: List[FileFormat] = Field(
        default=[
            FileFormat.PDF, FileFormat.DOCX, FileFormat.DOC,
            FileFormat.TXT, FileFormat.MD, FileFormat.RTF,
            FileFormat.PNG, FileFormat.JPG, FileFormat.JPEG, FileFormat.GIF,
            # Audio formats added
            "MP3", "WAV", "OGG", "M4A", "FLAC", "AAC", "OPUS"
        ],
        description="Supported file formats for processing (including audio)"
    )
    
    max_file_size_mb: int = Field(
        default=50,
        ge=1,
        le=1000,
        description="Maximum file size in MB"
    )
    
    preprocessing_enabled: bool = Field(
        default=True,
        description="Enable file preprocessing and cleanup"
    )


class SecurityConfig(BaseModel):
    """Security and access configuration"""
    
    require_authentication: bool = Field(
        default=True,
        description="Require user authentication for API access"
    )
    
    admin_only_config: bool = Field(
        default=True,
        description="Restrict configuration changes to admin users only"
    )
    
    api_key_required: bool = Field(
        default=True,
        description="Require API key for programmatic access"
    )
    
    rate_limit_per_user_per_hour: int = Field(
        default=100,
        ge=1,
        le=10000,
        description="Rate limit per user per hour"
    )
    
    audit_logging: bool = Field(
        default=True,
        description="Enable audit logging for configuration changes"
    )


class SystemLimitsConfig(BaseModel):
    """System limits and performance configuration"""
    
    max_concurrent_tasks: int = Field(
        default=3,
        ge=1,
        le=50,
        description="Maximum concurrent processing tasks"
    )
    
    task_timeout_seconds: int = Field(
        default=300,
        ge=30,
        le=3600,
        description="Task timeout in seconds"
    )
    
    queue_max_size: int = Field(
        default=100,
        ge=10,
        le=1000,
        description="Maximum queue size for pending tasks"
    )
    
    cleanup_completed_tasks_after_hours: int = Field(
        default=24,
        ge=1,
        le=168,
        description="Clean up completed tasks after N hours"
    )
    
    auto_scaling_enabled: bool = Field(
        default=False,
        description="Enable automatic scaling of concurrent tasks based on system load"
    )


class TemplateConfig(BaseModel):
    """Template configuration for prompts"""
    
    default_prompt_template: str = Field(
        default="Analyze the provided document and answer: {prompt}",
        min_length=10,
        max_length=2000,
        description="Default prompt template with {prompt} placeholder"
    )
    
    vision_prompt_template: str = Field(
        default="Analyze the provided image and answer: {prompt}",
        min_length=10,
        max_length=2000,
        description="Template for vision/image processing tasks"
    )
    
    multimodal_prompt_template: str = Field(
        default="Analyze the provided document and images, then answer: {prompt}",
        min_length=10,
        max_length=2000,
        description="Template for multimodal processing tasks"
    )
    
    system_prompt: str = Field(
        default="You are a helpful AI assistant specialized in document analysis.",
        min_length=10,
        max_length=1000,
        description="System prompt for all LLM interactions"
    )

    @validator('default_prompt_template', 'vision_prompt_template', 'multimodal_prompt_template')
    def validate_template_has_placeholder(cls, v):
        if '{prompt}' not in v:
            raise ValueError('Template must contain {prompt} placeholder')
        return v


class MonitoringConfig(BaseModel):
    """Monitoring and logging configuration"""
    
    enable_metrics: bool = Field(
        default=True,
        description="Enable system metrics collection"
    )
    
    metrics_retention_days: int = Field(
        default=30,
        ge=1,
        le=365,
        description="Metrics retention period in days"
    )
    
    log_level: LogLevel = Field(
        default=LogLevel.INFO,
        description="Logging level for API v2 operations"
    )
    
    performance_logging: bool = Field(
        default=True,
        description="Enable detailed performance logging"
    )
    
    error_reporting: bool = Field(
        default=True,
        description="Enable automatic error reporting"
    )
    
    health_check_interval_seconds: int = Field(
        default=60,
        ge=10,
        le=600,
        description="Health check interval in seconds"
    )


class ApiV2AdminConfig(BaseModel):
    """Complete API v2 administration configuration"""
    
    # Core configuration sections
    llm: LLMConfig = Field(default_factory=LLMConfig)
    processing: ProcessingConfig = Field(default_factory=ProcessingConfig)
    security: SecurityConfig = Field(default_factory=SecurityConfig)
    system_limits: SystemLimitsConfig = Field(default_factory=SystemLimitsConfig)
    templates: TemplateConfig = Field(default_factory=TemplateConfig)
    memory_management: MemoryManagementConfig = Field(default_factory=MemoryManagementConfig)
    monitoring: MonitoringConfig = Field(default_factory=MonitoringConfig)
    
    # Global settings
    enabled: bool = Field(
        default=True,
        description="Enable/disable API v2 globally"
    )
    
    admin_model: str = Field(
        default="auto",
        min_length=1,
        description="Default model for administrative operations (use 'auto' for automatic selection)"
    )
    
    version: str = Field(
        default="2.0.0",
        description="Configuration version for migration tracking"
    )
    
    last_modified: Optional[float] = Field(
        default=None,
        description="Timestamp of last configuration modification"
    )
    
    modified_by: Optional[str] = Field(
        default=None,
        description="User ID who last modified the configuration"
    )

    class Config:
        """Pydantic configuration"""
        extra = "forbid"  # Prevent additional fields
        validate_assignment = True  # Validate on assignment
        use_enum_values = True  # Use enum values in serialization


class ApiV2StatusResponse(BaseModel):
    """API v2 system status response"""
    
    enabled: bool
    active_tasks: int
    queued_tasks: int
    completed_tasks_24h: int
    failed_tasks_24h: int
    
    system_health: Dict[str, Any] = Field(
        description="System health metrics"
    )
    
    memory_usage: Dict[str, float] = Field(
        description="Memory usage statistics"
    )
    
    performance_metrics: Dict[str, Any] = Field(
        description="Performance metrics"
    )
    
    configuration_version: str
    last_config_update: Optional[float]


class ApiV2ConfigUpdateRequest(BaseModel):
    """Request model for configuration updates"""
    
    config: ApiV2AdminConfig
    reason: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Reason for configuration change (for audit trail)"
    )
    
    backup_current: bool = Field(
        default=True,
        description="Create backup of current configuration before update"
    )


class ApiV2ConfigBackup(BaseModel):
    """Configuration backup model"""
    
    config: ApiV2AdminConfig
    timestamp: float
    user_id: str
    version: str
    reason: Optional[str] = None


# Legacy compatibility functions
def migrate_legacy_config(legacy_config: Dict[str, Any]) -> ApiV2AdminConfig:
    """
    Migrate legacy configuration format to new structured format.
    
    Args:
        legacy_config: Old configuration dictionary
        
    Returns:
        Migrated ApiV2AdminConfig instance
    """
    
    # Extract legacy values with defaults
    temperature = legacy_config.get("temperature", 0.7)
    max_tokens = legacy_config.get("max_tokens", 8000)
    supported_formats = legacy_config.get("supported_formats", [
        "pdf", "docx", "txt", "md", "png", "jpg", "jpeg", "gif"
    ])
    
    # Memory management from legacy
    memory_mgmt = legacy_config.get("memory_management", {})
    
    # Create new structured config
    return ApiV2AdminConfig(
        llm=LLMConfig(
            temperature=temperature,
            max_tokens=max_tokens
        ),
        processing=ProcessingConfig(
            supported_formats=[FileFormat(fmt) for fmt in supported_formats if fmt in [e.value for e in FileFormat]]
        ),
        memory_management=MemoryManagementConfig(
            cleanup_after_processing=memory_mgmt.get("cleanup_after_processing", True),
            monitor_usage=memory_mgmt.get("monitor_usage", True),
            emergency_stop_threshold=memory_mgmt.get("emergency_stop_threshold", 95)
        ),
        templates=TemplateConfig(
            default_prompt_template=legacy_config.get("default_prompt_template", 
                "Analyze the provided document and answer: {prompt}")
        ),
        version="2.0.0"
    )


def export_config_to_legacy(config: ApiV2AdminConfig) -> Dict[str, Any]:
    """
    Export structured config to legacy format for backward compatibility.
    
    Args:
        config: Structured configuration
        
    Returns:
        Legacy configuration dictionary
    """
    
    return {
        "temperature": config.llm.temperature,
        "max_tokens": config.llm.max_tokens,
        "vision_mode": config.processing.vision_mode,
        "default_prompt_template": config.templates.default_prompt_template,
        "supported_formats": [fmt.value for fmt in config.processing.supported_formats],
        "memory_management": {
            "cleanup_after_processing": config.memory_management.cleanup_after_processing,
            "monitor_usage": config.memory_management.monitor_usage,
            "emergency_stop_threshold": config.memory_management.emergency_stop_threshold
        }
    }