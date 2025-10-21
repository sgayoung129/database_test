# 데이터베이스 시험 제출 시스템

12명의 학생들을 위한 간단한 파일 제출 시스템입니다. 로그인 없이 이름, 전화번호, 이메일을 입력하고 파일을 업로드할 수 있습니다.

## 주요 기능

- **학생 제출**: 이름, 전화번호, 이메일 입력 및 파일 업로드
- **드래그 앤 드롭**: 직관적인 파일 업로드 인터페이스
- **관리자 페이지**: 제출된 데이터 확인 및 다운로드
- **PostgreSQL 연동**: Render.com PostgreSQL 데이터베이스 사용
- **파일 관리**: 안전한 파일 저장 및 다운로드

## 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Render.com)
- **File Upload**: Multer
- **Deployment**: 로컬 또는 클라우드 배포 가능

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일에서 데이터베이스 비밀번호를 설정하세요:
```
DB_PASSWORD=your_actual_database_password
```

### 3. 서버 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

### 4. 웹사이트 접속
- 메인 제출 페이지: http://localhost:3000
- 관리자 페이지: http://localhost:3000/admin.html
- 관리자 비밀번호: `admin123`

## 프로젝트 구조

```
database_test/
├── public/           # 정적 파일 (HTML)
│   ├── index.html   # 메인 제출 페이지
│   ├── admin.html   # 관리자 페이지
│   └── results.html # 결과 페이지 (미사용)
├── css/
│   └── style.css    # 스타일시트
├── js/
│   ├── submission.js # 제출 페이지 JavaScript
│   └── admin.js     # 관리자 페이지 JavaScript
├── uploads/         # 업로드된 파일 저장소
├── server.js        # Express 서버
├── package.json     # 프로젝트 설정
└── .env            # 환경 변수
```

## 데이터베이스 스키마

### submissions 테이블
```sql
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    file_path VARCHAR(255),
    original_filename VARCHAR(255),
    submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 사용 방법

### 학생 제출
1. 메인 페이지에서 이름, 전화번호, 이메일 입력
2. 파일을 드래그 앤 드롭하거나 클릭하여 선택
3. 제출 버튼 클릭

### 관리자 확인
1. /admin.html 페이지 접속
2. 비밀번호 `admin123` 입력
3. 제출 현황 및 통계 확인
4. 필요시 파일 다운로드

## 허용 파일 형식

- 이미지: jpg, jpeg, png, gif
- 문서: pdf, doc, docx, txt
- 최대 크기: 10MB

## 보안 고려사항

- 파일 형식 및 크기 제한
- SQL Injection 방지 (Parameterized Queries)
- 파일 업로드 보안 (Multer 설정)
- 환경 변수를 통한 민감 정보 관리

## 배포

### 🚀 Render.com 배포 (권장)

현재 웹사이트: **https://database-test-h7d0.onrender.com**

#### 1. 환경 변수 설정
Render.com 대시보드에서 다음 환경 변수를 설정하세요:

```
NODE_ENV=production
DB_HOST=dpg-d3rstnggjchc73e5tbeg-a.singapore-postgres.render.com
DB_NAME=database_test_db
DB_USER=database_test_user
DB_PORT=5432
DB_PASSWORD=your_actual_password_here
```

#### 2. 배포 과정
1. **GitHub 저장소 연결**: Render.com에서 GitHub 리포지토리 연결
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **환경 변수 설정**: 위의 환경 변수들을 Render.com 대시보드에서 설정
5. **자동 배포**: GitHub에 푸시할 때마다 자동으로 배포됨

#### 3. 배포 후 확인사항
- [ ] 메인 페이지 접속 확인
- [ ] 파일 업로드 테스트
- [ ] 관리자 페이지 접속 확인 (비밀번호: admin123)
- [ ] 데이터베이스 연결 확인

### 🏠 로컬 배포
1. PostgreSQL 연결 정보 확인
2. `.env` 파일 설정
3. `npm install` 실행
4. `npm start` 실행

## 라이센스

MIT License

## 개발자

aebonlee

---

## 문제 해결

### 🔧 일반적인 문제

#### 데이터베이스 연결 오류
- `.env` 파일의 데이터베이스 정보 확인
- PostgreSQL 서버 상태 확인
- 네트워크 연결 확인
- Render.com 환경 변수 설정 확인

#### 파일 업로드 오류
- `uploads/` 디렉토리 권한 확인
- 파일 크기 및 형식 확인 (10MB 제한)
- 서버 디스크 공간 확인
- 브라우저에서 파일 형식 에러 메시지 확인

#### 관리자 페이지 접속 불가
- 비밀번호 `admin123` 확인
- JavaScript 활성화 확인
- 브라우저 콘솔 에러 확인
- 네트워크 탭에서 API 요청 상태 확인

### 🚀 Render.com 배포 문제

#### 빌드 실패
```bash
# 로그 확인 방법
# Render.com 대시보드 > Logs 탭에서 에러 메시지 확인
```

#### 환경 변수 문제
- Render.com 대시보드에서 Environment 탭 확인
- 모든 필수 환경 변수가 설정되었는지 확인
- DB_PASSWORD가 올바르게 설정되었는지 확인

#### 데이터베이스 연결 실패
```bash
# PostgreSQL 연결 상태 확인
# Render.com 대시보드에서 PostgreSQL 서비스 상태 확인
```

#### 정적 파일 로드 실패
- CSS/JS 파일 경로가 절대 경로(`/css/style.css`)로 설정되었는지 확인
- 브라우저 개발자 도구에서 404 에러 확인

### 📞 지원
문제가 계속 발생하면:
1. Render.com 로그 확인
2. 브라우저 개발자 도구 콘솔 확인
3. GitHub Issues에 문제 보고