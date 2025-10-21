-- 데이터베이스 시험 시스템 스키마

-- 학생 시험 결과 테이블
CREATE TABLE exam_results (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    attempt_number INTEGER NOT NULL CHECK (attempt_number >= 1 AND attempt_number <= 3),
    total_score INTEGER NOT NULL DEFAULT 0,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    a_type_score INTEGER NOT NULL DEFAULT 0,
    a_type_total INTEGER NOT NULL DEFAULT 20,
    b_type_score INTEGER NOT NULL DEFAULT 0,
    b_type_total INTEGER NOT NULL DEFAULT 40,
    c_type_score INTEGER NOT NULL DEFAULT 0,
    c_type_total INTEGER NOT NULL DEFAULT 40,
    time_spent INTEGER NOT NULL DEFAULT 0, -- 초 단위
    answers JSONB NOT NULL DEFAULT '{}', -- 답안 데이터 JSON 형태
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_name, attempt_number)
);

-- 학생 시도 횟수 관리 테이블
CREATE TABLE student_attempts (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(100) UNIQUE NOT NULL,
    current_attempts INTEGER NOT NULL DEFAULT 0 CHECK (current_attempts >= 0 AND current_attempts <= 3),
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 시험 제출 파일 테이블 (기존 유지)
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    filename VARCHAR(255),
    original_filename VARCHAR(255),
    file_size INTEGER,
    submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_exam_results_student ON exam_results(student_name);
CREATE INDEX idx_exam_results_attempt ON exam_results(student_name, attempt_number);
CREATE INDEX idx_student_attempts_name ON student_attempts(student_name);
CREATE INDEX idx_submissions_time ON submissions(submission_time);

-- 샘플 데이터 (테스트용)
INSERT INTO student_attempts (student_name, current_attempts) VALUES 
('테스트학생1', 0),
('테스트학생2', 1),
('테스트학생3', 2);