from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
import schemas
import database
from database import get_db, engine
import datetime
from typing import Optional, List
from pydantic import BaseModel
from java_tracer import JavaTracer

# Create database tables if they do not exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JavaBloom API",
    description="Backend API for JDI tracing, questions bank, and student activity analytics.",
    version="1.0.0"
)

# Configure CORS so our React frontend can query the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "ok",
        "app": "JavaBloom API Server",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Auth API: Login
@app.post("/auth/login", response_model=schemas.ProfileResponse)
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    username_lower = req.username.lower()
    profile = db.query(models.Profile).filter(models.Profile.username == username_lower).first()
    
    if not profile:
        # Create profile dynamically (matching store fallback mock logic)
        profile = models.Profile(
            username=username_lower,
            full_name=req.username.capitalize(),
            track="ICSE9",
            role="student",
            total_xp=75,
            level=1,
            current_streak=1,
            longest_streak=1,
            last_active_date=datetime.date.today().isoformat()
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
        # Add initial login activity log
        act = models.UserActivity(
            user_id=profile.id,
            activityType="login",
            displayName="Logged in for the first time today",
            xpEarned=5,
            createdAt=datetime.datetime.utcnow().isoformat() + "Z"
        )
        db.add(act)
        db.commit()
        
    return profile

# Auth API: Signup
@app.post("/auth/signup", response_model=schemas.ProfileResponse)
def signup(req: schemas.ProfileCreate, db: Session = Depends(get_db)):
    username_lower = req.username.lower()
    existing = db.query(models.Profile).filter(models.Profile.username == username_lower).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    profile = models.Profile(
        username=username_lower,
        full_name=req.full_name,
        track=req.track,
        role="student",
        total_xp=0,
        level=1,
        current_streak=1,
        longest_streak=1,
        last_active_date=datetime.date.today().isoformat()
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

# Profile details API
@app.get("/profile/me/{user_id}", response_model=schemas.ProfileResponse)
def get_profile(user_id: str, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

# Change active track API
@app.patch("/profile/track", response_model=schemas.ProfileResponse)
def update_track(req: schemas.TrackUpdate, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.id == req.user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.track = req.track
    db.commit()
    db.refresh(profile)
    return profile

# Log user activity and calculate gamification logic
@app.post("/activity/log")
def log_activity(req: schemas.ActivityLogCreate, db: Session = Depends(get_db)):
    profile = db.query(models.Profile).filter(models.Profile.id == req.user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    today_str = datetime.date.today().isoformat()
    streak_updated = profile.current_streak
    longest_streak_updated = profile.longest_streak
    
    if profile.last_active_date != today_str:
        if profile.last_active_date:
            last_date = datetime.date.fromisoformat(profile.last_active_date)
            today_date = datetime.date.today()
            diff_days = (today_date - last_date).days
            
            if diff_days == 1:
                streak_updated += 1
            elif diff_days > 1:
                streak_updated = 1
        else:
            streak_updated = 1
            
        if streak_updated > longest_streak_updated:
            longest_streak_updated = streak_updated

    # Compute new XP and Level
    new_xp = profile.total_xp + req.xpEarned
    xp_requirements = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]
    new_level = 1
    for i, req_xp in enumerate(xp_requirements):
        if new_xp >= req_xp:
            new_level = i + 1
        else:
            break
            
    profile.total_xp = new_xp
    profile.level = new_level
    profile.current_streak = streak_updated
    profile.longest_streak = longest_streak_updated
    profile.last_active_date = today_str
    
    # Save UserActivity
    act = models.UserActivity(
        user_id=profile.id,
        activityType=req.activityType,
        displayName=req.displayName,
        xpEarned=req.xpEarned,
        createdAt=datetime.datetime.utcnow().isoformat() + "Z",
        activity_metadata=req.metadata
    )
    db.add(act)
    db.commit()
    db.refresh(profile)
    db.refresh(act)
    
    return {
        "profile": {
            "id": profile.id,
            "username": profile.username,
            "full_name": profile.full_name,
            "track": profile.track,
            "role": profile.role,
            "total_xp": profile.total_xp,
            "level": profile.level,
            "current_streak": profile.current_streak,
            "longest_streak": profile.longest_streak,
            "last_active_date": profile.last_active_date
        },
        "activity": {
            "id": act.id,
            "activityType": act.activityType,
            "displayName": act.displayName,
            "xpEarned": act.xpEarned,
            "createdAt": act.createdAt,
            "metadata": act.activity_metadata
        }
    }

# Get list of all activities for profile (heatmap + recent lists)
@app.get("/profile/activities/{user_id}", response_model=List[schemas.ActivityResponse])
def get_user_activities(user_id: str, db: Session = Depends(get_db)):
    activities = db.query(models.UserActivity).filter(models.UserActivity.user_id == user_id).order_by(models.UserActivity.createdAt.desc()).all()
    return activities

# Questions API
@app.get("/questions")
def get_questions(track: str, type: Optional[str] = None, chapter: Optional[int] = None, sub_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Question).filter(models.Question.track == track)
    if type:
        query = query.filter(models.Question.type == type)
    if chapter is not None:
        query = query.filter(models.Question.chapter_number == chapter)
    if sub_type is not None:
        query = query.filter(models.Question.sub_type == sub_type)
    return query.all()

@app.get("/chapters")
def get_chapters(track: str, db: Session = Depends(get_db)):
    """Returns distinct chapters for a track, ordered by chapter_number."""
    chapters = db.query(
        models.Question.chapter_number,
        models.Question.chapter_title
    ).filter(
        models.Question.track == track,
        models.Question.type == "predict_output"
    ).distinct().order_by(models.Question.chapter_number).all()
    return [{"chapter_number": c[0], "chapter_title": c[1]} for c in chapters if c[0] is not None]

@app.get("/chapters/progress", response_model=List[schemas.ChapterProgressResponse])
def get_chapter_progress(user_id: str, track: str, db: Session = Depends(get_db)):
    """Returns completion % and mistake count per chapter."""
    chapters = db.query(
        models.Question.chapter_number,
        models.Question.chapter_title
    ).filter(
        models.Question.track == track,
        models.Question.type == "predict_output"
    ).distinct().order_by(models.Question.chapter_number).all()

    response = []
    for ch_num, ch_title in chapters:
        if ch_num is None:
            continue
        # Total questions in this chapter
        total_q = db.query(models.Question).filter(
            models.Question.track == track,
            models.Question.type == "predict_output",
            models.Question.chapter_number == ch_num
        ).count()

        # All attempts by this user for this chapter
        attempts = db.query(models.ArenaAttempt).filter(
            models.ArenaAttempt.user_id == user_id,
            models.ArenaAttempt.track == track,
            models.ArenaAttempt.chapter_number == ch_num
        ).all()

        # Unique questions answered correctly
        correct_q_ids = {a.question_id for a in attempts if a.is_correct}
        correct_count = len(correct_q_ids)

        # Unique questions attempted
        attempted_q_ids = {a.question_id for a in attempts}
        attempted_count = len(attempted_q_ids)

        # Mistakes (total wrong attempts)
        mistakes = sum(1 for a in attempts if not a.is_correct)

        completion_pct = (correct_count / total_q * 100) if total_q > 0 else 0.0

        response.append(schemas.ChapterProgressResponse(
            chapter_number=ch_num,
            chapter_title=ch_title,
            total_questions=total_q,
            correct_count=correct_count,
            attempted_count=attempted_count,
            mistakes=mistakes,
            completion_pct=round(completion_pct, 1)
        ))
    return response

@app.post("/arena/submit", response_model=schemas.ArenaSubmitResponse)
def submit_arena_answer(req: schemas.ArenaSubmitRequest, db: Session = Depends(get_db)):
    """Records attempt, checks answer, awards XP (first-correct-only), returns result."""
    question = db.query(models.Question).filter(models.Question.id == req.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    user_ans = req.user_answer.strip()
    correct_ans = question.correct_answer.strip()
    is_correct = user_ans == correct_ans

    # Check if the user already solved this question correctly before
    already_solved = db.query(models.ArenaAttempt).filter(
        models.ArenaAttempt.user_id == req.user_id,
        models.ArenaAttempt.question_id == req.question_id,
        models.ArenaAttempt.is_correct == True
    ).first() is not None

    xp_earned = 0
    if is_correct and not already_solved:
        xp_earned = 10
        profile = db.query(models.Profile).filter(models.Profile.id == req.user_id).first()
        if profile:
            profile.total_xp += xp_earned
            # Compute new level
            xp_requirements = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]
            new_level = 1
            for i, req_xp in enumerate(xp_requirements):
                if profile.total_xp >= req_xp:
                    new_level = i + 1
                else:
                    break
            profile.level = new_level
            
            # Log UserActivity
            act = models.UserActivity(
                user_id=profile.id,
                activityType="drill_complete",
                displayName=f"Solved a Predict the Output question in {question.chapter_title}",
                xpEarned=xp_earned,
                createdAt=datetime.datetime.utcnow().isoformat() + "Z",
                activity_metadata={"question_id": question.id, "chapter_number": question.chapter_number}
            )
            db.add(act)

    # Record attempt
    attempt = models.ArenaAttempt(
        user_id=req.user_id,
        question_id=req.question_id,
        track=question.track,
        chapter_number=question.chapter_number,
        user_answer=req.user_answer,
        is_correct=is_correct,
        time_taken_ms=req.time_taken_ms,
        attempted_at=datetime.datetime.utcnow().isoformat() + "Z"
    )
    db.add(attempt)
    db.commit()

    return schemas.ArenaSubmitResponse(
        is_correct=is_correct,
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        xp_earned=xp_earned,
        already_solved=already_solved
    )

@app.get("/arena/mistakes", response_model=List[schemas.MistakeDetail])
def get_arena_mistakes(user_id: str, track: str, chapter: int, db: Session = Depends(get_db)):
    """Returns mistake log for a user in a specific chapter."""
    wrong_attempts = db.query(models.ArenaAttempt).filter(
        models.ArenaAttempt.user_id == user_id,
        models.ArenaAttempt.track == track,
        models.ArenaAttempt.chapter_number == chapter,
        models.ArenaAttempt.is_correct == False
    ).order_by(models.ArenaAttempt.attempted_at.asc()).all()

    from collections import defaultdict
    grouped = defaultdict(list)
    for att in wrong_attempts:
        grouped[att.question_id].append(att.user_answer)

    res = []
    for q_id, wrong_answers in grouped.items():
        question = db.query(models.Question).filter(models.Question.id == q_id).first()
        if not question:
            continue
        
        code = ""
        if question.content and isinstance(question.content, dict):
            code = question.content.get("code") or question.content.get("expression") or ""

        total_attempts = db.query(models.ArenaAttempt).filter(
            models.ArenaAttempt.user_id == user_id,
            models.ArenaAttempt.question_id == q_id
        ).count()

        res.append(schemas.MistakeDetail(
            question_id=q_id,
            code=code,
            correct_answer=question.correct_answer,
            user_answers=wrong_answers,
            explanation=question.explanation,
            attempt_count=total_attempts
        ))
    return res

# Traces API
@app.get("/traces/{question_id}")
def get_trace(question_id: str, db: Session = Depends(get_db)):
    trace = db.query(models.Trace).filter(models.Trace.question_id == question_id).first()
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found for this question")
    return {
        "id": trace.id,
        "question_id": trace.question_id,
        "code": trace.code,
        "steps": trace.steps,
        "finalOutput": trace.final_output
    }

class GenerateTraceRequest(BaseModel):
    code: str

@app.post("/sandbox/generate")
def generate_trace(req: GenerateTraceRequest):
    tracer = JavaTracer(req.code)
    res = tracer.trace()
    if 'error' in res:
        raise HTTPException(status_code=400, detail=res['error'])
    return res

