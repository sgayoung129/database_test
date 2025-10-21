# 🚀 Render.com 배포 가이드

## 배포 전 체크리스트

### ✅ 필수 준비사항
- [ ] GitHub 리포지토리에 코드 푸시 완료
- [ ] PostgreSQL 데이터베이스 생성 완료 (Service ID: dpg-d3rstnggjchc73e5tbeg-a)
- [ ] 데이터베이스 비밀번호 확인
- [ ] Render.com 계정 생성

### ✅ 파일 확인
- [ ] `server.js` - Express 서버 파일
- [ ] `package.json` - Node.js 의존성 및 스크립트
- [ ] `render.yaml` - Render.com 설정 파일
- [ ] `public/` 디렉토리 - HTML 파일들
- [ ] `css/` 디렉토리 - 스타일시트
- [ ] `js/` 디렉토리 - JavaScript 파일들
- [ ] `.gitignore` - Git 제외 파일 목록

## 배포 단계

### 1️⃣ Render.com 웹 서비스 생성
1. Render.com 대시보드 접속
2. "New" → "Web Service" 선택
3. GitHub 리포지토리 연결: `https://github.com/aebonlee/database_test`

### 2️⃣ 빌드 설정
```
Name: database-test-website
Environment: Node
Build Command: npm install
Start Command: npm start
```

### 3️⃣ 환경 변수 설정
다음 환경 변수들을 Render.com 대시보드 → Environment 탭에서 설정:

```
NODE_ENV=production
DB_HOST=dpg-d3rstnggjchc73e5tbeg-a.singapore-postgres.render.com
DB_NAME=database_test_db
DB_USER=database_test_user
DB_PORT=5432
DB_PASSWORD=[실제_데이터베이스_비밀번호]
```

### 4️⃣ 배포 실행
1. "Create Web Service" 클릭
2. 빌드 로그 확인
3. 배포 완료 대기 (약 5-10분)

## 배포 후 테스트

### 🧪 기능 테스트 체크리스트
웹사이트: https://database-test-h7d0.onrender.com

#### 메인 페이지 테스트
- [ ] 메인 페이지 로딩 확인
- [ ] CSS 스타일 적용 확인
- [ ] 이름 입력 필드 작동
- [ ] 전화번호 입력 필드 작동 (자동 포맷팅)
- [ ] 이메일 입력 필드 작동

#### 파일 업로드 테스트
- [ ] 드래그 앤 드롭 영역 표시
- [ ] 파일 선택 버튼 작동
- [ ] 파일 드래그 앤 드롭 작동
- [ ] 파일 형식 검증 (jpg, png, pdf 등)
- [ ] 파일 크기 제한 (10MB) 확인

#### 제출 기능 테스트
- [ ] 모든 필드 입력 후 제출
- [ ] 성공 메시지 표시
- [ ] 제출 ID 반환

#### 관리자 페이지 테스트
URL: https://database-test-h7d0.onrender.com/admin.html

- [ ] 관리자 페이지 로딩
- [ ] 비밀번호 입력 (admin123)
- [ ] 제출 현황 테이블 표시
- [ ] 통계 정보 표시
- [ ] 파일 다운로드 기능

#### 데이터베이스 테스트
- [ ] 제출 데이터 저장 확인
- [ ] 관리자 페이지에서 데이터 조회 확인
- [ ] 파일 업로드 및 저장 확인

## 배포 모니터링

### 📊 로그 확인
- Render.com 대시보드 → Logs 탭
- 실시간 서버 로그 모니터링
- 에러 메시지 확인

### 🔍 성능 모니터링
- 서버 응답 시간
- 메모리 사용량
- CPU 사용량

### 🚨 알림 설정
- 서비스 다운 알림
- 에러 발생 알림
- 배포 완료 알림

## 자주 발생하는 문제

### 1. 빌드 실패
**원인**: 의존성 설치 실패
**해결**: `package.json` 확인, Node.js 버전 확인

### 2. 데이터베이스 연결 실패
**원인**: 환경 변수 미설정 또는 잘못된 값
**해결**: DB_PASSWORD 등 환경 변수 재확인

### 3. 정적 파일 404 에러
**원인**: CSS/JS 파일 경로 문제
**해결**: 절대 경로(`/css/style.css`) 사용 확인

### 4. 파일 업로드 실패
**원인**: 업로드 디렉토리 권한 또는 용량 문제
**해결**: Render.com 디스크 용량 확인

## 유지보수

### 정기 점검 (주 1회)
- [ ] 웹사이트 접속 확인
- [ ] 데이터베이스 연결 상태 확인
- [ ] 파일 업로드 기능 테스트
- [ ] 관리자 페이지 접속 확인

### 업데이트 방법
1. 로컬에서 코드 수정
2. GitHub에 푸시
3. Render.com 자동 배포 대기
4. 배포 후 기능 테스트

---

## 연락처
- 개발자: aebonlee
- GitHub: https://github.com/aebonlee/database_test
- 웹사이트: https://database-test-h7d0.onrender.com