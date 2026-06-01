from app.models import LeaveRequest
from app.models.user import db
from datetime import date
from sqlalchemy import and_


class LeaveService:
    """Service for leave request operations"""

    @staticmethod
    def create_leave_request(employee_id: str, start_date: date, end_date: date, reason: str) -> dict:
        """Create a leave request"""
        try:
            leave_request = LeaveRequest(
                employee_id=employee_id,
                start_date=start_date,
                end_date=end_date,
                reason=reason,
                status='pending'
            )
            db.session.add(leave_request)
            db.session.commit()
            return leave_request.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_leave_request_by_id(leave_id: str) -> LeaveRequest:
        """Get leave request by ID"""
        return LeaveRequest.query.filter_by(id=leave_id).first()

    @staticmethod
    def get_leave_requests_by_employee(employee_id: str) -> list:
        """Get all leave requests for an employee"""
        requests = LeaveRequest.query.filter_by(employee_id=employee_id).all()
        return [req.to_dict() for req in requests]

    @staticmethod
    def get_pending_leave_requests() -> list:
        """Get all pending leave requests"""
        requests = LeaveRequest.query.filter_by(status='pending').all()
        return [req.to_dict() for req in requests]

    @staticmethod
    def approve_leave_request(leave_id: str) -> dict:
        """Approve a leave request"""
        try:
            leave_request = LeaveRequest.query.filter_by(id=leave_id).first()
            if not leave_request:
                raise ValueError('Leave request not found')

            leave_request.status = 'approved'
            db.session.commit()
            return leave_request.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def reject_leave_request(leave_id: str) -> dict:
        """Reject a leave request"""
        try:
            leave_request = LeaveRequest.query.filter_by(id=leave_id).first()
            if not leave_request:
                raise ValueError('Leave request not found')

            leave_request.status = 'rejected'
            db.session.commit()
            return leave_request.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_pending_leaves_count() -> int:
        """Get count of pending leave requests"""
        return LeaveRequest.query.filter_by(status='pending').count()
