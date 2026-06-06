from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.middleware.auth import token_required, role_required
from app.services.copilot_service import HRCopilotService
from app.utils.response import success_response, error_response

copilot_bp = Blueprint('copilot', __name__, url_prefix='/api/copilot')


@copilot_bp.route('/chat', methods=['POST'])
@role_required('admin', 'hr')
def chat():
    """Process a natural language query"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'query' not in data or not data['query']:
            return error_response('Query is required', 400)
        
        # Get API key from request or use config fallback
        api_key = data.get('api_key', '')
        
        # Process query
        result = HRCopilotService.process_query(
            query=data['query'],
            api_key=api_key
        )
        
        return success_response(result, 'Query processed successfully')
    
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        return error_response(f'Error processing query: {str(e)}', 500)


@copilot_bp.route('/suggested-questions', methods=['GET'])
@role_required('admin', 'hr')
def suggested_questions():
    """Get suggested questions for quick access"""
    try:
        suggestions = [
            "How many employees joined this month?",
            "Show employees with attendance below 80%",
            "Show pending leave requests",
            "Which department has the most employees?",
            "What is the average attendance rate?",
            "Show top candidates from resume screenings",
            "How many interviews have been completed?",
            "Show leave statistics for this month"
        ]
        
        return success_response({"suggestions": suggestions}, 'Suggestions retrieved successfully')
    
    except Exception as e:
        return error_response(f'Error retrieving suggestions: {str(e)}', 500)
