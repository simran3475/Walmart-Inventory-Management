import pandas as pd
import sqlite3
import os
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataLoader:
    def __init__(self, db_path='inventory.db'):
        self.db_path = db_path
        self.init_database()
        
    def init_database(self):
        """Initialize SQLite database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create products table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                product_id TEXT PRIMARY KEY,
                product_name TEXT NOT NULL,
                category TEXT NOT NULL,
                current_price REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create inventory table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id TEXT NOT NULL,
                stock INTEGER NOT NULL,
                expiry_date DATE NOT NULL,
                status TEXT DEFAULT 'safe',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products (product_id)
            )
        ''')
        
        # Create sales_history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sales_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                product_id TEXT NOT NULL,
                units_sold INTEGER NOT NULL,
                price REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products (product_id)
            )
        ''')
        
        # Create markdown_suggestions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS markdown_suggestions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id TEXT NOT NULL,
                suggested_discount REAL NOT NULL,
                potential_savings REAL NOT NULL,
                confidence_score REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products (product_id)
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
        
    def load_csv_data(self, inventory_csv='data/inventory.csv', sales_csv='data/sales.csv'):
        """Load data from CSV files into database"""
        try:
            # Load inventory data
            if os.path.exists(inventory_csv):
                inventory_df = pd.read_csv(inventory_csv)
                self._load_inventory_from_df(inventory_df)
                logger.info(f"Loaded inventory data from {inventory_csv}")
            
            # Load sales data
            if os.path.exists(sales_csv):
                sales_df = pd.read_csv(sales_csv)
                self._load_sales_from_df(sales_df)
                logger.info(f"Loaded sales data from {sales_csv}")
                
        except Exception as e:
            logger.error(f"Error loading CSV data: {e}")
            
    def _load_inventory_from_df(self, df):
        """Load inventory data from DataFrame"""
        conn = sqlite3.connect(self.db_path)
        
        for _, row in df.iterrows():
            # Insert product if not exists
            conn.execute('''
                INSERT OR IGNORE INTO products (product_id, product_name, category, current_price)
                VALUES (?, ?, ?, ?)
            ''', (row['productId'], row['productName'], row['category'], row.get('currentPrice', 5.99)))
            
            # Calculate status based on expiry date
            expiry_date = pd.to_datetime(row['expiryDate'])
            days_until_expiry = (expiry_date - pd.Timestamp.now()).days
            
            if days_until_expiry < 0:
                status = 'expired'
            elif days_until_expiry <= 2:
                status = 'expiring'
            elif row['stock'] > row.get('predictedDemand', 0) * 1.5:
                status = 'overstock'
            else:
                status = 'safe'
            
            # Insert inventory
            conn.execute('''
                INSERT OR REPLACE INTO inventory (product_id, stock, expiry_date, status)
                VALUES (?, ?, ?, ?)
            ''', (row['productId'], row['stock'], row['expiryDate'], status))
        
        conn.commit()
        conn.close()
        
    def _load_sales_from_df(self, df):
        """Load sales data from DataFrame"""
        conn = sqlite3.connect(self.db_path)
        
        for _, row in df.iterrows():
            conn.execute('''
                INSERT OR REPLACE INTO sales_history (date, product_id, units_sold, price)
                VALUES (?, ?, ?, ?)
            ''', (row['date'], row['productId'], row['unitsSold'], row.get('price', 5.99)))
        
        conn.commit()
        conn.close()
        
    def get_inventory(self, category=None, expiry_days=None):
        """Get inventory data with optional filters"""
        conn = sqlite3.connect(self.db_path)
        
        query = '''
            SELECT p.product_id, p.product_name, p.category, p.current_price,
                   i.stock, i.expiry_date, i.status,
                   CAST(julianday(i.expiry_date) - julianday('now') AS INTEGER) as days_until_expiry
            FROM products p
            JOIN inventory i ON p.product_id = i.product_id
        '''
        
        params = []
        conditions = []
        
        if category:
            conditions.append("p.category = ?")
            params.append(category)
            
        if expiry_days is not None:
            conditions.append("CAST(julianday(i.expiry_date) - julianday('now') AS INTEGER) <= ?")
            params.append(expiry_days)
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
            
        query += " ORDER BY i.expiry_date ASC"
        
        df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        
        return df.to_dict('records')
        
    def get_sales_history(self, product_id, days=90):
        """Get sales history for a product"""
        conn = sqlite3.connect(self.db_path)
        
        query = '''
            SELECT date, units_sold, price
            FROM sales_history
            WHERE product_id = ? AND date >= date('now', '-{} days')
            ORDER BY date ASC
        '''.format(days)
        
        df = pd.read_sql_query(query, conn, params=[product_id])
        conn.close()
        
        return df
        
    def seed_sample_data(self):
        """Create sample data for testing"""
        sample_products = [
            ('PROD001', 'Organic Bananas', 'Produce', 2.99),
            ('PROD002', 'Greek Yogurt 32oz', 'Dairy', 5.49),
            ('PROD003', 'Rotisserie Chicken', 'Deli', 4.98),
            ('PROD004', 'Strawberries 1lb', 'Produce', 3.99),
            ('PROD005', 'Whole Milk Gallon', 'Dairy', 3.79),
            ('PROD006', 'Caesar Salad Kit', 'Produce', 2.49)
        ]
        
        sample_inventory = [
            ('PROD001', 45, '2025-01-17', 'expiring'),
            ('PROD002', 28, '2025-01-19', 'safe'),
            ('PROD003', 12, '2025-01-16', 'expiring'),
            ('PROD004', 67, '2025-01-18', 'overstock'),
            ('PROD005', 89, '2025-01-22', 'safe'),
            ('PROD006', 34, '2025-01-20', 'safe')
        ]
        
        # Generate sample sales history
        sample_sales = []
        base_date = datetime.now() - timedelta(days=90)
        
        for product_id, _, _, price in sample_products:
            for i in range(90):
                date = base_date + timedelta(days=i)
                # Simulate varying sales with some randomness
                base_sales = 15 + (i % 7) * 2  # Weekly pattern
                units_sold = max(0, base_sales + (hash(f"{product_id}{i}") % 10 - 5))
                sample_sales.append((date.strftime('%Y-%m-%d'), product_id, units_sold, price))
        
        conn = sqlite3.connect(self.db_path)
        
        # Insert sample data
        conn.executemany('INSERT OR REPLACE INTO products VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)', sample_products)
        conn.executemany('INSERT OR REPLACE INTO inventory (product_id, stock, expiry_date, status) VALUES (?, ?, ?, ?)', sample_inventory)
        conn.executemany('INSERT OR REPLACE INTO sales_history (date, product_id, units_sold, price) VALUES (?, ?, ?, ?)', sample_sales)
        
        conn.commit()
        conn.close()
        
        logger.info("Sample data seeded successfully")