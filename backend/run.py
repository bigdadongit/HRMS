import os
from app import create_app
from app.models.user import db
from app.models import User, Employee, Attendance, LeaveRequest
from app.utils.validators import hash_password
from datetime import date, timedelta

app = create_app(os.environ.get('FLASK_ENV', 'development'))


@app.shell_context_processor
def make_shell_context():
    """Shell context for Flask CLI"""
    return {
        'db': db,
        'User': User,
        'Employee': Employee,
        'Attendance': Attendance,
        'LeaveRequest': LeaveRequest
    }


def seed_database():
    """Seed initial data into the database"""
    with app.app_context():
        # Check if data already exists
        if User.query.first():
            print('Database already seeded')
            return

        try:
            # Create Admin user
            admin_user = User(
                email='admin@hrms.com',
                password_hash=hash_password('admin123'),
                role='admin'
            )
            db.session.add(admin_user)
            db.session.flush()

            admin_employee = Employee(
                user_id=admin_user.id,
                first_name='Admin',
                last_name='User',
                phone='9999999999',
                department='Administration',
                designation='Administrator'
            )
            db.session.add(admin_employee)

            # Create HR user
            hr_user = User(
                email='hr@hrms.com',
                password_hash=hash_password('hr123'),
                role='hr'
            )
            db.session.add(hr_user)
            db.session.flush()

            hr_employee = Employee(
                user_id=hr_user.id,
                first_name='HR',
                last_name='Manager',
                phone='8888888888',
                department='Human Resources',
                designation='HR Manager'
            )
            db.session.add(hr_employee)

            # Create Manager user
            manager_user = User(
                email='manager@hrms.com',
                password_hash=hash_password('manager123'),
                role='manager'
            )
            db.session.add(manager_user)
            db.session.flush()

            manager_employee = Employee(
                user_id=manager_user.id,
                first_name='Manager',
                last_name='User',
                phone='7777777777',
                department='Engineering',
                designation='Team Lead'
            )
            db.session.add(manager_employee)

            # Create Employee user
            employee_user = User(
                email='employee@hrms.com',
                password_hash=hash_password('employee123'),
                role='employee'
            )
            db.session.add(employee_user)
            db.session.flush()

            employee_emp = Employee(
                user_id=employee_user.id,
                first_name='John',
                last_name='Doe',
                phone='6666666666',
                department='Engineering',
                designation='Software Engineer'
            )
            db.session.add(employee_emp)

            db.session.commit()

            # Add sample attendance records
            today = date.today()
            for i in range(30):
                attendance_date = today - timedelta(days=i)
                status = 'present' if i % 7 != 0 else 'absent'  # Weekend absent
                
                attendance = Attendance(
                    employee_id=employee_emp.id,
                    date=attendance_date,
                    status=status
                )
                db.session.add(attendance)

            # Add sample leave requests
            leave_request = LeaveRequest(
                employee_id=employee_emp.id,
                start_date=today + timedelta(days=10),
                end_date=today + timedelta(days=12),
                reason='Personal leave',
                status='pending'
            )
            db.session.add(leave_request)

            db.session.commit()
            print('Database seeded successfully!')

        except Exception as e:
            db.session.rollback()
            print(f'Error seeding database: {str(e)}')


if __name__ == '__main__':
    with app.app_context():
        # Create tables
        db.create_all()
        print('Database tables created')

        # Seed sample data
        seed_database()

    app.run(debug=True, host='0.0.0.0', port=5000)
