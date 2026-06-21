# JavaBloom

An interactive, visual learning platform for school students studying Computer Applications (Java). Scope spans ICSE Class 9, ICSE Class 10, and AP Computer Science A.

## Monorepo Layout

* `/frontend` - React + TypeScript + Vite + TailwindCSS v4
* `/backend` - FastAPI (Python) for JDI tracing & content bank APIs
* `/docs` or Root - Feature buckets and specifications

## Getting Started

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
