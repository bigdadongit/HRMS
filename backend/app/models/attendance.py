import uuid
from datetime import datetime, date
from sqlalchemy.dialects.postgresql import UUID
from .user import db


class Attendance(db.Model):
    __tablename__ = 'attendance'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = db.Column(UUID(as_uuid=True), db.ForeignKey('employees.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, default=date.today)
    status = db.Column(db.String(50), nullable=False)  # present, absent, leave, half_day
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('employee_id', 'date', name='unique_employee_date'),
    )

    def __repr__(self):
        return f'<Attendance {self.employee_id} - {self.date}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'employee_id': str(self.employee_id),
            'date': self.date.isoformat(),
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
