"""
Interview Service for AI Interview System
Handles question generation, answer evaluation, and interview management
"""

try:
    import google.generativeai as genai
except Exception:
    genai = None
from app.models import Interview, InterviewQuestion, InterviewAnswer, InterviewResult
from app.models.user import db
from flask import current_app
from datetime import datetime
import json


class InterviewService:
    """Service for interview operations and AI evaluation"""

    @staticmethod
    def generate_questions(role, api_key, num_questions=10):
        """Generate interview questions using Gemini API"""
        try:
            # If Gemini client isn't available, fall back
            if genai is None:
                raise RuntimeError('Gemini client not available')

            # Configure Gemini
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')

            # Create prompt for question generation
            prompt = f"""
            You are an expert technical interviewer. Generate {num_questions} interview questions for the role of {role}.
            
            Requirements:
            - Mix of difficulty levels: 3 Easy, 4 Medium, 3 Hard
            - Questions should test technical knowledge, problem-solving, and practical skills
            - Each question should be clear and specific
            
            Return ONLY a valid JSON array with the following structure:
            [
                {{
                    "question": "Question text here",
                    "difficulty": "easy|medium|hard"
                }}
            ]
            
            No additional text, just the JSON array.
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
            questions = json.loads(response_text)
            return questions

        except Exception as e:
            print(f"Gemini API error: {str(e)}")
            # Return default questions if API fails
            return [
                {"question": f"Tell me about your experience with {role}", "difficulty": "easy"},
                {"question": "What are your strengths and weaknesses?", "difficulty": "easy"},
                {"question": "Describe a challenging project you worked on", "difficulty": "medium"}
            ]

    @staticmethod
    def evaluate_answers(interview_id, api_key):
        """Evaluate all answers for an interview using Gemini"""
        try:
            # Get interview with questions and answers
            interview = Interview.query.filter_by(id=interview_id).first()
            if not interview:
                raise ValueError('Interview not found')

            questions = InterviewQuestion.query.filter_by(interview_id=interview_id).order_by(InterviewQuestion.order).all()
            answers = InterviewAnswer.query.filter_by(interview_id=interview_id).all()

            if not answers:
                raise ValueError('No answers to evaluate')

            # Configure Gemini
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')

            # Build evaluation prompt
            qa_pairs = []
            for question in questions:
                answer = next((a for a in answers if a.question_id == question.id), None)
                if answer and answer.answer:
                    qa_pairs.append({
                        "question": question.question,
                        "answer": answer.answer,
                        "difficulty": question.difficulty
                    })

            prompt = f"""
            You are an expert technical interviewer. Evaluate the following interview answers for the role of {interview.role_applied}.
            
            Question-Answer pairs:
            {json.dumps(qa_pairs, indent=2)}
            
            Evaluate the candidate on:
            1. Technical Knowledge (0-10)
            2. Communication Skills (0-10)
            3. Confidence Level (0-10)
            
            Calculate overall score as average of the three.
            
            Provide recommendation:
            - "Proceed" if overall score >= 7
            - "Maybe" if overall score >= 5
            - "Reject" if overall score < 5
            
            Return ONLY a valid JSON object:
            {{
                "technical_score": 8,
                "communication_score": 7,
                "confidence_score": 8,
                "overall_score": 7.7,
                "recommendation": "Proceed",
                "feedback": "Brief feedback summary"
            }}
            
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
            evaluation = json.loads(response_text)
            return evaluation

        except Exception as e:
            print(f"Gemini API error: {str(e)}")
            # Return default evaluation if API fails
            return {
                "technical_score": 5,
                "communication_score": 5,
                "confidence_score": 5,
                "overall_score": 5.0,
                "recommendation": "Maybe",
                "feedback": "Unable to evaluate due to API error"
            }

    @staticmethod
    def create_interview(candidate_name, role_applied, created_by, api_key=None):
        """Create a new interview with generated questions"""
        try:
            # Use provided API key or fallback to config
            if not api_key:
                api_key = current_app.config.get('GEMINI_API_KEY', '')
            
            if not api_key:
                raise ValueError('Gemini API key is required')

            # Create interview
            interview = Interview(
                candidate_name=candidate_name,
                role_applied=role_applied,
                created_by=created_by,
                status='in_progress'
            )
            
            db.session.add(interview)
            db.session.commit()
            
            # Generate questions
            questions_data = InterviewService.generate_questions(role_applied, api_key)
            
            # Save questions
            for idx, q_data in enumerate(questions_data):
                question = InterviewQuestion(
                    interview_id=interview.id,
                    question=q_data['question'],
                    difficulty=q_data['difficulty'],
                    order=idx + 1
                )
                db.session.add(question)
            
            db.session.commit()
            
            return interview.to_dict()

        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def submit_answer(interview_id, question_id, answer):
        """Submit an answer for a question"""
        try:
            answer_record = InterviewAnswer(
                interview_id=interview_id,
                question_id=question_id,
                answer=answer
            )
            
            db.session.add(answer_record)
            db.session.commit()
            
            return answer_record.to_dict()

        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def complete_interview(interview_id, api_key=None):
        """Complete interview and generate results"""
        try:
            # Use provided API key or fallback to config
            if not api_key:
                api_key = current_app.config.get('GEMINI_API_KEY', '')
            
            if not api_key:
                raise ValueError('Gemini API key is required')

            # Get interview
            interview = Interview.query.filter_by(id=interview_id).first()
            if not interview:
                raise ValueError('Interview not found')

            # Evaluate answers
            evaluation = InterviewService.evaluate_answers(interview_id, api_key)
            
            # Create result
            result = InterviewResult(
                interview_id=interview_id,
                technical_score=evaluation['technical_score'],
                communication_score=evaluation['communication_score'],
                confidence_score=evaluation['confidence_score'],
                overall_score=evaluation['overall_score'],
                recommendation=evaluation['recommendation'],
                feedback=evaluation.get('feedback', '')
            )
            
            # Update interview status
            interview.status = 'completed'
            
            db.session.add(result)
            db.session.commit()
            
            return {
                **result.to_dict(),
                'candidate_name': interview.candidate_name,
                'role_applied': interview.role_applied
            }

        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_interview(interview_id):
        """Get interview details with questions and answers"""
        interview = Interview.query.filter_by(id=interview_id).first()
        if not interview:
            return None
        
        questions = InterviewQuestion.query.filter_by(interview_id=interview_id).order_by(InterviewQuestion.order).all()
        answers = InterviewAnswer.query.filter_by(interview_id=interview_id).all()
        result = InterviewResult.query.filter_by(interview_id=interview_id).first()
        
        return {
            **interview.to_dict(),
            'questions': [q.to_dict() for q in questions],
            'answers': [a.to_dict() for a in answers],
            'result': result.to_dict() if result else None
        }

    @staticmethod
    def get_all_interviews(page=1, per_page=10):
        """Get all interviews with pagination"""
        query = Interview.query.order_by(Interview.created_at.desc())
        total = query.count()
        interviews = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'data': [interview.to_dict() for interview in interviews.items],
            'total': total,
            'pages': interviews.pages,
            'current_page': page,
            'per_page': per_page
        }

    @staticmethod
    def get_interview_statistics():
        """Get interview statistics"""
        total_interviews = Interview.query.count()
        completed_interviews = Interview.query.filter_by(status='completed').count()
        
        if completed_interviews > 0:
            avg_score = db.session.query(db.func.avg(InterviewResult.overall_score)).scalar()
            avg_score = round(avg_score, 2) if avg_score else 0
        else:
            avg_score = 0
        
        # Count by recommendation
        proceed_count = InterviewResult.query.filter_by(recommendation='Proceed').count()
        maybe_count = InterviewResult.query.filter_by(recommendation='Maybe').count()
        reject_count = InterviewResult.query.filter_by(recommendation='Reject').count()
        
        return {
            'total_interviews': total_interviews,
            'completed_interviews': completed_interviews,
            'average_score': avg_score,
            'proceed_count': proceed_count,
            'maybe_count': maybe_count,
            'reject_count': reject_count
        }

    @staticmethod
    def get_top_candidates(limit=10):
        """Get top candidates based on interview scores"""
        results = InterviewResult.query\
            .order_by(InterviewResult.overall_score.desc())\
            .limit(limit)\
            .all()
        
        candidates = []
        for result in results:
            interview = Interview.query.filter_by(id=result.interview_id).first()
            if interview:
                candidates.append({
                    'candidate_name': interview.candidate_name,
                    'role_applied': interview.role_applied,
                    'overall_score': result.overall_score,
                    'recommendation': result.recommendation,
                    'interviewed_at': interview.created_at.isoformat()
                })
        
        return candidates

    @staticmethod
    def delete_interview(interview_id):
        """Delete an interview"""
        try:
            interview = Interview.query.filter_by(id=interview_id).first()
            if not interview:
                raise ValueError('Interview not found')
            
            db.session.delete(interview)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
