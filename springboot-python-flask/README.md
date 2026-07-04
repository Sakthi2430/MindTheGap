# Skill Gap Analysis Agent — Production Microservices Reference

This directory contains the production-grade, multi-container Dockerized implementation of the **Skill Gap Analysis Agent** utilizing:
- **Spring Boot 3** (Java 17, JPA, Spring Security + JWT, orchestrator)
- **Python 3.11 + Flask** (ML parsing, embeddings, local Chroma DB, Gemini SDK)
- **MySQL 8** (analyses, users, and skill tables)
- **Nginx** (reverse proxy routing `/api/*` to backend and `/` to React)

---

## 🏗️ Architecture Design & Flow
1. **React Frontend (Port 5174)**: The user interacts with a responsive dashboard where they upload their resume and paste the target job description. It sends HTTP requests through Nginx.
2. **Nginx Reverse Proxy (Port 80)**: Serves static React assets and forwards `/api/*` requests to the Spring Boot backend.
3. **Spring Boot Orchestrator (Port 8081)**: Manages User Auth, stores results in MySQL, tracks user history, and calls the Python microservice for heavy NLP/AI computation.
4. **Flask ML Service (Port 5001)**: Leverages `sentence-transformers` locally to generate embeddings, indexes skill profiles in **Chroma DB**, compares candidate profiles semantically, and prompts **Google Gemini** with structured schemas.

---

## 🚀 Steps to Run on Windows + Docker Desktop (WSL2)

### 1. Prerequisites
- **Docker Desktop**: Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
- **WSL2 Enabled**: Ensure WSL2 is selected as the default Docker backend (Settings > General > Use the WSL 2 based engine).
- **Maven & Java 17** (Only if building Spring Boot outside of Docker for development).

### 2. Configure Environment Variables
Create a `.env` file in this directory (adjacent to `docker-compose.yml`):
```env
# Your actual Gemini API key for ML microservice LLM calls
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Secure password for the MySQL database
MYSQL_ROOT_PASSWORD="SuperSecretPassword123"

# Secret key used for signing Spring Boot JSON Web Tokens
JWT_SECRET="YourCustomSecureJwtSigningKeyStringGoesHere"
```

### 3. Bootstrap and Build Images
Open **PowerShell** or **Git Bash** in this folder and execute:
```bash
docker-compose up --build -d
```
This command will:
1. Initialize the `mysql` service and execute `schema.sql` to initialize tables.
2. Build the `ml-service` (downloads `sentence-transformers` and sets up requirements).
3. Compile the `spring-backend` using a Maven multi-stage container.
4. Build the `react-frontend` static production build and load it into an Alpine Nginx container.
5. Launch the outer `nginx` load balancer routing traffic under Port 80.

### 4. Verify Services
To verify that everything booted successfully, run:
```bash
docker-compose ps
```
You can also inspect container logs:
```bash
docker-compose logs -f spring-backend
docker-compose logs -f ml-service
```

### 5. Accessing the Application
- **Frontend Dashboard**: Open `http://localhost` (mapped via outer Nginx) or `http://localhost:5174` (direct React build).
- **Backend API**: Accessible under `http://localhost/api/` or `http://localhost:8081`.
- **Database (MySQL)**: Accessible at `localhost:3307` using root credentials and the password defined in `.env`.
