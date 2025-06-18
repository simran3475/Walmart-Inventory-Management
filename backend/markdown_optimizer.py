import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class MarkdownOptimizer:
    def __init__(self):
        self.price_elasticity_estimates = {
            'Produce': -1.5,  # More elastic
            'Dairy': -1.2,
            'Deli': -1.8,
            'Bakery': -1.4,
            'Meat': -1.6,
            'default': -1.3
        }
        
    def calculate_price_elasticity(self, category):
        """Get price elasticity estimate for a category"""
        return self.price_elasticity_estimates.get(category, self.price_elasticity_estimates['default'])
        
    def simulate_demand_response(self, base_demand, discount_percent, category):
        """Simulate how demand changes with discount"""
        elasticity = self.calculate_price_elasticity(category)
        
        # Price elasticity formula: % change in quantity / % change in price
        price_change_percent = -discount_percent  # Negative because price decreases
        quantity_change_percent = elasticity * price_change_percent
        
        # Calculate new demand
        new_demand = base_demand * (1 + quantity_change_percent / 100)
        return max(0, new_demand)
        
    def calculate_waste_reduction(self, current_stock, predicted_demand, days_until_expiry):
        """Calculate potential waste reduction"""
        if days_until_expiry <= 0:
            return current_stock  # All will be wasted
            
        # Estimate how much will be sold without markdown
        natural_sales = min(current_stock, predicted_demand * days_until_expiry)
        potential_waste = current_stock - natural_sales
        
        return max(0, potential_waste)
        
    def optimize_markdown(self, product_data, forecast_data):
        """Find optimal markdown percentage"""
        try:
            product_id = product_data['product_id']
            current_price = product_data['current_price']
            current_stock = product_data['stock']
            category = product_data['category']
            days_until_expiry = product_data['days_until_expiry']
            
            # Get predicted demand from forecast
            if forecast_data and len(forecast_data) > 0:
                predicted_demand = sum([f['predicted'] for f in forecast_data[:days_until_expiry]])
            else:
                # Fallback to simple estimate
                predicted_demand = max(1, current_stock * 0.3)  # Conservative estimate
                
            # Calculate potential waste without markdown
            potential_waste = self.calculate_waste_reduction(current_stock, predicted_demand, days_until_expiry)
            
            if potential_waste <= 0:
                return {
                    'product_id': product_id,
                    'optimal_discount': 0,
                    'projected_units_sold': predicted_demand,
                    'estimated_waste_reduction': 0,
                    'revenue_impact': 0,
                    'confidence_score': 0.9
                }
            
            # Test different discount levels
            discount_options = range(10, 71, 5)  # 10% to 70% in 5% increments
            best_option = None
            best_score = -float('inf')
            
            for discount in discount_options:
                # Calculate new demand with discount
                new_demand = self.simulate_demand_response(predicted_demand, discount, category)
                
                # Calculate units that will be sold
                units_sold = min(current_stock, new_demand * days_until_expiry)
                
                # Calculate revenue
                discounted_price = current_price * (1 - discount / 100)
                revenue = units_sold * discounted_price
                
                # Calculate waste reduction
                waste_reduction = current_stock - units_sold
                waste_reduction = max(0, min(waste_reduction, potential_waste))
                
                # Calculate score (weighted combination of revenue and waste reduction)
                # Prioritize waste reduction for items close to expiry
                urgency_factor = max(0.1, 1 - (days_until_expiry / 7))  # Higher urgency for items expiring soon
                waste_weight = 0.3 + (urgency_factor * 0.4)  # 30-70% weight on waste reduction
                revenue_weight = 1 - waste_weight
                
                # Normalize scores
                max_possible_revenue = current_stock * current_price
                revenue_score = revenue / max_possible_revenue if max_possible_revenue > 0 else 0
                waste_score = waste_reduction / potential_waste if potential_waste > 0 else 0
                
                total_score = (revenue_weight * revenue_score) + (waste_weight * waste_score)
                
                if total_score > best_score:
                    best_score = total_score
                    best_option = {
                        'discount': discount,
                        'units_sold': units_sold,
                        'revenue': revenue,
                        'waste_reduction': waste_reduction,
                        'score': total_score
                    }
            
            if best_option is None:
                # Fallback option
                best_option = {
                    'discount': 25,
                    'units_sold': predicted_demand * 1.2,
                    'revenue': current_stock * current_price * 0.75 * 0.8,
                    'waste_reduction': potential_waste * 0.6,
                    'score': 0.5
                }
            
            # Calculate confidence score based on data quality
            confidence_score = self._calculate_confidence(product_data, forecast_data, days_until_expiry)
            
            return {
                'product_id': product_id,
                'optimal_discount': best_option['discount'],
                'projected_units_sold': round(best_option['units_sold'], 1),
                'estimated_waste_reduction': round(best_option['waste_reduction'], 1),
                'revenue_impact': round(best_option['revenue'], 2),
                'confidence_score': round(confidence_score, 2),
                'discounted_price': round(current_price * (1 - best_option['discount'] / 100), 2),
                'potential_savings': round(best_option['waste_reduction'] * current_price, 2)
            }
            
        except Exception as e:
            logger.error(f"Error optimizing markdown for product {product_data.get('product_id', 'unknown')}: {e}")
            return self._fallback_markdown(product_data)
            
    def _calculate_confidence(self, product_data, forecast_data, days_until_expiry):
        """Calculate confidence score for markdown recommendation"""
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on data availability
        if forecast_data and len(forecast_data) >= 7:
            confidence += 0.2
            
        # Adjust based on time until expiry
        if days_until_expiry <= 1:
            confidence += 0.2  # High confidence for urgent items
        elif days_until_expiry <= 3:
            confidence += 0.1
            
        # Adjust based on stock levels
        stock = product_data.get('stock', 0)
        if stock > 0:
            confidence += 0.1
            
        return min(1.0, confidence)
        
    def _fallback_markdown(self, product_data):
        """Fallback markdown calculation when optimization fails"""
        days_until_expiry = product_data.get('days_until_expiry', 7)
        current_price = product_data.get('current_price', 5.0)
        current_stock = product_data.get('stock', 10)
        
        # Simple rule-based markdown
        if days_until_expiry <= 1:
            discount = 40
        elif days_until_expiry <= 2:
            discount = 30
        elif days_until_expiry <= 3:
            discount = 20
        else:
            discount = 15
            
        projected_sales = current_stock * 0.7  # Assume 70% will sell with markdown
        waste_reduction = current_stock * 0.3
        
        return {
            'product_id': product_data.get('product_id', 'unknown'),
            'optimal_discount': discount,
            'projected_units_sold': round(projected_sales, 1),
            'estimated_waste_reduction': round(waste_reduction, 1),
            'revenue_impact': round(projected_sales * current_price * (1 - discount / 100), 2),
            'confidence_score': 0.6,
            'discounted_price': round(current_price * (1 - discount / 100), 2),
            'potential_savings': round(waste_reduction * current_price, 2)
        }
        
    def batch_optimize(self, products_data, forecasts_data):
        """Optimize markdowns for multiple products"""
        results = []
        
        for product in products_data:
            product_id = product['product_id']
            forecast = forecasts_data.get(product_id, [])
            
            result = self.optimize_markdown(product, forecast)
            results.append(result)
            
        return results