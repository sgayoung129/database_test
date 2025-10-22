const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// PostgreSQL 연결 설정
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 
        `postgresql://${process.env.DB_USER || 'database_test_user'}:${process.env.DB_PASSWORD}@${process.env.DB_HOST || 'dpg-d3rstnggjchc73e5tbeg-a.singapore-postgres.render.com'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'database_test_db'}`,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// uploads 디렉토리 생성
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB 제한
    },
    fileFilter: function (req, file, cb) {
        // 이미지 및 문서 파일만 허용
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('허용되지 않는 파일 형식입니다.'));
        }
    }
});

// 데이터베이스 테이블 생성
async function initDatabase() {
    try {
        // schema.sql 파일의 내용을 실행
        const fs = require('fs');
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        
        if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await pool.query(schemaSql);
            console.log('데이터베이스 스키마가 성공적으로 적용되었습니다.');
        } else {
            // 스키마 파일이 없는 경우 기본 테이블 생성
            await createBasicTables();
        }
    } catch (error) {
        console.error('데이터베이스 초기화 오류:', error);
        // 스키마 파일 실행 실패 시 기본 테이블 생성
        await createBasicTables();
    }
}

async function createBasicTables() {
    try {
        // 제출 데이터 테이블
        await pool.query(`
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
            )
        `);
        
        // 시험 결과 테이블
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_results (
                id SERIAL PRIMARY KEY,
                student_name VARCHAR(100) NOT NULL,
                attempt_number INTEGER NOT NULL DEFAULT 1,
                total_score INTEGER NOT NULL DEFAULT 0,
                percentage INTEGER NOT NULL DEFAULT 0,
                category_scores JSONB NOT NULL DEFAULT '{}',
                answers JSONB NOT NULL DEFAULT '{}',
                grading_details JSONB NOT NULL DEFAULT '[]',
                time_spent INTEGER NOT NULL DEFAULT 0,
                submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_name, attempt_number)
            )
        `);
        
        // 시험 시도 횟수 관리 테이블
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_attempts (
                id SERIAL PRIMARY KEY,
                student_name VARCHAR(100) NOT NULL UNIQUE,
                total_attempts INTEGER NOT NULL DEFAULT 0,
                max_attempts INTEGER NOT NULL DEFAULT 3,
                last_attempt_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('기본 데이터베이스 테이블이 성공적으로 생성되었습니다.');
    } catch (error) {
        console.error('기본 테이블 생성 오류:', error);
    }
}

// 라우트 설정
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 모든 HTML 페이지 라우트
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/exam.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'exam.html'));
});

app.get('/results.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'results.html'));
});

// 제출 처리
app.post('/submit', upload.single('file'), async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        const file = req.file;

        // 입력 검증
        if (!name || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: '이름, 전화번호, 이메일은 필수 입력 항목입니다.'
            });
        }

        // 데이터베이스에 저장
        const query = `
            INSERT INTO submissions (name, phone, email, original_filename, file_path, file_size, mime_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;
        
        const values = [
            name,
            phone,
            email,
            file ? file.originalname : null,
            file ? file.filename : null,
            file ? file.size : null,
            file ? file.mimetype : null
        ];

        const result = await pool.query(query, values);
        
        res.json({
            success: true,
            message: '제출이 완료되었습니다.',
            submissionId: result.rows[0].id
        });

    } catch (error) {
        console.error('제출 처리 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 모든 제출 조회 (관리자용)
app.get('/admin/submissions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                name, 
                phone, 
                email, 
                original_filename, 
                file_size,
                mime_type,
                submission_time
            FROM submissions
            ORDER BY submission_time DESC
        `);
        
        res.json({
            success: true,
            submissions: result.rows
        });
    } catch (error) {
        console.error('제출 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '데이터 조회 중 오류가 발생했습니다.'
        });
    }
});

// 시험 시도 횟수 확인
app.post('/api/check-attempts', async (req, res) => {
    try {
        const { student } = req.body;
        
        if (!student) {
            return res.status(400).json({
                success: false,
                message: '학생 이름이 필요합니다.'
            });
        }
        
        const result = await pool.query(
            'SELECT total_attempts FROM exam_attempts WHERE student_name = $1',
            [student]
        );
        
        const currentAttempt = result.rows.length > 0 ? result.rows[0].total_attempts : 0;
        
        res.json({
            success: true,
            currentAttempt: currentAttempt
        });
    } catch (error) {
        console.error('시도 횟수 확인 오류:', error);
        res.status(500).json({
            success: false,
            message: '시도 횟수 확인 중 오류가 발생했습니다.'
        });
    }
});

// 시험 결과 저장
app.post('/api/save-exam-result', async (req, res) => {
    try {
        const { 
            student, 
            attempt, 
            score, 
            percentage, 
            categoryScores, 
            answers,
            gradingDetails,
            timeSpent 
        } = req.body;

        // 입력 검증
        if (!student || !answers || score === undefined) {
            return res.status(400).json({
                success: false,
                message: '필수 데이터가 누락되었습니다.'
            });
        }

        // 시도 횟수 업데이트
        await pool.query(`
            INSERT INTO exam_attempts (student_name, total_attempts, last_attempt_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (student_name) 
            DO UPDATE SET 
                total_attempts = GREATEST(exam_attempts.total_attempts, $2),
                last_attempt_at = CURRENT_TIMESTAMP
        `, [student, attempt]);

        // 시험 결과 저장
        const examResult = await pool.query(`
            INSERT INTO exam_results (
                student_name, attempt_number, total_score, percentage,
                category_scores, answers, grading_details, time_spent
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (student_name, attempt_number)
            DO UPDATE SET
                total_score = $3,
                percentage = $4,
                category_scores = $5,
                answers = $6,
                grading_details = $7,
                time_spent = $8,
                submitted_at = CURRENT_TIMESTAMP
            RETURNING id
        `, [
            student,
            attempt,
            score,
            percentage,
            JSON.stringify(categoryScores),
            JSON.stringify(answers),
            JSON.stringify(gradingDetails),
            timeSpent
        ]);

        res.json({
            success: true,
            message: '시험 결과가 저장되었습니다.',
            examId: examResult.rows[0].id
        });

    } catch (error) {
        console.error('시험 결과 저장 오류:', error);
        res.status(500).json({
            success: false,
            message: '시험 결과 저장 중 오류가 발생했습니다.'
        });
    }
});

// 모든 시험 결과 조회 (관리자용)
// 시험 결과 조회 (관리자용 - 전체)
app.get('/api/exam-results', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                student_name,
                attempt_number,
                total_score,
                percentage,
                category_scores,
                time_spent,
                answers,
                grading_details,
                submitted_at
            FROM exam_results
            ORDER BY student_name, attempt_number
        `);
        
        // JSON 문자열을 객체로 변환하고 필드명 매핑
        const results = result.rows.map(row => ({
            student: row.student_name,
            attempt: row.attempt_number,
            score: row.total_score,
            percentage: row.percentage,
            timeSpent: row.time_spent,
            timestamp: row.submitted_at,
            categoryScores: typeof row.category_scores === 'string' 
                ? JSON.parse(row.category_scores) 
                : row.category_scores,
            answers: typeof row.answers === 'string' 
                ? JSON.parse(row.answers) 
                : row.answers,
            gradingDetails: typeof row.grading_details === 'string' 
                ? JSON.parse(row.grading_details) 
                : row.grading_details
        }));
        
        res.json({
            success: true,
            results: results
        });
    } catch (error) {
        console.error('시험 결과 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '시험 결과 조회 중 오류가 발생했습니다.'
        });
    }
});

// 학생 개인 시험 결과 조회
app.post('/api/student-results', async (req, res) => {
    try {
        const { student } = req.body;
        
        if (!student) {
            return res.status(400).json({
                success: false,
                message: '학생 이름이 필요합니다.'
            });
        }
        
        const result = await pool.query(`
            SELECT 
                student_name,
                attempt_number,
                total_score,
                percentage,
                category_scores,
                time_spent,
                answers,
                grading_details,
                submitted_at
            FROM exam_results
            WHERE student_name = $1
            ORDER BY attempt_number
        `, [student]);
        
        // JSON 문자열을 객체로 변환하고 필드명 매핑
        const results = result.rows.map(row => ({
            student: row.student_name,
            attempt: row.attempt_number,
            score: row.total_score,
            percentage: row.percentage,
            timeSpent: row.time_spent,
            timestamp: row.submitted_at,
            categoryScores: typeof row.category_scores === 'string' 
                ? JSON.parse(row.category_scores) 
                : row.category_scores,
            answers: typeof row.answers === 'string' 
                ? JSON.parse(row.answers) 
                : row.answers,
            gradingDetails: typeof row.grading_details === 'string' 
                ? JSON.parse(row.grading_details) 
                : row.grading_details
        }));
        
        res.json({
            success: true,
            results: results
        });
    } catch (error) {
        console.error('학생 결과 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '시험 결과 조회 중 오류가 발생했습니다.'
        });
    }
});

