// DOM Elements
const fileUpload = document.getElementById('file-upload');
const uploadProgress = document.getElementById('upload-progress');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const careersList = document.getElementById('careers');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const sourcesPanel = document.getElementById('sources-panel');
const sourcesContent = document.getElementById('sources-content');
const closeSourcesBtn = document.getElementById('close-sources');

// Lấy thông tin từ URL
const params = new URLSearchParams(window.location.search);
const name = params.get("name");
const age = params.get("age");
const career = params.get("career");

console.log(`Chào ${name} (${age} tuổi) - Bắt đầu phỏng vấn nghề: ${career}`);


// State
let careersLoaded = false;
let lastSources = [];

// Initialize application
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Event listeners
    fileUpload.addEventListener('change', handleFileUpload);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    sendBtn.addEventListener('click', sendMessage);
    closeSourcesBtn.addEventListener('click', toggleSourcesPanel);
    
    // Load careers list
    loadCareers();
}

// Document handling functions
async function loadCareers() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/processed_documents');  // Sửa lại port đây
        const data = await response.json();
        
        if (data.careers && data.careers.length > 0) {
            renderCareersList(data.careers);
            enableChat();
            careersLoaded = true;
        } else {
            careersList.innerHTML = '<p class="no-documents">Chưa có tài liệu nào</p>';
        }
    } catch (error) {
        console.error('Error loading documents:', error);
        showErrorMessage('Không thể tải danh sách tài liệu');
    }
}


