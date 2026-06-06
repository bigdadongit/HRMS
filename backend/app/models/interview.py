from app.models.user import db
from datetime import datetime
import uuid


class Interview(db.Model):
    """Interview model for tracking interview sessions"""
    __tablename__ = 'interviews'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_name = db.Column(db.String(255), nullable=False)
    role_applied = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    status = db.Column(db.String(50), default='in_progress')  # in_progress, completed

    # Relationships
    questions = db.relationship('InterviewQuestion', backref='interview', lazy=True, cascade='all, delete-orphan')
    answers = db.relationship('InterviewAnswer', backref='interview', lazy=True, cascade='all, delete-orphan')
    result = db.relationship('InterviewResult', backref='interview', lazy=True, uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'candidate_name': self.candidate_name,
            'role_applied': self.role_applied,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'created_by': self.created_by,
            'status': self.status
        }


class InterviewQuestion(db.Model):
    """Interview questions model"""
    __tablename__ = 'interview_questions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id = db.Column(db.String(36), db.ForeignKey('interviews.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)  # easy, medium, hard
    order = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'interview_id': self.interview_id,
            'question': self.question,
            'difficulty': self.difficulty,
            'order': self.order
        }


class InterviewAnswer(db.Model):
    """Interview answers model"""
    __tablename__ = 'interview_answers'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id = db.Column(db.String(36), db.ForeignKey('interviews.id'), nullable=False)
    question_id = db.Column(db.String(36), db.ForeignKey('interview_questions.id'), nullable=True)
    answer = db.Column(db.Text, nullable=True)
    score = db.Column(db.Float, nullable=True)
    answered_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'interview_id': self.interview_id,
            'question_id': self.question_id,
            'answer': self.answer,
            'score': self.score,
            'answered_at': self.answered_at.isoformat() if self.answered_at else None
        }


class InterviewResult(db.Model):
    """Interview results model"""
    __tablename__ = 'interview_results'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id = db.Column(db.String(36), db.ForeignKey('interviews.id'), nullable=False)
    technical_score = db.Column(db.Float, nullable=False)
    communication_score = db.Column(db.Float, nullable=False)
    confidence_score = db.Column(db.Float, nullable=False)
    overall_score = db.Column(db.Float, nullable=False)
    recommendation = db.Column(db.String(50), nullable=False)  # Proceed, Maybe, Reject
    feedback = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'interview_id': self.interview_id,
            'technical_score': self.technical_score,
            'communication_score': self.communication_score,
            'confidence_score': self.confidence_score,
            'overall_score': self.overall_score,
            'recommendation': self.recommendation,
            'feedback': self.feedback,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
