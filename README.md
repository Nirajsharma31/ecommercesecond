# E-Commerce Website - Spring Boot Project

A complete e-commerce website built with Spring Boot 3.x, Java 17, and MySQL.

## Features

### Core Features
- **User Authentication**: Signup, Login, Logout with JWT-based security
- **User Management**: Profile update, address management, password reset
- **Product Management**: Browse, search, and view products
- **Cart System**: Add to cart, update quantity, remove items
- **Wishlist**: Save favorite products
- **Order Management**: Place orders, track orders, order history
- **Payment Integration**: Ready for payment gateway integration
- **Admin Dashboard**: Manage users, products, categories, and orders

### Technical Features
- RESTful API design
- JWT-based authentication
- MySQL database with JPA/Hibernate
- Responsive frontend with HTML, CSS, JavaScript
- Exception handling
- Input validation
- CORS support

## Technology Stack

### Backend
- **Java 17**
- **Spring Boot 3.5.5**
- **Spring Data JPA**
- **Spring Security**
- **Spring Validation**
- **MySQL 8.0+**
- **Lombok**
- **JWT (JSON Web Tokens)**

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- **Responsive Design**

### Build Tool
- **Maven**

## Project Structure

```
src/
├── main/
│   ├── java/com/example/SecondEcomWeNiraj/
│   │   ├── entity/          # JPA Entities
│   │   ├── repository/      # Data Access Layer
│   │   ├── service/         # Business Logic Layer
│   │   ├── controller/      # REST Controllers
│   │   ├── config/          # Configuration Classes
│   │   └── exception/       # Exception Handling
│   └── resources/
│       ├── static/          # Frontend Files
│       │   ├── css/
│       │   ├── js/
│       │   └── index.html
│       └── application.properties
└── test/                    # Test Classes
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- IDE (IntelliJ IDEA, Eclipse, VS Code)

### Database Setup
1. Install MySQL and create a database:
```sql
CREATE DATABASE ecommerce_db;
```

2. Update database credentials in `application.properties`:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Running the Application

1. **Clone the repository**
```bash
git clone <repository-url>
cd SecondEcomWeNiraj
```

2. **Build the project**
```bash
mvn clean install
```

3. **Run the application**
```bash
mvn spring-boot:run
```

4. **Access the application**
- Backend API: http://localhost:8080/api
- Frontend: http://localhost:8080
- Health Check: http://localhost:8080/api/health

## API Documentation

See [API_ENDPOINTS.md](API_ENDPOINTS.md) for detailed API documentation.

## Database Schema

See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for database structure and relationships.

## Configuration

### Application Properties
Key configurations in `application.properties`:
- Database connection settings
- JWT secret and expiration
- Server port
- Logging levels

### Security Configuration
- JWT-based authentication
- Role-based access control (USER, ADMIN)
- CORS enabled for frontend integration
- Password encryption with BCrypt

## Development Roadmap

### Phase 1: Foundation (Current)
- ✅ Project setup and dependencies
- ✅ Database entities and relationships
- ✅ Repository layer
- ✅ Basic service layer
- ✅ REST API endpoints (placeholder)
- ✅ Security configuration
- ✅ Basic frontend structure
- ✅ Exception handling

### Phase 2: Authentication & User Management
- 🔄 JWT implementation
- 🔄 User registration and login
- 🔄 Password encryption
- 🔄 Profile management
- 🔄 Address management

### Phase 3: Product & Category Management
- 🔄 Product CRUD operations
- 🔄 Category management
- 🔄 Product search and filtering
- 🔄 Image upload functionality

### Phase 4: Cart & Wishlist
- 🔄 Cart functionality
- 🔄 Wishlist implementation
- 🔄 Session management

### Phase 5: Order Management
- 🔄 Order creation and processing
- 🔄 Order tracking
- 🔄 Order history

### Phase 6: Admin Dashboard
- 🔄 Admin panel implementation
- 🔄 User management
- 🔄 Product management
- 🔄 Order management

### Phase 7: Payment Integration
- 🔄 Payment gateway integration
- 🔄 Payment processing
- 🔄 Transaction management

### Phase 8: Frontend Enhancement
- 🔄 Enhanced UI/UX
- 🔄 Product catalog
- 🔄 Shopping cart interface
- 🔄 User dashboard

## Testing

Run tests with:
```bash
mvn test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository.