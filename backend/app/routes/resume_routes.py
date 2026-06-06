from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity, get_jwt
from werkzeug.utils import secure_filename
import os
from app.middleware.auth import token_required, role_required
from app.services.resume_service import ResumeService
from app.utils.response import success_response, error_response

resume_bp = Blueprint('resume', __name__, url_prefix='/api/resume')

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'docx'}


def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@resume_bp.route('/upload', methods=['POST'])
@role_required('admin', 'hr')
def upload_resume():
    """Upload a resume file"""
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return error_response('No file provided', 400)
        
        file = request.files['file']
        
        if file.filename == '':
            return error_response('No file selected', 400)
        
        if not allowed_file(file.filename):
            return error_response('Invalid file type. Only PDF and DOCX are allowed', 400)
        
        # Get candidate name
        candidate_name = request.form.get('candidate_name')
        if not candidate_name:
            return error_response('Candidate name is required', 400)
        
        # Get user ID
        user_id = get_jwt_identity()
        
        # Secure filename
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        
        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(current_app.root_path, 'uploads', 'resumes')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Create resume record
        resume = ResumeService.create_resume(
            candidate_name=candidate_name,
            file_path=file_path,
            file_name=filename,
            file_type=file_extension,
            uploaded_by=user_id
        )
        
        return success_response(resume, 'Resume uploaded successfully', 201)
    
    except Exception as e:
        return error_response(f'Error uploading resume: {str(e)}', 500)


@resume_bp.route('/screen', methods=['POST'])
@role_required('admin', 'hr')
def screen_resume():
    """Screen a resume against job description"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'resume_id' not in data or not data['resume_id']:
            return error_response('Resume ID is required', 400)
        
        if 'jd_text' not in data or not data['jd_text']:
            return error_response('Job description is required', 400)
        
        # Get Gemini API key from request or use config fallback
        api_key = data.get('api_key', '')
        
        user_id = get_jwt_identity()
        
        # Screen resume
        result = ResumeService.screen_resume(
            resume_id=data['resume_id'],
            jd_text=data['jd_text'],
            api_key=api_key,
            screened_by=user_id
        )
        
        return success_response(result, 'Resume screened successfully', 201)
    
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Error screening resume: {str(e)}', 500)


@resume_bp.route('', methods=['GET'])
@role_required('admin', 'hr')
def get_all_resumes():
    """Get all resumes with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        result = ResumeService.get_all_resumes(page=page, per_page=per_page)
        return success_response(result, 'Resumes retrieved successfully')
    
    except Exception as e:
        return error_response(f'Error retrieving resumes: {str(e)}', 500)


@resume_bp.route('/<resume_id>', methods=['GET'])
@role_required('admin', 'hr')
def get_resume(resume_id):
    """Get a specific resume"""
    try:
        resume = ResumeService.get_resume_by_id(resume_id)
        if not resume:
            return error_response('Resume not found', 404)
        
        return success_response(resume, 'Resume retrieved successfully')
    
    except Exception as e:
        return error_response(f'Error retrieving resume: {str(e)}', 500)


@resume_bp.route('/<resume_id>/screenings', methods=['GET'])
@role_required('admin', 'hr')
def get_resume_screenings(resume_id):
    """Get all screenings for a resume"""
    try:
        screenings = ResumeService.get_resume_screenings(resume_id)
        return success_response(screenings, 'Screenings retrieved successfully')
    
    except Exception as e:
        return error_response(f'Error retrieving screenings: {str(e)}', 500)


@resume_bp.route('/<resume_id>', methods=['DELETE'])
@role_required('admin', 'hr')
def delete_resume(resume_id):
    """Delete a resume"""
    try:
        ResumeService.delete_resume(resume_id)
        return success_response(None, 'Resume deleted successfully')
    
    except ValueError as e:
        return error_response(str(e), 404)
    except Exception as e:
        return error_response(f'Error deleting resume: {str(e)}', 500)


@resume_bp.route('/statistics', methods=['GET'])
@role_required('admin', 'hr')
def get_resume_statistics():
    """Get resume screening statistics"""
    try:
        stats = ResumeService.get_resume_statistics()
        return success_response(stats, 'Statistics retrieved successfully')
    
    except Exception as e:
        return error_response(f'Error retrieving statistics: {str(e)}', 500)


@resume_bp.route('/top-candidates', methods=['GET'])
@role_required('admin', 'hr')
def get_top_candidates():
    """Get top candidates based on screening scores"""
    try:
        limit = request.args.get('limit', 10, type=int)
        candidates = ResumeService.get_top_candidates(limit=limit)
        return success_response(candidates, 'Top candidates retrieved successfully')
    
    except Exception as e:
        return error_response(f'Error retrieving top candidates: {str(e)}', 500)
