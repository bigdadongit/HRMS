"""
Resume Service for AI Resume Screening System
Handles file extraction, Gemini API integration, and deterministic scoring
"""

import os
import PyPDF2
import pdfplumber
from docx import Document
try:
    import google.generativeai as genai
except Exception:
    genai = None
from app.models import Resume, ResumeScreening
from app.models.user import db
from flask import current_app
from datetime import datetime
import json
import re


class ResumeService:
    """Service for resume operations and AI screening"""

    @staticmethod
    def extract_text_from_pdf(file_path):
        """Extract text from PDF file"""
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            # Fallback to PyPDF2
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
            except Exception as e2:
                raise Exception(f"Failed to extract text from PDF: {str(e2)}")
        return text

    @staticmethod
    def extract_text_from_docx(file_path):
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            raise Exception(f"Failed to extract text from DOCX: {str(e)}")

    @staticmethod
    def extract_text(file_path, file_type):
        """Extract text from resume file based on type"""
        if file_type == 'pdf':
            return ResumeService.extract_text_from_pdf(file_path)
        elif file_type == 'docx':
            return ResumeService.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

    @staticmethod
    def analyze_resume_with_gemini(resume_text, jd_text, api_key):
        """Analyze resume using Gemini API"""
        try:
            # If google generative AI client isn't available, return default analysis
            if genai is None:
                raise RuntimeError('Gemini client not available')

            # Configure Gemini
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')

            # Create prompt for Gemini
            prompt = f"""
            You are an expert HR analyst. Analyze the following resume against the job description.
            
            RESUME:
            {resume_text}
            
            JOB DESCRIPTION:
            {jd_text}
            
            Extract and return ONLY a valid JSON object with the following structure:
            {{
                "skills_found": ["skill1", "skill2", ...],
                "missing_skills": ["skill1", "skill2", ...],
                "experience_summary": "Brief summary of experience",
                "strengths": ["strength1", "strength2", ...],
                "education_level": "Bachelor's/Master's/PhD/Other",
                "years_of_experience": number,
                "key_achievements": ["achievement1", ...]
            }}
            
            Focus on:
            1. Technical skills mentioned in resume
            2. Skills from JD that are missing in resume
            3. Overall experience summary
            4. Key strengths of the candidate
            5. Education level
            6. Total years of experience
            7. Notable achievements
            
            Return ONLY the JSON, no additional text.
            """

            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up response (remove markdown code blocks if present)
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            # Parse JSON
            analysis = json.loads(response_text)
            return analysis

        except Exception as e:
            print(f"Gemini API error: {str(e)}")
            # Return default analysis if API fails
            return {
                "skills_found": [],
                "missing_skills": [],
                "experience_summary": "Unable to analyze",
                "strengths": [],
                "education_level": "Unknown",
                "years_of_experience": 0,
                "key_achievements": []
            }

    @staticmethod
    def calculate_deterministic_score(analysis, jd_text):
        """
        Calculate deterministic score based on:
        - Skills Match: 50%
        - Experience Match: 30%
        - Education Match: 20%
        """
        # Extract skills from JD (simple keyword extraction)
        jd_skills = ResumeService.extract_skills_from_text(jd_text)
        
        # Calculate skills match score (50% weight)
        skills_found = set(analysis.get('skills_found', []))
        jd_skills_set = set(jd_skills)
        
        if len(jd_skills_set) > 0:
            matched_skills = skills_found.intersection(jd_skills_set)
            skills_score = (len(matched_skills) / len(jd_skills_set)) * 50
        else:
            skills_score = 25  # Default if no skills in JD

        # Calculate experience score (30% weight)
        years_of_experience = analysis.get('years_of_experience', 0)
        # Assume 5+ years is ideal, scale accordingly
        experience_score = min((years_of_experience / 5) * 30, 30)

        # Calculate education score (20% weight)
        education_level = analysis.get('education_level', '').lower()
        if 'phd' in education_level:
            education_score = 20
        elif 'master' in education_level:
            education_score = 18
        elif 'bachelor' in education_level:
            education_score = 15
        else:
            education_score = 10

        # Total score
        total_score = round(skills_score + experience_score + education_score, 2)
        
        return {
            'total_score': min(total_score, 100),
            'skills_score': round(skills_score, 2),
            'experience_score': round(experience_score, 2),
            'education_score': round(education_score, 2)
        }

    @staticmethod
    def extract_skills_from_text(text):
        """Extract skills from job description text"""
        # Common tech skills to look for
        common_skills = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js',
            'django', 'flask', 'spring', 'sql', 'nosql', 'mongodb', 'postgresql',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'ci/cd',
            'machine learning', 'deep learning', 'nlp', 'data science', 'analytics',
            'html', 'css', 'typescript', 'redux', 'graphql', 'rest api',
            'agile', 'scrum', 'devops', 'linux', 'bash', 'shell scripting',
            'testing', 'junit', 'pytest', 'selenium', 'cypress'
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in common_skills:
            if skill in text_lower:
                found_skills.append(skill)
        
        return found_skills

    @staticmethod
    def determine_recommendation(score):
        """Determine recommendation based on score"""
        if score >= 80:
            return "Proceed to Interview"
        elif score >= 60:
            return "Maybe Consider"
        else:
            return "Not Recommended"

    @staticmethod
    def create_resume(candidate_name, file_path, file_name, file_type, uploaded_by):
        """Create a new resume record"""
        try:
            # Extract text from file
            extracted_text = ResumeService.extract_text(file_path, file_type)
            
            resume = Resume(
                candidate_name=candidate_name,
                file_path=file_path,
                file_name=file_name,
                file_type=file_type,
                extracted_text=extracted_text,
                uploaded_by=uploaded_by
            )
            
            db.session.add(resume)
            db.session.commit()
            
            return resume.to_dict()
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def screen_resume(resume_id, jd_text, api_key, screened_by):
        """Screen a resume against job description"""
        try:
            # Get resume
            resume = Resume.query.filter_by(id=resume_id).first()
            if not resume:
                raise ValueError('Resume not found')
            
            # Use provided API key or fallback to config
            if not api_key:
                api_key = current_app.config.get('GEMINI_API_KEY', '')
            
            if not api_key:
                raise ValueError('Gemini API key is required. Provide it in request or set GEMINI_API_KEY environment variable')
            
            # Analyze with Gemini
            analysis = ResumeService.analyze_resume_with_gemini(
                resume.extracted_text, 
                jd_text, 
                api_key
            )
            
            # Calculate deterministic score
            score_breakdown = ResumeService.calculate_deterministic_score(analysis, jd_text)
            total_score = score_breakdown['total_score']
            
            # Determine recommendation
            recommendation = ResumeService.determine_recommendation(total_score)
            
            # Create screening record
            screening = ResumeScreening(
                resume_id=resume_id,
                jd_text=jd_text,
                match_score=total_score,
                skills_found=analysis.get('skills_found', []),
                missing_skills=analysis.get('missing_skills', []),
                experience_summary=analysis.get('experience_summary', ''),
                strengths=analysis.get('strengths', []),
                recommendation=recommendation,
                screened_by=screened_by
            )
            
            db.session.add(screening)
            db.session.commit()
            
            return {
                **screening.to_dict(),
                'score_breakdown': score_breakdown,
                'candidate_name': resume.candidate_name
            }
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_all_resumes(page=1, per_page=10):
        """Get all resumes with pagination"""
        query = Resume.query.order_by(Resume.uploaded_at.desc())
        total = query.count()
        resumes = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'data': [resume.to_dict() for resume in resumes.items],
            'total': total,
            'pages': resumes.pages,
            'current_page': page,
            'per_page': per_page
        }

    @staticmethod
    def get_resume_by_id(resume_id):
        """Get resume by ID"""
        resume = Resume.query.filter_by(id=resume_id).first()
        if not resume:
            return None
        return resume.to_dict()

    @staticmethod
    def get_resume_screenings(resume_id):
        """Get all screenings for a resume"""
        screenings = ResumeScreening.query.filter_by(resume_id=resume_id)\
            .order_by(ResumeScreening.created_at.desc()).all()
        return [screening.to_dict() for screening in screenings]

    @staticmethod
    def get_top_candidates(limit=10):
        """Get top candidates based on latest screening scores"""
        screenings = ResumeScreening.query\
            .order_by(ResumeScreening.match_score.desc())\
            .limit(limit)\
            .all()
        
        results = []
        for screening in screenings:
            resume = Resume.query.filter_by(id=screening.resume_id).first()
            if resume:
                results.append({
                    'candidate_name': resume.candidate_name,
                    'match_score': screening.match_score,
                    'recommendation': screening.recommendation,
                    'screened_at': screening.created_at.isoformat()
                })
        
        return results

    @staticmethod
    def get_resume_statistics():
        """Get resume screening statistics"""
        total_resumes = Resume.query.count()
        total_screenings = ResumeScreening.query.count()
        
        if total_screenings > 0:
            avg_score = db.session.query(db.func.avg(ResumeScreening.match_score)).scalar()
            avg_score = round(avg_score, 2) if avg_score else 0
        else:
            avg_score = 0
        
        # Count by recommendation
        proceed_count = ResumeScreening.query.filter_by(recommendation='Proceed to Interview').count()
        maybe_count = ResumeScreening.query.filter_by(recommendation='Maybe Consider').count()
        reject_count = ResumeScreening.query.filter_by(recommendation='Not Recommended').count()
        
        return {
            'total_resumes': total_resumes,
            'total_screenings': total_screenings,
            'average_match_score': avg_score,
            'proceed_count': proceed_count,
            'maybe_count': maybe_count,
            'reject_count': reject_count
        }

    @staticmethod
    def delete_resume(resume_id):
        """Delete a resume and its screenings"""
        try:
            resume = Resume.query.filter_by(id=resume_id).first()
            if not resume:
                raise ValueError('Resume not found')
            
            # Delete file if exists
            if os.path.exists(resume.file_path):
                os.remove(resume.file_path)
            
            db.session.delete(resume)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
