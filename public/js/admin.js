document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshBtn = document.getElementById('refreshBtn');

    // 간단한 관리자 비밀번호
    const ADMIN_PASSWORD = 'admin123';

    // 탭 관리
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // 로그인 처리
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        if (password === ADMIN_PASSWORD) {
            loginSection.style.display = 'none';
            adminPanel.style.display = 'block';
            loadSubmissions();
        } else {
            alert('비밀번호가 올바르지 않습니다.');
        }
    });

    // 로그아웃 처리
    logoutBtn.addEventListener('click', function() {
        adminPanel.style.display = 'none';
        loginSection.style.display = 'block';
        document.getElementById('adminPassword').value = '';
    });

    // 탭 전환
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // 모든 탭 비활성화
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 선택된 탭 활성화
            this.classList.add('active');
            document.getElementById(targetTab + 'Tab').classList.add('active');
            
            // 통계 탭이 선택되면 통계 로드
            if (targetTab === 'statistics') {
                loadStatistics();
            }
        });
    });

    // 새로고침 버튼
    refreshBtn.addEventListener('click', loadSubmissions);

    // 제출 데이터 로드
    async function loadSubmissions() {
        try {
            const response = await fetch('/admin/submissions');
            const data = await response.json();
            
            if (data.success) {
                displaySubmissions(data.submissions);
                updateTotalCount(data.submissions.length);
            } else {
                console.error('데이터 로드 실패:', data.message);
            }
        } catch (error) {
            console.error('네트워크 오류:', error);
        }
    }

    // 제출 데이터 표시
    function displaySubmissions(submissions) {
        const tbody = document.getElementById('submissionsTableBody');
        tbody.innerHTML = '';
        
        if (submissions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">제출된 데이터가 없습니다.</td></tr>';
            return;
        }
        
        submissions.forEach(submission => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${submission.id}</td>
                <td>${submission.name}</td>
                <td>${submission.phone}</td>
                <td>${submission.email}</td>
                <td>${submission.original_filename ? 
                    `<span title="${submission.original_filename}">${truncateFilename(submission.original_filename)}</span>` : 
                    '<span class="no-file">파일 없음</span>'}</td>
                <td>${formatDateTime(submission.submission_time)}</td>
                <td>${submission.original_filename ? 
                    `<a href="/download/${submission.original_filename}" class="download-btn" target="_blank">다운로드</a>` : 
                    '<span class="no-file">-</span>'}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // 총 개수 업데이트
    function updateTotalCount(count) {
        document.getElementById('totalCount').textContent = `총 ${count}개 제출`;
    }

    // 통계 로드
    async function loadStatistics() {
        try {
            const response = await fetch('/admin/submissions');
            const data = await response.json();
            
            if (data.success) {
                const submissions = data.submissions;
                
                // 기본 통계
                const totalSubmissions = submissions.length;
                const withFiles = submissions.filter(s => s.original_filename).length;
                const today = new Date().toDateString();
                const todaySubmissions = submissions.filter(s => 
                    new Date(s.submission_time).toDateString() === today
                ).length;
                
                // 통계 표시
                document.getElementById('totalSubmissions').textContent = totalSubmissions;
                document.getElementById('withFiles').textContent = withFiles;
                document.getElementById('todaySubmissions').textContent = todaySubmissions;
                
                // 최근 제출 표시
                displayRecentSubmissions(submissions.slice(0, 5));
            }
        } catch (error) {
            console.error('통계 로드 오류:', error);
        }
    }

    // 최근 제출 표시
    function displayRecentSubmissions(submissions) {
        const container = document.getElementById('recentSubmissionsList');
        container.innerHTML = '';
        
        if (submissions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">최근 제출이 없습니다.</p>';
            return;
        }
        
        submissions.forEach(submission => {
            const item = document.createElement('div');
            item.className = 'recent-item';
            item.innerHTML = `
                <div class="recent-info">
                    <div class="recent-name">${submission.name}</div>
                    <div class="recent-email">${submission.email}</div>
                </div>
                <div class="recent-time">${formatDateTime(submission.submission_time)}</div>
            `;
            container.appendChild(item);
        });
    }

    // 파일명 줄이기
    function truncateFilename(filename, maxLength = 20) {
        if (filename.length <= maxLength) return filename;
        const ext = filename.split('.').pop();
        const name = filename.substring(0, filename.lastIndexOf('.'));
        const truncated = name.substring(0, maxLength - ext.length - 4) + '...';
        return truncated + '.' + ext;
    }

    // 날짜 시간 포맷팅
    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
});