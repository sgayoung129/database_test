document.addEventListener('DOMContentLoaded', function() {
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const refreshExamResults = document.getElementById('refreshExamResults');
    const resetAllAttempts = document.getElementById('resetAllAttempts');

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
            loadExamResults();
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
            // 시험 결과 탭이 선택되면 시험 결과 로드
            if (targetTab === 'examResults') {
                loadExamResults();
            }
        });
    });

    // 새로고침 버튼
    refreshBtn.addEventListener('click', loadSubmissions);
    refreshExamResults.addEventListener('click', loadExamResults);
    
    // 모든 시도 횟수 초기화
    resetAllAttempts.addEventListener('click', function() {
        if (confirm('모든 학생의 시도 횟수를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            resetAllExamData();
            alert('모든 시도 횟수와 시험 결과가 초기화되었습니다.');
            loadExamResults();
        }
    });

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

    // 시험 결과 로드
    async function loadExamResults() {
        try {
            const response = await fetch('/api/exam-results');
            const data = await response.json();
            
            if (data.success) {
                displayExamResults(data.results);
                updateExamTotalCount(data.results.length);
            } else {
                console.error('시험 결과 로드 실패:', data.message);
                document.getElementById('examResultsTableBody').innerHTML = 
                    '<tr><td colspan="10" style="text-align: center; color: #999;">시험 결과를 불러올 수 없습니다.</td></tr>';
            }
        } catch (error) {
            console.error('네트워크 오류:', error);
            document.getElementById('examResultsTableBody').innerHTML = 
                '<tr><td colspan="10" style="text-align: center; color: #999;">서버 연결 오류가 발생했습니다.</td></tr>';
        }
    }

    // 시험 결과 표시
    function displayExamResults(results) {
        const tbody = document.getElementById('examResultsTableBody');
        tbody.innerHTML = '';
        
        if (results.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: #999;">시험 결과가 없습니다.</td></tr>';
            return;
        }
        
        // 학생별로 그룹화하여 표시
        const groupedResults = groupResultsByStudent(results);
        
        Object.keys(groupedResults).forEach(studentName => {
            const studentResults = groupedResults[studentName];
            studentResults.forEach((result, index) => {
                const row = document.createElement('tr');
                const timeSpent = formatTimeSpent(result.timeSpent);
                
                row.innerHTML = `
                    <td>${index === 0 ? `<strong>${studentName}</strong>` : ''}</td>
                    <td>${result.attempt}차</td>
                    <td><strong>${result.score}점</strong></td>
                    <td>${result.percentage}%</td>
                    <td>${result.categoryScores['A형'].score}/${result.categoryScores['A형'].total}</td>
                    <td>${result.categoryScores['B형'].score}/${result.categoryScores['B형'].total}</td>
                    <td>${result.categoryScores['C형'].score}/${result.categoryScores['C형'].total}</td>
                    <td>${timeSpent}</td>
                    <td>${formatDateTime(result.timestamp)}</td>
                    <td><button onclick="showExamDetails('${studentName}', ${result.attempt})" class="detail-btn">상세보기</button></td>
                `;
                
                // 점수에 따른 색상 적용
                if (result.percentage >= 80) {
                    row.style.backgroundColor = '#d4edda';
                } else if (result.percentage >= 60) {
                    row.style.backgroundColor = '#fff3cd';
                } else {
                    row.style.backgroundColor = '#f8d7da';
                }
                
                tbody.appendChild(row);
            });
        });
    }

    // 학생별로 결과 그룹화
    function groupResultsByStudent(results) {
        const grouped = {};
        results.forEach(result => {
            if (!grouped[result.student]) {
                grouped[result.student] = [];
            }
            grouped[result.student].push(result);
        });
        
        // 각 학생의 결과를 시도 순서대로 정렬
        Object.keys(grouped).forEach(student => {
            grouped[student].sort((a, b) => a.attempt - b.attempt);
        });
        
        return grouped;
    }

    // 시험 결과 총 개수 업데이트
    function updateExamTotalCount(count) {
        document.getElementById('examTotalCount').textContent = `총 ${count}개 결과`;
    }

    // 소요 시간 포맷팅
    function formatTimeSpent(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}분 ${remainingSeconds}초`;
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

// 시험 상세보기 (전역 함수)
async function showExamDetails(studentName, attempt) {
    try {
        const response = await fetch('/api/exam-detail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ student: studentName, attempt: attempt })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            alert('시험 결과를 불러올 수 없습니다.');
            return;
        }
        
        const result = data.result;
    
        let detailHtml = `
        <div style="padding: 20px;">
            <h3>${studentName}님의 ${attempt}차 시험 상세 결과</h3>
            <div style="margin: 20px 0;">
                <strong>총점:</strong> ${result.score}점 (${result.percentage}%)<br>
                <strong>A형 점수:</strong> ${result.categoryScores['A형'].score}/${result.categoryScores['A형'].total}점<br>
                <strong>B형 점수:</strong> ${result.categoryScores['B형'].score}/${result.categoryScores['B형'].total}점<br>
                <strong>C형 점수:</strong> ${result.categoryScores['C형'].score}/${result.categoryScores['C형'].total}점<br>
                <strong>소요 시간:</strong> ${Math.floor(result.timeSpent / 60)}분 ${result.timeSpent % 60}초<br>
                <strong>제출 시간:</strong> ${new Date(result.timestamp).toLocaleString('ko-KR')}
            </div>
            
            <h4>채점 상세 내역:</h4>
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px;">
    `;
    
    // 채점 상세 정보 표시
    if (result.gradingDetails && result.gradingDetails.length > 0) {
        result.gradingDetails.forEach((detail, index) => {
            const scorePercentage = detail.maxPoints > 0 ? Math.round((detail.score / detail.maxPoints) * 100) : 0;
            const scoreClass = scorePercentage >= 80 ? 'good' : scorePercentage >= 60 ? 'average' : 'poor';
            
            detailHtml += `
                <div style="border: 1px solid #eee; margin: 10px 0; padding: 10px; border-radius: 5px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <strong>문제 ${index + 1} (${detail.type})</strong>
                        <span class="${scoreClass}" style="padding: 2px 8px; border-radius: 3px; font-weight: bold; 
                              color: ${scoreClass === 'good' ? '#28a745' : scoreClass === 'average' ? '#ffc107' : '#dc3545'};">
                            ${detail.score}/${detail.maxPoints}점 (${scorePercentage}%)
                        </span>
                    </div>
                    <div style="margin: 5px 0;">
                        <strong>답안:</strong> 
                        <span style="background: #f8f9fa; padding: 5px; border-radius: 3px; display: inline-block; margin-left: 10px;">
                            ${detail.userAnswer || '답안 없음'}
                        </span>
                    </div>
                    <div style="margin: 5px 0;">
                        <strong>채점 결과:</strong> 
                        <span style="color: #666;">${detail.feedback}</span>
                        ${detail.needsReview ? '<span style="color: #dc3545; font-weight: bold; margin-left: 10px;">[수동 검토 필요]</span>' : ''}
                    </div>
                </div>
            `;
        });
    } else {
        // 기존 방식 (채점 상세 정보가 없는 경우)
        Object.keys(result.answers).forEach(questionIndex => {
            const qIndex = parseInt(questionIndex);
            const answer = result.answers[questionIndex];
            detailHtml += `<p><strong>문제 ${qIndex + 1}:</strong> ${answer || '답안 없음'}</p>`;
        });
    }
    
    detailHtml += `
            </div>
        </div>
    `;
    
        // 새 창으로 열기
        const newWindow = window.open('', '_blank', 'width=600,height=700,scrollbars=yes');
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>시험 결과 상세보기</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; }
                    h3 { color: #333; }
                    h4 { color: #666; margin-top: 20px; }
                    p { margin: 5px 0; }
                </style>
            </head>
            <body>
                ${detailHtml}
                <div style="text-align: center; margin: 20px;">
                    <button onclick="window.close()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">창 닫기</button>
                </div>
            </body>
            </html>
        `);
        newWindow.document.close();
        
    } catch (error) {
        console.error('상세보기 로드 오류:', error);
        alert('시험 결과 상세보기를 불러올 수 없습니다.');
    }
}

// 모든 시험 데이터 초기화
async function resetAllExamData() {
    try {
        const response = await fetch('/api/reset-exam-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            console.error('데이터 초기화 실패:', data.message);
        }
    } catch (error) {
        console.error('데이터 초기화 네트워크 오류:', error);
    }
}