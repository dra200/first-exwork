"""
API server for exWork.eu machine learning services.

Provides RESTful endpoints to access ML model predictions and recommendations
for project recommendations, price predictions, and business analytics.
"""
import os
import json
import logging
from flask import Flask, request, jsonify

from ..config import API_HOST, API_PORT
from ..models.recommendation import ProjectRecommendationModel
from ..models.price_prediction import PricePredictionModel
from ..services.analytics import BusinessAnalytics

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Initialize models
recommendation_model = ProjectRecommendationModel()
price_model = PricePredictionModel()
analytics = BusinessAnalytics()

# Load models if they exist or train them with available data
@app.before_first_request
def load_or_train_models():
    logger.info("Loading or training ML models...")
    recommendation_model.train()
    price_model.train()


# API endpoints
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'service': 'exWork.eu ML API',
        'models': {
            'recommendation': os.path.exists(recommendation_model.model_path),
            'price_prediction': os.path.exists(price_model.model_path)
        }
    })

@app.route('/api/recommend/projects/<int:seller_id>', methods=['GET'])
def recommend_projects(seller_id):
    """
    Get project recommendations for a seller.
    
    Args:
        seller_id (int): The seller's ID
        
    Returns:
        JSON response with recommended projects
    """
    try:
        limit = request.args.get('limit', default=5, type=int)
        recommendations = recommendation_model.get_project_recommendations_for_seller(
            seller_id, limit=limit
        )
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
    
    except Exception as e:
        logger.error(f"Error in project recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/recommend/sellers/<int:project_id>', methods=['GET'])
def recommend_sellers(project_id):
    """
    Get seller recommendations for a project.
    
    Args:
        project_id (int): The project's ID
        
    Returns:
        JSON response with recommended sellers
    """
    try:
        limit = request.args.get('limit', default=5, type=int)
        recommendations = recommendation_model.get_seller_recommendations_for_project(
            project_id, limit=limit
        )
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
    
    except Exception as e:
        logger.error(f"Error in seller recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predict/price', methods=['POST'])
def predict_price():
    """
    Predict the appropriate price for a project.
    
    Request body:
        JSON with project details
        
    Returns:
        JSON response with price prediction
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        prediction = price_model.predict_price(data)
        return jsonify(prediction)
    
    except Exception as e:
        logger.error(f"Error in price prediction: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/evaluate/proposal', methods=['POST'])
def evaluate_proposal():
    """
    Evaluate if a proposal price is fair for a project.
    
    Request body:
        JSON with project ID and proposal price
        
    Returns:
        JSON response with proposal evaluation
    """
    try:
        data = request.json
        
        if not data or 'project_id' not in data or 'price' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: project_id, price'
            }), 400
        
        project_id = data['project_id']
        price = float(data['price'])
        
        evaluation = price_model.evaluate_proposal_price(project_id, price)
        return jsonify(evaluation)
    
    except Exception as e:
        logger.error(f"Error in proposal evaluation: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analytics/market', methods=['GET'])
def market_analytics():
    """
    Get market analytics and trends.
    
    Returns:
        JSON response with market analytics
    """
    try:
        time_period = request.args.get('period', default='month', type=str)
        category = request.args.get('category', default=None, type=str)
        
        result = analytics.get_market_trends(time_period, category)
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in market analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analytics/buyer/<int:buyer_id>', methods=['GET'])
def buyer_analytics(buyer_id):
    """
    Get business analytics for a buyer.
    
    Args:
        buyer_id (int): The buyer's ID
        
    Returns:
        JSON response with buyer analytics
    """
    try:
        result = analytics.get_buyer_analytics(buyer_id)
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in buyer analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analytics/seller/<int:seller_id>', methods=['GET'])
def seller_analytics(seller_id):
    """
    Get business analytics for a seller.
    
    Args:
        seller_id (int): The seller's ID
        
    Returns:
        JSON response with seller analytics
    """
    try:
        result = analytics.get_seller_analytics(seller_id)
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error in seller analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def run_server():
    """Run the Flask API server."""
    logger.info(f"Starting ML API server on {API_HOST}:{API_PORT}")
    app.run(host=API_HOST, port=API_PORT, debug=False)


if __name__ == '__main__':
    run_server()