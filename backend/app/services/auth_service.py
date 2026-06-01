from app.models import User, Employee
from app.utils.validators import hash_password, verify_password
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError
from app.models.user import db


class AuthService:
    """Service for authentication operations"""

    @staticmethod
    def register(email: str, password: str, role: str = 'employee') -> dict:
        """
        Register a new user
        
        Args:
            email: User email
            password: User password
            role: User role (admin, hr, manager, employee)
            
        Returns:
            dict with user data
            
        Raises:
            ValueError: If email already exists or validation fails
        """
        try:
            # Check if user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                raise ValueError('Email already registered')

            # Create new user
            user = User(
                email=email,
                password_hash=hash_password(password),
                role=role
            )

            db.session.add(user)
            db.session.commit()

            return {
                'id': str(user.id),
                'email': user.email,
                'role': user.role
            }
        except IntegrityError:
            db.session.rollback()
            raise ValueError('Email already registered')
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def login(email: str, password: str) -> dict:
        """
        Login user and return JWT token
        
        Args:
            email: User email
            password: User password
            
        Returns:
            dict with access_token and user data
            
        Raises:
            ValueError: If credentials are invalid
        """
        user = User.query.filter_by(email=email).first()

        if not user or not verify_password(password, user.password_hash):
            raise ValueError('Invalid email or password')

        # Create JWT token
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                'email': user.email,
                'role': user.role
            }
        )

        return {
            'access_token': access_token,
            'user': user.to_dict()
        }

    @staticmethod
    def get_user_by_id(user_id: str) -> User:
        """Get user by ID"""
        return User.query.filter_by(id=user_id).first()

    @staticmethod
    def get_user_by_email(email: str) -> User:
        """Get user by email"""
        return User.query.filter_by(email=email).first()
