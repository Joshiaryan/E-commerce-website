import os
import json
import random
from datetime import datetime, timezone
from functools import wraps
from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    LoginManager, UserMixin, login_user, logout_user,
    login_required, current_user
)
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# Secret key for session signing
app.config['SECRET_KEY'] = 'aetherio-super-secret-2026'

# Configure SQLite Database URI inside the Flask instance folder
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///aetherio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Ensure the instance directory exists
if not os.path.exists(app.instance_path):
    os.makedirs(app.instance_path)

db = SQLAlchemy(app)

# --- Flask-Login Setup ---
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.unauthorized_handler
def unauthorized():
    # Return JSON for API requests, redirect for page requests
    if request.path.startswith('/api/'):
        return jsonify({"success": False, "error": "Authentication required", "logged_in": False}), 401
    return redirect(url_for('home'))


# ============================================================
# Database Models
# ============================================================

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    orders = db.relationship('Order', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "is_admin": self.is_admin,
            "created_at": self.created_at.strftime('%b %d, %Y')
        }


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    rating = db.Column(db.Float, default=4.5)
    image = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    specs_json = db.Column(db.Text, nullable=False)

    @property
    def specs(self):
        try:
            return json.loads(self.specs_json)
        except Exception:
            return []

    @specs.setter
    def specs(self, val):
        self.specs_json = json.dumps(val)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "price": self.price,
            "rating": self.rating,
            "image": self.image,
            "description": self.description,
            "specs": self.specs
        }


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id_str = db.Column(db.String(20), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # nullable for guest checkout
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(100), nullable=False)
    shipping_address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    zip_code = db.Column(db.String(20), nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    total = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    items = db.relationship('OrderItem', backref='order', lazy=True)

    def to_dict(self):
        return {
            "order_id": self.order_id_str,
            "customer_name": self.customer_name,
            "customer_email": self.customer_email,
            "shipping_address": self.shipping_address,
            "city": self.city,
            "zip_code": self.zip_code,
            "subtotal": self.subtotal,
            "total": self.total,
            "created_at": self.created_at.strftime('%b %d, %Y'),
            "items": [item.to_dict() for item in self.items]
        }


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=True)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase = db.Column(db.Float, nullable=False)

    product = db.relationship('Product')

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else "Unknown Product",
            "product_image": self.product.image if self.product else "",
            "quantity": self.quantity,
            "price_at_purchase": self.price_at_purchase,
            "line_total": round(self.price_at_purchase * self.quantity, 2)
        }


# ============================================================
# Seed Data
# ============================================================

PRODUCTS_SEED = [
    {
        "id": 1, "name": "Nebula X1 Wireless Headset", "category": "audio",
        "price": 189.99, "rating": 4.8, "image": "/static/images/product_headset.webp",
        "description": "Experience otherworldly sound clarity with hybrid active noise cancellation, spatial audio, and a 60-hour battery life. Designed for seamless comfort and cosmic aesthetics.",
        "specs": ["Hybrid ANC", "Spatial Audio", "60h Battery", "Bluetooth 5.3"]
    },
    {
        "id": 2, "name": "AeroKey Mechanical Keyboard", "category": "peripherals",
        "price": 149.99, "rating": 4.7, "image": "/static/images/product_keyboard.webp",
        "description": "A low-profile mechanical keyboard featuring hot-swappable tactile switches, dynamic per-key RGB backlighting, and a solid aircraft-grade aluminum top plate.",
        "specs": ["Tactile Switches", "RGB Backlit", "Alum Frame", "Hot-swappable"]
    },
    {
        "id": 3, "name": "StellarShift Ergonomic Mouse", "category": "peripherals",
        "price": 79.99, "rating": 4.9, "image": "/static/images/product_mouse.webp",
        "description": "Ergonomically sculpted mouse with high-precision 26K DPI optical sensor, silent clicks, and an infinity scroll wheel to glide through tasks effortlessly.",
        "specs": ["26,000 DPI Sensor", "Silent Click", "Infinity Wheel", "Wireless & BT"]
    },
    {
        "id": 4, "name": "Lumina RGB Desk Mat", "category": "lifestyle",
        "price": 34.99, "rating": 4.5, "image": "/static/images/product_deskmat.webp",
        "description": "Premium micro-woven cloth surface optimized for pixel-precise tracking, surrounded by a vibrant 360-degree dual-zone dynamic RGB border.",
        "specs": ["Micro-woven Cloth", "Vibrant RGB Border", "Water-Resistant", "Non-Slip Base"]
    },
    {
        "id": 5, "name": "Chronos Pro Smartwatch", "category": "wearables",
        "price": 249.99, "rating": 4.6, "image": "/static/images/product_watch.webp",
        "description": "Sophisticated fitness and notification tracker. Featuring an always-on AMOLED display, advanced biometric tracking (heart rate, SpO2, sleep), and a sleek titanium bezel.",
        "specs": ["AMOLED Display", "Titanium Bezel", "Heart & SpO2 Monitor", "14-Day Battery"]
    },
    {
        "id": 6, "name": "NovaCharge Multi-Port Charger", "category": "power",
        "price": 59.99, "rating": 4.8, "image": "/static/images/product_charger.webp",
        "description": "Compact 100W GaN fast charger with 3x USB-C and 1x USB-A ports. Powers up your laptop, phone, and tablet simultaneously with dynamic power allocation.",
        "specs": ["100W GaN Technology", "4 Charging Ports", "Ultra-Compact", "Smart Protection"]
    }
]

