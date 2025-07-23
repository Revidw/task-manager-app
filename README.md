# Task Manager API

A secure REST API built with **Node.js, Express, and PostgreSQL** for user authentication and task management.  
Implements **JWT authentication**, **bcrypt password hashing**, and security features like **Helmet** and **CORS**.

---

## **Features**
- User registration and login with JWT authentication.
- Password hashing using **bcrypt**.
- CRUD operations for tasks, scoped to each authenticated user.
- Profile management (update user info).
- Security via **Helmet**, **CORS**, and proper error handling.

---

## **Tech Stack**
- **Node.js / Express**
- **PostgreSQL** (with `pg` for queries)
- **bcryptjs** for password hashing
- **JWT** for authentication
- **Helmet & CORS** for security
- **dotenv** for environment variables

---

## **Installation**

```bash
# Clone repository
git clone https://github.com/your-username/task-manager-api.git
cd task-manager-api

# Install dependencies
npm install

# Create .env file
PORT=3000
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgres://user:password@localhost:5432/taskdb

# Run server
npm run dev
```

---

## **API Endpoints**

### **Authentication**
#### **Register**
```
POST /register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "token": "jwt_token_here"
}
```

#### **Login**
```
POST /login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### **User**
#### **Get Profile**
```
GET /profile
```
**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### **Update Profile**
```
PUT /update
```
**Headers:**
```
Authorization: Bearer <jwt_token>
```
**Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "password": "newPassword123"
}
```

---

### **Tasks**
#### **Create Task**
```
POST /tasks
```
**Headers:**
```
Authorization: Bearer <jwt_token>
```
**Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, and bread"
}
```

#### **Get All Tasks**
```
GET /tasks
```
**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### **Update Task**
```
PUT /tasks/:id
```
**Headers:**
```
Authorization: Bearer <jwt_token>
```
**Body:**
```json
{
  "title": "Go Shopping",
  "description": "Buy milk and bread"
}
```

#### **Delete Task**
```
DELETE /tasks/:id
```
**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

## **Database Schema**

### **Users Table**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);
```

### **Tasks Table**
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INT REFERENCES users(id) ON DELETE CASCADE
);
```

---

## **License**
MIT License
