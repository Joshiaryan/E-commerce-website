# AETHERIO — Premium Tech E-Commerce Website

> A full-featured, dark-themed e-commerce web application built with Flask and SQLite, featuring user authentication, a shopping cart, checkout flow, order history, and a protected admin dashboard.

---

## 🚀 Live Preview

Run locally at: `http://127.0.0.1:5000/`

---

## ✨ Features

### 🛍️ Storefront
- Dynamic product catalog with category filtering, keyword search, and price/rating sort
- Quick-view product detail modal with specifications
- Add to cart / remove from cart with live count badge
- Dark / Light theme toggle with system preference detection

### 🔐 Authentication
- User registration & login (session-based with Flask-Login)
- Password hashing with Werkzeug
- Persistent login sessions across page reloads

### 🛒 Shopping Cart & Checkout
- Persistent cart (localStorage)
- Multi-step checkout form with shipping + payment fields
- Backend order creation with server-side price validation (prevents client-side tampering)
- Order confirmation modal with unique `AETH-XXXXX` order ID

### 📦 Order History
- Logged-in users can view their full order history
- Itemized breakdown with product images, quantities, and prices

### 🛡️ Admin Dashboard (`/admin`)
- Protected route — only accessible to admin users
- **Dashboard**: Total revenue, order count, user count, product count + recent activity feed
- **Products**: Add, edit, and delete products with full spec management
- **Orders**: View all orders with itemized invoice viewer
- **Users**: List all registered users, grant or revoke admin privileges

---

## 🧱 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Python 3, Flask                     |
| Database   | SQLite (via Flask-SQLAlchemy)       |
| Auth       | Flask-Login, Werkzeug               |
| Frontend   | Vanilla HTML, CSS, JavaScript       |
| Icons      | Lucide Icons (CDN)                  |
| Fonts      | Google Fonts — Outfit, Plus Jakarta Sans |

---

## 📁 Project Structure

```
E-commerce-website/
├── app.py                  # Flask app — routes, models, APIs
├── migrate_db.py           # DB migration helper script
├── instance/
│   └── aetherio.db         # SQLite database
├── templates/
│   ├── index.html          # Main storefront page
│   └── admin.html          # Admin dashboard page
└── static/
    ├── css/
    │   ├── style.css       # Main design system
    │   └── admin.css       # Admin panel styles
    ├── js/
    │   ├── app.js          # Storefront logic
    │   └── admin.js        # Admin dashboard logic
    └── images/             # Product & hero images (WebP)
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Joshiaryan/E-commerce-website.git
cd E-commerce-website
```

### 2. Create and activate a virtual environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install flask flask-sqlalchemy flask-login werkzeug
```

### 4. Run the application
```bash
python app.py
```

The app will automatically:
- Create the SQLite database at `instance/aetherio.db`
- Seed the database with 6 default products

Open your browser at **http://127.0.0.1:5000/**

---

## 🔑 Default Admin Account

To access the admin panel, register an account and then run the migration script to grant admin privileges:

```bash
python migrate_db.py
```

Then update your user in the database:
```python
# Run once in Python shell or a script
import sqlite3
conn = sqlite3.connect('instance/aetherio.db')
conn.execute("UPDATE user SET is_admin = 1 WHERE email = 'your@email.com'")
conn.commit()
conn.close()
```

Navigate to **http://127.0.0.1:5000/admin** after logging in.

---

## 📸 Screenshots

> Storefront, Cart, Checkout, and Admin Panel all styled with a premium dark glassmorphism aesthetic.

---

## 📄 License

This project is for educational purposes. Feel free to fork and build on top of it.

---

*Built with ❤️ using Flask + vanilla web stack.*
