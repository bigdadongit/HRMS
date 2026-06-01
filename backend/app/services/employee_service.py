from app.models import Employee, User
from app.models.user import db
from sqlalchemy.exc import IntegrityError


class EmployeeService:
    """Service for employee operations"""

    @staticmethod
    def create_employee(user_id: str, first_name: str, last_name: str, 
                       phone: str = None, department: str = None, 
                       designation: str = None) -> dict:
        """Create employee profile for a user"""
        try:
            employee = Employee(
                user_id=user_id,
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                department=department,
                designation=designation
            )
            db.session.add(employee)
            db.session.commit()
            return employee.to_dict()
        except IntegrityError:
            db.session.rollback()
            raise ValueError('Employee profile already exists for this user')
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_employee_by_user_id(user_id: str) -> Employee:
        """Get employee profile by user ID"""
        return Employee.query.filter_by(user_id=user_id).first()

    @staticmethod
    def get_all_employees() -> list:
        """Get all employees"""
        employees = Employee.query.all()
        return [emp.to_dict() for emp in employees]

    @staticmethod
    def get_employee_by_id(employee_id: str) -> Employee:
        """Get employee by ID"""
        return Employee.query.filter_by(id=employee_id).first()

    @staticmethod
    def get_active_employees_count() -> int:
        """Get count of active employees"""
        return Employee.query.count()

    @staticmethod
    def update_employee(employee_id: str, **kwargs) -> dict:
        """Update employee details"""
        try:
            employee = Employee.query.filter_by(id=employee_id).first()
            if not employee:
                raise ValueError('Employee not found')

            for key, value in kwargs.items():
                if hasattr(employee, key) and value is not None:
                    setattr(employee, key, value)

            db.session.commit()
            return employee.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e
