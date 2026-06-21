from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

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
