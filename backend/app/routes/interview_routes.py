from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.middleware.auth import token_required, role_required
from app.services.interview_service import InterviewService
from app.utils.response import success_response, error_response

interview_bp = Blueprint('interview', __name__, url_prefix='/api/interview')


@interview_bp.route('/create', methods=['POST'])
@role_required('admin', 'hr')
def create_interview():
    """Create a new interview with generated questions"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'candidate_name' not in data or not data['candidate_name']:
            return error_response('Candidate name is required', 400)
        
        if 'role_applied' not in data or not data['role_applied']:
            return error_response('Role applied is required', 400)
        
        # Get API key from request or use config fallback
        api_key = data.get('api_key', '')
        
        user_id = get_jwt_identity()
        
        # Create interview
        interview = InterviewService.create_interview(
            candidate_name=data['candidate_name'],
            role_applied=data['role_applied'],
            created_by=user_id,
            api_key=api_key
        )
        
        return success_response(interview, 'Interview created successfully', 201)
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Error creating interview: {str(e)}', 500)


@interview_bp.route('/<interview_id>', methods=['GET'])
@role_required('admin', 'hr')
def get_interview(interview_id):
    """Get interview details"""
    try:
        interview = InterviewService.get_interview(interview_id)
        if not interview:
            return error_response('Interview not found', 404)
        
        return success_response(interview, 'Interview retrieved successfully')
    
    except Exception as e:
        return error_response(f'Error retrieving interview: {str(e)}', 500)


@interview_bp.route('', methods=['GET'])
@role_required('admin', 'hr')
def get_all_interviews():
    """Get all interviews with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        result = InterviewService.get_all_interviews(page=page, per_page=per_page)
        return success_response(result, 'Interviews retrieved successfully')
    
    except Exception as e:
        return error_response(f'Error retrieving interviews: {str(e)}', 500)


@interview_bp.route('/answer', methods=['POST'])
@role_required('admin', 'hr')
def submit_answer():
    """Submit an answer for a question"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'interview_id' not in data or not data['interview_id']:
            return error_response('Interview ID is required', 400)
        
        if 'question_id' not in data or not data['question_id']:
            return error_response('Question ID is required', 400)
        
        if 'answer' not in data or not data['answer']:
            return error_response('Answer is required', 400)
        
        # Submit answer
        answer = InterviewService.submit_answer(
            interview_id=data['interview_id'],
            question_id=data['question_id'],
            answer=data['answer']
        )
        
        return success_response(answer, 'Answer submitted successfully', 201)
    
    except Exception as e:
        return error_response(f'Error submitting answer: {str(e)}', 500)


@interview_bp.route('/<interview_id>/complete', methods=['POST'])
@role_required('admin', 'hr')
def complete_interview(interview_id):
    """Complete interview and generate results"""
    try:
        data = request.get_json()
        
        # Get API key from request or use config fallback
        api_key = data.get('api_key', '')
        
        # Complete interview
        result = InterviewService.complete_interview(
            interview_id=interview_id,
            api_key=api_key
        )
        
        return success_response(result, 'Interview completed successfully', 201)
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Error completing interview: {str(e)}', 500)


@interview_bp.route('/<interview_id>', methods=['DELETE'])
@role_required('admin', 'hr')
def delete_interview(interview_id):
    """Delete an interview"""
    try:
        InterviewService.delete_interview(interview_id)
        return success_response(None, 'Interview deleted successfully')
    
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Error deleting interview: {str(e)}', 500)


@interview_bp.route('/statistics', methods=['GET'])
@role_required('admin', 'hr')
def get_interview_statistics():
    """Get interview statistics"""
    try:
        stats = InterviewService.get_interview_statistics()
        return success_response(stats, 'Statistics retrieved successfully')
    
    except Exception as e:
        return error_response(f'Error retrieving statistics: {str(e)}', 500)


@interview_bp.route('/top-candidates', methods=['GET'])
@role_required('admin', 'hr')
def get_top_candidates():
    """Get top candidates based on interview scores"""
    try:
        limit = request.args.get('limit', 10, type=int)
        candidates = InterviewService.get_top_candidates(limit=limit)
        return success_response(candidates, 'Top candidates retrieved successfully')
    
    except Exception as e:
        return error_response(f'Error retrieving top candidates: {str(e)}', 500)
