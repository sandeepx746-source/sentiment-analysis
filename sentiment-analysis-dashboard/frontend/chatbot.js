document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-chat');
    const closeBtn = document.getElementById('close-chat');
    const chatContainer = document.getElementById('ai-chatbot');
    const sendBtn = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-messages');

    let isOpen = false;

    // Toggle Chatbot Window
    const toggleChat = () => {
        if (!isOpen) {
            chatContainer.style.display = 'flex';
            gsap.to(chatContainer, {
                y: 0, 
                opacity: 1, 
                duration: 0.5, 
                ease: 'back.out(1.2)'
            });
            toggleBtn.style.transform = 'scale(0)';
        } else {
            gsap.to(chatContainer, {
                y: '150%', 
                opacity: 0, 
                duration: 0.4, 
                ease: 'power2.in',
                onComplete: () => { chatContainer.style.display = 'none'; }
            });
            toggleBtn.style.transform = 'scale(1)';
        }
        isOpen = !isOpen;
    };

    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    // Send Message
    const sendMessage = async () => {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message to UI
        appendMessage(text, 'user');
        chatInput.value = '';

        // Add loading typing indicator
        const loadingId = 'loading-' + Date.now();
        appendTypingIndicator(loadingId);
        
        try {
            const response = await fetch('http://127.0.0.1:5000/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            
            // Remove typing indicator and append bot response
            document.getElementById(loadingId).remove();
            appendMessage(data.response, 'ai');

        } catch (error) {
            document.getElementById(loadingId).remove();
            appendMessage('Connection Error. Cannot reach AI.', 'ai');
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerHTML = `<div class="msg-content">${text}</div>`;
        
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        
        // Simple pop-in animation
        gsap.from(msgDiv, {scale: 0.8, opacity: 0, duration: 0.3, ease: 'back.out(1.5)'});
    }

    function appendTypingIndicator(id) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ai`;
        msgDiv.id = id;
        msgDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
});
