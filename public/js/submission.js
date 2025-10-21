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
});