function renderCareersList(careers) {
    careersList.innerHTML = '';
    
    careers.forEach(doc => {
        const li = document.createElement('li');
        const iconClass = doc.name.endsWith('.pdf') ? 'fa-file-pdf' : 'fa-file-alt';
        
        li.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <span>${doc.name}</span>
        `;
        
        careersList.appendChild(li);
    });
}

async function handleFileUpload() {
    if (!fileUpload.files.length) return;
    
    const file = fileUpload.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    // Show progress
    uploadProgress.hidden = false;
    progressFill.style.width = '10%';
    progressText.textContent = 'Đang tải lên...';
    
    try {
        progressFill.style.width = '30%';
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        progressFill.style.width = '70%';
        progressText.textContent = 'Đang xử lý...';
        
        const data = await response.json();
        
        if (data.success) {
            progressFill.style.width = '100%';
            progressText.textContent = 'Hoàn thành!';
            
            // Add success message to chat
            addBotMessage(`Tài liệu "${file.name}" đã được tải lên và xử lý thành công. Bạn có thể bắt đầu đặt câu hỏi ngay bây giờ.`);
            
            // Reload careers list
            setTimeout(() => {
                uploadProgress.hidden = true;
                loadCareers();
            }, 1500);
        } else {
            throw new Error(data.error || 'Xử lý tài liệu thất bại');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        progressFill.style.width = '100%';
        progressFill.style.backgroundColor = 'var(--danger-color)';
        progressText.textContent = 'Lỗi: ' + error.message;
        
        setTimeout(() => {
            uploadProgress.hidden = true;
            progressFill.style.backgroundColor = 'var(--primary-color)';
        }, 3000);
    } finally {
        // Reset file input
        fileUpload.value = '';
    }
}

// Chat functions
function enableChat() {
    userInput.disabled = false;
    sendBtn.disabled = false;
}

function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
        <div class="message-time">${currentTime}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(message, sources = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let messageHtml = `
        <div class="message-content">
            <p>${message.replace(/\n/g, '</p><p>')}</p>
        </div>
        <div class="message-time">${currentTime}</div>
    `;
    
    if (sources && sources.length > 0) {
        lastSources = sources;
        messageHtml += `<button class="sources-btn" onclick="toggleSourcesPanel()">Xem nguồn (${sources.length})</button>`;
    }
    
    messageDiv.innerHTML = messageHtml;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (sources && sources.length > 0) {
        updateSourcesPanel(sources);
    }
}

function addLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot loading';
    loadingDiv.id = 'loading-message';
    
    loadingDiv.innerHTML = `
        <div class="loading-dots">
            <div></div>
            <div></div>
            <div></div>
        </div>
    `;
    
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message bot';
    
    errorDiv.innerHTML = `
        <div class="message-content">
            <p style="color: var(--danger-color);">
                <i class="fas fa-exclamation-circle"></i> ${message}
            </p>
        </div>
    `;
    
    chatMessages.appendChild(errorDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    // if (!careersLoaded) {
    //     showErrorMessage('Vui lòng tải lên ít nhất một tài liệu trước khi đặt câu hỏi');
    //     return;
    // }
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input
    userInput.value = '';
    
    // Add loading indicator
    addLoadingMessage();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        // Remove loading indicator
        removeLoadingMessage();
        
        if (data.error) {
            showErrorMessage(data.error);
        } else {
            addBotMessage(data.answer, data.sources);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        removeLoadingMessage();
        showErrorMessage('Không thể gửi tin nhắn. Vui lòng thử lại sau.');
    }
}

// Sources panel functions
function toggleSourcesPanel() {
    sourcesPanel.classList.toggle('active');
    
    if (sourcesPanel.classList.contains('active') && lastSources.length > 0) {
        updateSourcesPanel(lastSources);
    }
}

function updateSourcesPanel(sources) {
    sourcesContent.innerHTML = '';
    
    if (!sources || sources.length === 0) {
        sourcesContent.innerHTML = '<p class="no-sources">Chưa có nguồn thông tin nào</p>';
        return;
    }
    
    sources.forEach((source, index) => {
        const sourceDiv = document.createElement('div');
        sourceDiv.className = 'source-item';
        
        sourceDiv.innerHTML = `
            <div class="source-title">${escapeHtml(source.title)}</div>
            <div class="source-text">${escapeHtml(source.content)}</div>
        `;
        
        sourcesContent.appendChild(sourceDiv);
    });
}

// Helper functions
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function loadCareerData() {
    try {
        const response = await fetch('data.json');  // Đảm bảo đúng đường dẫn đến data.json
        const data = await response.json();
        
        // Tìm nghề nghiệp trong danh sách
        const careerData = data.careers.find(c => c.name.toLowerCase() === career.toLowerCase());
        
        if (careerData) {
            // Hiển thị tiêu chí phỏng vấn cho nghề nghiệp này
            renderCareerCriteria(careerData);
        } else {
            console.log("Không tìm thấy nghề nghiệp trong dữ liệu.");
        }
    } catch (error) {
        console.error('Error loading career data:', error);
    }
}

function renderCareerCriteria(careerData) {
    // Duyệt qua các tiêu chí và hiển thị chúng
    const criteriaContainer = document.getElementById('criteria-container');
    careerData.criteria.forEach(criterion => {
        const criterionElement = document.createElement('div');
        criterionElement.classList.add('criterion');
        
        const criterionName = document.createElement('h3');
        criterionName.textContent = criterion.name;
        
        const levelsList = document.createElement('ul');
        criterion.levels.forEach(level => {
            const levelItem = document.createElement('li');
            levelItem.textContent = `${level.score}: ${level.description}`;
            levelsList.appendChild(levelItem);
        });
        
        criterionElement.appendChild(criterionName);
        criterionElement.appendChild(levelsList);
        criteriaContainer.appendChild(criterionElement);
    });
}

function handleAnswerSubmit() {
    const userAnswer = document.getElementById('user-answer').value;
    const selectedScore = parseInt(document.querySelector('input[name="knowledge-level"]:checked').value);
    
    const resultMessage = `Điểm của bạn cho câu trả lời: ${selectedScore}`;
    document.getElementById('result').textContent = resultMessage;
    
    // Gửi thông tin đến chatbot hoặc backend để xử lý thêm (nếu cần)
}
