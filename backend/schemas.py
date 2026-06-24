from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class ProfileBase(BaseModel):
    username: str
    full_name: str
    track: str

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(BaseModel):
    id: str
    username: str
    full_name: str
    track: str
    role: str
    total_xp: int
    level: int
    current_streak: int
    longest_streak: int
    last_active_date: Optional[str] = None

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str

class ActivityLogCreate(BaseModel):
    user_id: str
    activityType: str
    displayName: str
    xpEarned: int
    metadata: Optional[Dict[str, Any]] = Field(None, alias="activity_metadata")

    class Config:
        populate_by_name = True

class ActivityResponse(BaseModel):
    id: str
    user_id: str
    activityType: str
    displayName: str
    xpEarned: int
    createdAt: str
    metadata: Optional[Dict[str, Any]] = Field(None, alias="activity_metadata")

    class Config:
        from_attributes = True
        populate_by_name = True

class TrackUpdate(BaseModel):
    user_id: str
    track: str

class HeatmapDayResponse(BaseModel):
    date: str
    count: int
    level: int

# --- Arena-specific schemas ---

class ArenaSubmitRequest(BaseModel):
    user_id: str
    question_id: str
    user_answer: str
    time_taken_ms: Optional[int] = None

class ArenaSubmitResponse(BaseModel):
    is_correct: bool
    correct_answer: str
    explanation: Optional[str] = None
    xp_earned: int
    already_solved: bool  # True if they already got this one right before

class ChapterInfo(BaseModel):
    chapter_number: int
    chapter_title: str

class ChapterProgressResponse(BaseModel):
    chapter_number: int
    chapter_title: str
    total_questions: int
    correct_count: int      # Unique questions answered correctly
    attempted_count: int    # Unique questions attempted
    mistakes: int           # Total wrong attempts
    completion_pct: float   # correct_count / total_questions * 100

class MistakeDetail(BaseModel):
    question_id: str
    code: str
    correct_answer: str
    user_answers: List[str]  # All wrong answers they gave
    explanation: Optional[str] = None
    attempt_count: int
