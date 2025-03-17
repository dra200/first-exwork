"""
Business analytics service for exWork.eu.

Provides data analysis and insights for:
1. Market trends and project categories
2. Buyer spending patterns and project success rates
3. Seller performance metrics and earnings analysis
"""
import logging
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from ..data.db_connector import connector

logger = logging.getLogger(__name__)

class BusinessAnalytics:
    """
    Business analytics service for exWork.eu platform.
    Analyzes transaction data to provide business insights.
    """
    
    def __init__(self):
        """Initialize the business analytics service."""
        pass
    
    def get_market_trends(self, time_period='month', category=None):
        """
        Get market trends and analytics.
        
        Args:
            time_period (str, optional): Time period for analysis ('week', 'month', 'year').
                Defaults to 'month'.
            category (str, optional): Filter by project category. Defaults to None.
            
        Returns:
            dict: Market trend analysis
        """
        try:
            # Get projects data
            projects_df = connector.get_projects_data()
            
            if projects_df.empty:
                return {
                    'success': False,
                    'error': 'No project data available'
                }
            
            # Filter by time period
            now = datetime.now()
            if time_period == 'week':
                start_date = now - timedelta(days=7)
            elif time_period == 'month':
                start_date = now - timedelta(days=30)
            elif time_period == 'year':
                start_date = now - timedelta(days=365)
            else:  # Default to month
                start_date = now - timedelta(days=30)
            
            # Convert created_at to datetime if it's not already
            if 'created_at' in projects_df.columns:
                projects_df['created_at'] = pd.to_datetime(projects_df['created_at'])
                
                # Filter by date
                recent_projects = projects_df[projects_df['created_at'] >= start_date]
            else:
                recent_projects = projects_df  # Use all data if dates not available
            
            # Filter by category if provided
            if category and 'category' in recent_projects.columns:
                recent_projects = recent_projects[recent_projects['category'] == category]
            
            # Get proposals data for the same period
            proposals_df = connector.get_proposals_data()
            
            if not proposals_df.empty and 'created_at' in proposals_df.columns:
                proposals_df['created_at'] = pd.to_datetime(proposals_df['created_at'])
                recent_proposals = proposals_df[proposals_df['created_at'] >= start_date]
            else:
                recent_proposals = proposals_df
            
            # Calculate metrics
            total_projects = len(recent_projects)
            
            # Project status distribution
            status_counts = {}
            if 'status' in recent_projects.columns:
                status_counts = recent_projects['status'].value_counts().to_dict()
            
            # Average budget
            avg_budget = 0
            if 'budget' in recent_projects.columns:
                avg_budget = recent_projects['budget'].mean()
            
            # Proposals per project
            proposals_per_project = 0
            if not recent_proposals.empty and 'project_id' in recent_proposals.columns:
                proposals_per_project = recent_proposals.groupby('project_id').size().mean()
            
            # Average price of proposals
            avg_proposal_price = 0
            if 'price' in recent_proposals.columns:
                avg_proposal_price = recent_proposals['price'].mean()
            
            # Time series data for projects by day/week
            time_series = []
            if 'created_at' in recent_projects.columns:
                if time_period == 'week':
                    # Group by day
                    grouped = recent_projects.groupby(
                        recent_projects['created_at'].dt.date
                    ).size()
                elif time_period == 'year':
                    # Group by month
                    grouped = recent_projects.groupby([
                        recent_projects['created_at'].dt.year,
                        recent_projects['created_at'].dt.month
                    ]).size()
                    # Convert to more readable format
                    time_series = [
                        {
                            'period': f"{year}-{month:02d}",
                            'count': count
                        }
                        for (year, month), count in grouped.items()
                    ]
                else:  # month - group by day
                    grouped = recent_projects.groupby(
                        recent_projects['created_at'].dt.date
                    ).size()
                
                # Format time series data (except for year which is handled above)
                if time_period != 'year':
                    time_series = [
                        {
                            'period': str(date),
                            'count': count
                        }
                        for date, count in grouped.items()
                    ]
            
            # Category distribution
            category_distribution = []
            if 'category' in recent_projects.columns:
                cats = recent_projects['category'].value_counts().to_dict()
                category_distribution = [
                    {'category': cat, 'count': count}
                    for cat, count in cats.items()
                ]
            
            # Return analysis
            return {
                'success': True,
                'time_period': time_period,
                'category_filter': category,
                'metrics': {
                    'total_projects': total_projects,
                    'status_distribution': status_counts,
                    'avg_budget': float(avg_budget),
                    'avg_proposals_per_project': float(proposals_per_project),
                    'avg_proposal_price': float(avg_proposal_price)
                },
                'time_series': time_series,
                'category_distribution': category_distribution
            }
        
        except Exception as e:
            logger.error(f"Error in market trends analysis: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_buyer_analytics(self, buyer_id):
        """
        Get business analytics for a buyer.
        
        Args:
            buyer_id (int): The buyer's ID
            
        Returns:
            dict: Buyer analytics data
        """
        try:
            # Get buyer's projects
            buyer_projects = connector.get_user_project_history(buyer_id, 'buyer')
            
            if buyer_projects.empty:
                return {
                    'success': False,
                    'error': 'No project data available for this buyer'
                }
            
            # Get payments made by the buyer
            payments_df = connector.get_payments_by_buyer(buyer_id)
            
            # Calculate metrics
            total_projects = len(buyer_projects)
            
            # Project status distribution
            status_counts = {}
            if 'status' in buyer_projects.columns:
                status_counts = buyer_projects['status'].value_counts().to_dict()
            
            # Calculate completion rate
            completion_rate = 0
            if 'status' in buyer_projects.columns:
                completed = buyer_projects[buyer_projects['status'] == 'completed']
                completion_rate = len(completed) / total_projects if total_projects > 0 else 0
            
            # Total spending
            total_spent = 0
            if not payments_df.empty and 'amount' in payments_df.columns:
                total_spent = payments_df['amount'].sum()
            
            # Average project cost
            avg_cost = 0
            if total_projects > 0 and total_spent > 0:
                avg_cost = total_spent / total_projects
            
            # Average time to completion
            avg_completion_time = 0
            if 'created_at' in buyer_projects.columns and 'status' in buyer_projects.columns:
                completed = buyer_projects[buyer_projects['status'] == 'completed']
                if not completed.empty:
                    # This is an approximation since we don't have completion dates
                    # In reality, you'd use the actual completion date
                    avg_completion_time = 30  # Placeholder: 30 days
            
            # Project timeline
            timeline = []
            if 'created_at' in buyer_projects.columns:
                buyer_projects['created_at'] = pd.to_datetime(buyer_projects['created_at'])
                monthly_projects = buyer_projects.groupby(
                    buyer_projects['created_at'].dt.strftime('%Y-%m')
                ).size()
                
                timeline = [
                    {
                        'month': month,
                        'count': count
                    }
                    for month, count in monthly_projects.items()
                ]
            
            # Return analysis
            return {
                'success': True,
                'buyer_id': buyer_id,
                'metrics': {
                    'total_projects': total_projects,
                    'status_distribution': status_counts,
                    'completion_rate': float(completion_rate),
                    'total_spent': float(total_spent),
                    'avg_project_cost': float(avg_cost),
                    'avg_completion_time_days': float(avg_completion_time)
                },
                'timeline': timeline
            }
        
        except Exception as e:
            logger.error(f"Error in buyer analytics: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_seller_analytics(self, seller_id):
        """
        Get business analytics for a seller.
        
        Args:
            seller_id (int): The seller's ID
            
        Returns:
            dict: Seller analytics data
        """
        try:
            # Get seller's proposals and projects
            seller_history = connector.get_user_project_history(seller_id, 'seller')
            
            if seller_history.empty:
                return {
                    'success': False,
                    'error': 'No proposal data available for this seller'
                }
            
            # Get earnings data
            earnings_df = connector.get_payments_by_seller(seller_id)
            
            # Calculate metrics
            total_proposals = len(seller_history)
            
            # Proposal status distribution
            proposal_status = {}
            if 'proposal_status' in seller_history.columns:
                proposal_status = seller_history['proposal_status'].value_counts().to_dict()
            
            # Calculate win rate (accepted proposals)
            win_rate = 0
            if 'proposal_status' in seller_history.columns:
                accepted = seller_history[seller_history['proposal_status'] == 'accepted']
                win_rate = len(accepted) / total_proposals if total_proposals > 0 else 0
            
            # Total earnings
            total_earnings = 0
            if not earnings_df.empty and 'amount' in earnings_df.columns:
                total_earnings = earnings_df['amount'].sum()
            
            # Average earnings per project
            avg_earnings = 0
            completed_projects = 0
            if 'project_status' in seller_history.columns:
                completed = seller_history[seller_history['project_status'] == 'completed']
                completed_projects = len(completed)
                
                if completed_projects > 0 and total_earnings > 0:
                    avg_earnings = total_earnings / completed_projects
            
            # Earnings timeline
            earnings_timeline = []
            if not earnings_df.empty and 'created_at' in earnings_df.columns:
                earnings_df['created_at'] = pd.to_datetime(earnings_df['created_at'])
                monthly_earnings = earnings_df.groupby(
                    earnings_df['created_at'].dt.strftime('%Y-%m')
                )['amount'].sum()
                
                earnings_timeline = [
                    {
                        'month': month,
                        'amount': float(amount)
                    }
                    for month, amount in monthly_earnings.items()
                ]
            
            # Return analysis
            return {
                'success': True,
                'seller_id': seller_id,
                'metrics': {
                    'total_proposals': total_proposals,
                    'proposal_status_distribution': proposal_status,
                    'win_rate': float(win_rate),
                    'total_earnings': float(total_earnings),
                    'completed_projects': completed_projects,
                    'avg_earnings_per_project': float(avg_earnings)
                },
                'earnings_timeline': earnings_timeline
            }
        
        except Exception as e:
            logger.error(f"Error in seller analytics: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_project_completion_prediction(self, project_id):
        """
        Predict project completion time and success probability.
        
        Args:
            project_id (int): The project ID
            
        Returns:
            dict: Project completion prediction
        """
        try:
            # Get project data
            projects_df = connector.get_projects_data()
            project = projects_df[projects_df['id'] == project_id]
            
            if project.empty:
                return {
                    'success': False,
                    'error': 'Project not found'
                }
            
            # Get proposals for this project
            proposals_df = connector.get_proposals_by_project(project_id)
            
            # Simple prediction logic based on available data
            # This could be enhanced with an actual ML model
            
            # Default predictions
            predicted_days = 30  # Default prediction
            success_probability = 0.7  # Default probability
            
            # If we have proposals, adjust based on their delivery times
            if not proposals_df.empty and 'delivery_time' in proposals_df.columns:
                avg_delivery = proposals_df['delivery_time'].mean()
                predicted_days = avg_delivery
            
            # Adjust success probability based on:
            # 1. Number of proposals (more proposals = higher chance of success)
            # 2. Budget (higher budget = higher chance of success, up to a point)
            
            if not proposals_df.empty:
                proposal_count = len(proposals_df)
                
                # More proposals generally means higher success chance
                if proposal_count > 5:
                    success_probability += 0.1
                elif proposal_count > 2:
                    success_probability += 0.05
                else:
                    success_probability -= 0.1
            
            # Budget factor
            if 'budget' in project.columns:
                budget = project.iloc[0]['budget']
                
                # Higher budget generally means higher success chance
                if budget > 5000:
                    success_probability += 0.1
                elif budget > 1000:
                    success_probability += 0.05
                else:
                    success_probability -= 0.05
            
            # Cap probability between 0.1 and 0.95
            success_probability = max(0.1, min(0.95, success_probability))
            
            return {
                'success': True,
                'project_id': project_id,
                'predicted_completion_days': float(predicted_days),
                'success_probability': float(success_probability),
                'confidence': 0.7  # Confidence in this prediction
            }
        
        except Exception as e:
            logger.error(f"Error in project completion prediction: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }