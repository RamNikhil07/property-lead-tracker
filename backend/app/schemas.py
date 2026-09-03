from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PropertyCreate(BaseModel):
    title: str
    location: str
    property_type: str
    price: Decimal


class PropertyResponse(PropertyCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class AgentCreate(BaseModel):
    name: str
    email: str
    phone: str


class AgentResponse(AgentCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class LeadCreate(BaseModel):
    customer_name: str
    phone: str
    property_id: int
    agent_id: int
    status: str = "New"


class LeadStatusUpdate(BaseModel):
    status: str


class LeadUpdate(BaseModel):
    agent_id: int | None = None
    status: str | None = None


class LeadResponse(BaseModel):
    id: int
    customer_name: str
    phone: str
    property_id: int
    agent_id: int
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ChartDataItem(BaseModel):
    label: str
    count: int


class DashboardResponse(BaseModel):
    total_properties: int
    total_leads: int
    converted_leads: int
    leads_by_status: list[ChartDataItem]
    properties_by_location: list[ChartDataItem]


class AIInsightsResponse(BaseModel):
    insights: str
