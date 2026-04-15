# E-Commerce Backend (Spring Boot + React + MySQL)

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