# Simple Property Lead Tracker

## Overview

Simple Property Lead Tracker is a small business dashboard for managing real-estate properties, agents, and sales leads.

## Features

- Manage properties and agents.
- Create leads, assign them to properties and agents, filter by status, update status or assignment, and delete leads.
- View a dashboard with exactly three KPIs and two charts.
- Generate Gemini-powered property insights from prepared summary statistics.

## Technology Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, and Recharts
- Backend: FastAPI and SQLAlchemy
- Database: PostgreSQL
- Insights: Gemini API

## Architecture

```text
Next.js frontend -> FastAPI -> SQLAlchemy -> PostgreSQL
															|
															-> Gemini API
```

Gemini receives only backend-prepared summary statistics.

## Project Structure

```text
backend/
	app/
		database.py
		main.py
		models.py
		schemas.py
		seed.py
	.env.example
frontend/
	my-app/
		app/
			page.tsx
			properties/page.tsx
			leads/page.tsx
```

## Backend Setup

From the project root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Update `backend/.env` with your local PostgreSQL connection details and Gemini API key, then start the API:

```powershell
uvicorn app.main:app --reload
```

## Frontend Setup

In a separate terminal:

```powershell
cd frontend/my-app
npm install
npm run dev
```

## API

- `GET /api/properties`
- `POST /api/properties`
- `GET /api/agents`
- `POST /api/agents`
- `GET /api/leads`
- `POST /api/leads`
- `PUT /api/leads/{lead_id}`
- `DELETE /api/leads/{lead_id}`
- `GET /api/dashboard`
- `POST /api/ai/insights`

## Secrets

Keep secrets in `backend/.env`. Never commit that file, passwords, or API keys to the repository.
