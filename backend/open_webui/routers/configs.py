from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel, ConfigDict

from typing import Optional, Dict, Any
import time
import logging

from open_webui.utils.auth import get_admin_user, get_verified_user
from open_webui.config import get_config, save_config
from open_webui.config import BannerModel

from open_webui.utils.tools import get_tool_server_data, get_tool_servers_data

# Import API v2 configuration models
from open_webui.api_v2.config_models import (
    ApiV2AdminConfig,
    ApiV2StatusResponse,
    ApiV2ConfigUpdateRequest,
    ApiV2ConfigBackup,
    migrate_legacy_config,
    export_config_to_legacy
)

log = logging.getLogger(__name__)


router = APIRouter()


############################
# ImportConfig
############################


class ImportConfigForm(BaseModel):
    config: dict


@router.post("/import", response_model=dict)
async def import_config(form_data: ImportConfigForm, user=Depends(get_admin_user)):
    save_config(form_data.config)
    return get_config()


############################
# ExportConfig
############################


@router.get("/export", response_model=dict)
async def export_config(user=Depends(get_admin_user)):
    return get_config()


############################
# Direct Connections Config
############################


class DirectConnectionsConfigForm(BaseModel):
    ENABLE_DIRECT_CONNECTIONS: bool


@router.get("/direct_connections", response_model=DirectConnectionsConfigForm)
async def get_direct_connections_config(request: Request, user=Depends(get_admin_user)):
    return {
        "ENABLE_DIRECT_CONNECTIONS": request.app.state.config.ENABLE_DIRECT_CONNECTIONS,
    }


@router.post("/direct_connections", response_model=DirectConnectionsConfigForm)
async def set_direct_connections_config(
    request: Request,
    form_data: DirectConnectionsConfigForm,
    user=Depends(get_admin_user),
):
    request.app.state.config.ENABLE_DIRECT_CONNECTIONS = (
        form_data.ENABLE_DIRECT_CONNECTIONS
    )
    return {
        "ENABLE_DIRECT_CONNECTIONS": request.app.state.config.ENABLE_DIRECT_CONNECTIONS,
    }


############################
# ToolServers Config
############################


class ToolServerConnection(BaseModel):
    url: str
    path: str
    auth_type: Optional[str]
    key: Optional[str]
    config: Optional[dict]

    model_config = ConfigDict(extra="allow")


class ToolServersConfigForm(BaseModel):
    TOOL_SERVER_CONNECTIONS: list[ToolServerConnection]


@router.get("/tool_servers", response_model=ToolServersConfigForm)
async def get_tool_servers_config(request: Request, user=Depends(get_admin_user)):
    return {
        "TOOL_SERVER_CONNECTIONS": request.app.state.config.TOOL_SERVER_CONNECTIONS,
    }


@router.post("/tool_servers", response_model=ToolServersConfigForm)
async def set_tool_servers_config(
    request: Request,
    form_data: ToolServersConfigForm,
    user=Depends(get_admin_user),
):
    request.app.state.config.TOOL_SERVER_CONNECTIONS = [
        connection.model_dump() for connection in form_data.TOOL_SERVER_CONNECTIONS
    ]

    request.app.state.TOOL_SERVERS = await get_tool_servers_data(
        request.app.state.config.TOOL_SERVER_CONNECTIONS
    )

    return {
        "TOOL_SERVER_CONNECTIONS": request.app.state.config.TOOL_SERVER_CONNECTIONS,
    }


@router.post("/tool_servers/verify")
async def verify_tool_servers_config(
    request: Request, form_data: ToolServerConnection, user=Depends(get_admin_user)
):
    """
    Verify the connection to the tool server.
    """
    try:

        token = None
        if form_data.auth_type == "bearer":
            token = form_data.key
        elif form_data.auth_type == "session":
            token = request.state.token.credentials

        url = f"{form_data.url}/{form_data.path}"
        return await get_tool_server_data(token, url)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to connect to the tool server: {str(e)}",
        )


