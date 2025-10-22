# 데이터베이스 시험 시스템 - PostgreSQL 백엔드

이 프로젝트는 데이터베이스 시험을 위한 웹 시스템의 PostgreSQL 연동 백엔드입니다.

## 🏗️ 시스템 구조

```
database_test/
├── database/
│   └── schema.sql              # PostgreSQL 스키마 정의
├── js/                         # 클라이언트 JavaScript
│   ├── exam.js                # 시험 로직 (PostgreSQL API 연동)
│   ├── admin.js               # 관리자 페이지 (PostgreSQL API 연동)
│   ├── submission.js          # 파일 제출 로직
│   └── results.js             # 결과 표시
├── public/                     # 정적 파일 (HTML, CSS, JS)
├── uploads/                    # 업로드된 파일 저장소
├── server.js                   # Express 서버 + PostgreSQL 연동
├── package.json               # 의존성 및 스크립트
└── .env.example               # 환경 변수 예시
```

## 🗄️ 데이터베이스 스키마

### 1. submissions (파일 제출)
- id (SERIAL PRIMARY KEY)
- name, phone, email (학생 정보)
- original_filename, file_path (파일 정보)
- file_size, mime_type (파일 메타데이터)
- submission_time, created_at (타임스탬프)

### 2. exam_results (시험 결과)
- id (SERIAL PRIMARY KEY)
- student_name, attempt_number (학생/시도 정보)
- total_score, percentage (점수 정보)
- category_scores (JSONB) - A형/B형/C형 점수
- answers (JSONB) - 학생 답안
- grading_details (JSONB) - 채점 상세 정보
- time_spent (소요 시간)
- submitted_at, created_at (타임스탬프)

### 3. exam_attempts (시도 횟수 관리)
- id (SERIAL PRIMARY KEY)
- student_name (UNIQUE)
- total_attempts (총 시도 횟수)
- max_attempts (최대 허용 횟수, 기본 3회)
- last_attempt_at, created_at, updated_at

## 🔌 API 엔드포인트

### 시험 관련 API
```
POST /api/check-attempts          # 시도 횟수 확인
POST /api/save-exam-result        # 시험 결과 저장
GET  /api/exam-results            # 전체 시험 결과 조회
POST /api/exam-detail             # 개별 시험 상세 조회
POST /api/reset-exam-data         # 모든 시험 데이터 초기화
```

### 파일 업로드 API
```
POST /submit                      # 파일 제출
GET  /admin/submissions           # 제출 내역 조회
GET  /download/:filename          # 파일 다운로드
```

### 정적 파일 서빙
```
GET  /                           # 메인 페이지
GET  /exam.html                  # 시험 페이지
GET  /admin.html                 # 관리자 페이지
GET  /results.html               # 결과 페이지
```

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 PostgreSQL 연결 정보 입력
```

### 3. PostgreSQL 데이터베이스 설정
```sql
-- PostgreSQL에서 데이터베이스 생성
CREATE DATABASE database_test;
CREATE USER database_test_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE database_test TO database_test_user;

-- 스키마 적용
\i database/schema.sql
```

### 4. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 🔧 주요 기능

### 1. 정교한 채점 시스템
- **객관식**: 완전 일치 검사
- **단답식**: 키워드/허용답안 기반 지능형 채점
- **주관식**: 필수/선택 키워드 기반 부분 점수
- **SQL**: 수동 채점 표시

### 2. 시도 횟수 관리
- 학생별 최대 3회 시도 제한
- 서버 중앙집중식 관리
- 중복 시도 방지

### 3. 상세 채점 정보
- 문제별 점수 및 피드백
- 수동 검토 필요 표시
- 카테고리별 점수 분석

### 4. 관리자 기능
- 전체 시험 결과 조회
- 학생별 상세 결과 확인
- 시험 데이터 초기화
- 파일 제출 관리

## 🛡️ 보안 고려사항

1. **SQL 인젝션 방지**: 매개변수화된 쿼리 사용
2. **파일 업로드 보안**: 파일 타입 및 크기 제한
3. **데이터 검증**: 입력값 유효성 검사
4. **CORS 설정**: 적절한 도메인 제한

## 🔄 주요 변경사항 (localStorage → PostgreSQL)

1. **시도 횟수 관리**: 클라이언트 → 서버 중앙 관리
2. **시험 결과 저장**: 브라우저 저장소 → PostgreSQL DB
3. **관리자 데이터**: localStorage → 서버 API 조회
4. **데이터 영속성**: 브라우저 종료 시에도 데이터 보존

## 📊 성능 최적화

1. **데이터베이스 인덱스**: 자주 조회되는 컬럼에 인덱스 생성
2. **JSONB 활용**: 복잡한 데이터 구조 효율적 저장
3. **연결 풀링**: PostgreSQL 연결 풀 사용
4. **압축**: JSON 데이터 압축 저장

## 🐛 트러블슈팅

### 데이터베이스 연결 오류
```bash
# 연결 문자열 확인
echo $DATABASE_URL

# PostgreSQL 서비스 상태 확인
sudo systemctl status postgresql
```

### 스키마 적용 오류
```sql
-- 수동으로 스키마 적용
\i database/schema.sql

-- 테이블 확인
\dt
```

### 파일 업로드 오류
```bash
# uploads 디렉토리 권한 확인
ls -la uploads/
chmod 755 uploads/
```

## 📝 환경 변수 설명

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| PORT | 서버 포트 | 10000 |
| NODE_ENV | 실행 환경 | development |
| DATABASE_URL | PostgreSQL 연결 문자열 | - |
| DB_HOST | 데이터베이스 호스트 | localhost |
| DB_PORT | 데이터베이스 포트 | 5432 |
| DB_NAME | 데이터베이스 이름 | database_test |
| DB_USER | 데이터베이스 사용자 | database_test_user |
| DB_PASSWORD | 데이터베이스 비밀번호 | - |

## 🎯 배포 가이드

### Render.com 배포
1. GitHub 레포지토리 연결
2. 환경 변수 설정
3. PostgreSQL 애드온 추가
4. 자동 배포 설정

### Heroku 배포
1. Heroku CLI 설치
2. PostgreSQL 애드온 추가
3. 환경 변수 설정
4. Git 배포

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. PostgreSQL 연결 상태
2. 환경 변수 설정
3. 방화벽 설정
4. 로그 메시지

---

**개발자**: aebonlee  
**라이선스**: MIT  
**버전**: 2.0.0 (PostgreSQL 연동)