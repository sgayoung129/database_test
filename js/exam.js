// 데이터베이스 시험 문제 데이터
const examData = {
    totalQuestions: 26,
    totalPoints: 100,
    timeLimit: 60, // 60분
    
    questions: [
        // A형: 객관·단답 (각 2점, 총 20점)
        {
            id: 1,
            type: 'multiple',
            category: 'A형',
            points: 2,
            question: '다음 중 DBMS 필수 기능이 아닌 것은?',
            options: ['A. 정의', 'B. 조작', 'C. 제어', 'D. 연산'],
            correctAnswer: 'D'
        },
        {
            id: 2,
            type: 'multiple',
            category: 'A형',
            points: 2,
            question: '3단계 스키마에 포함되지 않는 것은?',
            options: ['A. 외부', 'B. 개념', 'C. 내부', 'D. 관계'],
            correctAnswer: 'D'
        },
        {
            id: 3,
            type: 'multiple',
            category: 'A형',
            points: 2,
            question: '테이블의 행·열에 대한 용어 대응으로 옳은 것은?',
            options: ['A. 행=속성, 열=튜플', 'B. 행=튜플, 열=속성', 'C. 행=도메인, 열=튜플', 'D. 행=카디널리티, 열=디그리'],
            correctAnswer: 'B'
        },
        {
            id: 4,
            type: 'multiple',
            category: 'A형',
            points: 2,
            question: '기본키(Primary Key) 특성이 아닌 것은?',
            options: ['A. 유일성', 'B. NULL 허용', 'C. 최소성', 'D. 튜플 식별'],
            correctAnswer: 'B'
        },
        {
            id: 5,
            type: 'multiple',
            category: 'A형',
            points: 2,
            question: '다음 중 DCL에 속하는 명령어의 올바른 짝은?',
            options: ['A. CREATE, ALTER', 'B. SELECT, UPDATE', 'C. GRANT, REVOKE', 'D. INSERT, DELETE'],
            correctAnswer: 'C'
        },
        {
            id: 6,
            type: 'multiple',
            category: 'A형',
            points: 2,
            question: '트랜잭션 ACID 중 "커밋 후 결과가 영구히 보존"되는 성질은?',
            options: ['A. 원자성', 'B. 일관성', 'C. 고립성', 'D. 영속성'],
            correctAnswer: 'D'
        },
        {
            id: 7,
            type: 'multiple',
            category: 'A형',
            points: 2,
            question: '관계 연산자 중 "열(속성) 부분집합만 추출하며 중복 제거"는?',
            options: ['A. σ(선택)', 'B. ▷◁(조인)', 'C. π(프로젝션)', 'D. ÷(나누기)'],
            correctAnswer: 'C'
        },
        {
            id: 8,
            type: 'multiple',
            category: 'A형',
            points: 2,
            question: '뷰(View)의 장점으로 옳지 않은 것은?',
            options: ['A. 논리적 데이터 독립성', 'B. 자동 보안', 'C. 독립 인덱스 소유', 'D. 관리 용이'],
            correctAnswer: 'C'
        },
        {
            id: 9,
            type: 'shortAnswer',
            category: 'A형',
            points: 2,
            question: '카디널리티(Cardinality)와 디그리(Degree)를 각각 정의하시오. (한 줄씩)',
            correctAnswer: 'Cardinality: 테이블의 행(튜플)의 수\nDegree: 테이블의 열(속성)의 수',
            gradingCriteria: {
                keywords: {
                    cardinality: ['카디널리티', '행', '튜플', '수', '개수'],
                    degree: ['디그리', '열', '속성', '수', '개수']
                }
            }
        },
        {
            id: 10,
            type: 'shortAnswer',
            category: 'A형',
            points: 2,
            question: '외래키(FK)가 위배되기 쉬운 대표적 무결성 유형 한 가지를 이름으로 쓰시오.',
            correctAnswer: '참조 무결성',
            gradingCriteria: {
                acceptableAnswers: ['참조 무결성', '참조무결성', '참조제약', 'referential integrity']
            }
        },
        
        // B형: 서술·개념 (각 5점, 총 40점)
        {
            id: 11,
            type: 'essay',
            category: 'B형',
            points: 5,
            question: '외부/개념/내부 스키마의 관점 차이와 예시(사용자·관리자·설계자 관점)를 4~5문장으로 설명하시오.',
            correctAnswer: '외부 스키마는 사용자 관점에서 필요한 데이터만 보는 뷰 형태입니다. 개념 스키마는 전체 데이터베이스의 논리적 구조를 나타내며 관리자가 설계합니다. 내부 스키마는 물리적 저장 구조를 다루며 설계자가 성능 최적화를 담당합니다.',
            gradingCriteria: {
                requiredKeywords: ['외부 스키마', '개념 스키마', '내부 스키마'], // 3점
                optionalKeywords: ['사용자', '관리자', '설계자', '뷰', '논리적', '물리적'], // 각 0.5점
                minLength: 50
            }
        },
        {
            id: 12,
            type: 'essay',
            category: 'B형',
            points: 5,
            question: '논리적 독립성 vs 물리적 독립성을 비교하고, 각각이 유리한 실무 시나리오를 1개씩 제시하시오.',
            correctAnswer: '논리적 독립성은 스키마 변경 시 응용프로그램 수정 불필요. 물리적 독립성은 저장구조 변경 시 스키마 수정 불필요. 논리적: 테이블 구조 변경, 물리적: 인덱스 추가/변경'
        },
        {
            id: 13,
            type: 'essay',
            category: 'B형',
            points: 5,
            question: '정규화가 필요한 이유(삽입/삭제/갱신 이상)와 1NF→2NF→3NF 진행 시 제거되는 종속 형태를 핵심 키워드로 요약하시오.',
            correctAnswer: '이상 현상 제거가 목적. 1NF: 반복 그룹 제거, 2NF: 부분 함수 종속 제거, 3NF: 이행적 함수 종속 제거'
        },
        {
            id: 14,
            type: 'essay',
            category: 'B형',
            points: 5,
            question: '트랜잭션 회복 기법 2가지를 선택하여(예: 즉시/지연 갱신), 각 기법의 REDO/UNDO 수행 여부를 표로 정리하시오.',
            correctAnswer: '즉시갱신: REDO O, UNDO O / 지연갱신: REDO O, UNDO X'
        },
        {
            id: 15,
            type: 'essay',
            category: 'B형',
            points: 5,
            question: '접근통제(DAC/MAC/RBAC)의 차이와 SQL 차원에서 관리자 관점의 통제 예시 1개씩을 제시하시오.',
            correctAnswer: 'DAC: 소유자 결정권한, MAC: 관리자 강제정책, RBAC: 역할기반 권한. 예시: GRANT SELECT, 보안라벨 설정, CREATE ROLE'
        },
        {
            id: 16,
            type: 'essay',
            category: 'B형',
            points: 5,
            question: '관계대수 σ/π/조인을 각각 간단 예제로 설명하고, SQL로의 매핑 키워드(WHERE, SELECT 컬럼, JOIN … ON)를 대응시키시오.',
            correctAnswer: 'σ(선택): WHERE 조건절, π(프로젝션): SELECT 컬럼명, 조인: JOIN ... ON 조건'
        },
        {
            id: 17,
            type: 'essay',
            category: 'B형',
            points: 5,
            question: '뷰(View)의 장단점 2가지씩과, 뷰로는 곤란한 작업(예: ALTER 구조 변경 등)을 1가지 쓰시오.',
            correctAnswer: '장점: 보안성, 간편성 / 단점: 성능저하, 갱신제한 / 곤란작업: 인덱스 생성'
        },
        {
            id: 18,
            type: 'essay',
            category: 'B형',
            points: 5,
            question: 'MySQL 실습 환경 구축 시 필수 점검 항목 3가지를 쓰고, 각 항목에 대한 확인 SQL 또는 명령을 1개씩 제시하시오.',
            correctAnswer: '1. 서버가동: SHOW STATUS 2. 접속확인: SELECT VERSION() 3. 권한확인: SHOW GRANTS'
        },
        
        // C형: 실기 SQL (각 5점, 총 40점)
        {
            id: 19,
            type: 'sql',
            category: 'C형',
            points: 5,
            question: 'CS 학과 학생의 sid, name을 sid 오름차순으로 조회하시오.',
            schema: `CREATE TABLE Students (
  sid INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  dept VARCHAR(20),
  admit_year INT
);`,
            sampleData: "Students: (1,'Kim','CS',2023), (2,'Lee','IS',2024), (3,'Park','CS',2024)",
            correctAnswer: 'SELECT sid, name FROM Students WHERE dept = "CS" ORDER BY sid;'
        },
        {
            id: 20,
            type: 'sql',
            category: 'C형',
            points: 5,
            question: '수강신청(Enroll) 기준으로 수강 중인 학과명(중복 제거)을 조회하시오.',
            correctAnswer: 'SELECT DISTINCT s.dept FROM Students s JOIN Enroll e ON s.sid = e.sid;'
        },
        {
            id: 21,
            type: 'sql',
            category: 'C형',
            points: 5,
            question: '2024년에 입학한 학생의 이름과 "admit_year + 1" 값을 NEXT_YEAR 별칭으로 출력하시오.',
            correctAnswer: 'SELECT name, admit_year + 1 AS NEXT_YEAR FROM Students WHERE admit_year = 2024;'
        },
        {
            id: 22,
            type: 'sql',
            category: 'C형',
            points: 5,
            question: '학생 이름을 대문자로 변환해 name_up 컬럼으로 조회하시오.',
            correctAnswer: 'SELECT UPPER(name) AS name_up FROM Students;'
        },
        {
            id: 23,
            type: 'sql',
            category: 'C형',
            points: 5,
            question: '과목 title에서 앞의 3글자만 잘라 abbr로 조회하시오.',
            correctAnswer: 'SELECT SUBSTRING(title, 1, 3) AS abbr FROM Courses;'
        },
        {
            id: 24,
            type: 'sql',
            category: 'C형',
            points: 5,
            question: 'Kim이 수강 중인 과목의 title 목록을 조회하시오.',
            correctAnswer: 'SELECT c.title FROM Students s JOIN Enroll e ON s.sid = e.sid JOIN Courses c ON e.cid = c.cid WHERE s.name = "Kim";'
        },
        {
            id: 25,
            type: 'sql',
            category: 'C형',
            points: 5,
            question: "Enroll.grade가 'A'면 4, 'B'면 3, 그 외 0으로 환산하여 score 컬럼으로 조회하시오.",
            correctAnswer: 'SELECT CASE WHEN grade = "A" THEN 4 WHEN grade = "B" THEN 3 ELSE 0 END AS score FROM Enroll;'
        },
        {
            id: 26,
            type: 'sql',
            category: 'C형',
            points: 5,
            question: '학생 테이블에 대한 SELECT 권한을 사용자 studuser에게 부여하고, 이후 해당 권한을 회수하는 SQL을 작성하시오.',
            correctAnswer: 'GRANT SELECT ON Students TO studuser;\nREVOKE SELECT ON Students FROM studuser;'
        }
    ]
};

