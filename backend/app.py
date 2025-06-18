from flask import Flask, jsonify, request
from flask_cors import CORS
from data_loader import DataLoader
from forecast import DemandForecaster
from markdown_optimizer import MarkdownOptimizer
import logging
import os
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])

# Initialize components
data_loader = DataLoader()
forecaster = DemandForecaster()
markdown_optimizer = MarkdownOptimizer()

# Initialize database and seed sample data
data_loader.seed_sample_data()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/inventory', methods=['GET'])
def get_inventory():
    """Get inventory data with optional filters"""
    try:
        # Get query parameters
        category = request.args.get('category')
        expiry_days = request.args.get('expiry_days', type=int)
        
        # Get inventory data
        inventory_data = data_loader.get_inventory(category=category, expiry_days=expiry_days)
        
        # Format response
        formatted_data = []
        for item in inventory_data:
            formatted_data.append({
                'productId': item['product_id'],
                'productName': item['product_name'],
                'category': item['category'],
                'stock': item['stock'],
                'expiryDate': item['expiry_date'],
                'currentPrice': item['current_price'],
                'status': item['status'],
                'daysUntilExpiry': item['days_until_expiry']
            })
        
        return jsonify({
            'success': True,
            'data': formatted_data,
            'count': len(formatted_data),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error fetching inventory: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/forecast/<product_id>', methods=['GET'])
def get_forecast(product_id):
    """Get demand forecast for a specific product"""
    try:
        # Get query parameters
        days = request.args.get('days', default=7, type=int)
        
        # Get sales history
        sales_df = data_loader.get_sales_history(product_id, days=90)
        
        if sales_df.empty:
            return jsonify({
                'success': False,
                'error': f'No sales history found for product {product_id}',
                'timestamp': datetime.now().isoformat()
            }), 404
        
        # Generate forecast
        forecast_data = forecaster.forecast(product_id, sales_df, days=days)
        
        # Get accuracy metrics if available
        accuracy_metrics = forecaster.get_forecast_accuracy(product_id, sales_df)
        
        # Format historical data for chart
        historical_data = []
        for _, row in sales_df.tail(14).iterrows():  # Last 14 days
            historical_data.append({
                'date': row['date'],
                'actual': row['units_sold'],
                'predicted': None  # Historical data doesn't have predictions
            })
        
        # Combine historical and forecast data
        chart_data = historical_data + [
            {
                'date': f['date'],
                'actual': None,
                'predicted': f['predicted'],
                'confidence_lower': f['confidence_lower'],
                'confidence_upper': f['confidence_upper']
            }
            for f in forecast_data
        ]
        
        return jsonify({
            'success': True,
            'data': {
                'product_id': product_id,
                'forecast': forecast_data,
                'chart_data': chart_data,
                'accuracy_metrics': accuracy_metrics,
                'forecast_horizon_days': days
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error generating forecast for product {product_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/markdown/<product_id>', methods=['GET', 'POST'])
def get_markdown_suggestion(product_id):
    """Get or update markdown suggestion for a product"""
    try:
        # Get product data
        inventory_data = data_loader.get_inventory()
        product_data = next((item for item in inventory_data if item['product_id'] == product_id), None)
        
        if not product_data:
            return jsonify({
                'success': False,
                'error': f'Product {product_id} not found',
                'timestamp': datetime.now().isoformat()
            }), 404
        
        # Get forecast data
        sales_df = data_loader.get_sales_history(product_id, days=90)
        forecast_data = []
        
        if not sales_df.empty:
            forecast_data = forecaster.forecast(product_id, sales_df, days=7)
        
        # Generate markdown optimization
        markdown_result = markdown_optimizer.optimize_markdown(product_data, forecast_data)
        
        # If POST request, save the suggestion
        if request.method == 'POST':
            # In a real implementation, you would save this to the database
            logger.info(f"Markdown suggestion saved for product {product_id}")
        
        return jsonify({
            'success': True,
            'data': markdown_result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error generating markdown for product {product_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/markdown/batch', methods=['POST'])
def get_batch_markdown():
    """Get markdown suggestions for multiple products"""
    try:
        # Get request data
        data = request.get_json()
        product_ids = data.get('product_ids', [])
        
        if not product_ids:
            # Get all products that need markdown (expiring soon)
            inventory_data = data_loader.get_inventory(expiry_days=3)
            product_ids = [item['product_id'] for item in inventory_data]
        
        # Get product data
        inventory_data = data_loader.get_inventory()
        products_data = [item for item in inventory_data if item['product_id'] in product_ids]
        
        # Get forecasts for all products
        forecasts_data = {}
        for product_id in product_ids:
            sales_df = data_loader.get_sales_history(product_id, days=90)
            if not sales_df.empty:
                forecasts_data[product_id] = forecaster.forecast(product_id, sales_df, days=7)
        
        # Generate batch markdown optimization
        results = markdown_optimizer.batch_optimize(products_data, forecasts_data)
        
        return jsonify({
            'success': True,
            'data': results,
            'count': len(results),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error generating batch markdown: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """Get analytics summary data"""
    try:
        # Get inventory data
        inventory_data = data_loader.get_inventory()
        
        # Calculate summary statistics
        total_items = len(inventory_data)
        expiring_items = len([item for item in inventory_data if item['days_until_expiry'] <= 3])
        overstock_items = len([item for item in inventory_data if item['status'] == 'overstock'])
        safe_items = len([item for item in inventory_data if item['status'] == 'safe'])
        
        # Calculate total inventory value
        total_value = sum(item['stock'] * item['current_price'] for item in inventory_data)
        
        # Get markdown opportunities
        markdown_candidates = [item for item in inventory_data if item['days_until_expiry'] <= 5]
        potential_waste_value = sum(
            item['stock'] * item['current_price'] * 0.3  # Assume 30% waste without action
            for item in markdown_candidates
        )
        
        summary = {
            'inventory_overview': {
                'total_items': total_items,
                'total_value': round(total_value, 2),
                'expiring_items': expiring_items,
                'overstock_items': overstock_items,
                'safe_items': safe_items
            },
            'waste_prevention': {
                'potential_waste_value': round(potential_waste_value, 2),
                'markdown_candidates': len(markdown_candidates),
                'estimated_savings_opportunity': round(potential_waste_value * 0.7, 2)
            },
            'categories': {}
        }
        
        # Category breakdown
        categories = {}
        for item in inventory_data:
            cat = item['category']
            if cat not in categories:
                categories[cat] = {'count': 0, 'value': 0, 'expiring': 0}
            categories[cat]['count'] += 1
            categories[cat]['value'] += item['stock'] * item['current_price']
            if item['days_until_expiry'] <= 3:
                categories[cat]['expiring'] += 1
        
        summary['categories'] = categories
        
        return jsonify({
            'success': True,
            'data': summary,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error generating analytics summary: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/products/<product_id>/sales-history', methods=['GET'])
def get_product_sales_history(product_id):
    """Get sales history for a specific product"""
    try:
        days = request.args.get('days', default=30, type=int)
        sales_df = data_loader.get_sales_history(product_id, days=days)
        
        if sales_df.empty:
            return jsonify({
                'success': False,
                'error': f'No sales history found for product {product_id}',
                'timestamp': datetime.now().isoformat()
            }), 404
        
        # Format data for response
        sales_data = []
        for _, row in sales_df.iterrows():
            sales_data.append({
                'date': row['date'],
                'units_sold': row['units_sold'],
                'price': row['price']
            })
        
        return jsonify({
            'success': True,
            'data': {
                'product_id': product_id,
                'sales_history': sales_data,
                'total_units': sales_df['units_sold'].sum(),
                'average_daily_sales': round(sales_df['units_sold'].mean(), 2),
                'days_covered': len(sales_data)
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error fetching sales history for product {product_id}: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'timestamp': datetime.now().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'timestamp': datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Run the application
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Flask server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)