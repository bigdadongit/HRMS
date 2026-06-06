from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from app.middleware.auth import token_required, role_required
from app.services.employee_service import EmployeeService
from app.services.attendance_service import AttendanceService
from app.services.leave_service import LeaveService
from app.services.resume_service import ResumeService
from app.services.interview_service import InterviewService
from app.utils.response import success_response, error_response

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')


@dashboard_bp.route('/admin', methods=['GET'])
@role_required('admin')
def admin_dashboard():
    """Get admin dashboard data"""
    try:
        total_employees = EmployeeService.get_total_employees_count()
        active_employees = EmployeeService.get_active_employees_count()
        pending_leaves = LeaveService.get_pending_leaves_count()
        
        # Get organization-wide attendance rate
        from datetime import date
        org_attendance = AttendanceService.get_organization_attendance_summary(
            year=date.today().year,
            month=date.today().month
        )
        attendance_rate = org_attendance.get('average_attendance_percentage', 0.0)
        
        return success_response({
            'total_employees': total_employees,
            'active_employees': active_employees,
            'attendance_rate': attendance_rate,
            'pending_leaves': pending_leaves
        }, 'Admin dashboard data retrieved')

    except Exception as e:
        return error_response(f'Error retrieving dashboard: {str(e)}', 500)


@dashboard_bp.route('/hr', methods=['GET'])
@role_required('hr')
def hr_dashboard():
    """Get HR dashboard data"""
    try:
        total_employees = EmployeeService.get_total_employees_count()
        active_employees = EmployeeService.get_active_employees_count()
        pending_leaves = LeaveService.get_pending_leaves_count()
        
        # Get approved leaves count for this month
        from datetime import date
        from app.models import LeaveRequest
        approved_leaves = LeaveRequest.query.filter(
            LeaveRequest.status == 'approved',
            LeaveRequest.start_date >= date(date.today().year, date.today().month, 1)
        ).count()
        
        # Get resume statistics
        resume_stats = ResumeService.get_resume_statistics()
        
        # Get interview statistics
        interview_stats = InterviewService.get_interview_statistics()
        
        return success_response({
            'employee_count': active_employees,
            'pending_leaves': pending_leaves,
            'approved_leaves': approved_leaves,
            'total_resumes': resume_stats.get('total_resumes', 0),
            'total_screenings': resume_stats.get('total_screenings', 0),
            'average_match_score': resume_stats.get('average_match_score', 0),
            'total_interviews': interview_stats.get('total_interviews', 0),
            'completed_interviews': interview_stats.get('completed_interviews', 0),
            'average_interview_score': interview_stats.get('average_score', 0),
            'recruitment_pipeline': 5  # Mock data - recruitment not implemented yet
        }, 'HR dashboard data retrieved')

    except Exception as e:
        return error_response(f'Error retrieving dashboard: {str(e)}', 500)


@dashboard_bp.route('/manager', methods=['GET'])
@role_required('manager')
def manager_dashboard():
    """Get manager dashboard data"""
    try:
        user_id = get_jwt_identity()
        employee = EmployeeService.get_employee_by_user_id(user_id)
        
        if not employee:
            return error_response('Employee profile not found', 404)
        
        # Mock team size for now - in real implementation, would query team members
        team_size = 5
        
        # Get team attendance (mock for now - would need team member IDs)
        from datetime import date
        team_attendance = 92.0  # Mock data
        
        # Get pending team leaves
        from app.models import LeaveRequest
        team_leaves_pending = LeaveRequest.query.filter_by(status='pending').count()
        
        return success_response({
            'team_attendance': team_attendance,
            'team_performance': 'Excellent',  # Mock data - performance not implemented yet
            'team_size': team_size,
            'team_leaves_pending': team_leaves_pending
        }, 'Manager dashboard data retrieved')

    except Exception as e:
        return error_response(f'Error retrieving dashboard: {str(e)}', 500)


@dashboard_bp.route('/employee', methods=['GET'])
@token_required
def employee_dashboard():
    """Get employee dashboard data"""
    try:
        user_id = get_jwt_identity()
        employee = EmployeeService.get_employee_by_user_id(user_id)

        if not employee:
            return error_response('Employee profile not found', 404)

        # Get attendance rate
        attendance_rate = AttendanceService.get_attendance_rate(str(employee.id))
        
        # Get leave balance
        leave_balance = LeaveService.get_leave_balance(str(employee.id))
        total_balance = leave_balance.get('casual_leave_balance', 0) + \
                        leave_balance.get('sick_leave_balance', 0) + \
                        leave_balance.get('earned_leave_balance', 0)
        
        # Get recent attendance (last 5 records)
        from datetime import date, timedelta
        from app.models import Attendance
        recent_attendance = Attendance.query.filter_by(employee_id=employee.id)\
            .order_by(Attendance.date.desc()).limit(5).all()
        
        recent_attendance_data = [record.to_dict() for record in recent_attendance]

        return success_response({
            'employee': employee.to_dict(),
            'attendance': attendance_rate,
            'leave_balance': total_balance,
            'performance_score': 4.5,  # Mock data - performance not implemented yet
            'recent_attendance': recent_attendance_data
        }, 'Employee dashboard data retrieved')

    except Exception as e:
        return error_response(f'Error retrieving dashboard: {str(e)}', 500)