// 현재 시험 상태
let currentQuestion = 0;
let answers = {};
let timeRemaining = examData.timeLimit * 60; // 초 단위
let timer;
let currentStudent = '';
let currentAttempt = 1;
const MAX_ATTEMPTS = 3;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeExam();
});

async function initializeExam() {
    // URL 매개변수에서 학생 정보 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    currentStudent = urlParams.get('student') || '익명';
    
    // 서버에서 시험 시도 횟수 확인
    await checkExamAttempts();
    
    document.getElementById('currentStudent').textContent = `${currentStudent} (${currentAttempt}/${MAX_ATTEMPTS}회차)`;
    
    // 시험 시작
    startTimer();
    displayQuestion();
    updateQuestionNavigation();
}

// 서버에서 시험 시도 횟수 확인
async function checkExamAttempts() {
    try {
        const response = await fetch('/api/check-attempts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ student: currentStudent })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentAttempt = data.currentAttempt + 1;
            
            if (currentAttempt > MAX_ATTEMPTS) {
                alert(`${currentStudent}님은 이미 ${MAX_ATTEMPTS}회 시험을 완료하셨습니다. 더 이상 시험을 볼 수 없습니다.`);
                window.location.href = 'index.html';
                return;
            }
        } else {
            console.error('시도 횟수 확인 실패:', data.message);
            // 서버 오류 시 기본값으로 1회차 진행
            currentAttempt = 1;
        }
    } catch (error) {
        console.error('네트워크 오류:', error);
        // 네트워크 오류 시 기본값으로 1회차 진행
        currentAttempt = 1;
    }
}

