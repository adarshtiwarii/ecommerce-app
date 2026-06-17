# 🛍️ EcoMart - Full Stack E-Commerce Application

A complete, production-ready e-commerce platform built with **Spring Boot**, **React**, **MySQL**, and **JWT Authentication**. Features real-time payment integration with Razorpay, admin dashboard, product management, and delivery estimation.

**Live Demo:** [https://ecommerce-app-1-fnc3.onrender.com](https://ecommerce-app-1-fnc3.onrender.com)

🚀 Quick Start
Prerequisites
Java 17+
Node.js 16+
MySQL 8.0+
Git
Backend Setup
Clone & navigate:

bash
git clone https://github.com/adarshtiwarii/ecommerce-app.git
cd ecommerce-app/backend
Configure environment variables (.env or application.properties):

properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce
spring.datasource.username=root
spring.datasource.password=your_password

# JWT
app.jwtSecret=your_long_secret_key_here_min_32_chars

# Cloudinary (Image Upload)
cloudinary.cloud.name=your_cloud_name
cloudinary.api.key=your_api_key
cloudinary.api.secret=your_api_secret

# Razorpay (Payment)
razorpay.key.id=rzp_test_xxxxxxxxxxxxxx
razorpay.key.secret=your_razorpay_secret
razorpay.currency=INR

# Warehouse Info
warehouse.name=Primary Warehouse
warehouse.latitude=28.6139
warehouse.longitude=77.2090
Run the backend:

bash
mvn spring-boot:run
Backend runs at: http://localhost:8080

Frontend Setup
Navigate to frontend:

bash
cd ecommerce-app/frontend
Install dependencies:

bash
npm install
Configure API endpoint (.env):

env
REACT_APP_API_BASE_URL=http://localhost:8080/api
Run the frontend:

bash
npm start
Frontend runs at: http://localhost:3000

📚 API Documentation
Authentication Endpoints
Code
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login & get JWT token
GET    /api/auth/users             - List all users (Admin only)
PATCH  /api/auth/users/{id}/toggle - Activate/Deactivate user (Admin only)
Product Endpoints
Code
GET    /api/products                    - Get all products (paginated)
GET    /api/products/{id}               - Get product details
GET    /api/products/search            - Search products by name
GET    /api/products/category/{category} - Get products by category
POST   /api/products                    - Create product (Seller/Admin)
PUT    /api/products/{id}               - Update product (Seller/Admin)
DELETE /api/products/{id}               - Delete product (Seller/Admin)
GET    /api/products/admin/all          - Admin product list
Cart Endpoints
Code
GET    /api/cart?userId={id}       - Get user cart
POST   /api/cart/add               - Add item to cart
PUT    /api/cart/update            - Update cart item quantity
DELETE /api/cart/remove            - Remove item from cart
DELETE /api/cart/clear             - Clear entire cart
Order Endpoints
Code
POST   /api/orders                   - Create new order
GET    /api/orders/my?userId={id}   - Get user's orders
GET    /api/orders/count            - Get order count (Admin)
GET    /api/orders/admin/all        - Get all orders (Admin)
Payment & Delivery Endpoints
Code
POST   /api/payments/razorpay/order      - Create Razorpay order
POST   /api/payments/razorpay/verify     - Verify payment signature
GET    /api/delivery/estimate?latitude={lat}&longitude={lng} - Estimate delivery time
🎯 Main Frontend Routes
Route	Description
/	Home - Auto-scrolling banner, featured products
/product/:id	Product details page
/category/:category	Category browse page
/search	Search & filter products
/login	Login/Register form
/cart	Shopping cart
/checkout	Order checkout
/orders	User order history
/admin	Admin dashboard
/add-product	Add new product (Admin)
/edit-product/:id	Edit existing product (Admin)
🔐 Security Features
✅ JWT Authentication - Token-based stateless auth
✅ Role-based Access Control (RBAC) - USER, SELLER, ADMIN roles
✅ Password Hashing - BCrypt encryption
✅ CORS Configuration - Restricted origins
✅ Payment Verification - Razorpay signature validation
✅ SQL Injection Protection - JPA parameterized queries
📁 Project Structure
Code
ecommerce-app/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/
│   │   ├── config/         # Configuration classes
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # JPA repositories
│   │   ├── entity/         # JPA entities
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── security/       # JWT & security config
│   │   └── exception/      # Custom exceptions
│   ├── pom.xml             # Maven dependencies
│   └── README.md
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # Context API
│   │   ├── services/       # API services
│   │   ├── styles/         # Tailwind CSS
│   │   └── App.jsx
│   ├── package.json        # NPM dependencies
│   └── README.md
│
└── README.md               # This file
💡 Key Highlights
Payment Integration
Razorpay test mode ready
Secure signature verification
Order confirmation after successful payment
Image Management
Cloudinary CDN integration
Automatic image optimization
Support for both imageUrl and images[] formats
Delivery Estimation
Haversine formula for distance calculation
Real-time ETA based on warehouse location
Customizable delivery radius
Admin Dashboard
Real-time order analytics
User activity tracking
Product inventory management
🧪 Testing
Run backend tests:

bash
cd backend
mvn test
Run frontend tests:

bash
cd frontend
npm test
Selenium automation tests available in testing suite.

🚀 Deployment
Backend (Render/Heroku)
bash
mvn clean package -DskipTests
# Push JAR to cloud platform
Frontend (Vercel/Netlify)
bash
npm run build
# Deploy build folder
📝 Configuration Notes
JWT Expiration: Configure in backend security config
Product Images: Both imageUrl (single) and images[] (multiple) supported
Protected Routes: Frontend routes require valid JWT token in localStorage
CORS: Configure allowed origins in backend CorsConfig
Database: Auto-create tables via Hibernate DDL (configure in properties)
🤝 Contributing
Fork the repository
Create feature branch (git checkout -b feature/AmazingFeature)
Commit changes (git commit -m 'Add AmazingFeature')
Push to branch (git push origin feature/AmazingFeature)
Open a Pull Request
📄 License
This project is open source and available under the MIT License.

👨‍💻 Author
Adarsh Tiwari
GitHub: @adarshtiwarii

📞 Support & Contact
For issues, questions, or suggestions:

Open an Issue
Check existing Discussions
🎉 Acknowledgments
Spring Boot & Spring Security team
React community
Razorpay for payment integration
Cloudinary for image hosting

## 🗄️ Database Entity Relationship (ER) Diagram

Below is the entity relationship diagram for the e-commerce database:

```mermaid
erDiagram
    users {
        BIGINT user_id PK
        VARCHAR full_name
        VARCHAR email UK
        VARCHAR password_hash
        ENUM role
        TIMESTAMP created_at
    }
    products {
        BIGINT product_id PK
        VARCHAR name
        TEXT description
        DECIMAL price
        INT stock_quantity
        VARCHAR image_url
        VARCHAR category
    }
    cart_items {
        BIGINT cart_item_id PK
        BIGINT user_id FK
        BIGINT product_id FK
        INT quantity
        TIMESTAMP added_at
    }
    orders {
        BIGINT order_id PK
        BIGINT user_id FK
        TIMESTAMP order_date
        DECIMAL total_amount
        ENUM status
        TEXT shipping_address
        VARCHAR payment_method
    }
    order_items {
        BIGINT order_item_id PK
        BIGINT order_id FK
        BIGINT product_id FK
        INT quantity
        DECIMAL price_at_purchase
    }
    payments {
        BIGINT payment_id PK
        BIGINT order_id FK
        BIGINT user_id FK
        DECIMAL amount
        VARCHAR payment_status
        VARCHAR razorpay_payment_id
        TIMESTAMP payment_date
    }

    users ||--o{ cart_items : "has"
    users ||--o{ orders : "places"
    users ||--o{ payments : "makes"
    products ||--o{ cart_items : "added_to"
    products ||--o{ order_items : "included_in"
    orders ||--o{ order_items : "contains"
    orders ||--o| payments : "has_one"
