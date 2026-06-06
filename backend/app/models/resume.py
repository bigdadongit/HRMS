from app.models.user import db
from datetime import datetime
import uuid


class Resume(db.Model):
    """Resume model for storing uploaded resumes"""
    __tablename__ = 'resumes'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)  # pdf, docx
    extracted_text = db.Column(db.Text, nullable=True)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)

    # Relationship with screenings
    screenings = db.relationship('ResumeScreening', backref='resume', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'candidate_name': self.candidate_name,
            'file_name': self.file_name,
            'file_type': self.file_type,
            'extracted_text': self.extracted_text,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'uploaded_by': self.uploaded_by
        }


class ResumeScreening(db.Model):
    """Resume screening results model"""
    __tablename__ = 'resume_screenings'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id = db.Column(db.String(36), db.ForeignKey('resumes.id'), nullable=False)
    jd_text = db.Column(db.Text, nullable=False)
    match_score = db.Column(db.Float, nullable=False)  # 0-100
    skills_found = db.Column(db.JSON, nullable=True)  # List of skills
    missing_skills = db.Column(db.JSON, nullable=True)  # List of missing skills
    experience_summary = db.Column(db.Text, nullable=True)
    strengths = db.Column(db.JSON, nullable=True)  # List of strengths
    recommendation = db.Column(db.String(50), nullable=False)  # Proceed, Maybe, Reject
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    screened_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'resume_id': self.resume_id,
            'jd_text': self.jd_text,
            'match_score': self.match_score,
            'skills_found': self.skills_found or [],
            'missing_skills': self.missing_skills or [],
            'experience_summary': self.experience_summary,
            'strengths': self.strengths or [],
            'recommendation': self.recommendation,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'screened_by': self.screened_by
        }
