import uuid
from datetime import datetime, date
from sqlalchemy.dialects.postgresql import UUID
from .user import db


class LeaveRequest(db.Model):
    __tablename__ = 'leave_requests'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = db.Column(UUID(as_uuid=True), db.ForeignKey('employees.id'), nullable=False, index=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    leave_type = db.Column(db.String(50), nullable=False)  # casual_leave, sick_leave, earned_leave
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')  # pending, approved, rejected, cancelled
    approved_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    approval_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<LeaveRequest {self.employee_id} - {self.start_date} to {self.end_date}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'employee_id': str(self.employee_id),
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'leave_type': self.leave_type,
            'reason': self.reason,
            'status': self.status,
            'approved_by': str(self.approved_by) if self.approved_by else None,
            'approval_date': self.approval_date.isoformat() if self.approval_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
