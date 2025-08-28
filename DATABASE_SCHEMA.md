# E-Commerce Database Schema

## Tables Overview

### 1. users
- **id** (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- **username** (VARCHAR(255), UNIQUE, NOT NULL)
- **email** (VARCHAR(255), UNIQUE, NOT NULL)
- **password** (VARCHAR(255), NOT NULL)
- **first_name** (VARCHAR(255), NOT NULL)
- **last_name** (VARCHAR(255), NOT NULL)
- **phone_number** (VARCHAR(20))
- **role** (ENUM: 'USER', 'ADMIN', DEFAULT: 'USER')
- **enabled** (BOOLEAN, DEFAULT: true)
- **created_at** (TIMESTAMP)
- **updated_at** (TIMESTAMP)

### 2. categories
- **id** (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- **name** (VARCHAR(255), UNIQUE, NOT NULL)
- **description** (TEXT)
- **created_at** (TIMESTAMP)
- **updated_at** (TIMESTAMP)

### 3. products
- **id** (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- **name** (VARCHAR(255), NOT NULL)
- **description** (TEXT)
- **price** (DECIMAL(10,2), NOT NULL)
- **stock_quantity** (INT, DEFAULT: 0)
- **image_url** (VARCHAR(500))
- **brand** (VARCHAR(255))
- **category_id** (BIGINT, FOREIGN KEY → categories.id)
- **active** (BOOLEAN, DEFAULT: true)
- **created_at** (TIMESTAMP)
- **updated_at** (TIMESTAMP)

### 4. addresses
- **id** (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- **street** (VARCHAR(255), NOT NULL)
- **city** (VARCHAR(100), NOT NULL)
- **state** (VARCHAR(100), NOT NULL)
- **zip_code** (VARCHAR(20), NOT NULL)
- **country** (VARCHAR(100), NOT NULL)
- **is_default** (BOOLEAN, DEFAULT: false)
- **user_id** (BIGINT, FOREIGN KEY → users.id)

### 5. carts
- **id** (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- **user_id** (BIGINT, FOREIGN KEY → users.id, UNIQUE)
- **created_at** (TIMESTAMP)
- **updated_at** (TIMESTAMP)

### 6. cart_items
- **id** (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- **cart_id** (BIGINT, FOREIGN KEY → carts.id)
- **product_id** (BIGINT, FOREIGN KEY → products.id)
- **quantity** (INT, NOT NULL, MIN: 1)

### 7. orders
- **id** (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- **user_id** (BIGINT, FOREIGN KEY → users.id)
- **total_amount** (DECIMAL(10,2), NOT NULL)
- **status** (ENUM: 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')
- **payment_status** (ENUM: 'PENDING', 'PAID', 'FAILED', 'REFUNDED')
- **shipping_address** (TEXT)
- **created_at** (TIMESTAMP)
- **updated_at** (TIMESTAMP)

### 8. order_items
- **id** (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- **order_id** (BIGINT, FOREIGN KEY → orders.id)
- **product_id** (BIGINT, FOREIGN KEY → products.id)
- **quantity** (INT, NOT NULL)
- **price** (DECIMAL(10,2), NOT NULL)

### 9. wishlists
- **id** (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- **user_id** (BIGINT, FOREIGN KEY → users.id)
- **product_id** (BIGINT, FOREIGN KEY → products.id)
- **created_at** (TIMESTAMP)

## Relationships

1. **User → Address**: One-to-Many (One user can have multiple addresses)
2. **User → Cart**: One-to-One (Each user has one cart)
3. **User → Order**: One-to-Many (One user can have multiple orders)
4. **User → Wishlist**: One-to-Many (One user can have multiple wishlist items)
5. **Category → Product**: One-to-Many (One category can have multiple products)
6. **Product → CartItem**: One-to-Many (One product can be in multiple carts)
7. **Product → OrderItem**: One-to-Many (One product can be in multiple orders)
8. **Product → Wishlist**: One-to-Many (One product can be in multiple wishlists)
9. **Cart → CartItem**: One-to-Many (One cart can have multiple items)
10. **Order → OrderItem**: One-to-Many (One order can have multiple items)

## Indexes (Recommended)

```sql
-- Performance indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
```