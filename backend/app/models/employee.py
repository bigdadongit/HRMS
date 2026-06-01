import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from .user import db


class Employee(db.Model):
    __tablename__ = 'employees'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False, unique=True)
    first_name = db.Column(db.String(255), nullable=False)
    last_name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    department = db.Column(db.String(100), nullable=True)
    designation = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    attendance_records = db.relationship('Attendance', backref='employee', cascade='all, delete-orphan')
    leave_requests = db.relationship('LeaveRequest', backref='employee', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Employee {self.first_name} {self.last_name}>'

    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'department': self.department,
            'designation': self.designation,
            'email': self.user.email,
            'role': self.user.role,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
