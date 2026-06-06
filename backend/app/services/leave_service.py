from app.models import LeaveRequest, LeaveBalance, Employee
from app.models.user import db
from datetime import date, datetime
from sqlalchemy import and_


class LeaveService:
    """Service for leave request operations"""

    LEAVE_TYPES = ['casual_leave', 'sick_leave', 'earned_leave']

    @staticmethod
    def create_leave_request(employee_id: str, start_date: date, end_date: date, 
                            leave_type: str, reason: str) -> dict:
        """Create a leave request"""
        try:
            # Validate leave type
            if leave_type not in LeaveService.LEAVE_TYPES:
                raise ValueError(f'Invalid leave type. Must be one of: {", ".join(LeaveService.LEAVE_TYPES)}')
            
            # Validate dates
            if start_date > end_date:
                raise ValueError('Start date must be before end date')
            
            # Get leave balance
            leave_balance = LeaveBalance.query.filter_by(employee_id=employee_id).first()
            if not leave_balance:
                raise ValueError('Employee leave balance not found')
            
            # Calculate days requested
            days_requested = (end_date - start_date).days + 1
            
            # Check balance
            balance_field = f'{leave_type}_balance'
            current_balance = getattr(leave_balance, balance_field)
            
            if current_balance < days_requested:
                raise ValueError(f'Insufficient {leave_type} balance. Available: {current_balance}, Requested: {days_requested}')
            
            leave_request = LeaveRequest(
                employee_id=employee_id,
                start_date=start_date,
                end_date=end_date,
                leave_type=leave_type,
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
    def get_leave_requests_by_employee(employee_id: str, status: str = None, page: int = 1, per_page: int = 10) -> dict:
        """Get all leave requests for an employee with pagination"""
        query = LeaveRequest.query.filter_by(employee_id=employee_id)
        
        if status:
            query = query.filter_by(status=status)
        
        query = query.order_by(LeaveRequest.created_at.desc())
        total = query.count()
        records = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'data': [req.to_dict() for req in records.items],
            'total': total,
            'pages': records.pages,
            'current_page': page,
            'per_page': per_page
        }

    @staticmethod
    def get_pending_leave_requests(page: int = 1, per_page: int = 10) -> dict:
        """Get all pending leave requests with pagination"""
        query = LeaveRequest.query.filter_by(status='pending').order_by(LeaveRequest.created_at.asc())
        total = query.count()
        records = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'data': [req.to_dict() for req in records.items],
            'total': total,
            'pages': records.pages,
            'current_page': page,
            'per_page': per_page
        }

    @staticmethod
    def get_team_leave_requests(employee_ids: list, page: int = 1, per_page: int = 10) -> dict:
        """Get leave requests for a team"""
        query = LeaveRequest.query.filter(LeaveRequest.employee_id.in_(employee_ids))
        query = query.order_by(LeaveRequest.created_at.desc())
        total = query.count()
        records = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'data': [req.to_dict() for req in records.items],
            'total': total,
            'pages': records.pages,
            'current_page': page,
            'per_page': per_page
        }

    @staticmethod
    def approve_leave_request(leave_id: str, approved_by_user_id: str) -> dict:
        """Approve a leave request"""
        try:
            leave_request = LeaveRequest.query.filter_by(id=leave_id).first()
            if not leave_request:
                raise ValueError('Leave request not found')

            if leave_request.status != 'pending':
                raise ValueError(f'Cannot approve leave with status: {leave_request.status}')

            # Deduct from leave balance
            leave_balance = LeaveBalance.query.filter_by(employee_id=leave_request.employee_id).first()
            days_used = (leave_request.end_date - leave_request.start_date).days + 1
            balance_field = f'{leave_request.leave_type}_balance'
            
            current_balance = getattr(leave_balance, balance_field)
            setattr(leave_balance, balance_field, current_balance - days_used)

            leave_request.status = 'approved'
            leave_request.approved_by = approved_by_user_id
            leave_request.approval_date = datetime.utcnow()
            
            db.session.commit()
            return leave_request.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def reject_leave_request(leave_id: str, approved_by_user_id: str) -> dict:
        """Reject a leave request"""
        try:
            leave_request = LeaveRequest.query.filter_by(id=leave_id).first()
            if not leave_request:
                raise ValueError('Leave request not found')

            if leave_request.status != 'pending':
                raise ValueError(f'Cannot reject leave with status: {leave_request.status}')

            leave_request.status = 'rejected'
            leave_request.approved_by = approved_by_user_id
            leave_request.approval_date = datetime.utcnow()
            
            db.session.commit()
            return leave_request.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def cancel_leave_request(leave_id: str) -> dict:
        """Cancel a leave request (by employee)"""
        try:
            leave_request = LeaveRequest.query.filter_by(id=leave_id).first()
            if not leave_request:
                raise ValueError('Leave request not found')

            if leave_request.status not in ['pending', 'approved']:
                raise ValueError(f'Cannot cancel leave with status: {leave_request.status}')

            # Restore balance if was approved
            if leave_request.status == 'approved':
                leave_balance = LeaveBalance.query.filter_by(employee_id=leave_request.employee_id).first()
                days_used = (leave_request.end_date - leave_request.start_date).days + 1
                balance_field = f'{leave_request.leave_type}_balance'
                current_balance = getattr(leave_balance, balance_field)
                setattr(leave_balance, balance_field, current_balance + days_used)

            leave_request.status = 'cancelled'
            db.session.commit()
            return leave_request.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_leave_balance(employee_id: str) -> dict:
        """Get leave balance for an employee"""
        leave_balance = LeaveBalance.query.filter_by(employee_id=employee_id).first()
        if not leave_balance:
            raise ValueError('Employee leave balance not found')
        
        return leave_balance.to_dict()

    @staticmethod
    def get_leave_history(employee_id: str, year: int = None, page: int = 1, per_page: int = 10) -> dict:
        """Get leave history for an employee"""
        query = LeaveRequest.query.filter_by(employee_id=employee_id)
        query = query.filter(LeaveRequest.status.in_(['approved', 'rejected', 'cancelled']))
        
        if year:
            query = query.filter(LeaveRequest.start_date >= date(year, 1, 1))
            query = query.filter(LeaveRequest.start_date <= date(year, 12, 31))
        
        query = query.order_by(LeaveRequest.created_at.desc())
        total = query.count()
        records = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'data': [req.to_dict() for req in records.items],
            'total': total,
            'pages': records.pages,
            'current_page': page,
            'per_page': per_page
        }

    @staticmethod
    def get_pending_leaves_count() -> int:
        """Get count of pending leave requests"""
        return LeaveRequest.query.filter_by(status='pending').count()

    @staticmethod
    def get_leaves_summary(employee_id: str) -> dict:
        """Get leave summary for an employee"""
        try:
            leave_balance = LeaveBalance.query.filter_by(employee_id=employee_id).first()
            if not leave_balance:
                raise ValueError('Employee leave balance not found')
            
            # Get approved leaves
            approved = LeaveRequest.query.filter_by(
                employee_id=employee_id,
                status='approved'
            ).count()
            
            pending = LeaveRequest.query.filter_by(
                employee_id=employee_id,
                status='pending'
            ).count()
            
            return {
                'employee_id': employee_id,
                'casual_leave_balance': leave_balance.casual_leave_balance,
                'sick_leave_balance': leave_balance.sick_leave_balance,
                'earned_leave_balance': leave_balance.earned_leave_balance,
                'total_balance': leave_balance.get_total_balance(),
                'approved_leaves': approved,
                'pending_leaves': pending
            }
        except Exception as e:
            raise e

