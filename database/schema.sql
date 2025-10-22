-- 데이터베이스 시험 시스템 PostgreSQL 스키마

-- 확장 프로그램 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 제출 데이터 테이블
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    submission_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 시험 결과 테이블
CREATE TABLE IF NOT EXISTS exam_results (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    total_score INTEGER NOT NULL DEFAULT 0,
    percentage INTEGER NOT NULL DEFAULT 0,
    category_scores JSONB NOT NULL DEFAULT '{}',
    answers JSONB NOT NULL DEFAULT '{}',
    grading_details JSONB NOT NULL DEFAULT '[]',
    time_spent INTEGER NOT NULL DEFAULT 0, -- 초 단위
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 학생별 시도 차수 유니크 제약
    UNIQUE(student_name, attempt_number)
);

-- 시험 시도 횟수 관리 테이블
CREATE TABLE IF NOT EXISTS exam_attempts (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL UNIQUE,
    total_attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_submissions_submission_time ON submissions(submission_time DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_name ON submissions(name);
CREATE INDEX IF NOT EXISTS idx_exam_results_student_name ON exam_results(student_name);
CREATE INDEX IF NOT EXISTS idx_exam_results_submitted_at ON exam_results(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_name ON exam_attempts(student_name);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
DROP TRIGGER IF EXISTS update_exam_attempts_updated_at ON exam_attempts;
CREATE TRIGGER update_exam_attempts_updated_at
    BEFORE UPDATE ON exam_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 뷰 생성: 학생별 최신 시험 결과
CREATE OR REPLACE VIEW latest_exam_results AS
SELECT DISTINCT ON (student_name) 
    id,
    student_name,
    attempt_number,
    total_score,
    percentage,
    category_scores,
    time_spent,
    submitted_at
FROM exam_results 
ORDER BY student_name, attempt_number DESC;

-- 뷰 생성: 시험 통계
CREATE OR REPLACE VIEW exam_statistics AS
SELECT 
    COUNT(*) as total_exams,
    COUNT(DISTINCT student_name) as total_students,
    AVG(total_score) as avg_score,
    AVG(percentage) as avg_percentage,
    MAX(total_score) as max_score,
    MIN(total_score) as min_score,
    COUNT(CASE WHEN percentage >= 80 THEN 1 END) as high_scores,
    COUNT(CASE WHEN percentage >= 60 AND percentage < 80 THEN 1 END) as medium_scores,
    COUNT(CASE WHEN percentage < 60 THEN 1 END) as low_scores
FROM exam_results;

COMMENT ON TABLE submissions IS '파일 제출 데이터';
COMMENT ON TABLE exam_results IS '시험 결과 데이터';
COMMENT ON TABLE exam_attempts IS '학생별 시험 시도 횟수 관리';
COMMENT ON VIEW latest_exam_results IS '학생별 최신 시험 결과';
COMMENT ON VIEW exam_statistics IS '전체 시험 통계';