# Initialize DB tables and seed products on startup
with app.app_context():
    db.create_all()
    if Product.query.count() == 0:
        for p in PRODUCTS_SEED:
            new_prod = Product(
                id=p["id"], name=p["name"], category=p["category"],
                price=p["price"], rating=p["rating"],
                image=p["image"], description=p["description"]
            )
            new_prod.specs = p["specs"]
            db.session.add(new_prod)
        db.session.commit()


# ============================================================
# Flask-Login user loader
# ============================================================

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# ============================================================
# Page Routes
# ============================================================

@app.route('/')
def home():
    products = Product.query.all()
    return render_template('index.html', products=products)


# ============================================================
# Auth API Routes
# ============================================================

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid request body"}), 400

    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not full_name or not email or not password:
        return jsonify({"success": False, "error": "All fields are required"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "error": "An account with this email already exists"}), 409

    new_user = User(full_name=full_name, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    login_user(new_user, remember=True)
    return jsonify({"success": True, "user": new_user.to_dict()})


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid request body"}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"success": False, "error": "Invalid email or password"}), 401

    login_user(user, remember=True)
    return jsonify({"success": True, "user": user.to_dict()})


@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({"success": True})


@app.route('/api/me')
def me():
    if current_user.is_authenticated:
        return jsonify({"logged_in": True, "user": current_user.to_dict()})
    return jsonify({"logged_in": False})


@app.route('/api/orders')
def get_orders():
    if not current_user.is_authenticated:
        return jsonify({"success": False, "error": "Authentication required", "logged_in": False}), 401
    orders = Order.query.filter_by(user_id=current_user.id)\
                        .order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders])


# ============================================================
# Products API
# ============================================================

@app.route('/api/products')
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])


# ============================================================
# Checkout API
# ============================================================

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid request body"}), 400

    name = data.get('name')
    email = data.get('email')
    address = data.get('address')
    city = data.get('city')
    zip_code = data.get('zip')
    cart_items = data.get('cart', [])

    if not all([name, email, address, city, zip_code]) or not cart_items:
        return jsonify({"success": False, "error": "Missing required checkout fields"}), 400

    subtotal = 0.0
    items_to_create = []

    for item in cart_items:
        product_id = item.get('productId')
        quantity = item.get('quantity')

        if not product_id or not quantity or quantity <= 0:
            return jsonify({"success": False, "error": "Invalid product ID or quantity"}), 400

        product = Product.query.get(product_id)
        if not product:
            return jsonify({"success": False, "error": f"Product with ID {product_id} not found"}), 404

        subtotal += product.price * quantity
        items_to_create.append({
            "product_id": product.id,
            "quantity": quantity,
            "price_at_purchase": product.price
        })

    total = subtotal  # free shipping

    # Generate unique order ID
    order_id_str = f"AETH-{random.randint(10000, 99999)}"
    while Order.query.filter_by(order_id_str=order_id_str).first():
        order_id_str = f"AETH-{random.randint(10000, 99999)}"

    try:
        new_order = Order(
            order_id_str=order_id_str,
            user_id=current_user.id if current_user.is_authenticated else None,
            customer_name=name,
            customer_email=email,
            shipping_address=address,
            city=city,
            zip_code=zip_code,
            subtotal=subtotal,
            total=total
        )
        db.session.add(new_order)
        db.session.flush()

        for item_info in items_to_create:
            db.session.add(OrderItem(
                order_id=new_order.id,
                product_id=item_info["product_id"],
                quantity=item_info["quantity"],
                price_at_purchase=item_info["price_at_purchase"]
            ))

        db.session.commit()
        return jsonify({"success": True, "order_id": order_id_str})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Failed to save order: {str(e)}"}), 500