function startTimer() {
    timer = setInterval(() => {
        timeRemaining--;
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeRemaining <= 0) {
            clearInterval(timer);
            submitExam();
        }
    }, 1000);
}

function displayQuestion() {
    const question = examData.questions[currentQuestion];
    const questionContainer = document.querySelector('.question-content');
    
    let html = `
        <div class="question-header">
            <h3>문제 ${currentQuestion + 1} (${question.category} - ${question.points}점)</h3>
        </div>
        <div class="question-text">
            <p>${question.question}</p>
        </div>
    `;
    
    // 문제 유형별 입력 폼 생성
    switch(question.type) {
        case 'multiple':
            html += createMultipleChoiceForm(question);
            break;
        case 'shortAnswer':
            html += createShortAnswerForm(question);
            break;
        case 'essay':
            html += createEssayForm(question);
            break;
        case 'sql':
            html += createSQLForm(question);
            break;
    }
    
    questionContainer.innerHTML = html;
    
    // 이전 답안 복원
    restoreAnswer();
}

function createMultipleChoiceForm(question) {
    let html = '<div class="answer-options">';
    question.options.forEach((option, index) => {
        const optionValue = String.fromCharCode(65 + index); // A, B, C, D
        html += `
            <label class="option-label">
                <input type="radio" name="answer" value="${optionValue}">
                ${option}
            </label>
        `;
    });
    html += '</div>';
    return html;
}

