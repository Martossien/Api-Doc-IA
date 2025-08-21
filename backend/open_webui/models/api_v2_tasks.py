import logging
import time
from typing import Optional

from open_webui.internal.db import Base, JSONField, get_db
from open_webui.env import SRC_LOG_LEVELS
from pydantic import BaseModel, ConfigDict
from sqlalchemy import BigInteger, Column, String, Text, JSON

log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["MODELS"])

####################
# API v2 Tasks DB Schema
####################


class ApiV2Task(Base):
    __tablename__ = "api_v2_tasks"
    
    id = Column(String, primary_key=True)           # task_id UUID
    user_id = Column(String, nullable=False)        # user.id
    status = Column(String, default="pending")      # pending/processing/completed/failed/queued
    result = Column(JSON, nullable=True)            # Processing result JSON
    error = Column(Text, nullable=True)             # Error message if failed
    error_type = Column(String, nullable=True)      # Error type classification
    
    # Timestamps
    created_at = Column(BigInteger, default=lambda: int(time.time()))
    started_at = Column(BigInteger, nullable=True)
    completed_at = Column(BigInteger, nullable=True)
    
    # Processing metadata
    processing_time = Column(BigInteger, nullable=True)  # Duration in seconds
    model_used = Column(String, nullable=True)           # LLM model used
    file_id = Column(String, nullable=True)              # Link to Files table
    request_data = Column(JSON, nullable=True)           # Original request data
    
    # Progress tracking
    progress = Column(String, default="0.0")             # Progress percentage as string
    memory_usage = Column(JSON, nullable=True)           # Memory usage stats


class ApiV2TaskModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    status: str
    result: Optional[dict] = None
    error: Optional[str] = None
    error_type: Optional[str] = None
    
    created_at: int
    started_at: Optional[int] = None
    completed_at: Optional[int] = None
    
    processing_time: Optional[int] = None
    model_used: Optional[str] = None
    file_id: Optional[str] = None
    request_data: Optional[dict] = None
    
    progress: str = "0.0"
    memory_usage: Optional[dict] = None


class ApiV2TaskForm(BaseModel):
    user_id: str
    status: str = "pending"
    request_data: Optional[dict] = None


####################
# Forms
####################


class ApiV2TaskResponse(BaseModel):
    task_id: str
    status: str
    message: str
    created_at: int


####################
# DB Operations
####################


