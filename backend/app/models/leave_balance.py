import uuid
from datetime import datetime, date
from sqlalchemy.dialects.postgresql import UUID
from .user import db


class LeaveBalance(db.Model):
    __tablename__ = 'leave_balances'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = db.Column(UUID(as_uuid=True), db.ForeignKey('employees.id'), nullable=False, unique=True, index=True)
    casual_leave_balance = db.Column(db.Integer, nullable=False, default=12)
    sick_leave_balance = db.Column(db.Integer, nullable=False, default=10)
    earned_leave_balance = db.Column(db.Integer, nullable=False, default=20)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    employee = db.relationship('Employee', backref='leave_balance')

    def __repr__(self):
        return f'<LeaveBalance {self.employee_id}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'employee_id': str(self.employee_id),
            'casual_leave_balance': self.casual_leave_balance,
            'sick_leave_balance': self.sick_leave_balance,
            'earned_leave_balance': self.earned_leave_balance,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def get_total_balance(self):
        return self.casual_leave_balance + self.sick_leave_balance + self.earned_leave_balance