function createShortAnswerForm(question) {
    return `
        <div class="answer-input">
            <textarea name="answer" rows="3" placeholder="답안을 입력하세요..."></textarea>
        </div>
    `;
}

function createEssayForm(question) {
    return `
        <div class="answer-input">
            <textarea name="answer" rows="10" placeholder="서술형 답안을 입력하세요..." 
                style="min-height: 200px; font-size: 15px;"></textarea>
        </div>
    `;
}

function createSQLForm(question) {
    let html = '';
    
    // 모든 SQL 문제에 공통 스키마 정보 표시
    html += `
        <div class="schema-info">
            <h4>공통 스키마:</h4>
            <pre>CREATE TABLE Students (
  sid INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  dept VARCHAR(20),
  admit_year INT
);

CREATE TABLE Courses (
  cid INT PRIMARY KEY,
  title VARCHAR(100),
  dept VARCHAR(20),
  credits INT
);

CREATE TABLE Enroll (
  sid INT,
  cid INT,
  grade CHAR(2),
  PRIMARY KEY (sid, cid),
  FOREIGN KEY (sid) REFERENCES Students(sid),
  FOREIGN KEY (cid) REFERENCES Courses(cid)
);</pre>
        </div>
    `;
    
    // 공통 샘플 데이터 표시
    html += `
        <div class="sample-data">
            <h4>샘플 데이터:</h4>
            <p><strong>Students:</strong> (1,'Kim','CS',2023), (2,'Lee','IS',2024), (3,'Park','CS',2024)</p>
            <p><strong>Courses:</strong> (10,'DB Basics','CS',3), (20,'Python','IS',3), (30,'SQL Functions','CS',2)</p>
            <p><strong>Enroll:</strong> (1,10,'A'), (1,20,'B'), (2,10,'B'), (3,30,'A')</p>
        </div>
    `;
    
    html += `
        <div class="answer-input">
            <textarea name="answer" rows="8" placeholder="SQL 쿼리를 입력하세요..." 
                style="font-family: 'Courier New', monospace; font-size: 14px; min-height: 180px;"></textarea>
        </div>
    `;
    return html;
}

