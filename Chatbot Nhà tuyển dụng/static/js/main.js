// DOM Elements
const fileUpload = document.getElementById('file-upload');
const uploadProgress = document.getElementById('upload-progress');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const documentsList = document.getElementById('documents');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const sourcesPanel = document.getElementById('sources-panel');
const sourcesContent = document.getElementById('sources-content');
const closeSourcesBtn = document.getElementById('close-sources');

// State
let lastSources = [];

// Initialize application
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Event listeners
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    sendBtn.addEventListener('click', sendMessage);
    closeSourcesBtn.addEventListener('click', toggleSourcesPanel);
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
