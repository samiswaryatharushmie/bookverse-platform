@echo off
echo Starting Bookmarq Application...
echo.
echo Starting Database check... (Ensure SQL Server is running!)
echo.

echo Starting Backend (Spring Boot)...
start "Bookmarq Backend" cmd /k "cd backend && .\mvnw.cmd spring-boot:run"

echo Starting Frontend (React + Vite)...
start "Bookmarq Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting up in separate windows!
echo - The backend will be available at http://localhost:8080
echo - The frontend will be available at http://localhost:5173
echo.
pause