// 시험 상세 결과 조회
app.post('/api/exam-detail', async (req, res) => {
    try {
        const { student, attempt } = req.body;
        
        if (!student || !attempt) {
            return res.status(400).json({
                success: false,
                message: '학생 이름과 시도 차수가 필요합니다.'
            });
        }
        
        const result = await pool.query(`
            SELECT 
                student_name,
                attempt_number,
                total_score,
                percentage,
                category_scores,
                answers,
                grading_details,
                time_spent,
                submitted_at
            FROM exam_results
            WHERE student_name = $1 AND attempt_number = $2
        `, [student, attempt]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: '해당 시험 결과를 찾을 수 없습니다.'
            });
        }
        
        const row = result.rows[0];
        const examResult = {
            student: row.student_name,
            attempt: row.attempt_number,
            total_score: row.total_score,
            percentage: row.percentage,
            time_spent: row.time_spent,
            submitted_at: row.submitted_at,
            categoryScores: typeof row.category_scores === 'string' 
                ? JSON.parse(row.category_scores) 
                : row.category_scores,
            answers: typeof row.answers === 'string' 
                ? JSON.parse(row.answers) 
                : row.answers,
            gradingDetails: typeof row.grading_details === 'string' 
                ? JSON.parse(row.grading_details) 
                : row.grading_details
        };
        
        res.json({
            success: true,
            result: examResult
        });
    } catch (error) {
        console.error('시험 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '시험 상세 조회 중 오류가 발생했습니다.'
        });
    }
});