function updateQuestionNavigation() {
    const navContainer = document.querySelector('.question-nav');
    let html = '';
    
    // A형 문제 (1-8)
    html += '<div class="question-section"><h5>A형 (객관·단답)</h5><div class="section-nav section-nav-4">';
    for (let i = 0; i < 8; i++) {
        const isAnswered = answers[i] !== undefined;
        const isCurrent = i === currentQuestion;
        html += `
            <button class="nav-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}" 
                    onclick="goToQuestion(${i})">
                ${i + 1}
            </button>
        `;
    }
    html += '</div></div>';
    
    // B형 문제 (9-18)
    html += '<div class="question-section"><h5>B형 (서술·개념)</h5><div class="section-nav">';
    for (let i = 8; i < 18; i++) {
        const isAnswered = answers[i] !== undefined;
        const isCurrent = i === currentQuestion;
        html += `
            <button class="nav-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}" 
                    onclick="goToQuestion(${i})">
                ${i + 1}
            </button>
        `;
    }
    html += '</div></div>';
    
    // C형 문제 (19-26)
    html += '<div class="question-section"><h5>C형 (실기 SQL)</h5><div class="section-nav">';
    for (let i = 18; i < 26; i++) {
        const isAnswered = answers[i] !== undefined;
        const isCurrent = i === currentQuestion;
        html += `
            <button class="nav-btn ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}" 
                    onclick="goToQuestion(${i})">
                ${i + 1}
            </button>
        `;
    }
    html += '</div></div>';
    
    navContainer.innerHTML = html;
}

function goToQuestion(questionIndex) {
    saveCurrentAnswer();
    currentQuestion = questionIndex;
    displayQuestion();
    updateQuestionNavigation();
}

function saveCurrentAnswer() {
    const answerElement = document.querySelector('input[name="answer"]:checked') || 
                         document.querySelector('textarea[name="answer"]');
    
    if (answerElement) {
        answers[currentQuestion] = answerElement.value;
    }
}

function restoreAnswer() {
    if (answers[currentQuestion] !== undefined) {
        const answerElement = document.querySelector(`input[name="answer"][value="${answers[currentQuestion]}"]`) ||
                             document.querySelector('textarea[name="answer"]');
        
        if (answerElement) {
            if (answerElement.type === 'radio') {
                answerElement.checked = true;
            } else {
                answerElement.value = answers[currentQuestion];
            }
        }
    }
}

function nextQuestion() {
    saveCurrentAnswer();
    if (currentQuestion < examData.questions.length - 1) {
        currentQuestion++;
        displayQuestion();
        updateQuestionNavigation();
    }
}

function prevQuestion() {
    saveCurrentAnswer();
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
        updateQuestionNavigation();
    }
}

