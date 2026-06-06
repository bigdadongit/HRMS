"""
Seed Data Script for AI-HRMS
Generates:
- 50 Employees
- Attendance history for last 30 days
- 20 Leave Requests
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models.user import db
from app.models import Employee, User, LeaveBalance, Attendance, LeaveRequest
from app.services.employee_service import EmployeeService
from app.services.attendance_service import AttendanceService
from app.services.leave_service import LeaveService
from app.services.auth_service import AuthService
from datetime import date, datetime, timedelta
import random
import uuid

# Sample data
FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 
               'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
               'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
               'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
               'Steven', 'Dorothy', 'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna',
               'Kenneth', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
               'Edward', 'Deborah']

LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
              'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
              'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
              'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
              'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
              'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
              'Mitchell', 'Carter', 'Roberts']

DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Legal', 'Product']

DESIGNATIONS = ['Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Engineering Manager',
                'Marketing Manager', 'Marketing Specialist', 'Sales Representative', 'Sales Manager',
                'HR Manager', 'HR Specialist', 'Finance Manager', 'Accountant', 'Operations Manager',
                'Legal Counsel', 'Product Manager', 'Senior Product Manager']

ATTENDANCE_STATUSES = ['present', 'absent', 'leave', 'half_day']
LEAVE_TYPES = ['casual_leave', 'sick_leave', 'earned_leave']

def generate_email(first_name, last_name):
    """Generate email address"""
    return f"{first_name.lower()}.{last_name.lower()}@company.com"

def generate_password():
    """Generate a default password"""
    return "Password@123"

def seed_employees(num_employees=50):
    """Seed employees"""
    print(f"Seeding {num_employees} employees...")
    
    employees_created = 0
    for i in range(num_employees):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        email = generate_email(first_name, last_name)
        
        # Skip if email already exists
        if EmployeeService.get_employee_by_email(email):
            continue
        
        try:
            # Create user account
            user = AuthService.register(
                email=email,
                password=generate_password(),
                role=random.choice(['admin', 'hr', 'manager', 'employee'])
            )
            
            # Create employee profile
            joining_date = date.today() - timedelta(days=random.randint(30, 365))
            employee = EmployeeService.create_employee(
                user_id=user['id'],
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=f"+1-{random.randint(200, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                department=random.choice(DEPARTMENTS),
                designation=random.choice(DESIGNATIONS),
                joining_date=joining_date,
                status='active'
            )
            employees_created += 1
            print(f"Created employee: {first_name} {last_name} ({email})")
            
        except Exception as e:
            print(f"Error creating employee {first_name} {last_name}: {e}")
            continue
    
    print(f"Successfully created {employees_created} employees")
    return employees_created

def seed_attendance(days=30):
    """Seed attendance records for all employees"""
    print(f"Seeding attendance for last {days} days...")
    
    employees = Employee.query.filter_by(status='active').all()
    if not employees:
        print("No employees found. Please seed employees first.")
        return 0
    
    records_created = 0
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    for employee in employees:
        current_date = start_date
        while current_date <= end_date:
            # Skip weekends (Saturday=5, Sunday=6)
            if current_date.weekday() >= 5:
                current_date += timedelta(days=1)
                continue
            
            # Check if attendance already exists
            existing = Attendance.query.filter_by(
                employee_id=employee.id,
                date=current_date
            ).first()
            
            if not existing:
                # Randomly assign attendance status
                # 80% present, 10% absent, 5% leave, 5% half_day
                status = random.choices(
                    ATTENDANCE_STATUSES,
                    weights=[0.8, 0.1, 0.05, 0.05]
                )[0]
                
                try:
                    AttendanceService.mark_attendance(
                        employee_id=str(employee.id),
                        attendance_date=current_date,
                        status=status
                    )
                    records_created += 1
                except Exception as e:
                    print(f"Error marking attendance for {employee.email} on {current_date}: {e}")
            
            current_date += timedelta(days=1)
    
    print(f"Successfully created {records_created} attendance records")
    return records_created

def seed_leave_requests(num_leaves=20):
    """Seed leave requests"""
    print(f"Seeding {num_leaves} leave requests...")
    
    employees = Employee.query.filter_by(status='active').all()
    if not employees:
        print("No employees found. Please seed employees first.")
        return 0
    
    leaves_created = 0
    for i in range(num_leaves):
        employee = random.choice(employees)
        
        # Random leave dates (within next 30 days or past 30 days)
        start_date = date.today() + timedelta(days=random.randint(-30, 30))
        end_date = start_date + timedelta(days=random.randint(1, 5))
        
        # Ensure dates are valid
        if start_date > end_date:
            start_date, end_date = end_date, start_date
        
        leave_type = random.choice(LEAVE_TYPES)
        reason = random.choice([
            'Personal reasons', 'Family emergency', 'Medical appointment', 
            'Vacation', 'Travel', 'Wedding', 'Other personal matters'
        ])
        
        try:
            leave_request = LeaveService.create_leave_request(
                employee_id=str(employee.id),
                start_date=start_date,
                end_date=end_date,
                leave_type=leave_type,
                reason=reason
            )
            
            # Randomly approve/reject some leaves
            status = random.choice(['pending', 'approved', 'rejected'])
            if status != 'pending':
                if status == 'approved':
                    LeaveService.approve_leave_request(str(leave_request['id']), str(employee.user_id))
                else:
                    LeaveService.reject_leave_request(str(leave_request['id']), str(employee.user_id))
            
            leaves_created += 1
            print(f"Created leave request for {employee.first_name} {employee.last_name}: {leave_type}")
            
        except Exception as e:
            print(f"Error creating leave request for {employee.email}: {e}")
            continue
    
    print(f"Successfully created {leaves_created} leave requests")
    return leaves_created

def main():
    """Main seeding function"""
    app = create_app()
    
    with app.app_context():
        print("Starting seed data generation...")
        print("=" * 50)
        
        # Seed employees
        employees = seed_employees(50)
        
        # Seed attendance
        attendance = seed_attendance(30)
        
        # Seed leave requests
        leaves = seed_leave_requests(20)
        
        print("=" * 50)
        print("Seed data generation complete!")
        print(f"Summary:")
        print(f"  - Employees created: {employees}")
        print(f"  - Attendance records created: {attendance}")
        print(f"  - Leave requests created: {leaves}")

if __name__ == '__main__':
    main()
