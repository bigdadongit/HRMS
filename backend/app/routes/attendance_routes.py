from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, get_jwt
from app.middleware.auth import token_required, role_required
from app.services.attendance_service import AttendanceService
from app.services.employee_service import EmployeeService
from app.utils.response import success_response, error_response
from datetime import datetime, date

attendance_bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')


@attendance_bp.route('/mark', methods=['POST'])
@role_required('admin', 'hr')
def mark_attendance():
    """Mark attendance for an employee"""
    try:
        data = request.get_json()
        
        required_fields = ['employee_id', 'date', 'status']
        missing = [f for f in required_fields if f not in data or not data[f]]
        if missing:
            return error_response(f'Missing required fields: {", ".join(missing)}', 400)
        
        # Validate employee exists
        employee = EmployeeService.get_employee_by_id(data['employee_id'])
        if not employee:
            return error_response('Employee not found', 404)
        
        # Parse date
        attendance_date = datetime.fromisoformat(data['date']).date() if isinstance(data['date'], str) else data['date']
        
        record = AttendanceService.mark_attendance(
            employee_id=data['employee_id'],
            attendance_date=attendance_date,
            status=data['status']
        )
        
        return success_response(record, 'Attendance marked successfully', 201)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Error marking attendance: {str(e)}', 500)


@attendance_bp.route('/<attendance_id>', methods=['PUT'])
@role_required('admin', 'hr')
def update_attendance(attendance_id):
    """Update attendance record"""
    try:
        data = request.get_json()
        
        if 'status' not in data:
            return error_response('Status required', 400)
        
        record = AttendanceService.update_attendance(attendance_id, data['status'])
        return success_response(record, 'Attendance updated successfully')
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Error updating attendance: {str(e)}', 500)


@attendance_bp.route('/employee/<employee_id>', methods=['GET'])
@token_required
def get_employee_attendance(employee_id):
    """Get attendance records for an employee"""
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
        per_page = request.args.get('per_page', 31, type=int)
        month = request.args.get('month', None, type=int)
        year = request.args.get('year', None, type=int)
        
        result = AttendanceService.get_attendance_by_employee(
            employee_id=employee_id,
            month=month,
            year=year,
            page=page,
            per_page=per_page
        )
        
        return success_response(result, 'Attendance records retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving attendance: {str(e)}', 500)


@attendance_bp.route('/monthly-report/<employee_id>', methods=['GET'])
@token_required
def get_monthly_report(employee_id):
    """Get monthly attendance report for an employee"""
    try:
        user_id = get_jwt_identity()
        user_role = get_jwt().get('role')
        
        employee = EmployeeService.get_employee_by_id(employee_id)
        if not employee:
            return error_response('Employee not found', 404)
        
        # Check authorization
        if str(employee.user_id) != user_id and user_role not in ['admin', 'hr', 'manager']:
            return error_response('Unauthorized access', 403)
        
        month = request.args.get('month', date.today().month, type=int)
        year = request.args.get('year', date.today().year, type=int)
        
        report = AttendanceService.get_monthly_attendance_report(employee_id, month, year)
        return success_response(report, 'Monthly report retrieved successfully')
    except Exception as e:
        return error_response(f'Error generating report: {str(e)}', 500)


@attendance_bp.route('/summary/<employee_id>', methods=['GET'])
@token_required
def get_attendance_summary(employee_id):
    """Get attendance summary for an employee"""
    try:
        user_id = get_jwt_identity()
        user_role = get_jwt().get('role')
        
        employee = EmployeeService.get_employee_by_id(employee_id)
        if not employee:
            return error_response('Employee not found', 404)
        
        # Check authorization
        if str(employee.user_id) != user_id and user_role not in ['admin', 'hr', 'manager']:
            return error_response('Unauthorized access', 403)
        
        summary = AttendanceService.get_attendance_summary(employee_id)
        return success_response(summary, 'Attendance summary retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving summary: {str(e)}', 500)


@attendance_bp.route('/team', methods=['GET'])
@role_required('admin', 'hr', 'manager')
def get_team_attendance():
    """Get team attendance summary"""
    try:
        employee_ids = request.args.getlist('employee_ids')
        
        if not employee_ids:
            return error_response('Employee IDs required', 400)
        
        team_data = AttendanceService.get_team_attendance(employee_ids)
        return success_response(team_data, 'Team attendance retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving team attendance: {str(e)}', 500)


@attendance_bp.route('/organization-summary', methods=['GET'])
@role_required('admin', 'hr')
def get_organization_summary():
    """Get organization-wide attendance summary"""
    try:
        year = request.args.get('year', None, type=int)
        month = request.args.get('month', None, type=int)
        
        summary = AttendanceService.get_organization_attendance_summary(year=year, month=month)
        return success_response(summary, 'Organization summary retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving summary: {str(e)}', 500)
