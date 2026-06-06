from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, get_jwt
from app.middleware.auth import token_required, role_required
from app.services.employee_service import EmployeeService
from app.services.auth_service import AuthService
from app.utils.response import success_response, error_response
from datetime import datetime

employee_bp = Blueprint('employee', __name__, url_prefix='/api/employees')


@employee_bp.route('', methods=['POST'])
@role_required('admin', 'hr')
def create_employee():
    """Create a new employee"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email']
        missing = [f for f in required_fields if f not in data or not data[f]]
        if missing:
            return error_response(f'Missing required fields: {", ".join(missing)}', 400)
        
        # Check email uniqueness
        existing = EmployeeService.get_employee_by_email(data['email'])
        if existing:
            return error_response('Email already exists', 400)
        
        # Create user and employee
        try:
            # Create user account
            user = AuthService.register(
                email=data['email'],
                password=data.get('password', 'Default@123'),
                role=data.get('role', 'employee')
            )
            
            # Create employee profile
            employee = EmployeeService.create_employee(
                user_id=user['id'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                phone=data.get('phone'),
                department=data.get('department'),
                designation=data.get('designation'),
                joining_date=datetime.fromisoformat(data['joining_date']).date() if data.get('joining_date') else None,
                status=data.get('status', 'active')
            )
            
            return success_response(employee, 'Employee created successfully', 201)
        except ValueError as e:
            return error_response(str(e), 400)
        
    except Exception as e:
        return error_response(f'Error creating employee: {str(e)}', 500)


@employee_bp.route('', methods=['GET'])
@role_required('admin', 'hr')
def get_all_employees():
    """Get all employees with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', None, type=str)
        department = request.args.get('department', None, type=str)
        
        if search:
            result = EmployeeService.search_employees(search, page=page, per_page=per_page)
        elif department:
            result = EmployeeService.get_employees_by_department(department, page=page, per_page=per_page)
        else:
            result = EmployeeService.get_all_employees(page=page, per_page=per_page)
        
        return success_response(result, 'Employees retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving employees: {str(e)}', 500)


@employee_bp.route('/search', methods=['GET'])
@role_required('admin', 'hr', 'manager')
def search_employees():
    """Search employees"""
    try:
        query = request.args.get('q', '', type=str)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        if not query:
            return error_response('Search query required', 400)
        
        result = EmployeeService.search_employees(query, page=page, per_page=per_page)
        return success_response(result, 'Search results')
    except Exception as e:
        return error_response(f'Error searching employees: {str(e)}', 500)


@employee_bp.route('/profile', methods=['GET'])
@token_required
def get_own_profile():
    """Get own profile"""
    try:
        user_id = get_jwt_identity()
        employee = EmployeeService.get_employee_by_user_id(user_id)
        
        if not employee:
            return error_response('Employee profile not found', 404)
        
        return success_response(employee.to_dict(), 'Profile retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving profile: {str(e)}', 500)


@employee_bp.route('/<employee_id>', methods=['GET'])
@token_required
def get_employee(employee_id):
    """Get employee by ID"""
    try:
        user_id = get_jwt_identity()
        user_role = get_jwt().get('role')
        employee = EmployeeService.get_employee_by_id(employee_id)

        if not employee:
            return error_response('Employee not found', 404)

        # Check authorization - can only view own data unless admin/hr/manager
        if str(employee.user_id) != user_id and user_role not in ['admin', 'hr', 'manager']:
            return error_response('Unauthorized access', 403)

        return success_response(employee.to_dict(), 'Employee retrieved successfully')

    except Exception as e:
        return error_response(f'Error retrieving employee: {str(e)}', 500)


@employee_bp.route('/<employee_id>', methods=['PUT'])
@token_required
def update_employee(employee_id):
    """Update employee details"""
    try:
        user_id = get_jwt_identity()
        user_role = get_jwt().get('role')
        data = request.get_json()
        
        employee = EmployeeService.get_employee_by_id(employee_id)
        if not employee:
            return error_response('Employee not found', 404)
        
        # Check authorization
        if str(employee.user_id) != user_id and user_role not in ['admin', 'hr']:
            return error_response('Unauthorized access', 403)
        
        updated = EmployeeService.update_employee(employee_id, **data)
        return success_response(updated, 'Employee updated successfully')

    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Error updating employee: {str(e)}', 500)


@employee_bp.route('/<employee_id>', methods=['DELETE'])
@role_required('admin', 'hr')
def delete_employee(employee_id):
    """Delete (soft delete) employee"""
    try:
        employee = EmployeeService.get_employee_by_id(employee_id)
        if not employee:
            return error_response('Employee not found', 404)
        
        EmployeeService.delete_employee(employee_id)
        return success_response(None, 'Employee deleted successfully')
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Error deleting employee: {str(e)}', 500)


@employee_bp.route('/stats/summary', methods=['GET'])
@role_required('admin', 'hr')
def get_employee_stats():
    """Get employee statistics"""
    try:
        active_count = EmployeeService.get_active_employees_count()
        total_count = EmployeeService.get_total_employees_count()
        
        return success_response({
            'active_employees': active_count,
            'total_employees': total_count,
            'inactive_employees': total_count - active_count
        }, 'Employee statistics retrieved successfully')
    except Exception as e:
        return error_response(f'Error retrieving statistics: {str(e)}', 500)

