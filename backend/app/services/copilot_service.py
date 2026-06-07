"""
HR Copilot Service for AI-powered HR Assistant
Handles intent understanding, query building, and natural language responses
"""

try:
    import google.generativeai as genai
except Exception:
    genai = None
from app.models import Employee, Attendance, LeaveRequest, Resume, ResumeScreening, Interview, InterviewResult
from app.models.user import db
from flask import current_app
from datetime import date, datetime
import json
import re


class HRCopilotService:
    """Service for HR Copilot chat functionality"""

    @staticmethod
    def understand_intent(query, api_key):
        """Understand user intent using Gemini"""
        # If Gemini client is not available, use a simple rule-based fallback
        if genai is None:
            return HRCopilotService._rule_based_intent(query)

        try:
            # Configure Gemini
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')

            prompt = f"""
            You are an HR assistant. Analyze the following query and determine the intent.
            
            Query: "{query}"
            
            Supported intents:
            - employee_count: Get total number of employees
            - employee_list: List employees with filters
            - attendance_below: Get employees with attendance below threshold
            - attendance_summary: Get attendance statistics
            - pending_leaves: Get pending leave requests
            - leave_summary: Get leave statistics
            - department_stats: Get department statistics
            - resume_stats: Get resume screening statistics
            - interview_stats: Get interview statistics
            - top_candidates: Get top candidates from screenings/interviews
            
            Return ONLY a valid JSON object:
            {{
                "intent": "intent_name",
                "parameters": {{
                    "key": "value"
                }},
                "confidence": 0.95
            }}
            
            For parameters, extract any numbers, names, or thresholds mentioned.
            No additional text, just the JSON.
            """

            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up response
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            # Parse JSON
            intent_data = json.loads(response_text)
            return intent_data

        except Exception as e:
            print(f"Gemini API error: {str(e)}")
            # Fall back to rule-based parser when API fails
            return HRCopilotService._rule_based_intent(query)

    @staticmethod
    def execute_query(intent, parameters):
        """Execute database query based on intent"""
        try:
            result = {}
            
            if intent == 'employee_count':
                result = HRCopilotService._get_employee_count()
            
            elif intent == 'employee_list':
                result = HRCopilotService._get_employee_list(parameters)
            
            elif intent == 'attendance_below':
                threshold = parameters.get('threshold', 80)
                result = HRCopilotService._get_attendance_below(threshold)
            
            elif intent == 'attendance_summary':
                result = HRCopilotService._get_attendance_summary()
            
            elif intent == 'pending_leaves':
                result = HRCopilotService._get_pending_leaves()
            
            elif intent == 'leave_summary':
                result = HRCopilotService._get_leave_summary()
            
            elif intent == 'department_stats':
                result = HRCopilotService._get_department_stats()
            
            elif intent == 'resume_stats':
                result = HRCopilotService._get_resume_stats()
            
            elif intent == 'interview_stats':
                result = HRCopilotService._get_interview_stats()
            
            elif intent == 'top_candidates':
                result = HRCopilotService._get_top_candidates()
            
            else:
                result = {"error": "Unknown intent"}
            
            return result

        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def generate_response(query, query_result, api_key):
        """Generate human-friendly response using Gemini"""
        # If Gemini client is not available, format a simple response
        if genai is None:
            return HRCopilotService._format_simple_response(query, query_result)

        try:
            # Configure Gemini
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')

            prompt = f"""
            You are an HR assistant. Generate a friendly, professional response to the user's query based on the query result.
            
            User Query: "{query}"
            
            Query Result: {json.dumps(query_result, indent=2)}
            
            Guidelines:
            - Be concise and helpful
            - Use bullet points for lists
            - Provide actionable recommendations when appropriate
            - Be professional but conversational
            - If data is empty, suggest what the user can do
            
            Return ONLY the response text, no JSON or additional formatting.
            """

            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            return response_text

        except Exception as e:
            print(f"Gemini API error: {str(e)}")
            # Return simple response if API fails
            return HRCopilotService._format_simple_response(query, query_result)

    @staticmethod
    def _format_simple_response(query, query_result):
        """Format simple response without AI"""
        if "error" in query_result:
            return f"I'm sorry, I couldn't process that request: {query_result['error']}"
        
        response = f"Here's the information for: {query}\n\n"
        
        for key, value in query_result.items():
            if isinstance(value, list):
                response += f"{key.replace('_', ' ').title()}:\n"
                for item in value[:5]:  # Limit to 5 items
                    response += f"  - {item}\n"
            else:
                response += f"{key.replace('_', ' ').title()}: {value}\n"
        
        return response

    # Query execution methods
    @staticmethod
    def _get_employee_count():
        total = Employee.query.count()
        active = Employee.query.filter_by(status='active').count()
        return {
            "total_employees": total,
            "active_employees": active,
            "inactive_employees": total - active
        }

    @staticmethod
    def _get_employee_list(parameters):
        department = parameters.get('department')
        query = Employee.query
        
        if department:
            query = query.filter_by(department=department)
        
        employees = query.limit(10).all()
        return {
            "employees": [
                f"{e.first_name} {e.last_name} - {e.department} - {e.designation}"
                for e in employees
            ]
        }

    @staticmethod
    def _get_attendance_below(threshold):
        # Get employees with low attendance
        from app.services.attendance_service import AttendanceService
        employees = Employee.query.filter_by(status='active').all()
        
        low_attendance = []
        for emp in employees:
            rate = AttendanceService.get_attendance_rate(str(emp.id))
            if rate < threshold:
                low_attendance.append({
                    "name": f"{emp.first_name} {emp.last_name}",
                    "attendance": f"{rate:.1f}%"
                })
        
        return {
            "threshold": threshold,
            "employees_below_threshold": low_attendance,
            "count": len(low_attendance)
        }

    @staticmethod
    def _get_attendance_summary():
        from app.services.attendance_service import AttendanceService
        from datetime import date
        
        summary = AttendanceService.get_organization_attendance_summary(
            year=date.today().year,
            month=date.today().month
        )
        
        return {
            "average_attendance": f"{summary.get('average_attendance_percentage', 0):.1f}%",
            "total_records": summary.get('total_records', 0),
            "present": summary.get('present', 0),
            "absent": summary.get('absent', 0)
        }

    @staticmethod
    def _get_pending_leaves():
        leaves = LeaveRequest.query.filter_by(status='pending').limit(10).all()
        
        return {
            "pending_leaves": [
                {
                    "employee_id": str(l.employee_id),
                    "start_date": l.start_date.isoformat(),
                    "end_date": l.end_date.isoformat(),
                    "leave_type": l.leave_type
                }
                for l in leaves
            ],
            "count": len(leaves)
        }

    @staticmethod
    def _get_leave_summary():
        total = LeaveRequest.query.count()
        pending = LeaveRequest.query.filter_by(status='pending').count()
        approved = LeaveRequest.query.filter_by(status='approved').count()
        rejected = LeaveRequest.query.filter_by(status='rejected').count()
        
        return {
            "total_leaves": total,
            "pending": pending,
            "approved": approved,
            "rejected": rejected
        }

    @staticmethod
    def _get_department_stats():
        from sqlalchemy import func
        
        departments = db.session.query(
            Employee.department,
            func.count(Employee.id).label('count')
        ).group_by(Employee.department).all()
        
        return {
            "departments": [
                {"name": dept[0], "employee_count": dept[1]}
                for dept in departments
            ]
        }

    @staticmethod
    def _get_resume_stats():
        from app.services.resume_service import ResumeService
        return ResumeService.get_resume_statistics()

    @staticmethod
    def _get_interview_stats():
        from app.services.interview_service import InterviewService
        return InterviewService.get_interview_statistics()

    @staticmethod
    def _get_top_candidates():
        from app.services.resume_service import ResumeService
        return ResumeService.get_top_candidates(limit=5)

    @staticmethod
    def process_query(query, api_key=None):
        """Process a natural language query end-to-end"""
        try:
            # Use provided API key or fallback to config
            if not api_key:
                api_key = current_app.config.get('GEMINI_API_KEY', '')
            
            if not api_key:
                raise ValueError('Gemini API key is required')

            # Step 1: Understand intent (use fallback if Gemini missing or uncertain)
            intent_data = HRCopilotService.understand_intent(query, api_key)

            # If intent is unknown or low confidence, try rule-based fallback
            if not intent_data or intent_data.get('intent') == 'unknown' or intent_data.get('confidence', 0) < 0.4:
                fallback = HRCopilotService._rule_based_intent(query)
                if fallback and fallback.get('intent') != 'unknown':
                    intent_data = fallback
            
            # Step 2: Execute query
            query_result = HRCopilotService.execute_query(
                intent_data['intent'],
                intent_data.get('parameters', {})
            )
            
            # Step 3: Generate response
            response = HRCopilotService.generate_response(query, query_result, api_key)
            
            return {
                "response": response,
                "intent": intent_data['intent'],
                "query_result": query_result
            }

        except Exception as e:
            return {
                "response": f"I'm sorry, I encountered an error: {str(e)}",
                "intent": "error",
                "query_result": {"error": str(e)}
            }

    # --- Rule-based fallback intent parser ---
    @staticmethod
    def _rule_based_intent(query: str):
        """Simple heuristic intent parser for common HR questions."""
        q = query.lower().strip()

        # employee count
        if re.search(r"how many (employees|people) (joined|joined this month|joined this year|do we have)", q) or re.search(r"total employees|number of employees|employee count", q):
            return {"intent": "employee_count", "parameters": {}, "confidence": 0.9}

        # attendance below
        m = re.search(r"attendance (below|less than) (\d{1,3})", q)
        if m:
            threshold = int(m.group(2))
            return {"intent": "attendance_below", "parameters": {"threshold": threshold}, "confidence": 0.9}

        # attendance summary
        if "attendance" in q and ("summary" in q or "average" in q or "rate" in q):
            return {"intent": "attendance_summary", "parameters": {}, "confidence": 0.8}

        # pending leaves
        if "pending" in q and "leave" in q:
            return {"intent": "pending_leaves", "parameters": {}, "confidence": 0.8}

        # leave summary
        if "leave" in q and ("summary" in q or "statistics" in q or "how many leaves" in q):
            return {"intent": "leave_summary", "parameters": {}, "confidence": 0.75}

        # department stats
        if "department" in q and ("most" in q or "which department" in q or "department stats" in q):
            return {"intent": "department_stats", "parameters": {}, "confidence": 0.7}

        # resume / top candidates
        if "top candidates" in q or "resume" in q or "candidates" in q:
            return {"intent": "top_candidates", "parameters": {}, "confidence": 0.6}

        return {"intent": "unknown", "parameters": {}, "confidence": 0.0}
