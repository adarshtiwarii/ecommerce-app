# EcoMart Backend

Spring Boot backend for the EcoMart marketplace application. It provides authentication, product catalog APIs, cart APIs, checkout, orders, admin dashboard data, and Cloudinary image upload support.

## Tech Stack

- Java 17+
- Spring Boot
- Spring Security with JWT
- Spring Data JPA
- MySQL
- Cloudinary
- Maven

## Setup

Configure database and Cloudinary values in your backend environment or application config.

Common environment values:

```env
DB_URL=jdbc:mysql://localhost:3306/ecommerce
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run the backend:

```bash
mvn spring-boot:run
```

Compile without tests:

```bash
mvn -q -DskipTests compile
```

## API Overview

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/users` - Admin only
- `PATCH /api/auth/users/{id}/toggle` - Admin only

Products:

- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/products/search`
- `GET /api/products/category/{category}`
- `POST /api/products` - Seller/Admin
- `PUT /api/products/{id}` - Seller/Admin
- `DELETE /api/products/{id}` - Seller/Admin
- `GET /api/products/admin/all` - Admin only

Cart:

- `GET /api/cart?userId={id}`
- `POST /api/cart/add`
- `PUT /api/cart/update`
- `DELETE /api/cart/remove`
- `DELETE /api/cart/clear`

Orders:

- `POST /api/orders`
- `GET /api/orders/my?userId={id}`
- `GET /api/orders/count` - Admin only
- `GET /api/orders/admin/all` - Admin only

## Notes

- Product image data is kept compatible with both `imageUrl` and `images[]`.
- JWT-authenticated endpoints expect `Authorization: Bearer <token>`.
- User order responses include order items and avoid recursive JSON serialization.
