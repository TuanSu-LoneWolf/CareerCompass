document.addEventListener('DOMContentLoaded', function() {
    // Các phần tử DOM
    const chatTab = document.getElementById('chatTab');
    const uploadTab = document.getElementById('uploadTab');
    const chatSection = document.getElementById('chatSection');
    const uploadSection = document.getElementById('uploadSection');
    const chatMessages = document.getElementById('chatMessages');
    const userQuestion = document.getElementById('userQuestion');
    const sendBtn = document.getElementById('sendBtn');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const uploadForm = document.getElementById('uploadForm');
    const uploadStatus = document.getElementById('uploadStatus');

    // Chuyển tab
    chatTab.addEventListener('click', function() {
        switchTab(chatTab, chatSection);
    });

    uploadTab.addEventListener('click', function() {
        switchTab(uploadTab, uploadSection);
    });

    function switchTab(tabButton, tabContent) {
        // Bỏ active khỏi tất cả các tab
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Thêm active cho tab được chọn
        tabButton.classList.add('active');
        tabContent.classList.add('active');
    }

    // Xử lý gửi câu hỏi
    sendBtn.addEventListener('click', sendQuestion);
    userQuestion.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendQuestion();
        }
    });

    function sendQuestion() {
        const question = userQuestion.value.trim();
        if (!question) return;

        // Thêm tin nhắn người dùng vào chat
        appendMessage('user', question);
        
        // Xóa input
        userQuestion.value = '';
        
        // Hiển thị đang nhập
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="message bot">
                <div class="message-content">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        scrollToBottom();

        // Gửi câu hỏi đến server
        fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        })
        .then(response => response.json())
        .then(data => {
            // Xóa indicator đang nhập
            if (typingIndicator) {
                chatMessages.removeChild(typingIndicator);
            }

            if (data.error) {
                // Xử lý lỗi
                appendMessage('bot', `Xin lỗi, đã xảy ra lỗi: ${data.error}`);
            } else {
                // Hiển thị câu trả lời
                appendMessage('bot', data.answer, data.sources);
            }
        })
        .catch(error => {
            // Xóa indicator đang nhập
            if (typingIndicator) {
                chatMessages.removeChild(typingIndicator);
            }
            
            console.error('Error:', error);
            appendMessage('bot', 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.');
        });
    }

    function appendMessage(sender, text, sources = []) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        // Xử lý markdown trong text (đơn giản)
        const formattedText = formatText(text);

        let sourcesHtml = '';
        if (sources && sources.length > 0) {
            sourcesHtml = '<div class="sources">Nguồn tham khảo: ';
            sources.forEach(source => {
                const pageInfo = source.page ? ` (trang ${source.page})` : '';
                sourcesHtml += `<span class="source-item">${source.source}${pageInfo}</span>`;
            });
            sourcesHtml += '</div>';
        }

        messageDiv.innerHTML = `
            <div class="message-content">
                ${formattedText}
                ${sourcesHtml}
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function formatText(text) {
        // Xử lý xuống dòng
        let formatted = text.replace(/\n/g, '<br>');
        
        // Xử lý bold text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Xử lý italic text
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return formatted;
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Xử lý upload file
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileInfo.textContent = `File đã chọn: ${file.name} (${formatFileSize(file.size)})`;
        } else {
            fileInfo.textContent = '';
        }
    });

    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!fileInput.files.length) {
            showUploadStatus('Vui lòng chọn file để tải lên', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        // Hiển thị trạng thái đang tải
        showUploadStatus('Đang tải file lên và xử lý...', '');
        
        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showUploadStatus(`Lỗi: ${data.error}`, 'error');
            } else {
                showUploadStatus(`${data.success}`, 'success');
                // Reset form
                uploadForm.reset();
                fileInfo.textContent = '';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showUploadStatus('Đã xảy ra lỗi khi tải file lên. Vui lòng thử lại sau.', 'error');
        });
    });

    function showUploadStatus(message, status) {
        uploadStatus.textContent = message;
        uploadStatus.className = 'upload-status';
        if (status) {
            uploadStatus.classList.add(status);
        }
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / 1048576).toFixed(2) + ' MB';
    }
});