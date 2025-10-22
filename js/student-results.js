document.addEventListener('DOMContentLoaded', function() {
    const studentLoginSection = document.getElementById('studentLoginSection');
    const studentResultsPanel = document.getElementById('studentResultsPanel');
    const studentLoginForm = document.getElementById('studentLoginForm');
    const backBtn = document.getElementById('backBtn');
    const refreshStudentResults = document.getElementById('refreshStudentResults');
    
    let currentStudent = '';

    // 학생 이름 입력 폼 처리
    studentLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const studentName = document.getElementById('studentName').value.trim();
        
        if (studentName) {
            currentStudent = studentName;
            loadStudentResults(studentName);
        } else {
            alert('이름을 입력해주세요.');
        }
    });

    // 뒤로가기 버튼
    backBtn.addEventListener('click', function() {
        studentResultsPanel.style.display = 'none';
        studentLoginSection.style.display = 'block';
        document.getElementById('studentName').value = '';
        currentStudent = '';
    });

    // 새로고침 버튼
    refreshStudentResults.addEventListener('click', function() {
        if (currentStudent) {
            loadStudentResults(currentStudent);
        }
    });

    // 학생 결과 로드
    async function loadStudentResults(studentName) {
        try {
            const response = await fetch('/api/student-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ student: studentName })
            });
            
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('studentNameDisplay').textContent = `${studentName}님의 시험 결과`;
                studentLoginSection.style.display = 'none';
                studentResultsPanel.style.display = 'block';
                
                if (data.results.length === 0) {
                    showNoResults();
                } else {
                    displayStudentResults(data.results);
                    updateSummary(data.results);
                    showResults();
                }
            } else {
                alert('결과를 불러올 수 없습니다: ' + data.message);
            }
        } catch (error) {
            console.error('네트워크 오류:', error);
            alert('서버 연결 오류가 발생했습니다.');
        }
    }

    // 결과 없음 표시
    function showNoResults() {
        document.getElementById('noResultsMessage').style.display = 'block';
        document.getElementById('resultsContainer').style.display = 'none';
    }

    // 결과 있음 표시
    function showResults() {
        document.getElementById('noResultsMessage').style.display = 'none';
        document.getElementById('resultsContainer').style.display = 'block';
    }

    // 학생 결과 표시
    function displayStudentResults(results) {
        const tbody = document.getElementById('studentResultsTableBody');
        tbody.innerHTML = '';
        
        results.forEach(result => {
            const row = document.createElement('tr');
            const timeSpent = formatTimeSpent(result.timeSpent);
            
            row.innerHTML = `
                <td><strong>${result.attempt}차</strong></td>
                <td><strong>${result.score}점</strong></td>
                <td>${result.percentage}%</td>
                <td>${result.categoryScores['A형'].score}/${result.categoryScores['A형'].total}</td>
                <td>${result.categoryScores['B형'].score}/${result.categoryScores['B형'].total}</td>
                <td>${result.categoryScores['C형'].score}/${result.categoryScores['C형'].total}</td>
                <td>${timeSpent}</td>
                <td>${formatDateTime(result.timestamp)}</td>
                <td><button onclick="showStudentExamDetails('${currentStudent}', ${result.attempt})" class="detail-btn">상세보기</button></td>
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
        
        // 결과 개수 업데이트
        document.getElementById('studentResultCount').textContent = `총 ${results.length}개 결과`;
    }

    // 요약 정보 업데이트
    function updateSummary(results) {
        const totalAttempts = results.length;
        const scores = results.map(r => r.score);
        const bestScore = Math.max(...scores);
        const bestResult = results.find(r => r.score === bestScore);
        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const remainingAttempts = Math.max(0, 3 - totalAttempts);
        
        document.getElementById('totalAttempts').textContent = totalAttempts;
        document.getElementById('bestScore').textContent = bestScore;
        document.getElementById('bestPercentage').textContent = bestResult.percentage;
        document.getElementById('averageScore').textContent = averageScore;
        document.getElementById('remainingAttempts').textContent = remainingAttempts;
    }

    // 소요 시간 포맷팅
    function formatTimeSpent(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}분 ${remainingSeconds}초`;
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

// 학생용 시험 상세보기 (전역 함수)
async function showStudentExamDetails(studentName, attempt) {
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
                <strong>총점:</strong> ${result.total_score}점 (${result.percentage}%)<br>
                <strong>A형 점수:</strong> ${result.categoryScores['A형'].score}/${result.categoryScores['A형'].total}점<br>
                <strong>B형 점수:</strong> ${result.categoryScores['B형'].score}/${result.categoryScores['B형'].total}점<br>
                <strong>C형 점수:</strong> ${result.categoryScores['C형'].score}/${result.categoryScores['C형'].total}점<br>
                <strong>소요 시간:</strong> ${Math.floor(result.time_spent / 60)}분 ${result.time_spent % 60}초<br>
                <strong>제출 시간:</strong> ${new Date(result.submitted_at).toLocaleString('ko-KR')}
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