import os

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import schemas
from app.database import Base, engine, get_db
from app.models import Agent, Lead, Property

import app.models  # noqa: F401

app = FastAPI(title="Property Lead Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get("/")
def read_root():
    return {"message": "Property Lead Tracker API is running"}


@app.get("/api/properties", response_model=list[schemas.PropertyResponse])
def get_properties(
    search: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Property)
    if search is not None:
        search_pattern = f"%{search}%"
        query = query.filter(
            Property.title.ilike(search_pattern)
            | Property.location.ilike(search_pattern)
            | Property.property_type.ilike(search_pattern)
        )
    return query.all()


@app.post(
    "/api/properties",
    response_model=schemas.PropertyResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_property(
    property_data: schemas.PropertyCreate,
    db: Session = Depends(get_db),
):
    new_property = Property(**property_data.model_dump())
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return new_property 


@app.get("/api/agents", response_model=list[schemas.AgentResponse])
def get_agents(db: Session = Depends(get_db)):
    return db.query(Agent).all()


@app.post(
    "/api/agents",
    response_model=schemas.AgentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_agent(
    agent_data: schemas.AgentCreate,
    db: Session = Depends(get_db),
):
    new_agent = Agent(**agent_data.model_dump())
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    return new_agent


@app.get("/api/leads", response_model=list[schemas.LeadResponse])
def get_leads(
    status: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Lead)
    if status is not None:
        query = query.filter(Lead.status == status)
    return query.all()


@app.post(
    "/api/leads",
    response_model=schemas.LeadResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_lead(
    lead_data: schemas.LeadCreate,
    db: Session = Depends(get_db),
):
    new_lead = Lead(**lead_data.model_dump())
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    return new_lead


@app.put("/api/leads/{lead_id}", response_model=schemas.LeadResponse)
def update_lead_status(
    lead_id: int,
    lead_update: schemas.LeadUpdate,
    db: Session = Depends(get_db),
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if lead is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    if lead_update.agent_id is not None:
        lead.agent_id = lead_update.agent_id
    if lead_update.status is not None:
        lead.status = lead_update.status

    db.commit()
    db.refresh(lead)
    return lead


@app.delete("/api/leads/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if lead is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    db.delete(lead)
    db.commit()
    return None


@app.get("/api/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    total_properties = db.query(func.count(Property.id)).scalar() or 0
    total_leads = db.query(func.count(Lead.id)).scalar() or 0
    converted_leads = (
        db.query(func.count(Lead.id)).filter(Lead.status == "Converted").scalar() or 0
    )

    leads_by_status = [
        {"label": row.status, "count": row.count}
        for row in db.query(Lead.status, func.count(Lead.id).label("count")).group_by(Lead.status).all()
    ]

    properties_by_location = [
        {"label": row.location, "count": row.count}
        for row in db.query(Property.location, func.count(Property.id).label("count")).group_by(Property.location).all()
    ]

    return {
        "total_properties": total_properties,
        "total_leads": total_leads,
        "converted_leads": converted_leads,
        "leads_by_status": leads_by_status,
        "properties_by_location": properties_by_location,
    }


@app.post("/api/ai/insights", response_model=schemas.AIInsightsResponse)
def get_ai_insights(db: Session = Depends(get_db)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not configured.",
        )

    total_properties = db.query(func.count(Property.id)).scalar() or 0
    total_leads = db.query(func.count(Lead.id)).scalar() or 0
    converted_leads = (
        db.query(func.count(Lead.id)).filter(Lead.status == "Converted").scalar() or 0
    )
    leads_by_status = [
        {"status": row.status, "count": row.count}
        for row in db.query(Lead.status, func.count(Lead.id).label("count")).group_by(Lead.status).all()
    ]
    properties_by_location = [
        {"location": row.location, "count": row.count}
        for row in db.query(Property.location, func.count(Property.id).label("count")).group_by(Property.location).all()
    ]

    summary = (
        f"Total properties: {total_properties}\n"
        f"Total leads: {total_leads}\n"
        f"Converted leads: {converted_leads}\n"
        "Leads by status: "
        + (", ".join(f"{item['status']}={item['count']}" for item in leads_by_status) if leads_by_status else "none")
        + "\n"
        "Properties by location: "
        + (", ".join(f"{item['location']}={item['count']}" for item in properties_by_location) if properties_by_location else "none")
    )

    prompt = (
        "Analyze these property-lead statistics and provide 3-5 concise, factual observations. "
        "Use only the information below. Do not give investment, lending, valuation, "
        "price-prediction, or guaranteed-return advice.\n\n"
        f"{summary}"
    )

    try:
        client = genai.Client(api_key=api_key)
        interaction = client.interactions.create(
            model="gemini-3.8-flash",
            input=prompt,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI insights service is temporarily unavailable.",
        ) from None

    return {"insights": interaction.output_text}
