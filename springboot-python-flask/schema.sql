-- CREATE DATABASE IF NOT EXISTS skill_gap_db;
-- USE skill_gap_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analyses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    jd_text TEXT NOT NULL,
    resume_text TEXT NOT NULL,
    readiness_score INT NOT NULL,
    summary TEXT,
    strengths TEXT, -- Stored as comma-separated values or JSON
    roadmap TEXT, -- Stored as JSON string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analyses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analysis_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    analysis_id BIGINT NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    status ENUM('matched', 'missing', 'partial') NOT NULL,
    priority INT NOT NULL,
    CONSTRAINT fk_skills_analysis FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_analyses_user ON analyses(user_id);
CREATE INDEX idx_skills_analysis ON analysis_skills(analysis_id);
