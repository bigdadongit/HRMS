from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, get_jwt
from app.middleware.auth import token_required, role_required
from app.services.employee_service import EmployeeService
from app.utils.response import success_response, error_response

employee_bp = Blueprint('employee', __name__, url_prefix='/api/employees')


@employee_bp.route('', methods=['GET'])
@role_required('admin', 'hr')
def get_all_employees():
    """Get all employees"""
    try:
        employees = EmployeeService.get_all_employees()
        return success_response(employees, 'Employees retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving employees: {str(e)}', 500)


@employee_bp.route('/<employee_id>', methods=['GET'])
@token_required
def get_employee(employee_id):
    """Get employee by ID"""
    try:
        user_id = get_jwt_identity()
        employee = EmployeeService.get_employee_by_id(employee_id)

        if not employee:
            return error_response('Employee not found', 404)

        # Check authorization - can only view own data unless admin/hr
        claims = request.headers.get('Authorization')
        if str(employee.user_id) != user_id and get_jwt().get('role') not in ['admin', 'hr']:
            return error_response('Unauthorized access', 403)

        return success_response(employee.to_dict(), 'Employee retrieved successfully')

    except Exception as e:
        return error_response(f'Error retrieving employee: {str(e)}', 500)


@employee_bp.route('/<employee_id>', methods=['PUT'])
@role_required('admin', 'hr')
def update_employee(employee_id):
    """Update employee details"""
    try:
        data = request.get_json()
        employee = EmployeeService.update_employee(employee_id, **data)
        return success_response(employee, 'Employee updated successfully')

    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Error updating employee: {str(e)}', 500)
