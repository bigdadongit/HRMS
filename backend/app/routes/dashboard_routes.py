from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from app.middleware.auth import token_required, role_required
from app.services.employee_service import EmployeeService
from app.services.attendance_service import AttendanceService
from app.services.leave_service import LeaveService
from app.utils.response import success_response, error_response

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')


@dashboard_bp.route('/admin', methods=['GET'])
@role_required('admin')
def admin_dashboard():
    """Get admin dashboard data"""
    try:
        total_employees = EmployeeService.get_active_employees_count()
        pending_leaves = LeaveService.get_pending_leaves_count()

        return success_response({
            'total_employees': total_employees,
            'active_employees': total_employees,  # Mock data - all are active
            'attendance_rate': 85.0,  # Mock data
            'pending_leaves': pending_leaves
        }, 'Admin dashboard data retrieved')

    except Exception as e:
        return error_response(f'Error retrieving dashboard: {str(e)}', 500)


@dashboard_bp.route('/hr', methods=['GET'])
@role_required('hr')
def hr_dashboard():
    """Get HR dashboard data"""
    try:
        total_employees = EmployeeService.get_active_employees_count()
        pending_leaves = LeaveService.get_pending_leaves_count()

        return success_response({
            'employee_count': total_employees,
            'pending_leaves': pending_leaves,
            'recruitment_pipeline': 5  # Mock data
        }, 'HR dashboard data retrieved')

    except Exception as e:
        return error_response(f'Error retrieving dashboard: {str(e)}', 500)


@dashboard_bp.route('/manager', methods=['GET'])
@role_required('manager')
def manager_dashboard():
    """Get manager dashboard data"""
    try:
        # Mock data for manager dashboard
        return success_response({
            'team_attendance': 92.0,  # Mock data
            'team_performance': 'Excellent',  # Mock data
            'team_size': 5,  # Mock data
            'team_leaves_pending': 2  # Mock data
        }, 'Manager dashboard data retrieved')

    except Exception as e:
        return error_response(f'Error retrieving dashboard: {str(e)}', 500)


@dashboard_bp.route('/employee', methods=['GET'])
@token_required
def employee_dashboard():
    """Get employee dashboard data"""
    try:
        user_id = get_jwt_identity()
        employee = EmployeeService.get_employee_by_user_id(user_id)

        if not employee:
            return error_response('Employee profile not found', 404)

        # Get attendance rate
        attendance_rate = AttendanceService.get_attendance_rate(str(employee.id))

        return success_response({
            'employee': employee.to_dict(),
            'attendance': attendance_rate,
            'leave_balance': 18,  # Mock data
            'performance_score': 4.5  # Mock data
        }, 'Employee dashboard data retrieved')

    except Exception as e:
        return error_response(f'Error retrieving dashboard: {str(e)}', 500)
