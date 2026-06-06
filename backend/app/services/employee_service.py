from app.models import Employee, User, LeaveBalance
from app.models.user import db
from sqlalchemy.exc import IntegrityError
from datetime import date


class EmployeeService:
    """Service for employee operations"""

    @staticmethod
    def create_employee(user_id: str, first_name: str, last_name: str, 
                       email: str, phone: str = None, department: str = None, 
                       designation: str = None, joining_date: date = None,
                       status: str = 'active') -> dict:
        """Create employee profile for a user"""
        try:
            employee = Employee(
                user_id=user_id,
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone,
                department=department,
                designation=designation,
                joining_date=joining_date,
                status=status
            )
            db.session.add(employee)
            db.session.flush()
            
            # Create leave balance record
            leave_balance = LeaveBalance(employee_id=employee.id)
            db.session.add(leave_balance)
            db.session.commit()
            
            return employee.to_dict()
        except IntegrityError:
            db.session.rollback()
            raise ValueError('Employee profile already exists for this user or email')
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_employee_by_user_id(user_id: str) -> Employee:
        """Get employee profile by user ID"""
        return Employee.query.filter_by(user_id=user_id).first()

    @staticmethod
    def get_all_employees(page: int = 1, per_page: int = 10) -> dict:
        """Get all employees with pagination"""
        query = Employee.query.filter_by(status='active')
        total = query.count()
        employees = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'data': [emp.to_dict() for emp in employees.items],
            'total': total,
            'pages': employees.pages,
            'current_page': page,
            'per_page': per_page
        }

    @staticmethod
    def search_employees(search_query: str, page: int = 1, per_page: int = 10) -> dict:
        """Search employees by name, email, or department"""
        query = Employee.query.filter(
            (Employee.status == 'active') & (
                (Employee.first_name.ilike(f'%{search_query}%')) |
                (Employee.last_name.ilike(f'%{search_query}%')) |
                (Employee.email.ilike(f'%{search_query}%')) |
                (Employee.department.ilike(f'%{search_query}%'))
            )
        )
        total = query.count()
        employees = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'data': [emp.to_dict() for emp in employees.items],
            'total': total,
            'pages': employees.pages,
            'current_page': page,
            'per_page': per_page
        }

    @staticmethod
    def get_employee_by_id(employee_id: str) -> Employee:
        """Get employee by ID"""
        return Employee.query.filter_by(id=employee_id).first()

    @staticmethod
    def get_employee_by_email(email: str) -> Employee:
        """Get employee by email"""
        return Employee.query.filter_by(email=email).first()

    @staticmethod
    def get_active_employees_count() -> int:
        """Get count of active employees"""
        return Employee.query.filter_by(status='active').count()

    @staticmethod
    def get_total_employees_count() -> int:
        """Get count of total employees"""
        return Employee.query.count()

    @staticmethod
    def update_employee(employee_id: str, **kwargs) -> dict:
        """Update employee details"""
        try:
            employee = Employee.query.filter_by(id=employee_id).first()
            if not employee:
                raise ValueError('Employee not found')

            # Fields that can be updated
            allowed_fields = {
                'first_name', 'last_name', 'email', 'phone', 
                'department', 'designation', 'joining_date', 'status'
            }
            
            for key, value in kwargs.items():
                if key in allowed_fields and value is not None:
                    setattr(employee, key, value)

            db.session.commit()
            return employee.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_employee(employee_id: str) -> bool:
        """Soft delete employee (mark as terminated)"""
        try:
            employee = Employee.query.filter_by(id=employee_id).first()
            if not employee:
                raise ValueError('Employee not found')
            
            employee.status = 'terminated'
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_employees_by_department(department: str, page: int = 1, per_page: int = 10) -> dict:
        """Get employees by department"""
        query = Employee.query.filter_by(department=department, status='active')
        total = query.count()
        employees = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'data': [emp.to_dict() for emp in employees.items],
            'total': total,
            'pages': employees.pages,
            'current_page': page,
            'per_page': per_page
        }

    @staticmethod
    def validate_employee_data(**kwargs) -> tuple[bool, str]:
        """Validate employee data"""
        required_fields = {'first_name', 'last_name', 'email'}
        provided_fields = set(kwargs.keys())
        
        missing_fields = required_fields - provided_fields
        if missing_fields:
            return False, f'Missing required fields: {", ".join(missing_fields)}'
        
        # Validate email format
        if '@' not in kwargs.get('email', ''):
            return False, 'Invalid email format'
        
        # Check email uniqueness
        existing = Employee.query.filter_by(email=kwargs['email']).first()
        if existing:
            return False, 'Email already exists'
        
        return True, 'Valid'

