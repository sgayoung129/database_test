// 시험 결과 페이지 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    displayResults();
});

function displayResults() {
    const resultsData = JSON.parse(sessionStorage.getItem('examResults'));
    
    if (!resultsData) {
        alert('시험 결과 데이터가 없습니다.');
        window.location.href = 'index.html';
        return;
    }
    
    const { student, answers, results, examData } = resultsData;
    
    // 기본 정보 표시
    document.getElementById('studentName').textContent = student;
    document.getElementById('totalScore').textContent = results.totalScore;
    document.getElementById('scorePercentage').textContent = results.percentage + '%';
    
    // 점수 바 업데이트
    const scoreBar = document.getElementById('scoreBar');
    scoreBar.style.width = results.percentage + '%';
    
    // 점수에 따른 색상 변경
    if (results.percentage >= 90) {
        scoreBar.className = 'score-fill excellent';
    } else if (results.percentage >= 80) {
        scoreBar.className = 'score-fill good';
    } else if (results.percentage >= 70) {
        scoreBar.className = 'score-fill average';
    } else {
        scoreBar.className = 'score-fill poor';
    }
    
    // 카테고리별 점수 표시
    displayCategoryScores(results.categoryScores);
    
    // 문제별 상세 결과 표시
    displayDetailedResults(examData, answers, results);
    
    // 통계 표시
    displayStatistics(results);
}

function displayCategoryScores(categoryScores) {
    const categoryContainer = document.getElementById('categoryScores');
    let html = '';
    
    Object.entries(categoryScores).forEach(([category, scores]) => {
        const percentage = Math.round((scores.score / scores.total) * 100);
        html += `
            <div class="category-score">
                <div class="category-info">
                    <span class="category-name">${category}</span>
                    <span class="category-points">${scores.score}/${scores.total}점</span>
                </div>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="category-percentage">${percentage}%</span>
            </div>
        `;
    });
    
    categoryContainer.innerHTML = html;
}

function displayDetailedResults(examData, answers, results) {
    const detailContainer = document.getElementById('detailResults');
    let html = '';
    
    examData.questions.forEach((question, index) => {
        const userAnswer = answers[index] || '미답';
        const isCorrect = checkAnswer(question, userAnswer);
        
        html += `
            <div class="question-result ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="question-header">
                    <h4>문제 ${index + 1} (${question.category} - ${question.points}점)</h4>
                    <span class="result-icon">${isCorrect ? '✓' : '✗'}</span>
                </div>
                <div class="question-content">
                    <p><strong>문제:</strong> ${question.question}</p>
                    <p><strong>제출 답안:</strong> ${formatAnswer(userAnswer)}</p>
                    <p><strong>정답:</strong> ${formatAnswer(question.correctAnswer)}</p>
                    ${question.type === 'multiple' ? `<p><strong>선택지:</strong> ${question.options.join(', ')}</p>` : ''}
                    ${getAnswerFeedback(question, userAnswer, isCorrect)}
                </div>
            </div>
        `;
    });
    
    detailContainer.innerHTML = html;
}

function checkAnswer(question, userAnswer) {
    if (!userAnswer || userAnswer === '미답') {
        return false;
    }
    
    if (question.type === 'multiple') {
        return userAnswer === question.correctAnswer;
    }
    
    // 주관식/서술형/SQL은 키워드 매칭으로 간단 체크
    const correctKeywords = question.correctAnswer.toLowerCase().split(/[,\s]+/);
    const userKeywords = userAnswer.toLowerCase().split(/[,\s]+/);
    
    let matchCount = 0;
    correctKeywords.forEach(keyword => {
        if (keyword.length > 2 && userKeywords.some(userKeyword => userKeyword.includes(keyword))) {
            matchCount++;
        }
    });
    
    return matchCount >= Math.ceil(correctKeywords.length * 0.5);
}

function formatAnswer(answer) {
    if (!answer || answer === '미답') {
        return '<span class="no-answer">미답</span>';
    }
    
    if (answer.length > 100) {
        return answer.substring(0, 100) + '...';
    }
    
    return answer.replace(/\n/g, '<br>');
}

function getAnswerFeedback(question, userAnswer, isCorrect) {
    if (!userAnswer || userAnswer === '미답') {
        return '<p class="feedback warning"><strong>피드백:</strong> 답안을 제출하지 않았습니다.</p>';
    }
    
    if (question.type === 'multiple') {
        if (isCorrect) {
            return '<p class="feedback success"><strong>피드백:</strong> 정답입니다!</p>';
        } else {
            return '<p class="feedback error"><strong>피드백:</strong> 오답입니다. 정답을 확인해주세요.</p>';
        }
    }
    
    // 주관식 문제 피드백
    if (isCorrect) {
        return '<p class="feedback success"><strong>피드백:</strong> 주요 키워드가 포함된 좋은 답안입니다.</p>';
    } else {
        return '<p class="feedback warning"><strong>피드백:</strong> 핵심 키워드가 부족합니다. 정답을 참고하여 학습하세요.</p>';
    }
}

function displayStatistics(results) {
    const statsContainer = document.getElementById('examStats');
    
    // 등급 계산
    let grade = 'F';
    if (results.percentage >= 90) grade = 'A';
    else if (results.percentage >= 80) grade = 'B';
    else if (results.percentage >= 70) grade = 'C';
    else if (results.percentage >= 60) grade = 'D';
    
    // 소요 시간 계산 (임시)
    const timeSpent = '45분 30초'; // 실제로는 타이머에서 계산
    
    statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">등급:</span>
            <span class="stat-value grade-${grade.toLowerCase()}">${grade}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">소요 시간:</span>
            <span class="stat-value">${timeSpent}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">정답률:</span>
            <span class="stat-value">${results.percentage}%</span>
        </div>
    `;
}

function printResults() {
    window.print();
}

function retakeExam() {
    if (confirm('시험을 다시 응시하시겠습니까? 현재 결과는 저장되지 않습니다.')) {
        sessionStorage.removeItem('examResults');
        window.location.href = 'exam.html';
    }
}

function goHome() {
    window.location.href = 'index.html';
}

// 결과 저장 (관리자용)
function saveResults() {
    const resultsData = JSON.parse(sessionStorage.getItem('examResults'));
    
    if (!resultsData) {
        alert('저장할 결과가 없습니다.');
        return;
    }
    
    // 서버로 결과 전송 (실제 구현 시)
    fetch('/api/save-results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(resultsData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('시험 결과가 저장되었습니다.');
        } else {
            alert('결과 저장에 실패했습니다.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('결과 저장 중 오류가 발생했습니다.');
    });
}