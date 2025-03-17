"""
Project recommendation model for exWork.eu.

This module provides a neural network-based recommendation system to:
1. Recommend relevant projects to sellers based on their skills and history
2. Recommend qualified sellers to buyers based on project requirements
"""
import os
import logging
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model, Model
from tensorflow.keras.layers import Dense, Embedding, Flatten, Input, Concatenate
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

from ..config import MODEL_DIR, MODEL_CONFIG
from ..data.db_connector import connector

logger = logging.getLogger(__name__)

class ProjectRecommendationModel:
    """
    Neural network-based recommendation system for matching projects and sellers.
    Uses collaborative filtering and content-based techniques.
    """
    
    def __init__(self):
        """Initialize the recommendation model."""
        self.config = MODEL_CONFIG["project_recommendation"]
        self.model_path = os.path.join(MODEL_DIR, "project_recommendation_model.h5")
        self.vectorizer = TfidfVectorizer(
            min_df=self.config["min_word_freq"],
            stop_words='english'
        )
        self.model = None
        self.project_embeddings = {}
        self.seller_embeddings = {}
        
    def preprocess_data(self):
        """
        Preprocess project and proposal data for model training.
        
        Returns:
            tuple: Training data consisting of (inputs, targets)
        """
        # Get data from database
        projects_df = connector.get_projects_data()
        proposals_df = connector.get_proposals_data()
        
        if projects_df.empty or proposals_df.empty:
            logger.warning("Not enough data to train recommendation model")
            return None, None
        
        # Create project text representations
        projects_df['text_features'] = projects_df['title'] + ' ' + projects_df['description']
        
        # Create project-seller interaction matrix
        interactions = proposals_df.merge(
            projects_df[['id', 'text_features']], 
            left_on='project_id', 
            right_on='id',
            suffixes=('_proposal', '_project')
        )
        
        # Extract features from text
        if len(interactions) > 0:
            self.vectorizer.fit(interactions['text_features'])
            
            # Create unique IDs
            unique_projects = projects_df['id'].unique()
            unique_sellers = proposals_df['seller_id'].unique()
            
            project_id_map = {pid: i for i, pid in enumerate(unique_projects)}
            seller_id_map = {sid: i for i, sid in enumerate(unique_sellers)}
            
            # Create training pairs
            project_ids = interactions['project_id'].map(project_id_map).values
            seller_ids = interactions['seller_id'].map(seller_id_map).values
            
            # Target is 1 for interactions (proposals submitted)
            targets = np.ones(len(interactions))
            
            return (project_ids, seller_ids), targets
        else:
            return None, None
    
    def build_model(self, n_projects, n_sellers):
        """
        Build the neural network model for recommendation.
        
        Args:
            n_projects (int): Number of unique projects
            n_sellers (int): Number of unique sellers
            
        Returns:
            tensorflow.keras.Model: The compiled model
        """
        # Project input
        project_input = Input(shape=(1,), name='project_input')
        project_embedding = Embedding(
            input_dim=n_projects,
            output_dim=self.config["embedding_size"],
            name='project_embedding'
        )(project_input)
        project_vec = Flatten()(project_embedding)
        
        # Seller input
        seller_input = Input(shape=(1,), name='seller_input')
        seller_embedding = Embedding(
            input_dim=n_sellers,
            output_dim=self.config["embedding_size"],
            name='seller_embedding'
        )(seller_input)
        seller_vec = Flatten()(seller_embedding)
        
        # Merge layers
        concat = Concatenate()([project_vec, seller_vec])
        
        # Dense layers
        dense1 = Dense(128, activation='relu')(concat)
        dense2 = Dense(64, activation='relu')(dense1)
        output = Dense(1, activation='sigmoid')(dense2)
        
        # Create model
        model = Model(
            inputs=[project_input, seller_input],
            outputs=output
        )
        
        # Compile
        model.compile(
            optimizer=Adam(learning_rate=self.config["learning_rate"]),
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train(self, force=False):
        """
        Train the recommendation model.
        
        Args:
            force (bool, optional): Force retraining even if model exists.
                Defaults to False.
                
        Returns:
            bool: True if training was successful, False otherwise
        """
        # Check if model already exists
        if not force and os.path.exists(self.model_path):
            try:
                self.model = load_model(self.model_path)
                logger.info("Loaded existing recommendation model")
                return True
            except Exception as e:
                logger.error(f"Failed to load existing model: {str(e)}")
        
        # Preprocess data
        inputs, targets = self.preprocess_data()
        
        if inputs is None:
            logger.warning("Not enough data to train model")
            return False
        
        project_ids, seller_ids = inputs
        n_projects = len(np.unique(project_ids)) + 1  # +1 for padding
        n_sellers = len(np.unique(seller_ids)) + 1    # +1 for padding
        
        # Build model
        self.model = self.build_model(n_projects, n_sellers)
        
        # Train model
        callbacks = [
            EarlyStopping(monitor='val_loss', patience=3),
            ModelCheckpoint(
                filepath=self.model_path,
                monitor='val_loss',
                save_best_only=True
            )
        ]
        
        try:
            self.model.fit(
                [project_ids, seller_ids],
                targets,
                epochs=self.config["epochs"],
                batch_size=self.config["batch_size"],
                validation_split=0.2,
                callbacks=callbacks
            )
            logger.info("Successfully trained recommendation model")
            return True
        except Exception as e:
            logger.error(f"Model training failed: {str(e)}")
            return False
    
    def get_project_recommendations_for_seller(self, seller_id, limit=5):
        """
        Get project recommendations for a specific seller.
        
        Args:
            seller_id (int): The seller's ID
            limit (int, optional): Maximum number of recommendations.
                Defaults to 5.
                
        Returns:
            list: List of recommended project IDs with scores
        """
        # Get all active projects
        projects_df = connector.get_projects_data()
        active_projects = projects_df[projects_df['status'] == 'open']
        
        if active_projects.empty:
            return []
        
        # Get seller's proposal history
        seller_proposals = connector.get_user_project_history(seller_id, 'seller')
        
        # For content-based filtering, use text similarity if there's history
        if not seller_proposals.empty:
            # Extract text features from projects that seller has bid on
            past_project_ids = seller_proposals['project_id'].unique()
            past_projects = projects_df[projects_df['id'].isin(past_project_ids)]
            
            if not past_projects.empty:
                # Prepare text features
                past_projects['text_features'] = past_projects['title'] + ' ' + past_projects['description']
                active_projects['text_features'] = active_projects['title'] + ' ' + active_projects['description']
                
                # Use TF-IDF vectorizer
                all_texts = pd.concat([
                    past_projects['text_features'],
                    active_projects['text_features']
                ]).to_list()
                
                vectorizer = TfidfVectorizer(stop_words='english')
                tfidf_matrix = vectorizer.fit_transform(all_texts)
                
                # Calculate similarities
                n_past = len(past_projects)
                past_vectors = tfidf_matrix[:n_past]
                active_vectors = tfidf_matrix[n_past:]
                
                # Average past project vectors to create a seller profile
                seller_profile = past_vectors.mean(axis=0)
                
                # Calculate similarity to active projects
                similarities = cosine_similarity(seller_profile, active_vectors).flatten()
                
                # Create recommendations
                active_projects_list = active_projects.to_dict('records')
                recommendations = []
                
                for i, score in enumerate(similarities):
                    if i < len(active_projects_list):
                        project = active_projects_list[i]
                        recommendations.append({
                            'project_id': project['id'],
                            'title': project['title'],
                            'score': float(score),
                            'budget': project['budget']
                        })
                
                # Sort by score
                recommendations.sort(key=lambda x: x['score'], reverse=True)
                return recommendations[:limit]
        
        # Fallback to simple recommendation based on recency
        return [
            {
                'project_id': project['id'],
                'title': project['title'],
                'score': 0.5,  # Default score
                'budget': project['budget']
            }
            for project in active_projects.sort_values('created_at', ascending=False).to_dict('records')[:limit]
        ]
    
    def get_seller_recommendations_for_project(self, project_id, limit=5):
        """
        Get seller recommendations for a specific project.
        
        Args:
            project_id (int): The project's ID
            limit (int, optional): Maximum number of recommendations.
                Defaults to 5.
                
        Returns:
            list: List of recommended seller IDs with scores
        """
        # Get project details
        projects_df = connector.get_projects_data()
        project = projects_df[projects_df['id'] == project_id]
        
        if project.empty:
            return []
        
        project = project.iloc[0]
        
        # Get all sellers
        users_df = connector.get_user_data()
        sellers = users_df[users_df['role'] == 'seller']
        
        if sellers.empty:
            return []
        
        # Get seller proposal history
        proposals_df = connector.get_proposals_data()
        
        # Use content-based recommendation
        sellers_with_proposals = proposals_df['seller_id'].unique()
        active_sellers = sellers[sellers['id'].isin(sellers_with_proposals)]
        
        if active_sellers.empty:
            # Return all sellers if no history
            return [
                {
                    'seller_id': seller['id'],
                    'name': seller['name'],
                    'score': 0.5  # Default score
                }
                for seller in sellers.to_dict('records')[:limit]
            ]
        
        # Group proposals by seller to get their history
        seller_histories = []
        for seller_id in active_sellers['id']:
            seller_props = proposals_df[proposals_df['seller_id'] == seller_id]
            seller_project_ids = seller_props['project_id'].tolist()
            
            # Get these projects
            seller_projects = projects_df[projects_df['id'].isin(seller_project_ids)]
            
            if not seller_projects.empty:
                # Create text representation
                seller_projects['text_features'] = seller_projects['title'] + ' ' + seller_projects['description']
                seller_text = ' '.join(seller_projects['text_features'].tolist())
                
                seller_histories.append({
                    'seller_id': seller_id,
                    'text': seller_text,
                    'name': sellers[sellers['id'] == seller_id].iloc[0]['name']
                })
        
        # Project text features
        project_text = project['title'] + ' ' + project['description']
        
        # Vectorize
        if seller_histories:
            vectorizer = TfidfVectorizer(stop_words='english')
            texts = [project_text] + [s['text'] for s in seller_histories]
            tfidf_matrix = vectorizer.fit_transform(texts)
            
            # Calculate similarities
            project_vector = tfidf_matrix[0:1]
            seller_vectors = tfidf_matrix[1:]
            
            similarities = cosine_similarity(project_vector, seller_vectors).flatten()
            
            # Create recommendations
            recommendations = []
            for i, score in enumerate(similarities):
                if i < len(seller_histories):
                    seller = seller_histories[i]
                    recommendations.append({
                        'seller_id': seller['seller_id'],
                        'name': seller['name'],
                        'score': float(score)
                    })
            
            # Sort by score
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            return recommendations[:limit]
        
        # Fallback
        return [
            {
                'seller_id': seller['id'],
                'name': seller['name'],
                'score': 0.5  # Default score
            }
            for seller in sellers.to_dict('records')[:limit]
        ]