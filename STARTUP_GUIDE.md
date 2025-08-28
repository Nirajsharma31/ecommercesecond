# 🚀 E-Shop Startup Guide

## Quick Fix for "Failed to load products" Error

The "Failed to load products" error occurs because the Spring Boot server is not running. Follow these steps to get your application working:

### Step 1: Prerequisites
Make sure you have:
- ✅ Java 17 or higher installed
- ✅ MySQL server running
- ✅ Database `secondecomwebsite` created (or let Spring Boot create it automatically)

### Step 2: Start MySQL
Make sure MySQL is running on your system:
- **Windows**: Start MySQL service from Services or MySQL Workbench
- **Mac**: `brew services start mysql` or use MySQL Preference Pane
- **Linux**: `sudo systemctl start mysql`

### Step 3: Start the Spring Boot Application

#### Option A: Using Maven Wrapper (Recommended)
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw spring-boot:run
```

#### Option B: Using Maven (if installed)
```bash
mvn spring-boot:run
```

#### Option C: Using IDE
- Open the project in your IDE (IntelliJ IDEA, Eclipse, VS Code)
- Run the `SecondEcomWeNirajApplication.java` main method

### Step 4: Wait for Startup
Look for this message in the console:
```
Started SecondEcomWeNirajApplication in X.XXX seconds
```

### Step 5: Test the Application
1. Open your browser and go to: http://localhost:8080/debug.html
2. Click "Test Health Endpoint" - should show ✅ success
3. Click "Test Products Endpoint" - should show products
4. Go to http://localhost:8080 to see the main application

## Troubleshooting

### Problem: "JAVA_HOME not defined"
**Solution**: Set JAVA_HOME environment variable to your Java installation directory

### Problem: "Connection refused" or "Failed to fetch"
**Solution**: 
1. Make sure the Spring Boot app is running
2. Check if port 8080 is available
3. Verify MySQL is running

### Problem: "No products found" but server is running
**Solution**: 
1. Check MySQL connection in `application.properties`
2. Verify database credentials (username: root, password: root)
3. The DataInitializer should create sample products automatically

### Problem: Database connection errors
**Solution**:
1. Create MySQL database: `CREATE DATABASE secondecomwebsite;`
2. Update credentials in `src/main/resources/application.properties`
3. Make sure MySQL is running on port 3306

## Database Configuration
Current settings in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/secondecomwebsite?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
```

## What Happens on Startup
1. Spring Boot connects to MySQL
2. Creates database tables automatically (JPA/Hibernate)
3. DataInitializer runs and creates:
   - 9 product categories
   - 8 sample products
4. Server starts on port 8080
5. API endpoints become available

## API Endpoints
- Health: `GET /api/health`
- Products: `GET /api/products`
- Categories: `GET /api/categories`
- Debug page: `http://localhost:8080/debug.html`

## Next Steps
Once the server is running:
1. Visit http://localhost:8080 - should show products
2. Visit http://localhost:8080/admin.html - to add more products
3. Test all functionality

Need help? Check the debug page at http://localhost:8080/debug.html for detailed diagnostics.