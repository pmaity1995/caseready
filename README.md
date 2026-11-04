# CaseReady — Judicial Intelligence Powered by Meta Muse Spark

CaseReady is a human-in-the-loop legal case analysis prototype built for the Meta Global AI Developer Hackathon.

## Features

- Two-party petition analysis
- Meta Muse Spark 1.3 judicial assessment
- Separate Muse-powered neutrality audit
- Evidence-gap identification
- Neutral judicial question generation
- California legal-source research
- CourtListener precedent retrieval
- Citation-checking workflow
- Exportable judicial briefing

## Technology Stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express
- AI: Meta Muse Spark 1.3
- Legal research: CourtListener and locally indexed court opinions

## Meta AI Integration

CaseReady uses the Meta Model API to run two separate Muse Spark analysis stages:

1. Judicial Assessment: Identifies disputed issues, missing evidence, and neutral questions.
2. Neutrality Audit: Reviews the assessment for potential bias and unsupported assumptions.

Backend endpoints:
- POST /api/judicial-assessment
- POST /api/judicial-review

## Running Locally

Backend:

    cd backend
    npm install
    npm start

Frontend:

    cd frontend
    npm install
    npm run dev

Configure backend environment variables locally before starting the backend. Never commit API keys.

## Responsible Use

CaseReady is an AI-assisted research prototype. It does not make judicial decisions or independently verify legal claims. Human review is required.