############################
# CodeInterpreterConfig
############################
class CodeInterpreterConfigForm(BaseModel):
    ENABLE_CODE_EXECUTION: bool
    CODE_EXECUTION_ENGINE: str
    CODE_EXECUTION_JUPYTER_URL: Optional[str]
    CODE_EXECUTION_JUPYTER_AUTH: Optional[str]
    CODE_EXECUTION_JUPYTER_AUTH_TOKEN: Optional[str]
    CODE_EXECUTION_JUPYTER_AUTH_PASSWORD: Optional[str]
    CODE_EXECUTION_JUPYTER_TIMEOUT: Optional[int]
    ENABLE_CODE_INTERPRETER: bool
    CODE_INTERPRETER_ENGINE: str
    CODE_INTERPRETER_PROMPT_TEMPLATE: Optional[str]
    CODE_INTERPRETER_JUPYTER_URL: Optional[str]
    CODE_INTERPRETER_JUPYTER_AUTH: Optional[str]
    CODE_INTERPRETER_JUPYTER_AUTH_TOKEN: Optional[str]
    CODE_INTERPRETER_JUPYTER_AUTH_PASSWORD: Optional[str]
    CODE_INTERPRETER_JUPYTER_TIMEOUT: Optional[int]


@router.get("/code_execution", response_model=CodeInterpreterConfigForm)
async def get_code_execution_config(request: Request, user=Depends(get_admin_user)):
    return {
        "ENABLE_CODE_EXECUTION": request.app.state.config.ENABLE_CODE_EXECUTION,
        "CODE_EXECUTION_ENGINE": request.app.state.config.CODE_EXECUTION_ENGINE,
        "CODE_EXECUTION_JUPYTER_URL": request.app.state.config.CODE_EXECUTION_JUPYTER_URL,
        "CODE_EXECUTION_JUPYTER_AUTH": request.app.state.config.CODE_EXECUTION_JUPYTER_AUTH,
        "CODE_EXECUTION_JUPYTER_AUTH_TOKEN": request.app.state.config.CODE_EXECUTION_JUPYTER_AUTH_TOKEN,
        "CODE_EXECUTION_JUPYTER_AUTH_PASSWORD": request.app.state.config.CODE_EXECUTION_JUPYTER_AUTH_PASSWORD,
        "CODE_EXECUTION_JUPYTER_TIMEOUT": request.app.state.config.CODE_EXECUTION_JUPYTER_TIMEOUT,
        "ENABLE_CODE_INTERPRETER": request.app.state.config.ENABLE_CODE_INTERPRETER,
        "CODE_INTERPRETER_ENGINE": request.app.state.config.CODE_INTERPRETER_ENGINE,
        "CODE_INTERPRETER_PROMPT_TEMPLATE": request.app.state.config.CODE_INTERPRETER_PROMPT_TEMPLATE,
        "CODE_INTERPRETER_JUPYTER_URL": request.app.state.config.CODE_INTERPRETER_JUPYTER_URL,
        "CODE_INTERPRETER_JUPYTER_AUTH": request.app.state.config.CODE_INTERPRETER_JUPYTER_AUTH,
        "CODE_INTERPRETER_JUPYTER_AUTH_TOKEN": request.app.state.config.CODE_INTERPRETER_JUPYTER_AUTH_TOKEN,
        "CODE_INTERPRETER_JUPYTER_AUTH_PASSWORD": request.app.state.config.CODE_INTERPRETER_JUPYTER_AUTH_PASSWORD,
        "CODE_INTERPRETER_JUPYTER_TIMEOUT": request.app.state.config.CODE_INTERPRETER_JUPYTER_TIMEOUT,
    }


