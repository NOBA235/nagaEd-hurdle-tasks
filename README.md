# NagaEd Software Developer Hurdle Task — Full-Stack Application

[![Node.js](https://img.shields.io/badge/Node.js-v24.20.0-339933?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com)
[![Docker](https://img.shields.io/badge/Docker_Compose-Ready-2496ED?logo=docker)](https://www.docker.com)
[![Groq](https://img.shields.io/badge/Groq-Cloud_LLM-F55036)](https://console.groq.com)

A production-minded, integrated full-stack application built for the **NagaEd Software Developer Hurdle Task**. Features user registration, secure authentication, protected profile retrieval, an AI-powered username suggestion microservice, and multi-container Docker Compose orchestration.

---

## Candidate & Submission Details

- **Candidate Name**: `[Your Full Name]`
- **Email**: `[Your Email Address]`
- **Phone**: `[Your Phone Number]`
- **GitHub Repository**: [https://github.com/NOBA235/nagaEd-hurdle-tasks](https://github.com/NOBA235/nagaEd-hurdle-tasks)
- **Role**: Software Developer (Hurdle Task — Mid-Level)
- **Submission Form**: [Google Form Submission Link](https://forms.gle/5nXtuDKGrgqUCnx1A)
- **Submission Subject**: `[Your Full Name] — Software Developer Hurdle Task Submission`

---

## 1. System Architecture

The application connects four services in a unified monorepo:

![System Architecture](docs/architecture.png)

```text
                        ┌─────────────────────────────────────┐
                        │      Browser (User on Host)         │
                        └───────────────┬─────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │ :80 / :5173                │ :5000                      │ :8000
           ▼                            ▼                            ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│   frontend (Nginx)   │     │   backend (Node.js)  │     │ ai-service (FastAPI) │
│   Alpine Container   │     │   Alpine Container   │     │ Python Slim Container│
└──────────────────────┘     └──────────┬───────────┘     └──────────┬───────────┘
                                        │                            │
                                        │ Internal network:          │ HTTPS outbound:
                                        │ DB_HOST=mysql:3306         │ api.groq.com
                                        ▼                            ▼
                             ┌──────────────────────┐     ┌──────────────────────┐
                             │     mysql (8.0)      │     │      Groq Cloud      │
                             │  Persistent Volume   │     │   Language Models    │
                             └──────────────────────┘     └──────────────────────┘
```

### Service Map
| Service | Technology | Port (Host) | Internal DNS | Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **frontend** | React 19, Vite, Axios | `80` (or `5173`) | `frontend:80` | Client UI: Register, Login, Dashboard, AI Generator |
| **backend** | Node.js (ESM), Express 5 | `5000` | `backend:5000` | Core REST API: Auth, JWT, MySQL connection pool |
| **ai-service** | Python 3.13, FastAPI | `8000` | `ai-service:8000` | AI Microservice: Groq Cloud LLM username generation |
| **mysql** | MySQL Community 8.0 | `3306` | `mysql:3306` | Persistent Relational Storage (InnoDB, utf8mb4) |

---

## 2. Repository Structure

```text
nagaed-hurdle-task/
├── frontend/                     # Task 2: React 19 Frontend SPA
│   ├── src/
│   │   ├── components/           # Navbar, ProtectedRoute
│   │   ├── context/              # AuthContext.jsx (JWT session state)
│   │   ├── pages/                # RegisterPage, LoginPage, DashboardPage
│   │   ├── services/             # api.js (Axios interceptor), auth.service, ai.service
│   │   ├── App.jsx
│   │   ├── index.css             # Professional responsive theme
│   │   └── main.jsx
│   ├── Dockerfile                # Multi-stage Node builder & Nginx runner
│   ├── nginx.conf                # SPA routing & security headers
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
├── backend/                      # Task 1: Node.js / Express 5 REST API
│   ├── src/
│   │   ├── config/               # env.js (Zod validation), database.js (pool)
│   │   ├── controllers/          # auth.controller.js, users.controller.js
│   │   ├── middleware/           # authenticate.js, error-handler.js, not-found.js
│   │   ├── repositories/         # user.repository.js (parameterised SQL)
│   │   ├── routes/               # auth.routes.js, users.routes.js
│   │   ├── schemas/              # auth.schema.js (Zod request validation)
│   │   ├── services/             # auth.service.js, users.service.js
│   │   ├── utils/                # app-error.js, async-handler.js
│   │   ├── app.js                # Express app setup, CORS, Helmet
│   │   └── server.js             # HTTP listener & graceful shutdown
│   ├── sql/
│   │   └── schema.sql            # MySQL 8 DDL table definition
│   ├── tests/                    # Automated integration test suites
│   │   ├── auth.test.js          # Registration & Login test cases
│   │   └── users.test.js         # Protected profile & IDOR test cases
│   ├── Dockerfile                # Node 20 Alpine production container
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
├── ai-service/                   # Task 3: Python FastAPI AI Microservice
│   ├── app/
│   │   ├── core/                 # config.py (Pydantic settings)
│   │   ├── routes/               # suggestions.py, health.py
│   │   ├── schemas/              # suggestion.py (Pydantic models)
│   │   ├── services/             # groq_service.py (Groq client & fallback)
│   │   └── main.py               # FastAPI app, CORS, error handlers
│   ├── tests/
│   │   └── test_suggestions.py   # 7 Pytest cases with mocked Groq responses
│   ├── Dockerfile                # Python 3.13 slim container (non-root user)
│   ├── .dockerignore
│   ├── .env.example
│   ├── pytest.ini
│   └── requirements.txt
├── database/                     # Task 4: Database Provisioning
│   └── init.sql                  # Auto-mounted to /docker-entrypoint-initdb.d
├── docs/
│   ├── architecture.png          # High-resolution architecture diagram
│   └── generate_diagram.py       # Script used to generate architecture diagram
├── architecture.png              # Root copy of architecture diagram
├── docker-compose.yml            # Multi-container orchestration
├── .env.example                  # Root environment configuration template
├── .gitignore                    # Monorepo git exclusion rules
└── README.md                     # Master documentation
```

---

## 3. Quick Start (Docker Compose — Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Docker Engine 24+ & Docker Compose v2+)
- A free Groq Cloud API Key from [console.groq.com](https://console.groq.com)

### 1-Step Startup
In **Windows Command Prompt (`cmd.exe`)** from the project root:

```cmd
cd /d "F:\naged-hurdle tasks"
copy .env.example .env
```

Open `.env` in an editor and set your `GROQ_API_KEY`:
```dotenv
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```

Launch the entire containerized application:
```cmd
docker compose up --build
```

### Accessing the Services
- **React Frontend**: [http://localhost](http://localhost) (or [http://localhost:5173](http://localhost:5173))
- **Express Backend API Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **FastAPI Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **FastAPI Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 4. Local Development (Native Windows CMD — Without Docker)

If Docker is not installed on your host machine, you can run all services natively in parallel:

### Prerequisites
- Node.js `v20.0.0` or later (`node -v`)
- Python `3.11` or later (`python --version`)
- MySQL 8 Server running on `localhost:3306`

---

### Step 1: Database Initialization
1. Ensure your local MySQL 8 service is running (`net start MySQL80`).
2. Apply the database schema from **Command Prompt (`cmd.exe`)**:
   ```cmd
   cd /d "F:\naged-hurdle tasks\backend"
   mysql -u root -p < sql\schema.sql
   ```
   *(Or run via Node without needing `mysql.exe` in PATH)*:
   ```cmd
   node -e "import fs from 'node:fs'; import mysql from 'mysql2/promise'; import { env } from './src/config/env.js'; const sql = fs.readFileSync('./sql/schema.sql', 'utf8'); const conn = await mysql.createConnection({ host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER, password: env.DB_PASSWORD, multipleStatements: true }); await conn.query(sql); console.log('Schema applied successfully!'); await conn.end();"
   ```

---

### Step 2: Start Backend API (Terminal 1)
```cmd
cd /d "F:\naged-hurdle tasks\backend"
npm install
npm start
```
*Backend runs on `http://localhost:5000`.*

---

### Step 3: Start AI Microservice (Terminal 2)
```cmd
cd /d "F:\naged-hurdle tasks\ai-service"
py -3.13 -m venv .venv
.venv\Scripts\pip.exe install -r requirements.txt
.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```
*FastAPI runs on `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.*

---

### Step 4: Start Frontend SPA (Terminal 3)
```cmd
cd /d "F:\naged-hurdle tasks\frontend"
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 5. API Reference & Documentation

All API responses follow a consistent, predictable JSON schema.

### Success Response Format:
```json
{
  "success": true,
  "message": "Descriptive success message",
  "data": { ... }
}
```

### Error Response Format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable explanation",
    "details": []
  }
}
```

---

### A. `POST /api/register`
Creates a new user record with bcrypt password hashing.

- **URL**: `/api/register`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "noba",
    "email": "noba@example.com",
    "password": "StrongPassword123!",
    "address": "Kohima, Nagaland"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "id": 1,
      "username": "noba",
      "email": "noba@example.com",
      "address": "Kohima, Nagaland"
    }
  }
  ```
- **Error Responses**:
  - `400 VALIDATION_ERROR`: Missing fields, short password (<8 chars), or malformed email.
  - `409 EMAIL_ALREADY_EXISTS`: Duplicate email registration attempt.

---

### B. `POST /api/login`
Authenticates a user and issues a signed JSON Web Token (JWT).

- **URL**: `/api/login`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "noba@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "username": "noba",
        "email": "noba@example.com",
        "address": "Kohima, Nagaland"
      }
    }
  }
  ```
- **Error Responses**:
  - `401 INVALID_CREDENTIALS`: Password mismatch or email not found (returns a generic error without revealing email existence).

---

### C. `GET /api/users/:id`
Protected route that retrieves a user's profile record.

- **URL**: `/api/users/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "id": 1,
      "username": "noba",
      "email": "noba@example.com",
      "address": "Kohima, Nagaland"
    }
  }
  ```
- **Error Responses**:
  - `401 UNAUTHORIZED`: Missing or invalid Bearer authorization header.
  - `401 TOKEN_EXPIRED`: JWT token has passed its expiration time.
  - `403 FORBIDDEN`: Authenticated user attempts to access another user's profile ID (IDOR prevention).
  - `404 USER_NOT_FOUND`: User ID does not exist in MySQL.

---

### D. `POST /api/suggest-username` (FastAPI AI Microservice)
Generates 3 creative username suggestions based on user interests using Groq Cloud LLM.

- **URL**: `http://localhost:8000/api/suggest-username`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "interests": ["coding", "music", "gaming"]
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "suggestions": [
      "CodeMelody",
      "PixelRhythm",
      "ByteExplorer"
    ]
  }
  ```
- **Error Responses**:
  - `400 VALIDATION_ERROR`: Empty interests array, non-string items, or whitespace-only strings.
  - `429 RATE_LIMIT_EXCEEDED`: Groq API rate limit reached.
  - `503 GROQ_KEY_UNCONFIGURED`: Microservice started without a valid `GROQ_API_KEY`.

---

## 6. Automated Testing

### Backend Test Suite (Node.js Native Test Runner + Supertest)
Runs 22 comprehensive integration test cases:
```cmd
cd /d "F:\naged-hurdle tasks\backend"
npm test
```
*Tests validation errors, bcrypt hashing, JWT issuance, token expiration, IDOR authorization rules, and error formatting.*

---

### AI Microservice Test Suite (Pytest + TestClient)
Runs 7 test cases with mocked Groq responses (zero paid API calls):
```cmd
cd /d "F:\naged-hurdle tasks\ai-service"
.venv\Scripts\python.exe -m pytest -v
```
*Tests `/health`, successful username generation, input validation, rate limiting, and fallback generator.*

---

### Frontend Build Verification (Vite)
Verifies clean compilation, asset bundling, and TypeScript/JSX integrity:
```cmd
cd /d "F:\naged-hurdle tasks\frontend"
npm run build
```

---

## 7. Key Engineering & Security Highlights

1. **SQL Injection Prevention**: All MySQL queries in `backend/src/repositories/` use parameterised prepared statements (`pool.execute(..., [params])`). User input is never concatenated into SQL strings.
2. **Password Security**: Passwords are hashed using `bcrypt` with **12 salt rounds** before storage. Password hashes are strictly omitted from `SELECT` query projections and API response DTOs.
3. **User Enumeration & Timing Mitigation**: During login, if an email is not found, `bcrypt.compare()` is executed against a dummy hash to prevent timing side-channel attacks.
4. **Authorisation & IDOR Protection**: `GET /api/users/:id` validates that `req.user.id === requestedId`. Cross-user access returns `HTTP 403 Forbidden`.
5. **Fail-Fast Configuration**: Environment variables are validated on startup using Zod in Express and Pydantic Settings in FastAPI. Invalid configurations abort the boot process with clear diagnostic messages.
6. **Container Security**: Containers run under unprivileged non-root users (`USER node` in backend, `USER appuser` in ai-service) with multi-stage builds.
7. **Service Isolation**: The React Dashboard isolates AI microservice calls. If the AI service is offline, the user's dashboard and authenticated session remain fully functional.

---

## 8. Troubleshooting & FAQ

| Problem | Cause | Resolution |
| :--- | :--- | :--- |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL server is not running locally. | Start the MySQL 8 service with `net start MySQL80` or use `docker compose up`. |
| `GROQ_KEY_UNCONFIGURED (503)` | `GROQ_API_KEY` in `ai-service/.env` is missing or placeholder. | Add a valid key from [console.groq.com](https://console.groq.com). |
| `Port 5000 is already in use` | Another process is occupying port 5000. | Run `netstat -ano \| findstr :5000` to find the PID, or change `PORT` in `.env`. |
| PowerShell script execution error | Windows PowerShell ExecutionPolicy is set to `Restricted`. | Run commands in **Command Prompt (`cmd.exe`)** or execute `npm.cmd`. |

---

## 9. Final Submission Checklist

- [x] **Task 1 (Node.js API)**: Clean layered architecture, validation, bcrypt hashing, JWT auth, MySQL pooling, automated tests.
- [x] **Task 2 (React Frontend)**: Registration, Login, Dashboard profile retrieval, dedicated API service layer, responsive styling.
- [x] **Task 3 (FastAPI AI Service)**: `/api/suggest-username` with Groq Cloud LLM, Pydantic validation, `/health`, `/docs`, unit tests.
- [x] **Task 4 (Docker Compose)**: Multi-stage Dockerfiles, non-root users, persistent MySQL storage, health checks, root `.env.example`.
- [x] **Architecture Diagram**: High-resolution PNG generated and saved at [`docs/architecture.png`](docs/architecture.png) and [`architecture.png`](architecture.png).
- [x] **Git Cleanliness**: Monorepo `.gitignore` audits pass; zero `.env` secrets, virtual environments, or `node_modules` committed.
- [x] **Public Repository**: Code committed and pushed to [https://github.com/NOBA235/nagaEd-hurdle-tasks](https://github.com/NOBA235/nagaEd-hurdle-tasks).

### Submit via Google Form:
- **Link**: [https://forms.gle/5nXtuDKGrgqUCnx1A](https://forms.gle/5nXtuDKGrgqUCnx1A)
- **Subject**: `[Your Full Name] — Software Developer Hurdle Task Submission`
- **Include**: GitHub repository link or ZIP file, and architecture diagram.
