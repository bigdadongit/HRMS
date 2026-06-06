from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, get_jwt
from app.middleware.auth import token_required, role_required
from app.services.leave_service import LeaveService
from app.services.employee_service import EmployeeService
from app.utils.response import success_response, error_response
from datetime import datetime, date

leave_bp = Blueprint('leave', __name__, url_prefix='/api/leaves')


@leave_bp.route('/apply', methods=['POST'])
@token_required
def apply_leave():
    """Apply for leave"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['start_date', 'end_date', 'leave_type', 'reason']
        missing = [f for f in required_fields if f not in data or not data[f]]
        if missing:
            return error_response(f'Missing required fields: {", ".join(missing)}', 400)
        
        # Get employee
        employee = EmployeeService.get_employee_by_user_id(user_id)
        if not employee:
            return error_response('Employee profile not found', 404)
        
        # Parse dates
        start_date = datetime.fromisoformat(data['start_date']).date() if isinstance(data['start_date'], str) else data['start_date']
        end_date = datetime.fromisoformat(data['end_date']).date() if isinstance(data['end_date'], str) else data['end_date']
        
        leave_request = LeaveService.create_leave_request(
            employee_id=str(employee.id),
            start_date=start_date,
            end_date=end_date,
            leave_type=data['leave_type'],
            reason=data['reason']
        )
        
        return success_response(leave_request, 'Leave request submitted successfully', 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Error applying for leave: {str(e)}', 500)


@leave_bp.route('/my-requests', methods=['GET'])
@token_required
def get_my_leave_requests():
    """Get own leave requests"""
    try:
        user_id = get_jwt_identity()
        
        employee = EmployeeService.get_employee_by_user_id(user_id)
        if not employee:
            return error_response('Employee profile not found', 404)
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', None, type=str)
        
        result = LeaveService.get_leave_requests_by_employee(
            employee_id=str(employee.id),
            status=status,
            page=page,
            per_page=per_page
        )
        
        return success_response(result, 'Leave requests retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving leave requests: {str(e)}', 500)


@leave_bp.route('/<leave_id>', methods=['GET'])
@token_required
def get_leave_request(leave_id):
    """Get leave request details"""
    try:
        user_id = get_jwt_identity()
        user_role = get_jwt().get('role')
        
        leave_request = LeaveService.get_leave_request_by_id(leave_id)
        if not leave_request:
            return error_response('Leave request not found', 404)
        
        # Check authorization
        if str(leave_request.employee_id) != EmployeeService.get_employee_by_user_id(user_id).id and user_role not in ['admin', 'hr']:
            return error_response('Unauthorized access', 403)
        
        return success_response(leave_request.to_dict(), 'Leave request retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving leave request: {str(e)}', 500)


@leave_bp.route('/pending', methods=['GET'])
@role_required('admin', 'hr')
def get_pending_leaves():
    """Get all pending leave requests"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        result = LeaveService.get_pending_leave_requests(page=page, per_page=per_page)
        return success_response(result, 'Pending leave requests retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving pending leaves: {str(e)}', 500)


@leave_bp.route('/<leave_id>/approve', methods=['POST'])
@role_required('admin', 'hr')
def approve_leave(leave_id):
    """Approve leave request"""
    try:
        user_id = get_jwt_identity()
        
        leave_request = LeaveService.approve_leave_request(leave_id, user_id)
        return success_response(leave_request, 'Leave request approved successfully')
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Error approving leave: {str(e)}', 500)


@leave_bp.route('/<leave_id>/reject', methods=['POST'])
@role_required('admin', 'hr')
def reject_leave(leave_id):
    """Reject leave request"""
    try:
        user_id = get_jwt_identity()
        
        leave_request = LeaveService.reject_leave_request(leave_id, user_id)
        return success_response(leave_request, 'Leave request rejected successfully')
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Error rejecting leave: {str(e)}', 500)


@leave_bp.route('/<leave_id>/cancel', methods=['POST'])
@token_required
def cancel_leave(leave_id):
    """Cancel leave request"""
    try:
        user_id = get_jwt_identity()
        
        leave_request = LeaveService.get_leave_request_by_id(leave_id)
        if not leave_request:
            return error_response('Leave request not found', 404)
        
        # Check authorization - only employee or admin/hr can cancel
        employee = EmployeeService.get_employee_by_user_id(user_id)
        if str(leave_request.employee_id) != str(employee.id) and get_jwt().get('role') not in ['admin', 'hr']:
            return error_response('Unauthorized access', 403)
        
        leave_request = LeaveService.cancel_leave_request(leave_id)
        return success_response(leave_request, 'Leave request cancelled successfully')
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Error cancelling leave: {str(e)}', 500)


@leave_bp.route('/balance/<employee_id>', methods=['GET'])
@token_required
def get_leave_balance(employee_id):
    """Get leave balance for an employee"""
    try:
        user_id = get_jwt_identity()
        user_role = get_jwt().get('role')
        
        employee = EmployeeService.get_employee_by_id(employee_id)
        if not employee:
            return error_response('Employee not found', 404)
        
        # Check authorization
        if str(employee.user_id) != user_id and user_role not in ['admin', 'hr']:
            return error_response('Unauthorized access', 403)
        
        balance = LeaveService.get_leave_balance(employee_id)
        return success_response(balance, 'Leave balance retrieved successfully')
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Error retrieving leave balance: {str(e)}', 500)


@leave_bp.route('/history/<employee_id>', methods=['GET'])
@token_required
def get_leave_history(employee_id):
    """Get leave history for an employee"""
    try:
        user_id = get_jwt_identity()
        user_role = get_jwt().get('role')
        
        employee = EmployeeService.get_employee_by_id(employee_id)
        if not employee:
            return error_response('Employee not found', 404)
        
        # Check authorization
        if str(employee.user_id) != user_id and user_role not in ['admin', 'hr', 'manager']:
            return error_response('Unauthorized access', 403)
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        year = request.args.get('year', None, type=int)
        
        result = LeaveService.get_leave_history(
            employee_id=employee_id,
            year=year,
            page=page,
            per_page=per_page
        )
        
        return success_response(result, 'Leave history retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving leave history: {str(e)}', 500)


@leave_bp.route('/summary/<employee_id>', methods=['GET'])
@token_required
def get_leaves_summary(employee_id):
    """Get leave summary for an employee"""
    try:
        user_id = get_jwt_identity()
        user_role = get_jwt().get('role')
        
        employee = EmployeeService.get_employee_by_id(employee_id)
        if not employee:
            return error_response('Employee not found', 404)
        
        # Check authorization
        if str(employee.user_id) != user_id and user_role not in ['admin', 'hr', 'manager']:
            return error_response('Unauthorized access', 403)
        
        summary = LeaveService.get_leaves_summary(employee_id)
        return success_response(summary, 'Leave summary retrieved successfully')
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Error retrieving leave summary: {str(e)}', 500)


@leave_bp.route('/team/<employee_id>/requests', methods=['GET'])
@role_required('admin', 'hr', 'manager')
def get_team_leave_requests(employee_id):
    """Get team leave requests (manager view)"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # For manager: get their team members, for admin/hr: can specify employee_ids
        employee_ids = request.args.getlist('employee_ids')
        
        if not employee_ids:
            employee_ids = [employee_id]
        
        result = LeaveService.get_team_leave_requests(employee_ids, page=page, per_page=per_page)
        return success_response(result, 'Team leave requests retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving team leaves: {str(e)}', 500)