@router.post("/code_execution", response_model=CodeInterpreterConfigForm)
async def set_code_execution_config(
    request: Request, form_data: CodeInterpreterConfigForm, user=Depends(get_admin_user)
):

    request.app.state.config.ENABLE_CODE_EXECUTION = form_data.ENABLE_CODE_EXECUTION

    request.app.state.config.CODE_EXECUTION_ENGINE = form_data.CODE_EXECUTION_ENGINE
    request.app.state.config.CODE_EXECUTION_JUPYTER_URL = (
        form_data.CODE_EXECUTION_JUPYTER_URL
    )
    request.app.state.config.CODE_EXECUTION_JUPYTER_AUTH = (
        form_data.CODE_EXECUTION_JUPYTER_AUTH
    )
    request.app.state.config.CODE_EXECUTION_JUPYTER_AUTH_TOKEN = (
        form_data.CODE_EXECUTION_JUPYTER_AUTH_TOKEN
    )
    request.app.state.config.CODE_EXECUTION_JUPYTER_AUTH_PASSWORD = (
        form_data.CODE_EXECUTION_JUPYTER_AUTH_PASSWORD
    )
    request.app.state.config.CODE_EXECUTION_JUPYTER_TIMEOUT = (
        form_data.CODE_EXECUTION_JUPYTER_TIMEOUT
    )

    request.app.state.config.ENABLE_CODE_INTERPRETER = form_data.ENABLE_CODE_INTERPRETER
    request.app.state.config.CODE_INTERPRETER_ENGINE = form_data.CODE_INTERPRETER_ENGINE
    request.app.state.config.CODE_INTERPRETER_PROMPT_TEMPLATE = (
        form_data.CODE_INTERPRETER_PROMPT_TEMPLATE
    )

    request.app.state.config.CODE_INTERPRETER_JUPYTER_URL = (
        form_data.CODE_INTERPRETER_JUPYTER_URL
    )

    request.app.state.config.CODE_INTERPRETER_JUPYTER_AUTH = (
        form_data.CODE_INTERPRETER_JUPYTER_AUTH
    )

    request.app.state.config.CODE_INTERPRETER_JUPYTER_AUTH_TOKEN = (
        form_data.CODE_INTERPRETER_JUPYTER_AUTH_TOKEN
    )
    request.app.state.config.CODE_INTERPRETER_JUPYTER_AUTH_PASSWORD = (
        form_data.CODE_INTERPRETER_JUPYTER_AUTH_PASSWORD
    )
    request.app.state.config.CODE_INTERPRETER_JUPYTER_TIMEOUT = (
        form_data.CODE_INTERPRETER_JUPYTER_TIMEOUT
    )

    return {
        "ENABLE_CODE_EXECUTION": request.app.state.config.ENABLE_CODE_EXECUTION,
        "CODE_EXECUTION_ENGINE": request.app.state.config.CODE_EXECUTION_ENGINE,
        "CODE_EXECUTION_JUPYTER_URL": request.app.state.config.CODE_EXECUTION_JUPYTER_URL,
        "CODE_EXECUTION_JUPYTER_AUTH": request.app.state.config.CODE_EXECUTION_JUPYTER_AUTH,
        "CODE_EXECUTION_JUPYTER_AUTH_TOKEN": request.app.state.config.CODE_EXECUTION_JUPYTER_AUTH_TOKEN,
        "CODE_EXECUTION_JUPYTER_AUTH_PASSWORD": request.app.state.config.CODE_EXECUTION_JUPYTER_AUTH_PASSWORD,
        "CODE_EXECUTION_JUPYTER_TIMEOUT": request.app.state.config.CODE_EXECUTION_JUPYTER_TIMEOUT,
        "ENABLE_CODE_INTERPRETER": request.app.state.config.ENABLE_CODE_INTERPRETER,
        "CODE_INTERPRETER_ENGINE": request.app.state.config.CODE_INTERPRETER_ENGINE,
        "CODE_INTERPRETER_PROMPT_TEMPLATE": request.app.state.config.CODE_INTERPRETER_PROMPT_TEMPLATE,
        "CODE_INTERPRETER_JUPYTER_URL": request.app.state.config.CODE_INTERPRETER_JUPYTER_URL,
        "CODE_INTERPRETER_JUPYTER_AUTH": request.app.state.config.CODE_INTERPRETER_JUPYTER_AUTH,
        "CODE_INTERPRETER_JUPYTER_AUTH_TOKEN": request.app.state.config.CODE_INTERPRETER_JUPYTER_AUTH_TOKEN,
        "CODE_INTERPRETER_JUPYTER_AUTH_PASSWORD": request.app.state.config.CODE_INTERPRETER_JUPYTER_AUTH_PASSWORD,
        "CODE_INTERPRETER_JUPYTER_TIMEOUT": request.app.state.config.CODE_INTERPRETER_JUPYTER_TIMEOUT,
    }