# ============================================================
# Admin Custom Decorator & Routes
# ============================================================

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            if request.path.startswith('/api/'):
                return jsonify({"success": False, "error": "Admin privileges required"}), 403
            return redirect(url_for('home'))
        return f(*args, **kwargs)
    return decorated_function


@app.route('/admin')
@login_required
@admin_required
def admin_dashboard():
    return render_template('admin.html')


@app.route('/api/admin/stats')
@login_required
@admin_required
def admin_stats():
    total_products = Product.query.count()
    total_orders = Order.query.count()
    total_users = User.query.count()
    
    # Calculate revenue
    total_revenue = db.session.query(db.func.sum(Order.total)).scalar() or 0.0
    total_revenue = round(total_revenue, 2)
    
    # Get last 5 orders
    recent_orders_db = Order.query.order_by(Order.created_at.desc()).limit(5).all()
    recent_orders = [o.to_dict() for o in recent_orders_db]
    
    return jsonify({
        "success": True,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "total_revenue": total_revenue,
        "recent_orders": recent_orders
    })


@app.route('/api/admin/products')
@login_required
@admin_required
def admin_get_products():
    products = Product.query.order_by(Product.id.desc()).all()
    return jsonify([p.to_dict() for p in products])


@app.route('/api/admin/products', methods=['POST'])
@login_required
@admin_required
def admin_create_product():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid request body"}), 400
        
    name = data.get('name', '').strip()
    category = data.get('category', '').strip()
    price = data.get('price')
    rating = data.get('rating', 4.5)
    image = data.get('image', '').strip()
    description = data.get('description', '').strip()
    specs = data.get('specs', [])
    
    if not all([name, category, price, image, description]):
        return jsonify({"success": False, "error": "Missing required product fields"}), 400
        
    try:
        price = float(price)
        rating = float(rating)
    except ValueError:
        return jsonify({"success": False, "error": "Price and rating must be numeric"}), 400
        
    new_product = Product(
        name=name,
        category=category,
        price=price,
        rating=rating,
        image=image,
        description=description
    )
    new_product.specs = specs
    
    db.session.add(new_product)
    db.session.commit()
    
    return jsonify({"success": True, "product": new_product.to_dict()})


@app.route('/api/admin/products/<int:product_id>', methods=['PUT'])
@login_required
@admin_required
def admin_update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"success": False, "error": "Product not found"}), 404
        
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid request"}), 400
        
    name = data.get('name', '').strip()
    category = data.get('category', '').strip()
    price = data.get('price')
    rating = data.get('rating')
    image = data.get('image', '').strip()
    description = data.get('description', '').strip()
    specs = data.get('specs', [])
    
    if not all([name, category, price, image, description]):
        return jsonify({"success": False, "error": "Missing required product fields"}), 400
        
    try:
        price = float(price)
        rating = float(rating) if rating is not None else 4.5
    except ValueError:
        return jsonify({"success": False, "error": "Price and rating must be numeric"}), 400
        
    product.name = name
    product.category = category
    product.price = price
    product.rating = rating
    product.image = image
    product.description = description
    product.specs = specs
    
    db.session.commit()
    return jsonify({"success": True, "product": product.to_dict()})


@app.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
@login_required
@admin_required
def admin_delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"success": False, "error": "Product not found"}), 404
        
    OrderItem.query.filter_by(product_id=product_id).update({'product_id': None})
    
    db.session.delete(product)
    db.session.commit()
    return jsonify({"success": True})


@app.route('/api/admin/orders')
@login_required
@admin_required
def admin_get_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders])


@app.route('/api/admin/users')
@login_required
@admin_required
def admin_get_users():
    users = User.query.order_by(User.id.asc()).all()
    
    users_data = []
    for u in users:
        order_count = Order.query.filter_by(user_id=u.id).count()
        udict = u.to_dict()
        udict["order_count"] = order_count
        users_data.append(udict)
        
    return jsonify(users_data)


@app.route('/api/admin/users/<int:user_id>/toggle-admin', methods=['PUT'])
@login_required
@admin_required
def admin_toggle_user_admin(user_id):
    if current_user.id == user_id:
        return jsonify({"success": False, "error": "You cannot toggle your own admin status"}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
        
    user.is_admin = not user.is_admin
    db.session.commit()
    return jsonify({"success": True, "is_admin": user.is_admin})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
