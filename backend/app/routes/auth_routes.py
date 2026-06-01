from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from app.services.auth_service import AuthService
from app.utils.validators import validate_email, validate_password
from app.utils.response import success_response, error_response
from app.middleware.auth import token_required, role_required
from app.services.employee_service import EmployeeService

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()

        # Validate input
        if not data or not data.get('email') or not data.get('password'):
            return error_response('Email and password are required', 400)

        email = data.get('email').lower().strip()
        password = data.get('password')
        role = data.get('role', 'employee')

        # Validate email format
        if not validate_email(email):
            return error_response('Invalid email format', 400)

        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            return error_response(message, 400)

        # Register user
        user = AuthService.register(email, password, role)

        # Create employee profile
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        phone = data.get('phone')
        department = data.get('department')
        designation = data.get('designation')

        employee = EmployeeService.create_employee(
            user['id'], first_name, last_name, phone, department, designation
        )

        return success_response({
            'user': user,
            'employee': employee
        }, 'Registration successful', 201)

    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Registration failed: {str(e)}', 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    try:
        data = request.get_json()

        # Validate input
        if not data or not data.get('email') or not data.get('password'):
            return error_response('Email and password are required', 400)

        email = data.get('email').lower().strip()
        password = data.get('password')

        # Login user
        result = AuthService.login(email, password)

        return success_response(result, 'Login successful', 200)

    except ValueError as e:
        return error_response(str(e), 401)
    except Exception as e:
        return error_response(f'Login failed: {str(e)}', 500)


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current logged-in user"""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()

        user = AuthService.get_user_by_id(user_id)
        if not user:
            return error_response('User not found', 404)

        employee = EmployeeService.get_employee_by_user_id(user_id)
        employee_data = employee.to_dict() if employee else None

        return success_response({
            'user': user.to_dict(),
            'employee': employee_data
        }, 'User retrieved successfully')

    except Exception as e:
        return error_response(f'Error retrieving user: {str(e)}', 500)


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """Logout user (placeholder for token blacklist functionality)"""
    return success_response(None, 'Logout successful', 200)
