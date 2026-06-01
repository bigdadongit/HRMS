from app.models import Attendance
from app.models.user import db
from datetime import datetime, date
from sqlalchemy import and_


class AttendanceService:
    """Service for attendance operations"""

    @staticmethod
    def mark_attendance(employee_id: str, attendance_date: date, status: str) -> dict:
        """Mark attendance for an employee"""
        try:
            # Check if attendance already marked
            existing = Attendance.query.filter_by(
                employee_id=employee_id,
                date=attendance_date
            ).first()

            if existing:
                existing.status = status
            else:
                existing = Attendance(
                    employee_id=employee_id,
                    date=attendance_date,
                    status=status
                )
                db.session.add(existing)

            db.session.commit()
            return existing.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_attendance_by_employee(employee_id: str, month: int = None, year: int = None) -> list:
        """Get attendance records for an employee"""
        query = Attendance.query.filter_by(employee_id=employee_id)

        if month and year:
            query = query.filter(
                and_(
                    Attendance.date >= date(year, month, 1),
                    Attendance.date < date(year, month + 1, 1) if month < 12 else date(year + 1, 1, 1)
                )
            )

        records = query.all()
        return [record.to_dict() for record in records]

    @staticmethod
    def get_attendance_rate(employee_id: str) -> float:
        """Get attendance rate for an employee (percentage of present days)"""
        total = Attendance.query.filter_by(employee_id=employee_id).count()
        if total == 0:
            return 0.0

        present = Attendance.query.filter_by(
            employee_id=employee_id,
            status='present'
        ).count()

        return (present / total) * 100

    @staticmethod
    def get_team_attendance(employee_ids: list) -> dict:
        """Get attendance summary for a team"""
        attendance_data = {}
        for emp_id in employee_ids:
            attendance_data[emp_id] = AttendanceService.get_attendance_rate(emp_id)
        return attendance_data
