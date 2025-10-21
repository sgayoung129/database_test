// 새로운 폼 기반 시험 시작 함수
async function startExamWithForm() {
    const nameInput = document.getElementById('examStudentName');
    const phoneInput = document.getElementById('examStudentPhone');
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    
    // 입력 검증
    if (!name) {
        alert('성명을 입력해주세요.');
        nameInput.focus();
        return;
    }
    
    if (!phone) {
        alert('전화번호를 입력해주세요.');
        phoneInput.focus();
        return;
    }
    
    // 전화번호 형식 검증
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
        alert('전화번호를 010-1234-5678 형식으로 입력해주세요.');
        phoneInput.focus();
        return;
    }
    
    try {
        // 서버에서 시험 시도 횟수 확인
        const response = await fetch(`/api/student-attempts/${encodeURIComponent(name)}`);
        const data = await response.json();
        
        if (data.success) {
            const currentAttempt = data.currentAttempts + 1;
            const MAX_ATTEMPTS = 3;
            
            if (!data.canTakeExam) {
                alert(`${name}님은 이미 ${MAX_ATTEMPTS}회 시험을 완료하셨습니다. 더 이상 시험을 볼 수 없습니다.`);
                return;
            }
            
            if (confirm(`${name}님의 ${currentAttempt}/${MAX_ATTEMPTS}회차 시험을 시작하시겠습니까?\n전화번호: ${phone}`)) {
                // 시험 페이지로 이동 (학생 이름을 URL 파라미터로 전달)
                window.location.href = `exam.html?student=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`;
            }
        } else {
            throw new Error(data.message || '시도 횟수 확인 실패');
        }
    } catch (error) {
        console.error('시험 시도 횟수 확인 오류:', error);
        alert('시험 시도 횟수 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
}

// 기존 시험 시작 함수 (호환성 유지)
async function startExam() {
    const name = prompt('시험을 시작하기 전에 성명을 입력해주세요:');
    if (name && name.trim()) {
        try {
            // 서버에서 시험 시도 횟수 확인
            const response = await fetch(`/api/student-attempts/${encodeURIComponent(name.trim())}`);
            const data = await response.json();
            
            if (data.success) {
                const currentAttempt = data.currentAttempts + 1;
                const MAX_ATTEMPTS = 3;
                
                if (!data.canTakeExam) {
                    alert(`${name.trim()}님은 이미 ${MAX_ATTEMPTS}회 시험을 완료하셨습니다. 더 이상 시험을 볼 수 없습니다.`);
                    return;
                }
                
                if (confirm(`${name.trim()}님의 ${currentAttempt}/${MAX_ATTEMPTS}회차 시험을 시작하시겠습니까?`)) {
                    // 시험 페이지로 이동 (학생 이름을 URL 파라미터로 전달)
                    window.location.href = `exam.html?student=${encodeURIComponent(name.trim())}`;
                }
            } else {
                throw new Error(data.message || '시도 횟수 확인 실패');
            }
        } catch (error) {
            console.error('시험 시도 횟수 확인 오류:', error);
            alert('시험 시도 횟수 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    } else if (name !== null) {
        alert('성명을 입력해주세요.');
    }
}

// 제출 폼 보이기
function showSubmissionForm() {
    document.querySelector('.exam-menu').style.display = 'none';
    document.getElementById('submissionSection').style.display = 'block';
}

// 메인 메뉴로 돌아가기
function showMainMenu() {
    document.querySelector('.exam-menu').style.display = 'block';
    document.getElementById('submissionSection').style.display = 'none';
    
    // 폼 초기화
    document.getElementById('submissionForm').reset();
    document.getElementById('fileName').textContent = '';
    document.getElementById('submissionMessage').textContent = '';
    document.getElementById('submissionMessage').className = 'message';
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('submissionForm');
    const fileInput = document.getElementById('file');
    const dragDropArea = document.getElementById('dragDropArea');
    const fileName = document.getElementById('fileName');
    const messageDiv = document.getElementById('submissionMessage');

    // 드래그 앤 드롭 이벤트 처리
    dragDropArea.addEventListener('click', () => {
        fileInput.click();
    });

    dragDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragDropArea.classList.add('dragover');
    });

    dragDropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragDropArea.classList.remove('dragover');
    });

    dragDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dragDropArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 파일 선택 이벤트
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // 파일 처리 함수
    function handleFile(file) {
        // 파일 크기 체크 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            showMessage('파일 크기가 10MB를 초과합니다.', 'error');
            return;
        }

        // 파일 형식 체크
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
                             'application/pdf', 'application/msword', 
                             'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                             'text/plain'];
        
        if (!allowedTypes.includes(file.type)) {
            showMessage('허용되지 않는 파일 형식입니다.', 'error');
            return;
        }

        // 파일 정보 표시
        fileName.textContent = `선택된 파일: ${file.name} (${formatFileSize(file.size)})`;
        
        // 파일 input에 설정
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
    }

    // 파일 크기 포맷팅
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 폼 제출 처리
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // 버튼 비활성화
        submitBtn.disabled = true;
        submitBtn.textContent = '제출 중...';
        
        try {
            // 폼 데이터 생성
            const formData = new FormData();
            formData.append('name', document.getElementById('name').value);
            formData.append('phone', document.getElementById('phone').value);
            formData.append('email', document.getElementById('email').value);
            
            if (fileInput.files[0]) {
                formData.append('file', fileInput.files[0]);
            }

            // 서버로 전송
            const response = await fetch('/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showMessage('제출이 완료되었습니다! 제출 ID: ' + result.submissionId, 'success');
                form.reset();
                fileName.textContent = '';
            } else {
                showMessage(result.message || '제출 중 오류가 발생했습니다.', 'error');
            }

        } catch (error) {
            console.error('제출 오류:', error);
            showMessage('네트워크 오류가 발생했습니다.', 'error');
        } finally {
            // 버튼 활성화
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // 메시지 표시 함수
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // 3초 후 메시지 숨기기
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    // 전화번호 입력 포맷팅
    document.getElementById('phone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        
        if (value.length > 0) {
            if (value.length <= 3) {
                formattedValue = value;
            } else if (value.length <= 7) {
                formattedValue = value.slice(0, 3) + '-' + value.slice(3);
            } else {
                formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
            }
        }
        
        e.target.value = formattedValue;
    });
    
    // 시험 시작 폼의 전화번호 포맷팅
    const examPhoneInput = document.getElementById('examStudentPhone');
    if (examPhoneInput) {
        examPhoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            
            if (value.length > 0) {
                if (value.length <= 3) {
                    formattedValue = value;
                } else if (value.length <= 7) {
                    formattedValue = value.slice(0, 3) + '-' + value.slice(3);
                } else {
                    formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
                }
            }
            
            e.target.value = formattedValue;
        });
    }
});