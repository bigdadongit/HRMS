import random
from datetime import datetime, date, timedelta
from app.models import User, Employee, Attendance, LeaveRequest, LeaveBalance
from app.models.user import db
from app.utils.validators import hash_password


def seed_database():
    """Seed database with comprehensive test data"""
    
    # Clear existing data
    try:
        print('Clearing existing data...')
        Attendance.query.delete()
        LeaveRequest.query.delete()
        LeaveBalance.query.delete()
        Employee.query.delete()
        User.query.delete()
        db.session.commit()
        print('✅ Data cleared')
    except Exception as e:
        db.session.rollback()
        print(f'Error clearing data: {e}')
        return

    # Create admin user
    admin_user = User(
        email='admin@hrms.com',
        password_hash=hash_password('admin123'),
        role='admin'
    )
    db.session.add(admin_user)
    db.session.flush()

    admin_emp = Employee(
        user_id=admin_user.id,
        first_name='Admin',
        last_name='User',
        email='admin@hrms.com',
        phone='9001000001',
        department='Administration',
        designation='Administrator',
        joining_date=date(2023, 1, 1),
        status='active'
    )
    db.session.add(admin_emp)
    db.session.flush()

    admin_balance = LeaveBalance(employee_id=admin_emp.id)
    db.session.add(admin_balance)

    # Create HR user
    hr_user = User(
        email='hr@hrms.com',
        password_hash=hash_password('hr123'),
        role='hr'
    )
    db.session.add(hr_user)
    db.session.flush()

    hr_emp = Employee(
        user_id=hr_user.id,
        first_name='HR',
        last_name='Manager',
        email='hr@hrms.com',
        phone='9001000002',
        department='Human Resources',
        designation='HR Manager',
        joining_date=date(2023, 1, 15),
        status='active'
    )
    db.session.add(hr_emp)
    db.session.flush()

    hr_balance = LeaveBalance(employee_id=hr_emp.id)
    db.session.add(hr_balance)

    # Create manager user
    manager_user = User(
        email='manager@hrms.com',
        password_hash=hash_password('manager123'),
        role='manager'
    )
    db.session.add(manager_user)
    db.session.flush()

    manager_emp = Employee(
        user_id=manager_user.id,
        first_name='Project',
        last_name='Manager',
        email='manager@hrms.com',
        phone='9001000003',
        department='Operations',
        designation='Project Manager',
        joining_date=date(2023, 2, 1),
        status='active'
    )
    db.session.add(manager_emp)
    db.session.flush()

    manager_balance = LeaveBalance(employee_id=manager_emp.id)
    db.session.add(manager_balance)

    # Create base employee user
    emp_user = User(
        email='employee@hrms.com',
        password_hash=hash_password('employee123'),
        role='employee'
    )
    db.session.add(emp_user)
    db.session.flush()

    emp = Employee(
        user_id=emp_user.id,
        first_name='John',
        last_name='Doe',
        email='employee@hrms.com',
        phone='9001000004',
        department='Engineering',
        designation='Software Engineer',
        joining_date=date(2023, 3, 1),
        status='active'
    )
    db.session.add(emp)
    db.session.flush()

    emp_balance = LeaveBalance(employee_id=emp.id)
    db.session.add(emp_balance)

    db.session.commit()
    print('✅ Created base users (Admin, HR, Manager, Employee)')

    # Create 46 additional employees (50 total - 4 already created)
    departments = ['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance', 'HR', 'Product']
    designations = ['Software Engineer', 'Senior Engineer', 'Analyst', 'Specialist', 'Executive', 'Coordinator', 'Lead']
    first_names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack',
                   'Karen', 'Leo', 'Mia', 'Nathan', 'Olivia', 'Peter', 'Quinn', 'Rachel', 'Samuel', 'Tina',
                   'Uma', 'Victor', 'Wendy', 'Xavier', 'Yasmine', 'Zoe', 'Aaron', 'Bella', 'Carlos', 'Diana']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']

    employees = [admin_emp, hr_emp, manager_emp, emp]
    
    for i in range(46):
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        email = f'{first_name.lower()}.{last_name.lower()}{i}@hrms.com'
        phone = f'900100{5000 + i:04d}'
        department = random.choice(departments)
        designation = random.choice(designations)
        joining_date = date(2023, random.randint(1, 12), random.randint(1, 28))

        # Create user
        user = User(
            email=email,
            password_hash=hash_password('Password@123'),
            role='employee'
        )
        db.session.add(user)
        db.session.flush()

        # Create employee
        employee = Employee(
            user_id=user.id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            department=department,
            designation=designation,
            joining_date=joining_date,
            status='active'
        )
        db.session.add(employee)
        db.session.flush()

        # Create leave balance
        leave_balance = LeaveBalance(employee_id=employee.id)
        db.session.add(leave_balance)

        employees.append(employee)

    db.session.commit()
    print('✅ Created 50 employees')

    # Create attendance records for last 30 days
    today = date.today()
    attendance_statuses = ['present', 'absent', 'leave', 'half_day']

    for emp in employees:
        for i in range(30):
            attendance_date = today - timedelta(days=30 - i)
            
            # Skip weekends randomly
            if attendance_date.weekday() >= 5 and random.random() > 0.3:
                continue
            
            status = random.choices(
                attendance_statuses,
                weights=[70, 10, 15, 5],
                k=1
            )[0]

            attendance = Attendance(
                employee_id=emp.id,
                date=attendance_date,
                status=status
            )
            db.session.add(attendance)

    db.session.commit()
    print('✅ Created attendance records for 30 days')

    # Create 20 leave requests
    leave_types = ['casual_leave', 'sick_leave', 'earned_leave']
    leave_reasons = [
        'Personal work',
        'Medical appointment',
        'Family event',
        'Travel',
        'Home relocation',
        'Sick leave',
        'Annual vacation',
        'Wedding ceremony',
        'Child care',
        'Festival celebration'
    ]

    for i in range(20):
        emp = random.choice(employees)
        leave_type = random.choice(leave_types)
        start_date = today - timedelta(days=random.randint(5, 60))
        end_date = start_date + timedelta(days=random.randint(1, 5))
        reason = random.choice(leave_reasons)
        status = random.choices(['pending', 'approved', 'rejected'], weights=[30, 60, 10], k=1)[0]

        leave_request = LeaveRequest(
            employee_id=emp.id,
            start_date=start_date,
            end_date=end_date,
            leave_type=leave_type,
            reason=reason,
            status=status,
            approved_by=admin_user.id if status != 'pending' else None,
            approval_date=datetime.utcnow() if status != 'pending' else None
        )
        db.session.add(leave_request)

    db.session.commit()
    print('✅ Created 20 leave requests')

    print('\n' + '='*60)
    print('DATABASE SEEDING COMPLETED SUCCESSFULLY!')
    print('='*60)
    print(f'\nCreated:')
    print(f'  - 50 Employees')
    print(f'  - 30 days Attendance Records')
    print(f'  - 20 Leave Requests')
    print(f'  - Leave Balance Records for all employees')
    print('\n🔓 Test Credentials:')
    print('   Admin:    admin@hrms.com / admin123')
    print('   HR:       hr@hrms.com / hr123')
    print('   Manager:  manager@hrms.com / manager123')
    print('   Employee: employee@hrms.com / employee123')
    print('='*60 + '\n')
