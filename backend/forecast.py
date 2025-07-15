import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import logging
import joblib
import os

logger = logging.getLogger(__name__)

class DemandForecaster:
    def __init__(self, cache_dir='models'):
        self.cache_dir = cache_dir
        self.models = {}
        self.scalers = {}
        os.makedirs(cache_dir, exist_ok=True)
        
    def prepare_features(self, sales_df):
        """Prepare features for forecasting model"""
        if sales_df.empty:
            return pd.DataFrame()
            
        # Convert date to datetime
        sales_df['date'] = pd.to_datetime(sales_df['date'])
        sales_df = sales_df.sort_values('date')
        
        # Create time-based features
        sales_df['day_of_week'] = sales_df['date'].dt.dayofweek
        sales_df['day_of_month'] = sales_df['date'].dt.day
        sales_df['month'] = sales_df['date'].dt.month
        sales_df['days_since_start'] = (sales_df['date'] - sales_df['date'].min()).dt.days
        
        # Create lag features
        sales_df['units_sold_lag1'] = sales_df['units_sold'].shift(1)
        sales_df['units_sold_lag7'] = sales_df['units_sold'].shift(7)
        sales_df['units_sold_ma7'] = sales_df['units_sold'].rolling(window=7, min_periods=1).mean()
        sales_df['units_sold_ma14'] = sales_df['units_sold'].rolling(window=14, min_periods=1).mean()
        
        # Fill NaN values
        sales_df = sales_df.fillna(method='bfill').fillna(0)
        
        return sales_df
        
    def train_model(self, product_id, sales_df):
        """Train forecasting model for a specific product"""
        try:
            if len(sales_df) < 14:  # Need minimum data points
                logger.warning(f"Insufficient data for product {product_id}")
                return None
                
            # Prepare features
            df = self.prepare_features(sales_df.copy())
            
            if df.empty:
                return None
                
            # Select features for training
            feature_cols = ['day_of_week', 'day_of_month', 'month', 'days_since_start',
                          'units_sold_lag1', 'units_sold_lag7', 'units_sold_ma7', 'units_sold_ma14']
            
            X = df[feature_cols].values
            y = df['units_sold'].values
            
            # Scale features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Train model
            model = LinearRegression()
            model.fit(X_scaled, y)
            
            # Cache model and scaler
            self.models[product_id] = model
            self.scalers[product_id] = scaler
            
            # Save to disk
            model_path = os.path.join(self.cache_dir, f'model_{product_id}.joblib')
            scaler_path = os.path.join(self.cache_dir, f'scaler_{product_id}.joblib')
            
            joblib.dump(model, model_path)
            joblib.dump(scaler, scaler_path)
            
            logger.info(f"Model trained and cached for product {product_id}")
            return model
            
        except Exception as e:
            logger.error(f"Error training model for product {product_id}: {e}")
            return None
            
    def load_model(self, product_id):
        """Load cached model for a product"""
        try:
            if product_id in self.models:
                return self.models[product_id], self.scalers[product_id]
                
            model_path = os.path.join(self.cache_dir, f'model_{product_id}.joblib')
            scaler_path = os.path.join(self.cache_dir, f'scaler_{product_id}.joblib')
            
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                model = joblib.load(model_path)
                scaler = joblib.load(scaler_path)
                
                self.models[product_id] = model
                self.scalers[product_id] = scaler
                
                return model, scaler
                
        except Exception as e:
            logger.error(f"Error loading model for product {product_id}: {e}")
            
        return None, None
        
    def forecast(self, product_id, sales_df, days=7):
        """Generate forecast for a product"""
        try:
            # Try to load existing model
            model, scaler = self.load_model(product_id)
            
            # If no model exists, train one
            if model is None:
                model = self.train_model(product_id, sales_df)
                if model is None:
                    return self._fallback_forecast(sales_df, days)
                scaler = self.scalers[product_id]
            
            # Prepare recent data for forecasting
            df = self.prepare_features(sales_df.copy())
            
            if df.empty:
                return self._fallback_forecast(sales_df, days)
            
            # Generate forecasts
            forecasts = []
            last_date = pd.to_datetime(df['date'].max())
            
            # Use last known values for lag features
            last_row = df.iloc[-1].copy()
            
            for i in range(days):
                forecast_date = last_date + timedelta(days=i+1)
                
                # Create features for forecast date
                features = {
                    'day_of_week': forecast_date.dayofweek,
                    'day_of_month': forecast_date.day,
                    'month': forecast_date.month,
                    'days_since_start': last_row['days_since_start'] + i + 1,
                    'units_sold_lag1': last_row['units_sold'] if i == 0 else forecasts[-1]['predicted'],
                    'units_sold_lag7': df.iloc[-(7-i)]['units_sold'] if i < 7 else forecasts[i-7]['predicted'],
                    'units_sold_ma7': last_row['units_sold_ma7'],
                    'units_sold_ma14': last_row['units_sold_ma14']
                }
                
                # Create feature vector
                feature_cols = ['day_of_week', 'day_of_month', 'month', 'days_since_start',
                              'units_sold_lag1', 'units_sold_lag7', 'units_sold_ma7', 'units_sold_ma14']
                
                X = np.array([[features[col] for col in feature_cols]])
                X_scaled = scaler.transform(X)
                
                # Make prediction
                prediction = model.predict(X_scaled)[0]
                prediction = max(0, prediction)  # Ensure non-negative
                
                # Calculate confidence interval (simple approach)
                recent_std = df['units_sold'].tail(14).std()
                confidence_lower = max(0, prediction - 1.96 * recent_std)
                confidence_upper = prediction + 1.96 * recent_std
                
                forecasts.append({
                    'date': forecast_date.strftime('%Y-%m-%d'),
                    'predicted': round(prediction, 1),
                    'confidence_lower': round(confidence_lower, 1),
                    'confidence_upper': round(confidence_upper, 1)
                })
            
            return forecasts
            
        except Exception as e:
            logger.error(f"Error generating forecast for product {product_id}: {e}")
            return self._fallback_forecast(sales_df, days)
            
    def _fallback_forecast(self, sales_df, days=7):
        """Simple fallback forecast using moving average"""
        if sales_df.empty:
            # Return zero forecast if no data
            forecasts = []
            base_date = datetime.now()
            for i in range(days):
                forecast_date = base_date + timedelta(days=i+1)
                forecasts.append({
                    'date': forecast_date.strftime('%Y-%m-%d'),
                    'predicted': 0,
                    'confidence_lower': 0,
                    'confidence_upper': 0
                })
            return forecasts
        
        # Use recent average
        recent_avg = sales_df['units_sold'].tail(14).mean()
        recent_std = sales_df['units_sold'].tail(14).std()
        
        forecasts = []
        base_date = datetime.now()
        
        for i in range(days):
            forecast_date = base_date + timedelta(days=i+1)
            
            # Add some weekly seasonality
            day_of_week = forecast_date.weekday()
            seasonal_factor = 1.2 if day_of_week in [4, 5, 6] else 0.9  # Higher on weekends
            
            prediction = recent_avg * seasonal_factor
            confidence_lower = max(0, prediction - 1.96 * recent_std)
            confidence_upper = prediction + 1.96 * recent_std
            
            forecasts.append({
                'date': forecast_date.strftime('%Y-%m-%d'),
                'predicted': round(prediction, 1),
                'confidence_lower': round(confidence_lower, 1),
                'confidence_upper': round(confidence_upper, 1)
            })
        
        return forecasts
        
    def get_forecast_accuracy(self, product_id, sales_df, test_days=7):
        """Calculate forecast accuracy for a product"""
        try:
            if len(sales_df) < test_days + 14:
                return None
                
            # Split data for testing
            train_df = sales_df.iloc[:-test_days]
            test_df = sales_df.iloc[-test_days:]
            
            # Generate forecast on training data
            forecasts = self.forecast(product_id, train_df, test_days)
            
            if not forecasts:
                return None
                
            # Calculate accuracy metrics
            actual_values = test_df['units_sold'].values
            predicted_values = [f['predicted'] for f in forecasts]
            
            mae = np.mean(np.abs(np.array(actual_values) - np.array(predicted_values)))
            mape = np.mean(np.abs((np.array(actual_values) - np.array(predicted_values)) / np.array(actual_values))) * 100
            
            return {
                'mae': round(mae, 2),
                'mape': round(mape, 2),
                'accuracy': round(max(0, 100 - mape), 1)
            }
            
        except Exception as e:
            logger.error(f"Error calculating accuracy for product {product_id}: {e}")
            return None