############################
# SetDefaultModels
############################
class ModelsConfigForm(BaseModel):
    DEFAULT_MODELS: Optional[str]
    MODEL_ORDER_LIST: Optional[list[str]]


@router.get("/models", response_model=ModelsConfigForm)
async def get_models_config(request: Request, user=Depends(get_admin_user)):
    return {
        "DEFAULT_MODELS": request.app.state.config.DEFAULT_MODELS,
        "MODEL_ORDER_LIST": request.app.state.config.MODEL_ORDER_LIST,
    }


@router.post("/models", response_model=ModelsConfigForm)
async def set_models_config(
    request: Request, form_data: ModelsConfigForm, user=Depends(get_admin_user)
):
    request.app.state.config.DEFAULT_MODELS = form_data.DEFAULT_MODELS
    request.app.state.config.MODEL_ORDER_LIST = form_data.MODEL_ORDER_LIST
    return {
        "DEFAULT_MODELS": request.app.state.config.DEFAULT_MODELS,
        "MODEL_ORDER_LIST": request.app.state.config.MODEL_ORDER_LIST,
    }


class PromptSuggestion(BaseModel):
    title: list[str]
    content: str


class SetDefaultSuggestionsForm(BaseModel):
    suggestions: list[PromptSuggestion]


@router.post("/suggestions", response_model=list[PromptSuggestion])
async def set_default_suggestions(
    request: Request,
    form_data: SetDefaultSuggestionsForm,
    user=Depends(get_admin_user),
):
    data = form_data.model_dump()
    request.app.state.config.DEFAULT_PROMPT_SUGGESTIONS = data["suggestions"]
    return request.app.state.config.DEFAULT_PROMPT_SUGGESTIONS


############################
# SetBanners
############################


class SetBannersForm(BaseModel):
    banners: list[BannerModel]


@router.post("/banners", response_model=list[BannerModel])
async def set_banners(
    request: Request,
    form_data: SetBannersForm,
    user=Depends(get_admin_user),
):
    data = form_data.model_dump()
    request.app.state.config.BANNERS = data["banners"]
    return request.app.state.config.BANNERS


@router.get("/banners", response_model=list[BannerModel])
async def get_banners(
    request: Request,
    user=Depends(get_verified_user),
):
    return request.app.state.config.BANNERS


############################
# API v2 Configuration
############################

@router.get("/api_v2/admin/config", response_model=ApiV2AdminConfig)
async def get_api_v2_admin_config(request: Request, user=Depends(get_admin_user)):
    """
    Get current API v2 administration configuration.
    
    Returns:
        ApiV2AdminConfig: Current structured configuration
    """
    try:
        # Try to get current config from persistent storage first
        from open_webui.config import API_V2_ADMIN_CONFIG
        current_config = API_V2_ADMIN_CONFIG.value
        
        # If it's already structured, return it
        if isinstance(current_config, dict) and "llm" in current_config:
            return ApiV2AdminConfig(**current_config)
        
        # Otherwise migrate from legacy format or create default
        if current_config:
            migrated = migrate_legacy_config(current_config)
        else:
            # Create default config if none exists
            migrated = ApiV2AdminConfig()
        
        # Save migrated/default config back to persistent storage
        API_V2_ADMIN_CONFIG.value = migrated.dict()
        API_V2_ADMIN_CONFIG.save()
        
        # Also update runtime config
        request.app.state.config.API_V2_ADMIN_CONFIG = migrated.dict()
        
        log.info(f"Initialized API v2 config for user {user.id}")
        return migrated
        
    except Exception as e:
        log.error(f"Failed to get API v2 config: {e}")
        # Return default config if all else fails
        default_config = ApiV2AdminConfig()
        try:
            # Try to save default config
            from open_webui.config import API_V2_ADMIN_CONFIG
            API_V2_ADMIN_CONFIG.value = default_config.dict()
            API_V2_ADMIN_CONFIG.save()
            request.app.state.config.API_V2_ADMIN_CONFIG = default_config.dict()
        except:
            pass  # Ignore save errors during fallback
        return default_config


