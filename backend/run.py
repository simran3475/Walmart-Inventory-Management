#!/usr/bin/env python3
"""
Production-ready Flask application runner
"""
import os
import sys
from app import app

if __name__ == '__main__':
    # Set environment variables
    os.environ.setdefault('FLASK_ENV', 'development')
    
    # Get port from environment or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run the application
    print(f"🚀 Starting AI Inventory Backend on port {port}")
    print(f"📊 Database: SQLite (inventory.db)")
    print(f"🤖 AI Features: Demand Forecasting & Markdown Optimization")
    print(f"🌐 CORS enabled for: http://localhost:3000, http://localhost:5173")
    print(f"📡 Health check: http://localhost:{port}/health")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.environ.get('FLASK_ENV') == 'development',
        threaded=True
    )