@echo off
echo ========================================
echo    E-Shop Application Startup
echo ========================================
echo.
echo Starting Spring Boot application...
echo Please wait for the application to fully start.
echo Look for "Started SecondEcomWeNirajApplication" message.
echo.
echo Once started, open your browser and go to:
echo http://localhost:8080
echo.
echo For debugging, visit:
echo http://localhost:8080/debug.html
echo.
echo Press Ctrl+C to stop the application.
echo ========================================
echo.

.\mvnw.cmd spring-boot:run

pause