async function submitExam() {
    saveCurrentAnswer();
    clearInterval(timer);
    
    // 답안 확인
    const unansweredQuestions = [];
    for (let i = 0; i < examData.questions.length; i++) {
        if (answers[i] === undefined || answers[i] === '') {
            unansweredQuestions.push(i + 1);
        }
    }
    
    if (unansweredQuestions.length > 0) {
        const confirmSubmit = confirm(`미완성 문제가 있습니다 (문제 ${unansweredQuestions.join(', ')}). 정말 제출하시겠습니까?`);
        if (!confirmSubmit) {
            startTimer();
            return;
        }
    }
    
    // 점수 계산
    const results = calculateScore();
    
    // 시험 결과 저장
    await saveExamResult(results);
    
    // 결과 페이지로 이동
    sessionStorage.setItem('examResults', JSON.stringify({
        student: currentStudent,
        attempt: currentAttempt,
        answers: answers,
        results: results,
        examData: examData
    }));
    
    window.location.href = 'results.html';
}

function calculateScore() {
    let totalScore = 0;
    let categoryScores = {
        'A형': { score: 0, total: 20 },
        'B형': { score: 0, total: 40 },
        'C형': { score: 0, total: 40 }
    };
    
    const gradingDetails = []; // 채점 상세 정보 저장
    
    examData.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        let questionScore = 0;
        let gradingInfo = {
            questionId: question.id,
            type: question.type,
            userAnswer: userAnswer,
            maxPoints: question.points,
            score: 0,
            feedback: ''
        };
        
        if (userAnswer !== undefined && userAnswer !== '') {
            switch (question.type) {
                case 'multiple':
                    questionScore = gradeMultipleChoice(userAnswer, question);
                    gradingInfo.feedback = questionScore > 0 ? '정답' : '오답';
                    break;
                    
                case 'shortAnswer':
                    const shortResult = gradeShortAnswer(userAnswer, question);
                    questionScore = shortResult.score;
                    gradingInfo.feedback = shortResult.feedback;
                    break;
                    
                case 'essay':
                    const essayResult = gradeEssay(userAnswer, question);
                    questionScore = essayResult.score;
                    gradingInfo.feedback = essayResult.feedback;
                    gradingInfo.needsReview = essayResult.needsReview;
                    break;
                    
                case 'sql':
                    // SQL은 기본적으로 70% 점수 (수동 채점 필요)
                    questionScore = Math.floor(question.points * 0.7);
                    gradingInfo.feedback = 'SQL 문제는 수동 채점이 필요합니다.';
                    gradingInfo.needsReview = true;
                    break;
            }
        } else {
            gradingInfo.feedback = '답안 없음';
        }
        
        gradingInfo.score = questionScore;
        gradingDetails.push(gradingInfo);
        
        totalScore += questionScore;
        categoryScores[question.category].score += questionScore;
    });
    
    return {
        totalScore: totalScore,
        percentage: Math.round((totalScore / 100) * 100),
        categoryScores: categoryScores,
        gradingDetails: gradingDetails
    };
}

// 객관식 채점
function gradeMultipleChoice(userAnswer, question) {
    return userAnswer === question.correctAnswer ? question.points : 0;
}

