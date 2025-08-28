Write-Host "Starting E-Shop Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Make sure MySQL is running before starting the server!" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"
Write-Host ""
Write-Host "Starting Spring Boot application..." -ForegroundColor Green
Write-Host "Look for 'Started SecondEcomWeNirajApplication' message" -ForegroundColor Cyan
Write-Host ""
./mvnw.cmd spring-boot:run