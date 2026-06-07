from app.models import Attendance, Employee
from app.models.user import db
from datetime import datetime, date
from sqlalchemy import and_, func
from calendar import monthrange
import uuid


class AttendanceService:
    """Service for attendance operations"""

    @staticmethod
    def mark_attendance(employee_id: str, attendance_date: date, status: str) -> dict:
        """Mark attendance for an employee"""
        try:
            # Validate status
            valid_statuses = ['present', 'absent', 'leave', 'half_day']
            if status not in valid_statuses:
                raise ValueError(f'Invalid status. Must be one of: {", ".join(valid_statuses)}')
            
            # Normalize employee id
            emp_uuid = uuid.UUID(str(employee_id)) if employee_id is not None else None
            # Check if attendance already marked
            existing = Attendance.query.filter_by(
                employee_id=emp_uuid,
                date=attendance_date
            ).first()

            if existing:
                existing.status = status
            else:
                existing = Attendance(
                    employee_id=emp_uuid,
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
    def update_attendance(attendance_id: str, status: str) -> dict:
        """Update attendance record"""
        try:
            valid_statuses = ['present', 'absent', 'leave', 'half_day']
            if status not in valid_statuses:
                raise ValueError(f'Invalid status. Must be one of: {", ".join(valid_statuses)}')
            
            record = Attendance.query.filter_by(id=attendance_id).first()
            if not record:
                raise ValueError('Attendance record not found')
            
            record.status = status
            db.session.commit()
            return record.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_attendance_by_employee(employee_id: str, month: int = None, year: int = None, page: int = 1, per_page: int = 31) -> dict:
        """Get attendance records for an employee with pagination"""
        emp_uuid = uuid.UUID(str(employee_id)) if employee_id is not None else None
        query = Attendance.query.filter_by(employee_id=emp_uuid)

        if month and year:
            # Get first and last day of month
            _, last_day = monthrange(year, month)
            first_date = date(year, month, 1)
            last_date = date(year, month, last_day)

            query = query.filter(
                and_(
                    Attendance.date >= first_date,
                    Attendance.date <= last_date
                )
            )

        query = query.order_by(Attendance.date.desc())
        total = query.count()
        records = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'data': [record.to_dict() for record in records.items],
            'total': total,
            'pages': records.pages,
            'current_page': page,
            'per_page': per_page
        }

    @staticmethod
    def get_monthly_attendance_report(employee_id: str, month: int, year: int) -> dict:
        """Get detailed monthly attendance report"""
        try:
            # Get all days in month
            _, last_day = monthrange(year, month)
            
            report = {
                'employee_id': employee_id,
                'month': month,
                'year': year,
                'total_days': last_day,
                'present': 0,
                'absent': 0,
                'leave': 0,
                'half_day': 0,
                'attendance_percentage': 0.0,
                'daily_records': []
            }
            
            # Get attendance for the month
            first_date = date(year, month, 1)
            last_date = date(year, month, last_day)
            
            emp_uuid = uuid.UUID(str(employee_id)) if employee_id is not None else None
            records = Attendance.query.filter(
                and_(
                    Attendance.employee_id == emp_uuid,
                    Attendance.date >= first_date,
                    Attendance.date <= last_date
                )
            ).order_by(Attendance.date).all()
            
            # Count statuses
            for record in records:
                if record.status == 'present':
                    report['present'] += 1
                elif record.status == 'absent':
                    report['absent'] += 1
                elif record.status == 'leave':
                    report['leave'] += 1
                elif record.status == 'half_day':
                    report['half_day'] += 1
                
                report['daily_records'].append(record.to_dict())
            
            # Calculate attendance percentage (present and half_day count as present)
            working_days = report['present'] + report['absent'] + report['half_day'] + (report['leave'] * 0)
            if working_days > 0:
                report['attendance_percentage'] = round((report['present'] + report['half_day'] * 0.5) / working_days * 100, 2)
            
            return report
        except Exception as e:
            raise e

    @staticmethod
    def get_attendance_summary(employee_id: str) -> dict:
        """Get overall attendance summary"""
        try:
            emp_uuid = uuid.UUID(str(employee_id)) if employee_id is not None else None
            total = Attendance.query.filter_by(employee_id=emp_uuid).count()
            
            if total == 0:
                return {
                    'employee_id': employee_id,
                    'total_records': 0,
                    'present': 0,
                    'absent': 0,
                    'leave': 0,
                    'half_day': 0,
                    'attendance_percentage': 0.0
                }
            
            present = Attendance.query.filter_by(employee_id=emp_uuid, status='present').count()
            absent = Attendance.query.filter_by(employee_id=emp_uuid, status='absent').count()
            leave = Attendance.query.filter_by(employee_id=emp_uuid, status='leave').count()
            half_day = Attendance.query.filter_by(employee_id=emp_uuid, status='half_day').count()
            
            attendance_percentage = round((present + half_day * 0.5) / total * 100, 2)
            
            return {
                'employee_id': employee_id,
                'total_records': total,
                'present': present,
                'absent': absent,
                'leave': leave,
                'half_day': half_day,
                'attendance_percentage': attendance_percentage
            }
        except Exception as e:
            raise e

    @staticmethod
    def get_attendance_rate(employee_id: str) -> float:
        """Get attendance rate for an employee (percentage of present days)"""
        emp_uuid = uuid.UUID(str(employee_id)) if employee_id is not None else None
        total = Attendance.query.filter_by(employee_id=emp_uuid).count()
        if total == 0:
            return 0.0

        present = Attendance.query.filter_by(
            employee_id=emp_uuid,
            status='present'
        ).count()

        return round((present / total) * 100, 2)

    @staticmethod
    def get_team_attendance(employee_ids: list) -> dict:
        """Get attendance summary for a team"""
        attendance_data = {}
        for emp_id in employee_ids:
            attendance_data[emp_id] = AttendanceService.get_attendance_summary(emp_id)
        return attendance_data

    @staticmethod
    def get_organization_attendance_summary(year: int = None, month: int = None) -> dict:
        """Get organization-wide attendance summary"""
        try:
            query = Attendance.query
            
            if year and month:
                _, last_day = monthrange(year, month)
                first_date = date(year, month, 1)
                last_date = date(year, month, last_day)
                
                query = query.filter(
                    and_(
                        Attendance.date >= first_date,
                        Attendance.date <= last_date
                    )
                )
            
            total = query.count()
            
            if total == 0:
                return {
                    'total_records': 0,
                    'present': 0,
                    'absent': 0,
                    'leave': 0,
                    'half_day': 0,
                    'average_attendance_percentage': 0.0
                }
            
            present = query.filter_by(status='present').count()
            absent = query.filter_by(status='absent').count()
            leave = query.filter_by(status='leave').count()
            half_day = query.filter_by(status='half_day').count()
            
            avg_percentage = round((present + half_day * 0.5) / total * 100, 2)
            
            return {
                'total_records': total,
                'present': present,
                'absent': absent,
                'leave': leave,
                'half_day': half_day,
                'average_attendance_percentage': avg_percentage
            }
        except Exception as e:
            raise e