// 모든 시험 데이터 초기화 (관리자용)
app.post('/api/reset-exam-data', async (req, res) => {
    try {
        await pool.query('DELETE FROM exam_attempts');
        await pool.query('DELETE FROM exam_results');
        
        res.json({
            success: true,
            message: '모든 시도 횟수와 시험 결과가 초기화되었습니다.'
        });
    } catch (error) {
        console.error('데이터 초기화 오류:', error);
        res.status(500).json({
            success: false,
            message: '데이터 초기화 중 오류가 발생했습니다.'
        });
    }
});

// 파일 다운로드
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({
            success: false,
            message: '파일을 찾을 수 없습니다.'
        });
    }
});

// 전역 에러 핸들러
app.use((error, req, res, next) => {
    console.error('서버 에러:', error);
    res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
    });
});

// 404 핸들러
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(PORT, async () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📱 웹사이트: ${process.env.NODE_ENV === 'production' ? 'https://database-test-h7d0.onrender.com' : `http://localhost:${PORT}`}`);
    console.log(`👨‍💼 관리자 페이지: ${process.env.NODE_ENV === 'production' ? 'https://database-test-h7d0.onrender.com/admin.html' : `http://localhost:${PORT}/admin.html`}`);
    await initDatabase();
});

module.exports = app;