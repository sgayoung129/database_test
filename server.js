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
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
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