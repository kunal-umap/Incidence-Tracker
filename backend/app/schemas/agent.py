import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.agent import AgentStatus


class AgentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    description: Optional[str] = Field(default="", max_length=500)
    system_prompt: str = Field(..., min_length=10)
    model_name: str = Field(default="gemini-2.5-flash")
    config: Optional[Dict[str, Any]] = Field(default_factory=dict)
    rate_limit_per_minute: int = Field(default=60, ge=1, le=600)


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    model_name: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    status: Optional[AgentStatus] = None
    rate_limit_per_minute: Optional[int] = None


class AgentRead(AgentBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    creator_id: uuid.UUID
    status: AgentStatus
    created_at: datetime
    updated_at: datetime


class AgentExecutionRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    session_id: Optional[uuid.UUID] = None
    stream: bool = Field(default=False)
    context_parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ToolCallLog(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]
    result: Any


class AgentExecutionResponse(BaseModel):
    session_id: uuid.UUID
    agent_id: uuid.UUID
    output_text: str
    tokens_consumed: int
    tool_calls: List[ToolCallLog] = Field(default_factory=list)
    execution_time_ms: float


class AgentSessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    agent_id: uuid.UUID
    session_title: str
    messages: List[Dict[str, Any]]
    token_count: int
    created_at: datetime
