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
        // 기존 submissions 테이블
        await pool.query(`
            CREATE TABLE IF NOT EXISTS submissions (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(100) NOT NULL,
                file_path VARCHAR(255),
                original_filename VARCHAR(255),
                submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 시험 결과 테이블
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exam_results (
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
                time_spent INTEGER NOT NULL DEFAULT 0,
                answers JSONB NOT NULL DEFAULT '{}',
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_name, attempt_number)
            )
        `);
        
        // 학생 시도 횟수 테이블
        await pool.query(`
            CREATE TABLE IF NOT EXISTS student_attempts (
                id SERIAL PRIMARY KEY,
                student_name VARCHAR(100) UNIQUE NOT NULL,
                current_attempts INTEGER NOT NULL DEFAULT 0 CHECK (current_attempts >= 0 AND current_attempts <= 3),
                last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('데이터베이스 테이블이 성공적으로 생성되었습니다.');
    } catch (error) {
        console.error('데이터베이스 초기화 오류:', error);
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
            INSERT INTO submissions (name, phone, email, file_path, original_filename)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;
        
        const values = [
            name,
            phone,
            email,
            file ? file.filename : null,
            file ? file.originalname : null
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
            SELECT id, name, phone, email, original_filename, submission_time
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

// 학생 시도 횟수 확인
app.get('/api/student-attempts/:studentName', async (req, res) => {
    try {
        const { studentName } = req.params;
        
        const result = await pool.query(
            'SELECT current_attempts FROM student_attempts WHERE student_name = $1',
            [studentName]
        );
        
        const currentAttempts = result.rows.length > 0 ? result.rows[0].current_attempts : 0;
        
        res.json({
            success: true,
            currentAttempts: currentAttempts,
            canTakeExam: currentAttempts < 3
        });
    } catch (error) {
        console.error('시도 횟수 확인 오류:', error);
        res.status(500).json({
            success: false,
            message: '시도 횟수 확인 중 오류가 발생했습니다.'
        });
    }
});

// 시험 결과 제출
app.post('/api/submit-exam', async (req, res) => {
    try {
        const { 
            studentName, 
            answers, 
            totalScore, 
            percentage, 
            categoryScores, 
            timeSpent 
        } = req.body;

        // 입력 검증
        if (!studentName || !answers || totalScore === undefined) {
            return res.status(400).json({
                success: false,
                message: '필수 데이터가 누락되었습니다.'
            });
        }

        // 현재 시도 횟수 확인 및 업데이트
        let currentAttempts = 0;
        
        const attemptResult = await pool.query(
            'SELECT current_attempts FROM student_attempts WHERE student_name = $1',
            [studentName]
        );
        
        if (attemptResult.rows.length > 0) {
            currentAttempts = attemptResult.rows[0].current_attempts;
            // 시도 횟수 증가
            await pool.query(
                'UPDATE student_attempts SET current_attempts = $1, last_attempt_at = CURRENT_TIMESTAMP WHERE student_name = $2',
                [currentAttempts + 1, studentName]
            );
        } else {
            // 새 학생 등록
            await pool.query(
                'INSERT INTO student_attempts (student_name, current_attempts) VALUES ($1, 1)',
                [studentName]
            );
        }
        
        const attemptNumber = currentAttempts + 1;
        
        // 최대 시도 횟수 확인
        if (attemptNumber > 3) {
            return res.status(400).json({
                success: false,
                message: '최대 시도 횟수를 초과했습니다.'
            });
        }

        // 시험 결과 저장
        const examResult = await pool.query(`
            INSERT INTO exam_results (
                student_name, attempt_number, total_score, percentage,
                a_type_score, a_type_total, b_type_score, b_type_total,
                c_type_score, c_type_total, time_spent, answers
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id
        `, [
            studentName,
            attemptNumber,
            totalScore,
            percentage,
            categoryScores['A형'].score,
            categoryScores['A형'].total,
            categoryScores['B형'].score,
            categoryScores['B형'].total,
            categoryScores['C형'].score,
            categoryScores['C형'].total,
            timeSpent,
            JSON.stringify(answers)
        ]);

        res.json({
            success: true,
            message: '시험 결과가 저장되었습니다.',
            examId: examResult.rows[0].id,
            attemptNumber: attemptNumber
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
app.get('/api/exam-results', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                student_name,
                attempt_number,
                total_score,
                percentage,
                a_type_score,
                a_type_total,
                b_type_score,
                b_type_total,
                c_type_score,
                c_type_total,
                time_spent,
                answers,
                submitted_at
            FROM exam_results
            ORDER BY student_name, attempt_number
        `);
        
        res.json({
            success: true,
            results: result.rows
        });
    } catch (error) {
        console.error('시험 결과 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '시험 결과 조회 중 오류가 발생했습니다.'
        });
    }
});

// 모든 시도 횟수 초기화 (관리자용)
app.post('/api/reset-attempts', async (req, res) => {
    try {
        await pool.query('DELETE FROM student_attempts');
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