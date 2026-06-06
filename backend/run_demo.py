import os
from app import create_app
from app.models.user import db
from app.models import User, Employee, Attendance, LeaveRequest, LeaveBalance
from app.utils.seed import seed_database

app = create_app('testing')  # Use in-memory SQLite for demo


@app.shell_context_processor
def make_shell_context():
    """Shell context for Flask CLI"""
    return {
        'db': db,
        'User': User,
        'Employee': Employee,
        'Attendance': Attendance,
        'LeaveRequest': LeaveRequest,
        'LeaveBalance': LeaveBalance
    }


if __name__ == '__main__':
    with app.app_context():
        # Create tables
        db.create_all()
        print('✅ Database tables created')

        # Seed comprehensive data
        seed_database()

    print('\n' + '='*60)
    print('🚀 HRMS Backend Server Starting...')
    print('='*60)
    print('\n📍 Backend running on: http://localhost:5000')
    print('\n🔓 Test Credentials:')
    print('   Admin:    admin@hrms.com / admin123')
    print('   HR:       hr@hrms.com / hr123')
    print('   Manager:  manager@hrms.com / manager123')
    print('   Employee: employee@hrms.com / employee123')
    print('\n' + '='*60 + '\n')
    
    app.run(debug=True, host='0.0.0.0', port=5000)