// 단답식 자동 채점
function gradeShortAnswer(userAnswer, question) {
    if (!question.gradingCriteria) {
        // 채점 기준이 없으면 단순 문자열 비교
        return {
            score: userAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase() ? question.points : 0,
            feedback: '단순 문자열 비교'
        };
    }
    
    const criteria = question.gradingCriteria;
    let score = 0;
    let feedback = '';
    
    // 정규화 함수
    function normalize(text) {
        return text.toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s가-힣]/g, '');
    }
    
    const normalizedAnswer = normalize(userAnswer);
    
    if (criteria.acceptableAnswers) {
        // 허용 가능한 답안들과 비교 (9-10번 문제용)
        const isCorrect = criteria.acceptableAnswers.some(acceptable => 
            normalize(acceptable) === normalizedAnswer ||
            normalizedAnswer.includes(normalize(acceptable))
        );
        
        score = isCorrect ? question.points : 0;
        feedback = isCorrect ? '정답' : '오답';
        
    } else if (criteria.keywords) {
        // 키워드 기반 채점 (카디널리티/디그리 문제용)
        let cardinalityFound = false;
        let degreeFound = false;
        
        if (criteria.keywords.cardinality) {
            cardinalityFound = criteria.keywords.cardinality.some(keyword =>
                normalizedAnswer.includes(normalize(keyword))
            );
        }
        
        if (criteria.keywords.degree) {
            degreeFound = criteria.keywords.degree.some(keyword =>
                normalizedAnswer.includes(normalize(keyword))
            );
        }
        
        if (cardinalityFound && degreeFound) {
            score = question.points; // 2점
            feedback = '카디널리티와 디그리 모두 정답';
        } else if (cardinalityFound || degreeFound) {
            score = 1; // 1점
            feedback = cardinalityFound ? '카디널리티만 정답' : '디그리만 정답';
        } else {
            score = 0;
            feedback = '주요 키워드 누락';
        }
    }
    
    return { score, feedback };
}

// 주관식 반자동 채점
function gradeEssay(userAnswer, question) {
    if (!question.gradingCriteria) {
        return {
            score: Math.floor(question.points * 0.7),
            feedback: '수동 채점 필요',
            needsReview: true
        };
    }
    
    const criteria = question.gradingCriteria;
    let score = 0;
    let feedback = '';
    
    function normalizeEssay(text) {
        return text.toString().toLowerCase().trim();
    }
    
    const normalizedAnswer = normalizeEssay(userAnswer);
    
    // 최소 길이 체크
    if (criteria.minLength && userAnswer.length < criteria.minLength) {
        return {
            score: 0,
            feedback: `답안이 너무 짧습니다 (최소 ${criteria.minLength}자 필요)`,
            needsReview: true
        };
    }
    
    // 필수 키워드 체크
    let requiredCount = 0;
    if (criteria.requiredKeywords) {
        criteria.requiredKeywords.forEach(keyword => {
            if (normalizedAnswer.includes(normalizeEssay(keyword))) {
                requiredCount++;
            }
        });
        score += requiredCount; // 필수 키워드당 1점
    }
    
    // 선택 키워드 체크
    let optionalCount = 0;
    if (criteria.optionalKeywords) {
        criteria.optionalKeywords.forEach(keyword => {
            if (normalizedAnswer.includes(normalizeEssay(keyword))) {
                optionalCount++;
            }
        });
        score += optionalCount * 0.5; // 선택 키워드당 0.5점
    }
    
    // 최대 점수 제한
    score = Math.min(score, question.points);
    
    feedback = `필수 키워드: ${requiredCount}/${criteria.requiredKeywords?.length || 0}, 선택 키워드: ${optionalCount}`;
    
    return {
        score: Math.floor(score * 10) / 10, // 소수점 첫째자리까지
        feedback: feedback,
        needsReview: score < question.points * 0.8 // 80% 미만이면 재검토 필요
    };
}

async function saveExamResult(results) {
    const resultData = {
        student: currentStudent,
        attempt: currentAttempt,
        score: results.totalScore,
        percentage: results.percentage,
        categoryScores: results.categoryScores,
        answers: answers,
        gradingDetails: results.gradingDetails, // 채점 세부사항 추가
        timestamp: new Date().toISOString(),
        timeSpent: (examData.timeLimit * 60) - timeRemaining
    };
    
    try {
        const response = await fetch('/api/save-exam-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resultData)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            console.error('시험 결과 저장 실패:', data.message);
            // 실패 시에도 클라이언트에서 세션에 저장하여 결과 페이지에서 보여줄 수 있도록
        }
    } catch (error) {
        console.error('시험 결과 저장 네트워크 오류:', error);
        // 네트워크 오류 시에도 클라이언트에서 세션에 저장하여 결과 페이지에서 보여줄 수 있도록
    }
}