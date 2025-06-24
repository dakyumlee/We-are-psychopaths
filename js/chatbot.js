class Chatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.userId = this.generateUserId();
    this.conversationHistory = [];
    this.sessionId = this.generateSessionId();
    
    this.init();
    this.loadChatHistory();
  }

  generateUserId() {
    let userId = localStorage.getItem('chatbot_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('chatbot_user_id', userId);
    }
    return userId;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  init() {
    this.createChatbotHTML();
    this.bindEvents();
    this.addWelcomeMessage();
    this.initFirebase();
  }

  async initFirebase() {
    try {
      if (!window.db) {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
        
        const firebaseConfig = {
          apiKey: "AIzaSyAIU8q64ZB6g8D72SPcCxxkOQmhtREN9cg",
          authDomain: "we-are-psychopath.firebaseapp.com",
          projectId: "we-are-psychopath",
          storageBucket: "we-are-psychopath.firebasestorage.app",
          messagingSenderId: "1020831167882",
          appId: "1:1020831167882:web:addcfd266307c3bb71c473",
          measurementId: "G-MG2X69DDK8"
        };
        
        const app = initializeApp(firebaseConfig);
        window.db = getFirestore(app);
      }
    } catch (error) {
      console.error('Firebase 초기화 오류:', error);
    }
  }

  createChatbotHTML() {
    const floatBtn = document.createElement('button');
    floatBtn.className = 'chatbot-float-btn';
    floatBtn.innerHTML = '💬';
    floatBtn.title = '상담사와 대화하기';
    
    const container = document.createElement('div');
    container.className = 'chatbot-container';
    container.innerHTML = `
      <div class="chatbot-header">
        <h3>마음 상담사</h3>
        <button class="chatbot-close">×</button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages"></div>
      <div class="chatbot-input-area">
        <input type="text" class="chatbot-input" placeholder="편하게 말씀해 주세요..." maxlength="500">
        <button class="chatbot-send">전송</button>
      </div>
    `;

    document.body.appendChild(floatBtn);
    document.body.appendChild(container);

    this.floatBtn = floatBtn;
    this.container = container;
    this.messagesContainer = container.querySelector('#chatbot-messages');
    this.input = container.querySelector('.chatbot-input');
    this.sendBtn = container.querySelector('.chatbot-send');
    this.closeBtn = container.querySelector('.chatbot-close');
  }

  bindEvents() {
    this.floatBtn.addEventListener('click', () => {
      this.toggleChat();
    });

    this.closeBtn.addEventListener('click', () => {
      this.closeChat();
    });

    this.sendBtn.addEventListener('click', () => {
      this.sendMessage();
    });

    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeChat();
      }
    });
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    this.container.classList.add('active');
    this.isOpen = true;
    this.input.focus();
    this.scrollToBottom();
    this.logChatEvent('chat_opened');
  }

  closeChat() {
    this.container.classList.remove('active');
    this.isOpen = false;
    this.logChatEvent('chat_closed');
  }

  addWelcomeMessage() {
    const welcomeMsg = {
      type: 'bot',
      content: `안녕하세요. 저는 마음 상담사입니다.

이곳에 오시느라 용기 내주셔서 고마워요. 지금 어떤 기분이신지, 또는 무엇이든 편하게 말씀해 주세요.

천천히, 편안한 속도로 이야기해요.`,
      timestamp: new Date()
    };
    
    this.messages.push(welcomeMsg);
    this.renderMessage(welcomeMsg);
  }

  async sendMessage() {
    const content = this.input.value.trim();
    if (!content) return;

    const userMessage = {
      type: 'user',
      content: content,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    this.renderMessage(userMessage);
    this.input.value = '';
    this.sendBtn.disabled = true;

    this.showTypingIndicator();

    try {
      this.conversationHistory.push({ role: 'user', content: content });

      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: this.conversationHistory,
          userId: this.userId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      this.hideTypingIndicator();

      const botMessage = {
        type: 'bot',
        content: data.message,
        timestamp: new Date()
      };

      this.messages.push(botMessage);
      this.renderMessage(botMessage);
      
      this.conversationHistory.push({ role: 'assistant', content: data.message });

      await this.saveChatToFirebase(userMessage, botMessage);

    } catch (error) {
      console.error('챗봇 오류:', error);
      this.hideTypingIndicator();
      
      const errorMessage = {
        type: 'bot',
        content: '죄송합니다. 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        timestamp: new Date()
      };
      
      this.messages.push(errorMessage);
      this.renderMessage(errorMessage);

      await this.logError(error, content);
    } finally {
      this.sendBtn.disabled = false;
      this.input.focus();
    }
  }

  renderMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.type}`;
    
    let content = this.processMessageContent(message.content);
    messageEl.innerHTML = content;

    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  processMessageContent(content) {
    content = content.replace(/(\d{3})/g, '<a href="tel:$1" style="color: #8d6e63; text-decoration: underline;">$1</a>');
    content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: #8d6e63; text-decoration: underline;">$1</a>');
    content = content.replace(/\n/g, '<br>');
    return content;
  }

  showTypingIndicator() {
    const typingEl = document.createElement('div');
    typingEl.className = 'message bot loading';
    typingEl.innerHTML = `
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    typingEl.id = 'typing-indicator';
    
    this.messagesContainer.appendChild(typingEl);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) {
      typingEl.remove();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 100);
  }

  async saveChatToFirebase(userMessage, botMessage) {
    try {
      if (!window.db) return;

      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      
      await addDoc(collection(window.db, 'chatHistory'), {
        userId: this.userId,
        sessionId: this.sessionId,
        userMessage: userMessage.content,
        botMessage: botMessage.content,
        timestamp: serverTimestamp(),
        messageLength: userMessage.content.length,
        conversationTurn: this.conversationHistory.length / 2
      });

      await this.analyzeSaveUserMessage(userMessage.content);

    } catch (error) {
      console.error('대화 저장 오류:', error);
    }
  }

  async analyzeSaveUserMessage(message) {
    try {
      if (!window.db) return;

      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      const emotions = this.detectEmotions(message);
      const topics = this.detectTopics(message);
      const urgency = this.detectUrgency(message);

      await addDoc(collection(window.db, 'chatAnalytics'), {
        userId: this.userId,
        sessionId: this.sessionId,
        message: message,
        messageLength: message.length,
        detectedEmotions: emotions,
        detectedTopics: topics,
        urgencyLevel: urgency,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        page: window.location.pathname
      });

    } catch (error) {
      console.error('메시지 분석 저장 오류:', error);
    }
  }

  detectEmotions(message) {
    const emotionKeywords = {
      sad: ['슬프', '우울', '힘들', '절망', '외로', '눈물', '아프', '죽고싶', '포기'],
      anxious: ['불안', '걱정', '두려', '무서', '떨려', '긴장', '스트레스'],
      angry: ['화가', '짜증', '분노', '억울', '미워', '열받'],
      hopeful: ['희망', '나아질', '좋아질', '괜찮', '감사', '행복'],
      confused: ['모르겠', '혼란', '어떻게', '왜', '이해가안', '헷갈']
    };

    const detected = [];
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        detected.push(emotion);
      }
    }
    return detected;
  }

  detectTopics(message) {
    const topicKeywords = {
      medication: ['약', '복용', '치료', '병원', '의사', '처방'],
      family: ['가족', '부모', '엄마', '아빠', '형제', '자매', '남편', '아내'],
      work: ['직장', '회사', '일', '업무', '상사', '동료'],
      social: ['친구', '사람들', '관계', '외출', '모임'],
      symptoms: ['환청', '망상', '증상', '발작', '조현병', '정신'],
      daily: ['일상', '생활', '잠', '식사', '운동']
    };

    const detected = [];
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        detected.push(topic);
      }
    }
    return detected;
  }


  detectUrgency(message) {
    const highUrgencyKeywords = ['죽고싶', '자살', '자해', '끝내고싶', '더이상못', '견딜수없'];
    const mediumUrgencyKeywords = ['힘들어', '도와줘', '응급', '위험', '심각'];
    
    if (highUrgencyKeywords.some(keyword => message.includes(keyword))) {
      return 'high';
    } else if (mediumUrgencyKeywords.some(keyword => message.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  async logChatEvent(eventType) {
    try {
      if (!window.db) return;

      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      
      await addDoc(collection(window.db, 'chatEvents'), {
        userId: this.userId,
        sessionId: this.sessionId,
        eventType: eventType,
        timestamp: serverTimestamp(),
        page: window.location.pathname
      });

    } catch (error) {
      console.error('이벤트 로그 오류:', error);
    }
  }

  // 에러 로그
  async logError(error, userMessage) {
    try {
      if (!window.db) return;

      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      
      await addDoc(collection(window.db, 'chatErrors'), {
        userId: this.userId,
        sessionId: this.sessionId,
        errorMessage: error.message,
        userMessage: userMessage,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        page: window.location.pathname
      });

    } catch (error) {
      console.error('에러 로그 저장 오류:', error);
    }
  }

  loadChatHistory() {
    try {
      const savedHistory = localStorage.getItem(`chatbot_history_${this.userId}`);
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        this.conversationHistory = history.slice(-10);
      }
    } catch (error) {
      console.error('대화 기록 로드 오류:', error);
    }
  }

  saveChatHistory() {
    try {
      localStorage.setItem(`chatbot_history_${this.userId}`, JSON.stringify(this.conversationHistory));
    } catch (error) {
      console.error('대화 기록 저장 오류:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('link[href*="chatbot.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/chatbot.css'; 
    document.head.appendChild(link);
  }

  window.chatbot = new Chatbot();
});