@router.post("/api_v2/admin/config", response_model=ApiV2AdminConfig)
async def set_api_v2_admin_config(
    request: Request, 
    form_data: ApiV2ConfigUpdateRequest, 
    user=Depends(get_admin_user)
):
    """
    Update API v2 administration configuration.
    
    Args:
        form_data: New configuration with optional reason
        
    Returns:
        ApiV2AdminConfig: Updated configuration
    """
    try:
        # Create backup if requested
        if form_data.backup_current:
            from open_webui.config import API_V2_ADMIN_CONFIG
            current_config = API_V2_ADMIN_CONFIG.value
            backup = ApiV2ConfigBackup(
                config=current_config if isinstance(current_config, ApiV2AdminConfig) 
                       else migrate_legacy_config(current_config),
                timestamp=time.time(),
                user_id=user.id,
                version=getattr(current_config, 'version', '1.0.0'),
                reason=f"Backup before update: {form_data.reason or 'No reason provided'}"
            )
            
            # Store backup (you might want to implement a backup storage mechanism)
            log.info(f"Created config backup for user {user.id}")
        
        # Update metadata
        form_data.config.last_modified = time.time()
        form_data.config.modified_by = user.id
        
        # Save to persistent storage - separate model and config
        from open_webui.config import API_V2_ADMIN_MODEL, API_V2_ADMIN_CONFIG
        
        # Save the model separately if it's part of the config
        if hasattr(form_data.config, 'admin_model') and form_data.config.admin_model:
            API_V2_ADMIN_MODEL.value = form_data.config.admin_model
            API_V2_ADMIN_MODEL.save()
        
        # Save the full config
        API_V2_ADMIN_CONFIG.value = form_data.config.dict()
        API_V2_ADMIN_CONFIG.save()
        
        # Audit log
        log.info(f"API v2 config updated by user {user.id}. Reason: {form_data.reason or 'None'}")
        
        return form_data.config
        
    except Exception as e:
        log.error(f"Failed to update API v2 config: {e}")
        raise HTTPException(status_code=500, detail=f"Configuration update failed: {str(e)}")


@router.post("/api_v2/admin/reset")
async def reset_api_v2_admin_config(
    request: Request, 
    user=Depends(get_admin_user)
):
    """
    Reset API v2 configuration to defaults.
    
    Returns:
        ApiV2AdminConfig: Default configuration
    """
    try:
        # Create backup before reset
        current_config = request.app.state.config.API_V2_ADMIN_CONFIG
        backup = ApiV2ConfigBackup(
            config=current_config if isinstance(current_config, ApiV2AdminConfig) 
                   else migrate_legacy_config(current_config),
            timestamp=time.time(),
            user_id=user.id,
            version=getattr(current_config, 'version', '1.0.0'),
            reason="Reset to defaults"
        )
        
        # Create default config
        default_config = ApiV2AdminConfig()
        default_config.last_modified = time.time()
        default_config.modified_by = user.id
        
        # Save to persistent storage
        from open_webui.config import save_config_value
        save_config_value("api_v2.admin_config", default_config.dict())
        
        # Update runtime config
        request.app.state.config.API_V2_ADMIN_CONFIG = default_config.dict()
        
        log.info(f"API v2 config reset to defaults by user {user.id}")
        
        return {
            "status": "success",
            "message": "Configuration reset to defaults",
            "config": default_config
        }
        
    except Exception as e:
        log.error(f"Failed to reset API v2 config: {e}")
        raise HTTPException(status_code=500, detail=f"Configuration reset failed: {str(e)}")


