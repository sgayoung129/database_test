-- 데이터베이스 시험 시스템 초기화 스크립트
-- PostgreSQL 데이터베이스 및 사용자 생성

-- 1. 데이터베이스 생성 (superuser 권한 필요)
-- CREATE DATABASE database_test;

-- 2. 사용자 생성 및 권한 부여 (superuser 권한 필요)
-- CREATE USER database_test_user WITH PASSWORD 'your_secure_password_here';
-- GRANT ALL PRIVILEGES ON DATABASE database_test TO database_test_user;

-- 3. 연결 후 스키마 적용
-- \c database_test;
-- \i schema.sql;

-- 개발용 초기 데이터 (옵션)
-- 다음 명령으로 샘플 데이터를 추가할 수 있습니다:

/*
-- 샘플 학생 시도 횟수 데이터
INSERT INTO exam_attempts (student_name, total_attempts) VALUES 
('홍길동', 1),
('김철수', 2),
('이영희', 0);

-- 샘플 제출 데이터
INSERT INTO submissions (name, phone, email, original_filename) VALUES 
('홍길동', '010-1234-5678', 'hong@example.com', 'homework.pdf'),
('김철수', '010-2345-6789', 'kim@example.com', 'project.zip');

-- 샘플 시험 결과 데이터
INSERT INTO exam_results (
    student_name, 
    attempt_number, 
    total_score, 
    percentage, 
    category_scores, 
    answers, 
    grading_details,
    time_spent
) VALUES (
    '홍길동',
    1,
    85,
    85,
    '{"A형": {"score": 18, "total": 20}, "B형": {"score": 35, "total": 40}, "C형": {"score": 32, "total": 40}}',
    '{"0": "D", "1": "B", "2": "C"}',
    '[{"questionId": 1, "type": "multiple", "score": 2, "maxPoints": 2, "feedback": "정답"}]',
    3300
);
*/

-- 유용한 관리 쿼리들
/*
-- 전체 시험 통계 조회
SELECT * FROM exam_statistics;

-- 학생별 최신 시험 결과 조회
SELECT * FROM latest_exam_results;

-- 특정 학생의 모든 시도 조회
SELECT * FROM exam_results WHERE student_name = '홍길동' ORDER BY attempt_number;

-- 시도 횟수별 통계
SELECT 
    total_attempts,
    COUNT(*) as student_count
FROM exam_attempts 
GROUP BY total_attempts 
ORDER BY total_attempts;

-- 점수 분포 조회
SELECT 
    CASE 
        WHEN percentage >= 90 THEN 'A (90-100)'
        WHEN percentage >= 80 THEN 'B (80-89)'
        WHEN percentage >= 70 THEN 'C (70-79)'
        WHEN percentage >= 60 THEN 'D (60-69)'
        ELSE 'F (0-59)'
    END as grade,
    COUNT(*) as count
FROM exam_results
GROUP BY 
    CASE 
        WHEN percentage >= 90 THEN 'A (90-100)'
        WHEN percentage >= 80 THEN 'B (80-89)'
        WHEN percentage >= 70 THEN 'C (70-79)'
        WHEN percentage >= 60 THEN 'D (60-69)'
        ELSE 'F (0-59)'
    END
ORDER BY grade;

-- 데이터 정리 (개발용)
-- DELETE FROM exam_results;
-- DELETE FROM exam_attempts;
-- DELETE FROM submissions;
*/