# Bookmarq - Web Based Bookstore

This is a full-stack bookstore application built with Java Spring Boot and React (TypeScript).

## Prerequisites

Before running the application, ensure you have the following installed on your machine:
1. **Node.js** (v18 or higher)
2. **Java JDK** (v17 or higher)
3. **Microsoft SQL Server** (Running locally)

---

## 1. Starting the Database

The application connects to a local Microsoft SQL Server instance. Ensure your SQL Server service is running. 

By default, the backend expects the following database credentials (configured in `backend/src/main/resources/application-local.yml`):
- **Database Name**: `bookstore`
- **Username**: `sa`
- **Password**: `YourStr0ng!Pass`
- **Port**: `1433`

*Note: The database tables and seed data (books, users, roles) are automatically created via Flyway migrations when the backend starts up.*

---

## 2. Starting the Backend (Spring Boot)

The backend runs on **Port 8080**.

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Run the Spring Boot application using the Maven wrapper:
   - On **Windows**:
     ```bash
     .\mvnw.cmd spring-boot:run
     ```
   - On **Mac/Linux**:
     ```bash
     ./mvnw spring-boot:run
     ```

Once started, the backend API will be available at `http://localhost:8080`.

---

## 3. Starting the Frontend (React + Vite)

The frontend runs on **Port 5173**.

1. Open a **new, separate terminal** and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. If this is your very first time running the frontend, install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

Once started, you can access the website in your browser at `http://localhost:5173`.

---

## Default Accounts

The database comes pre-seeded with the following accounts you can use to log in:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@bookstore.com` | `Password1!` |
| **Staff** | `staff@bookstore.com` | `Password1!` |
| **Customer** | `john@example.com` | `Password1!` |
