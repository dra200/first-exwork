"""
Price prediction model for exWork.eu.

This module provides a machine learning model to:
1. Predict appropriate price ranges for projects based on their characteristics
2. Identify fair pricing for proposals
3. Help buyers and sellers with price negotiation
"""
import os
import logging
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score

from ..config import MODEL_DIR, MODEL_CONFIG
from ..data.db_connector import connector

logger = logging.getLogger(__name__)

class PricePredictionModel:
    """
    Model for predicting project and proposal prices based on various factors.
    Uses historical project, proposal, and payment data to make predictions.
    """
    
    def __init__(self):
        """Initialize the price prediction model."""
        self.config = MODEL_CONFIG["price_prediction"]
        self.model_path = os.path.join(MODEL_DIR, "price_prediction_model.pkl")
        self.pipeline = None
        
    def preprocess_data(self):
        """
        Preprocess project, proposal, and payment data for model training.
        Extracts features like project complexity, duration, and skills.
        
        Returns:
            tuple: X_train, X_test, y_train, y_test data splits
        """
        # Get completed projects with successful proposals and payments
        completed_df = connector.get_completed_projects()
        
        if completed_df.empty:
            logger.warning("Not enough data to train price prediction model")
            return None, None, None, None
        
        # Extract features from text descriptions
        # For simplicity, we'll use word counts and basic metrics
        def extract_complexity(text):
            if not isinstance(text, str):
                return 1  # Default complexity
            
            # Simple complexity metric based on text length and word counts
            words = text.split()
            
            if len(words) < 50:
                return 1  # Simple
            elif len(words) < 200:
                return 2  # Moderate
            else:
                return 3  # Complex
        
        # Apply feature extraction
        completed_df['complexity'] = completed_df['description'].apply(extract_complexity)
        
        # Convert duration (delivery_time) to numeric if it's not already
        if 'delivery_time' in completed_df.columns:
            completed_df['duration'] = pd.to_numeric(completed_df['delivery_time'], errors='coerce')
        else:
            # Estimate from project deadlines if available
            completed_df['duration'] = 30  # Default to 30 days if not available
        
        # Use actual payments as target
        if 'payment_amount' in completed_df.columns:
            target = completed_df['payment_amount']
        else:
            # Fallback to proposal price if payment data isn't available
            target = completed_df['proposal_price']
        
        # Create features dataframe
        features = pd.DataFrame()
        
        # Use available columns from our configuration
        for feature in self.config["features"]:
            if feature in completed_df.columns:
                features[feature] = completed_df[feature]
            else:
                logger.warning(f"Feature {feature} not found in data, using default")
                # Use reasonable defaults for missing features
                if feature == 'complexity':
                    features[feature] = 2  # Medium complexity
                elif feature == 'duration':
                    features[feature] = 30  # 30 days
                elif feature == 'required_skills':
                    features[feature] = 'general'  # General skills
                elif feature == 'category':
                    features[feature] = 'other'  # Other category
        
        # Add additional useful features if available
        if 'proposal_price' in completed_df.columns:
            features['initial_price'] = completed_df['proposal_price']
        
        if 'project_budget' in completed_df.columns:
            features['budget'] = completed_df['project_budget']
        elif 'budget' in completed_df.columns:
            features['budget'] = completed_df['budget']
            
        # Split data
        if len(features) > 10:  # Only if we have enough data
            return train_test_split(
                features, target, test_size=0.2, random_state=42
            )
        else:
            return None, None, None, None
    
    def build_pipeline(self):
        """
        Build the preprocessing and model pipeline.
        
        Returns:
            sklearn.pipeline.Pipeline: The model pipeline
        """
        # Define categorical and numerical features
        categorical_features = ['category', 'required_skills']
        numerical_features = ['complexity', 'duration', 'budget', 'initial_price']
        
        # Keep only features that exist in our data
        categorical_features = [f for f in categorical_features 
                                if f in self.config["features"]]
        numerical_features = [f for f in numerical_features 
                              if f in self.config["features"]]
        
        # Define preprocessing for numerical and categorical features
        numerical_transformer = Pipeline(steps=[
            ('scaler', StandardScaler())
        ])
        
        categorical_transformer = Pipeline(steps=[
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])
        
        # Combine preprocessing steps
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numerical_transformer, numerical_features),
                ('cat', categorical_transformer, categorical_features)
            ],
            remainder='drop'  # Drop columns not specified
        )
        
        # Create model pipeline
        if self.config["model_type"] == "random_forest":
            pipeline = Pipeline(steps=[
                ('preprocessor', preprocessor),
                ('model', RandomForestRegressor(
                    n_estimators=100,
                    max_depth=None,
                    min_samples_split=2,
                    random_state=42
                ))
            ])
        else:  # Default to RandomForest
            pipeline = Pipeline(steps=[
                ('preprocessor', preprocessor),
                ('model', RandomForestRegressor(
                    n_estimators=100,
                    random_state=42
                ))
            ])
            
        return pipeline
    
    def train(self, force=False):
        """
        Train the price prediction model.
        
        Args:
            force (bool, optional): Force retraining even if model exists.
                Defaults to False.
                
        Returns:
            bool: True if training was successful, False otherwise
        """
        # Check if model already exists
        if not force and os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    self.pipeline = pickle.load(f)
                logger.info("Loaded existing price prediction model")
                return True
            except Exception as e:
                logger.error(f"Failed to load existing model: {str(e)}")
        
        # Preprocess data
        X_train, X_test, y_train, y_test = self.preprocess_data()
        
        if X_train is None:
            logger.warning("Not enough data to train model")
            return False
        
        # Build pipeline
        self.pipeline = self.build_pipeline()
        
        # Train model
        try:
            self.pipeline.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = self.pipeline.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            logger.info(f"Model trained. MAE: {mae:.2f}, R²: {r2:.2f}")
            
            # Save model
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.pipeline, f)
                
            return True
        except Exception as e:
            logger.error(f"Model training failed: {str(e)}")
            return False
    
    def predict_price(self, project_data):
        """
        Predict the appropriate price for a project.
        
        Args:
            project_data (dict): Project details including features in config
                
        Returns:
            dict: Prediction results including estimated price range
        """
        if self.pipeline is None:
            # Try to load the model
            if os.path.exists(self.model_path):
                try:
                    with open(self.model_path, 'rb') as f:
                        self.pipeline = pickle.load(f)
                except Exception as e:
                    logger.error(f"Failed to load model: {str(e)}")
                    return {
                        'success': False,
                        'error': 'Model not available'
                    }
            else:
                return {
                    'success': False,
                    'error': 'Model not trained'
                }
        
        # Extract features
        try:
            features = {}
            
            # Process text to extract complexity
            if 'description' in project_data:
                words = project_data['description'].split()
                if len(words) < 50:
                    features['complexity'] = 1  # Simple
                elif len(words) < 200:
                    features['complexity'] = 2  # Moderate
                else:
                    features['complexity'] = 3  # Complex
            elif 'complexity' in project_data:
                features['complexity'] = project_data['complexity']
            else:
                features['complexity'] = 2  # Default to moderate
            
            # Duration
            if 'delivery_time' in project_data:
                features['duration'] = project_data['delivery_time']
            elif 'duration' in project_data:
                features['duration'] = project_data['duration']
            else:
                features['duration'] = 30  # Default 30 days
            
            # Category
            if 'category' in project_data:
                features['category'] = project_data['category']
            else:
                features['category'] = 'other'
            
            # Skills
            if 'required_skills' in project_data:
                features['required_skills'] = project_data['required_skills']
            else:
                features['required_skills'] = 'general'
            
            # Budget (if available)
            if 'budget' in project_data:
                features['budget'] = project_data['budget']
            
            # Initial price (for proposals)
            if 'initial_price' in project_data:
                features['initial_price'] = project_data['initial_price']
            
            # Convert to DataFrame
            features_df = pd.DataFrame([features])
            
            # Make prediction
            predicted_price = self.pipeline.predict(features_df)[0]
            
            # Calculate range (±15%)
            price_min = max(predicted_price * 0.85, 0)
            price_max = predicted_price * 1.15
            
            return {
                'success': True,
                'predicted_price': float(predicted_price),
                'price_range': {
                    'min': float(price_min),
                    'max': float(price_max)
                },
                'confidence': 0.8  # Placeholder for confidence score
            }
        
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def evaluate_proposal_price(self, project_id, proposal_price):
        """
        Evaluate if a proposal price is fair for a project.
        
        Args:
            project_id (int): The project ID
            proposal_price (float): The proposed price to evaluate
                
        Returns:
            dict: Evaluation results
        """
        # Get project data
        projects_df = connector.get_projects_data()
        project = projects_df[projects_df['id'] == project_id]
        
        if project.empty:
            return {
                'success': False,
                'error': 'Project not found'
            }
        
        # Extract project features
        project_data = project.iloc[0].to_dict()
        
        # Make price prediction
        prediction = self.predict_price(project_data)
        
        if not prediction['success']:
            return prediction
        
        # Compare with proposal
        predicted_price = prediction['predicted_price']
        price_min = prediction['price_range']['min']
        price_max = prediction['price_range']['max']
        
        # Evaluate the proposal
        if proposal_price < price_min:
            evaluation = 'below_market'
            message = 'Price is below the expected market rate'
        elif proposal_price > price_max:
            evaluation = 'above_market'
            message = 'Price is above the expected market rate'
        else:
            evaluation = 'fair'
            message = 'Price is within the expected market range'
        
        # Add deviation percentage
        deviation = ((proposal_price - predicted_price) / predicted_price) * 100
        
        return {
            'success': True,
            'evaluation': evaluation,
            'message': message,
            'predicted_price': float(predicted_price),
            'deviation_percent': float(deviation),
            'price_range': prediction['price_range']
        }