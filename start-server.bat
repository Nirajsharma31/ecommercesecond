@echo off
echo Starting E-Shop Server...
echo.
echo Make sure MySQL is running before starting the server!
echo.
pause
echo.
echo Starting Spring Boot application...
echo Look for "Started SecondEcomWeNirajApplication" message
echo.
mvnw.cmd spring-boot:run
pause