@router.get("/api_v2/admin/status", response_model=ApiV2StatusResponse)
async def get_api_v2_status(request: Request, user=Depends(get_admin_user)):
    """
    Get current API v2 system status and metrics.
    
    Returns:
        ApiV2StatusResponse: System status and metrics
    """
    try:
        # Get adapter instance to check status
        from open_webui.api_v2.adapter import OpenWebUIAdapter
        
        # This would be better if we had a singleton adapter instance
        # For now, create a temporary one to get system status
        adapter = OpenWebUIAdapter()
        system_status = adapter.get_system_status()
        
        # Get task statistics (simplified)
        active_tasks = system_status.get("active_tasks", 0)
        queued_tasks = system_status.get("queued_tasks", 0)
        
        # Get current config version
        current_config = request.app.state.config.API_V2_ADMIN_CONFIG
        config_version = current_config.get("version", "1.0.0") if isinstance(current_config, dict) else "2.0.0"
        last_update = current_config.get("last_modified") if isinstance(current_config, dict) else None
        
        return ApiV2StatusResponse(
            enabled=system_status.get("enabled", True),
            active_tasks=active_tasks,
            queued_tasks=queued_tasks,
            completed_tasks_24h=0,  # Would need metrics storage
            failed_tasks_24h=0,     # Would need metrics storage
            system_health={
                "status": "healthy" if system_status.get("memory_usage", {}).get("used_percent", 0) < 90 else "warning",
                "uptime_seconds": 0,  # Would need tracking
                "last_health_check": time.time()
            },
            memory_usage=system_status.get("memory_usage", {}),
            performance_metrics={
                "avg_processing_time": 0.0,  # Would need metrics storage
                "requests_per_minute": 0.0,  # Would need metrics storage
                "error_rate": 0.0             # Would need metrics storage
            },
            configuration_version=config_version,
            last_config_update=last_update
        )
        
    except Exception as e:
        log.error(f"Failed to get API v2 status: {e}")
        raise HTTPException(status_code=500, detail=f"Status retrieval failed: {str(e)}")


@router.get("/api_v2/admin/export")
async def export_api_v2_config(request: Request, user=Depends(get_admin_user)):
    """
    Export current API v2 configuration as JSON.
    
    Returns:
        Dict: Configuration export with metadata
    """
    try:
        current_config = request.app.state.config.API_V2_ADMIN_CONFIG
        
        if isinstance(current_config, dict) and "llm" in current_config:
            config = ApiV2AdminConfig(**current_config)
        else:
            config = migrate_legacy_config(current_config)
        
        return {
            "export_timestamp": time.time(),
            "exported_by": user.id,
            "config_version": config.version,
            "config": config.dict()
        }
        
    except Exception as e:
        log.error(f"Failed to export API v2 config: {e}")
        raise HTTPException(status_code=500, detail=f"Configuration export failed: {str(e)}")


@router.post("/api_v2/admin/import")
async def import_api_v2_config(
    request: Request, 
    import_data: Dict[str, Any],
    user=Depends(get_admin_user)
):
    """
    Import API v2 configuration from JSON.
    
    Args:
        import_data: Configuration import data
        
    Returns:
        ApiV2AdminConfig: Imported configuration
    """
    try:
        # Validate import data structure
        if "config" not in import_data:
            raise HTTPException(status_code=400, detail="Invalid import data: missing 'config' field")
        
        # Create config from import data
        imported_config = ApiV2AdminConfig(**import_data["config"])
        
        # Update metadata
        imported_config.last_modified = time.time()
        imported_config.modified_by = user.id
        
        # Save to persistent storage
        from open_webui.config import save_config_value
        save_config_value("api_v2.admin_config", imported_config.dict())
        
        # Update runtime config
        request.app.state.config.API_V2_ADMIN_CONFIG = imported_config.dict()
        
        log.info(f"API v2 config imported by user {user.id}")
        
        return imported_config
        
    except Exception as e:
        log.error(f"Failed to import API v2 config: {e}")
        raise HTTPException(status_code=500, detail=f"Configuration import failed: {str(e)}")
