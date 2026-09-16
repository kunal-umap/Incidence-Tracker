import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.agent_repository import agent_repository
from app.schemas.agent import (
    AgentCreate,
    AgentExecutionRequest,
    AgentExecutionResponse,
    AgentRead,
    AgentSessionRead,
)
from app.schemas.common import APIResponse
from app.services.agent_service import agent_service

router = APIRouter()


@router.post(
    "/",
    response_model=APIResponse[AgentRead],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new AI Agent",
)
async def create_agent(
    agent_in: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Register an autonomous AI agent configuration.
    Includes system prompt, model selection, tool configurations, and rate limits.
    """
    agent = await agent_service.register_agent(
        db, user=current_user, agent_in=agent_in
    )
    return APIResponse[AgentRead](
        success=True,
        message=f"AI Agent '{agent.name}' registered successfully",
        data=AgentRead.model_validate(agent),
    )


@router.get(
    "/",
    response_model=APIResponse[List[AgentRead]],
    summary="List current user's AI Agents",
)
async def list_agents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all agents created by the authenticated user."""
    agents = await agent_repository.get_by_creator(db, creator_id=current_user.id)
    return APIResponse[List[AgentRead]](
        success=True,
        message=f"Retrieved {len(agents)} agents",
        data=[AgentRead.model_validate(a) for a in agents],
    )


@router.post(
    "/{agent_id}/execute",
    response_model=APIResponse[AgentExecutionResponse],
    summary="Execute agent reasoning task with tools",
)
async def execute_agent_task(
    agent_id: uuid.UUID,
    execution_in: AgentExecutionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Execute an AI Agent with user prompt, tools orchestration,
    and automatic session persistence in PostgreSQL.
    """
    result = await agent_service.execute_agent(
        db,
        agent_id=agent_id,
        user=current_user,
        execution_in=execution_in,
    )
    return APIResponse[AgentExecutionResponse](
        success=True,
        message="Agent task executed successfully",
        data=result,
    )


@router.get(
    "/{agent_id}/sessions",
    response_model=APIResponse[List[AgentSessionRead]],
    summary="Get execution sessions and audit logs for an agent",
)
async def get_agent_sessions(
    agent_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve conversation histories, token counts, and tool logs."""
    agent = await agent_repository.get(db, id=agent_id)
    if not agent:
        return APIResponse[List[AgentSessionRead]](
            success=False,
            message="Agent not found",
            data=[],
        )
    return APIResponse[List[AgentSessionRead]](
        success=True,
        message="Sessions retrieved",
        data=[AgentSessionRead.model_validate(s) for s in agent.sessions],
    )
