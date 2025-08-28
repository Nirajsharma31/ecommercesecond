# E-Commerce API Endpoints

## Base URL
```
http://localhost:8080/api
```

## Authentication Endpoints

### POST /auth/signup
Register a new user
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string"
}
```

### POST /auth/login
User login
```json
{
  "username": "string",
  "password": "string"
}
```

### POST /auth/logout
User logout (requires authentication)

## Product Endpoints

### GET /products
Get all active products

### GET /products/{id}
Get product by ID

### GET /products/search?keyword={keyword}&page={page}&size={size}
Search products by keyword

### GET /products/category/{categoryId}
Get products by category

## Category Endpoints

### GET /categories
Get all categories

### GET /categories/{id}
Get category by ID

## User Endpoints (Requires Authentication)

### GET /users/profile
Get user profile

### PUT /users/profile
Update user profile
```json
{
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string"
}
```

## Cart Endpoints (Requires Authentication)

### GET /cart
Get user's cart

### POST /cart/add
Add item to cart
```json
{
  "productId": "number",
  "quantity": "number"
}
```

### PUT /cart/update/{itemId}
Update cart item quantity
```json
{
  "quantity": "number"
}
```

### DELETE /cart/remove/{itemId}
Remove item from cart

## Order Endpoints (Requires Authentication)

### POST /orders
Create new order
```json
{
  "shippingAddress": "string",
  "paymentMethod": "string"
}
```

### GET /orders
Get user's orders

### GET /orders/{id}
Get order by ID

## Wishlist Endpoints (Requires Authentication)

### GET /wishlist
Get user's wishlist

### POST /wishlist/add
Add item to wishlist
```json
{
  "productId": "number"
}
```

### DELETE /wishlist/remove/{productId}
Remove item from wishlist

## Admin Endpoints (Requires ADMIN role)

### GET /admin/dashboard
Get admin dashboard data

### POST /admin/products
Create new product
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "stockQuantity": "number",
  "imageUrl": "string",
  "brand": "string",
  "categoryId": "number"
}
```

### PUT /admin/products/{id}
Update product

### DELETE /admin/products/{id}
Delete product

### POST /admin/categories
Create new category
```json
{
  "name": "string",
  "description": "string"
}
```

### PUT /admin/categories/{id}
Update category

### DELETE /admin/categories/{id}
Delete category

### GET /admin/users
Get all users

### PUT /admin/users/{id}/status
Update user status
```json
{
  "enabled": "boolean"
}
```

### GET /admin/orders
Get all orders

### PUT /admin/orders/{id}/status
Update order status
```json
{
  "status": "PENDING|CONFIRMED|SHIPPED|DELIVERED|CANCELLED"
}
```

## Health Check

### GET /health
Check API health status

## Response Format

### Success Response
```json
{
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00"
}
```

### Error Response
```json
{
  "timestamp": "2024-01-01T00:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Error description"
}
```

## HTTP Status Codes

- **200 OK**: Successful GET, PUT requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error