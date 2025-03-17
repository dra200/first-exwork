"""
Database connector for the exWork.eu machine learning services.
This module provides utilities to connect to the PostgreSQL database
and extract data for training and inference.
"""
import logging
import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
from ..config import DB_CONFIG

logger = logging.getLogger(__name__)

class DatabaseConnector:
    """
    Connector class for the exWork.eu PostgreSQL database.
    Provides methods to fetch and transform data for ML models.
    """
    
    def __init__(self, config=None):
        """
        Initialize the database connector with optional custom configuration.
        
        Args:
            config (dict, optional): Custom database configuration.
                Defaults to the configuration in config.py.
        """
        self.config = config or DB_CONFIG
        self.conn = None
        
    def connect(self):
        """
        Establish a connection to the PostgreSQL database.
        
        Returns:
            bool: True if connection was successful, False otherwise.
        """
        try:
            self.conn = psycopg2.connect(
                host=self.config["host"],
                port=self.config["port"],
                database=self.config["database"],
                user=self.config["user"],
                password=self.config["password"]
            )
            logger.info("Successfully connected to the database")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to database: {str(e)}")
            return False
    
    def disconnect(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()
            self.conn = None
            logger.info("Database connection closed")
    
    def execute_query(self, query, params=None):
        """
        Execute a SQL query and return the results.
        
        Args:
            query (str): The SQL query to execute
            params (tuple, optional): Parameters for the query. Defaults to None.
            
        Returns:
            list: Query results as a list of dictionaries
        """
        if not self.conn:
            self.connect()
            
        results = []
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params or ())
                results = cursor.fetchall()
            return [dict(row) for row in results]
        except Exception as e:
            logger.error(f"Query execution failed: {str(e)}")
            logger.error(f"Query: {query}")
            return []
    
    def get_projects_data(self):
        """
        Fetch all projects data for analysis and training.
        
        Returns:
            pandas.DataFrame: DataFrame containing project data
        """
        query = """
        SELECT 
            p.id, p.title, p.description, p.budget, p.status, 
            p.buyer_id, p.created_at, 
            u.name as buyer_name, u.email as buyer_email
        FROM projects p
        JOIN users u ON p.buyer_id = u.id
        """
        results = self.execute_query(query)
        return pd.DataFrame(results)
    
    def get_proposals_data(self):
        """
        Fetch all proposals data for analysis and training.
        
        Returns:
            pandas.DataFrame: DataFrame containing proposal data
        """
        query = """
        SELECT 
            p.id, p.service_details, p.price, p.delivery_time, 
            p.status, p.project_id, p.seller_id, p.created_at,
            u.name as seller_name, u.email as seller_email
        FROM proposals p
        JOIN users u ON p.seller_id = u.id
        """
        results = self.execute_query(query)
        return pd.DataFrame(results)
    
    def get_user_data(self, user_id=None):
        """
        Fetch user data, optionally filtered by user ID.
        
        Args:
            user_id (int, optional): User ID to filter by. Defaults to None.
            
        Returns:
            pandas.DataFrame: DataFrame containing user data
        """
        query = """
        SELECT id, name, email, role, created_at
        FROM users
        """
        params = None
        
        if user_id is not None:
            query += " WHERE id = %s"
            params = (user_id,)
            
        results = self.execute_query(query, params)
        return pd.DataFrame(results)
    
    def get_completed_projects(self):
        """
        Fetch all completed projects with their proposals and payments.
        
        Returns:
            pandas.DataFrame: DataFrame with completed project data
        """
        query = """
        SELECT 
            p.id as project_id, p.title, p.description, p.budget,
            p.buyer_id, p.created_at as project_created_at,
            pr.id as proposal_id, pr.price as proposal_price, 
            pr.delivery_time, pr.seller_id,
            pay.id as payment_id, pay.amount as payment_amount,
            pay.status as payment_status, pay.created_at as payment_date
        FROM projects p
        JOIN proposals pr ON p.id = pr.project_id
        JOIN payments pay ON pr.id = pay.proposal_id
        WHERE p.status = 'completed' AND pay.status = 'completed'
        """
        results = self.execute_query(query)
        return pd.DataFrame(results)
    
    def get_user_project_history(self, user_id, role='buyer'):
        """
        Get a user's project history based on their role.
        
        Args:
            user_id (int): The user ID
            role (str, optional): The user's role ('buyer' or 'seller'). 
                                  Defaults to 'buyer'.
                                  
        Returns:
            pandas.DataFrame: DataFrame with the user's project history
        """
        if role == 'buyer':
            query = """
            SELECT 
                p.id, p.title, p.description, p.budget, 
                p.status, p.created_at,
                count(pr.id) as proposal_count
            FROM projects p
            LEFT JOIN proposals pr ON p.id = pr.project_id
            WHERE p.buyer_id = %s
            GROUP BY p.id
            ORDER BY p.created_at DESC
            """
        else:  # seller
            query = """
            SELECT 
                p.id as project_id, p.title, p.description, 
                p.budget as project_budget, p.status as project_status,
                pr.id as proposal_id, pr.price as proposal_price, 
                pr.status as proposal_status, pr.created_at
            FROM proposals pr
            JOIN projects p ON pr.project_id = p.id
            WHERE pr.seller_id = %s
            ORDER BY pr.created_at DESC
            """
            
        results = self.execute_query(query, (user_id,))
        return pd.DataFrame(results)


# Singleton instance
connector = DatabaseConnector()