class ApiV2Tasks:
    @staticmethod
    def insert_new_task(user_id: str, request_data: dict) -> ApiV2TaskModel:
        """
        Create a new API v2 task in the database.
        
        Args:
            user_id: User identifier
            request_data: Request parameters
            
        Returns:
            ApiV2TaskModel
        """
        with get_db() as db:
            import uuid
            
            task_id = str(uuid.uuid4())
            task = ApiV2Task(
                id=task_id,
                user_id=user_id,
                status="pending",
                request_data=request_data,
                created_at=int(time.time())
            )
            
            db.add(task)
            db.commit()
            db.refresh(task)
            
            log.info(f"Created new API v2 task: {task_id}")
            return ApiV2TaskModel.model_validate(task)
    
    @staticmethod
    def get_task_by_id(task_id: str) -> Optional[ApiV2TaskModel]:
        """
        Get a task by its ID.
        
        Args:
            task_id: Task identifier
            
        Returns:
            ApiV2TaskModel or None if not found
        """
        try:
            with get_db() as db:
                task = db.query(ApiV2Task).filter_by(id=task_id).first()
                if task:
                    return ApiV2TaskModel.model_validate(task)
                return None
        except Exception as e:
            log.error(f"Error getting task {task_id}: {e}")
            return None
    
    @staticmethod
    def update_task_by_id(task_id: str, **kwargs) -> bool:
        """
        Update a task with new data.
        
        Args:
            task_id: Task identifier
            **kwargs: Fields to update
            
        Returns:
            bool: True if updated successfully
        """
        try:
            with get_db() as db:
                task = db.query(ApiV2Task).filter_by(id=task_id).first()
                if task:
                    # Update fields
                    for key, value in kwargs.items():
                        if hasattr(task, key):
                            setattr(task, key, value)
                    
                    # Auto-update completed_at if status changes to completed/failed
                    if 'status' in kwargs and kwargs['status'] in ['completed', 'failed']:
                        task.completed_at = int(time.time())
                        
                        # Calculate processing time if started_at exists
                        if task.started_at:
                            task.processing_time = task.completed_at - task.started_at
                    
                    # Auto-update started_at if status changes to processing
                    if 'status' in kwargs and kwargs['status'] == 'processing' and not task.started_at:
                        task.started_at = int(time.time())
                    
                    db.commit()
                    log.info(f"Updated task {task_id}: {kwargs}")
                    return True
                else:
                    log.warning(f"Task {task_id} not found for update")
                    return False
        except Exception as e:
            log.error(f"Error updating task {task_id}: {e}")
            return False
    
    @staticmethod
    def delete_task_by_id(task_id: str) -> bool:
        """
        Delete a task by its ID.
        
        Args:
            task_id: Task identifier
            
        Returns:
            bool: True if deleted successfully
        """
        try:
            with get_db() as db:
                task = db.query(ApiV2Task).filter_by(id=task_id).first()
                if task:
                    db.delete(task)
                    db.commit()
                    log.info(f"Deleted task {task_id}")
                    return True
                return False
        except Exception as e:
            log.error(f"Error deleting task {task_id}: {e}")
            return False
    
    @staticmethod
    def get_tasks_by_user_id(user_id: str, limit: int = 50) -> list[ApiV2TaskModel]:
        """
        Get tasks for a specific user.
        
        Args:
            user_id: User identifier
            limit: Maximum number of tasks to return
            
        Returns:
            List of ApiV2TaskModel
        """
        try:
            with get_db() as db:
                tasks = (
                    db.query(ApiV2Task)
                    .filter_by(user_id=user_id)
                    .order_by(ApiV2Task.created_at.desc())
                    .limit(limit)
                    .all()
                )
                
                return [ApiV2TaskModel.model_validate(task) for task in tasks]
        except Exception as e:
            log.error(f"Error getting tasks for user {user_id}: {e}")
            return []
    
    @staticmethod
    def cleanup_old_tasks(hours: int = 24) -> int:
        """
        Clean up old completed/failed tasks.
        
        Args:
            hours: Age threshold in hours
            
        Returns:
            int: Number of tasks cleaned up
        """
        try:
            cutoff_time = int(time.time()) - (hours * 3600)
            
            with get_db() as db:
                old_tasks = (
                    db.query(ApiV2Task)
                    .filter(
                        ApiV2Task.status.in_(['completed', 'failed']),
                        ApiV2Task.completed_at < cutoff_time
                    )
                    .all()
                )
                
                count = len(old_tasks)
                for task in old_tasks:
                    db.delete(task)
                
                db.commit()
                log.info(f"Cleaned up {count} old API v2 tasks")
                return count
        except Exception as e:
            log.error(f"Error cleaning up old tasks: {e}")
            return 0
    
    @staticmethod
    def get_active_tasks_count() -> int:
        """
        Get count of active (processing) tasks.
        
        Returns:
            int: Number of active tasks
        """
        try:
            with get_db() as db:
                count = db.query(ApiV2Task).filter_by(status='processing').count()
                return count
        except Exception as e:
            log.error(f"Error getting active tasks count: {e}")
            return 0
    
    @staticmethod
    def get_queued_tasks_count() -> int:
        """
        Get count of queued tasks.
        
        Returns:
            int: Number of queued tasks
        """
        try:
            with get_db() as db:
                count = db.query(ApiV2Task).filter_by(status='queued').count()
                return count
        except Exception as e:
            log.error(f"Error getting queued tasks count: {e}")
            return 0