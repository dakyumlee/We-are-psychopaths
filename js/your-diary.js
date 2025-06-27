import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc,
  updateDoc,
  deleteDoc,
  query, 
  orderBy, 
  limit,
  startAfter,
  where,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const db = getFirestore(app);

class YourDiaryBoard {
  constructor() {
    this.stories = [];
    this.lastVisible = null;
    this.currentSort = 'recent';
    this.currentCategory = '';
    this.loadLimit = 10;
    this.currentStoryId = null;
    this.comments = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadStories();
    this.setupModal();
  }

  setupEventListeners() {
    const storyForm = document.getElementById('story-form');
    storyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitStory();
    });

    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.addEventListener('change', (e) => {
      this.currentCategory = e.target.value;
      this.resetAndLoadStories();
    });

    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.changeSortOrder(e.target.dataset.sort);
      });
    });

    const loadMoreBtn = document.getElementById('load-more-btn');
    loadMoreBtn.addEventListener('click', () => {
      this.loadMoreStories();
    });

    const commentForm = document.getElementById('comment-form');
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitComment();
    });
  }

  setupModal() {
    const modal = document.getElementById('story-modal');
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
      this.closeModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        this.closeModal();
      }
    });
  }

  async submitStory() {
    const title = document.getElementById('story-title').value.trim() || '익명의 이야기';
    const category = document.getElementById('story-category').value;
    const content = document.getElementById('story-content').value.trim();
    const youtubeLink = document.getElementById('youtube-link').value.trim();
    const nickname = document.getElementById('story-nickname').value.trim() || '익명';

    if (!category || !content) {
      alert('카테고리와 내용은 필수입니다.');
      return;
    }

    let validYoutubeLink = '';
    if (youtubeLink) {
      if (this.isValidYouTubeUrl(youtubeLink)) {
        validYoutubeLink = youtubeLink;
      } else {
        alert('올바른 YouTube 링크를 입력해주세요.');
        return;
      }
    }

    if (this.containsInappropriateContent(content)) {
      alert('부적절한 내용이 포함되어 있습니다. 다시 작성해주세요.');
      return;
    }

    try {
      const storyData = {
        title,
        category,
        content,
        youtubeLink: validYoutubeLink,
        nickname,
        timestamp: serverTimestamp(),
        likes: 0,
        commentCount: 0,
        views: 0
      };

      await addDoc(collection(db, "userStories"), storyData);
      alert('이야기가 성공적으로 공유되었습니다!');
      document.getElementById('story-form').reset();
      this.resetAndLoadStories();
    } catch (error) {
      console.error('이야기 저장 오류:', error);
      alert('이야기 저장 중 오류가 발생했습니다.');
    }
  }

  async loadStories() {
    try {
      let q = collection(db, "userStories");

      if (this.currentCategory) {
        q = query(q, where("category", "==", this.currentCategory));
      }

      const sortField = this.getSortField();
      q = query(q, orderBy(sortField, "desc"));

      if (this.lastVisible) {
        q = query(q, startAfter(this.lastVisible));
      }

      q = query(q, limit(this.loadLimit));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty && this.stories.length === 0) {
        this.showEmptyState();
        return;
      }

      querySnapshot.forEach((doc) => {
        const storyData = { id: doc.id, ...doc.data() };
        this.stories.push(storyData);
      });

      this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      this.renderStories();

      const loadMoreBtn = document.getElementById('load-more-btn');
      if (querySnapshot.docs.length < this.loadLimit) {
        loadMoreBtn.style.display = 'none';
      } else {
        loadMoreBtn.style.display = 'block';
      }

    } catch (error) {
      console.error('이야기 로드 오류:', error);
      this.showErrorState();
    }
  }

  async loadMoreStories() {
    await this.loadStories();
  }

  resetAndLoadStories() {
    this.stories = [];
    this.lastVisible = null;
    document.getElementById('stories-list').innerHTML = '';
    this.loadStories();
  }

  changeSortOrder(sortType) {
    this.currentSort = sortType;
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.sort === sortType) {
        btn.classList.add('active');
      }
    });
    this.resetAndLoadStories();
  }

  getSortField() {
    switch (this.currentSort) {
      case 'likes':
        return 'likes';
      case 'comments':
        return 'commentCount';
      case 'recent':
      default:
        return 'timestamp';
    }
  }

  renderStories() {
    const storiesList = document.getElementById('stories-list');
    this.stories.forEach(story => {
      const storyCard = this.createStoryCard(story);
      storiesList.appendChild(storyCard);
    });
  }

  createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.dataset.storyId = story.id;

    const categoryLabels = {
      daily: '일상 이야기',
      family: '가족 이야기',
      treatment: '치료 경험',
      emotion: '감정 나누기',
      recovery: '회복 과정',
      music: '음악 추천',
      support: '응원 메시지',
      question: '질문/고민',
      other: '기타'
    };

    const timestamp = story.timestamp?.toDate ? story.timestamp.toDate() : new Date();
    const dateString = timestamp.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    card.innerHTML = `
      <div class="story-header">
        <h3 class="story-title">${this.escapeHtml(story.title)}</h3>
        <span class="story-category">${categoryLabels[story.category] || story.category}</span>
      </div>
      <div class="story-meta">
        <span class="story-author">by ${this.escapeHtml(story.nickname)}</span>
        <span class="story-date">${dateString}</span>
      </div>
      <div class="story-preview">
        ${this.escapeHtml(story.content.substring(0, 150))}${story.content.length > 150 ? '...' : ''}
      </div>
      <div class="story-actions">
        <div class="story-stats">
          <span>👀 ${story.views || 0}</span>
          <span>❤️ ${story.likes || 0}</span>
          <span>💬 ${story.commentCount || 0}</span>
          ${story.youtubeLink ? '<span class="youtube-indicator">🎵 음악</span>' : ''}
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      this.openStoryModal(story);
    });

    return card;
  }

  async openStoryModal(story) {
    this.currentStoryId = story.id;

    try {
      await updateDoc(doc(db, "userStories", story.id), {
        views: increment(1)
      });
    } catch (error) {
      console.error('조회수 업데이트 오류:', error);
    }

    const modal = document.getElementById('story-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-story-content');
    const modalYoutube = document.getElementById('modal-youtube');

    modalTitle.textContent = story.title;
    modalContent.textContent = story.content;

    if (story.youtubeLink) {
      const embedUrl = this.getYouTubeEmbedUrl(story.youtubeLink);
      if (embedUrl) {
        modalYoutube.innerHTML = `
          <h4>🎵 추천 음악</h4>
          <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
        `;
        modalYoutube.style.display = 'block';
      }
    } else {
      modalYoutube.style.display = 'none';
    }

    await this.loadComments(story.id);
    modal.style.display = 'block';
  }

  closeModal() {
    const modal = document.getElementById('story-modal');
    modal.style.display = 'none';
    this.currentStoryId = null;
    this.comments = [];
  }

  async loadComments(storyId) {
    try {
      const q = query(
        collection(db, "userStories", storyId, "comments"),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      this.comments = [];

      querySnapshot.forEach((doc) => {
        this.comments.push({ id: doc.id, ...doc.data() });
      });

      this.renderComments();

    } catch (error) {
      console.error('댓글 로드 오류:', error);
    }
  }

  renderComments() {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';

    if (this.comments.length === 0) {
      commentsList.innerHTML = '<p style="text-align: center; color: #b8a082; font-style: italic;">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>';
      return;
    }

    this.comments.forEach(comment => {
      const commentEl = this.createCommentElement(comment);
      commentsList.appendChild(commentEl);
    });
  }

  createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';

    const timestamp = comment.timestamp?.toDate ? comment.timestamp.toDate() : new Date();
    const dateString = timestamp.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    commentDiv.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${this.escapeHtml(comment.nickname)}</span>
        <span class="comment-date">${dateString}</span>
      </div>
      <div class="comment-content">${this.escapeHtml(comment.content)}</div>
    `;

    return commentDiv;
  }

  async submitComment() {
    if (!this.currentStoryId) return;

    const content = document.getElementById('comment-content').value.trim();
    const nickname = document.getElementById('comment-nickname').value.trim() || '익명';

    if (!content) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    if (this.containsInappropriateContent(content)) {
      alert('부적절한 내용이 포함되어 있습니다. 다시 작성해주세요.');
      return;
    }

    try {
      await addDoc(collection(db, "userStories", this.currentStoryId, "comments"), {
        content,
        nickname,
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, "userStories", this.currentStoryId), {
        commentCount: increment(1)
      });

      document.getElementById('comment-form').reset();
      await this.loadComments(this.currentStoryId);
      alert('댓글이 등록되었습니다!');

    } catch (error) {
      console.error('댓글 등록 오류:', error);
      alert('댓글 등록 중 오류가 발생했습니다.');
    }
  }

  isValidYouTubeUrl(url) {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/playlist\?list=)/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\//
    ];
    return patterns.some(pattern => pattern.test(url));
  }

  getYouTubeEmbedUrl(url) {
    try {
      let videoId = '';
      let playlistId = '';

      if (url.includes('playlist?list=')) {
        const playlistMatch = url.match(/[?&]list=([^&]+)/);
        if (playlistMatch) {
          playlistId = playlistMatch[1];
          return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
        }
      }

      if (url.includes('youtube.com/watch?v=')) {
        const videoMatch = url.match(/[?&]v=([^&]+)/);
        if (videoMatch) {
          videoId = videoMatch[1];
        }
      } else if (url.includes('youtu.be/')) {
        const videoMatch = url.match(/youtu\.be\/([^?&]+)/);
        if (videoMatch) {
          videoId = videoMatch[1];
        }
      } else if (url.includes('youtube.com/embed/')) {
        return url;
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

    } catch (error) {
      console.error('YouTube URL 처리 오류:', error);
    }

    return null;
  }

  containsInappropriateContent(text) {
    const inappropriateWords = [
      '바보', '멍청이', '죽어', '자살', '미친', '병신', 
      '씨발', '개새끼', '좆', '년', '놈', '썅',
      '혐오', '차별', '폭력', '테러'
    ];

    const lowerText = text.toLowerCase();
    return inappropriateWords.some(word => lowerText.includes(word));
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showEmptyState() {
    const storiesList = document.getElementById('stories-list');
    storiesList.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #b8a082;">
        <h3 style="margin-bottom: 15px;">📝 아직 이야기가 없습니다</h3>
        <p>첫 번째 이야기를 공유해 주세요!</p>
      </div>
    `;
    document.getElementById('load-more-btn').style.display = 'none';
  }

  showErrorState() {
    const storiesList = document.getElementById('stories-list');
    storiesList.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #ff6b6b;">
        <h3 style="margin-bottom: 15px;">⚠️ 로딩 중 오류가 발생했습니다</h3>
        <p>페이지를 새로고침해 주세요.</p>
      </div>
    `;
    document.getElementById('load-more-btn').style.display = 'none';
  }
}

class DiaryBoardAdmin {
  constructor() {
    this.checkAdminAccess();
  }

  checkAdminAccess() {
    if (window.adminSystem && window.adminSystem.isLoggedIn) {
      this.enableAdminFeatures();
    }

    window.addEventListener('adminLogin', () => {
      this.enableAdminFeatures();
    });
  }

  enableAdminFeatures() {
    this.addDeleteButtons();
  }

  addDeleteButtons() {
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach(card => {
      if (card.querySelector('.admin-delete-btn')) return;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'admin-delete-btn';
      deleteBtn.innerHTML = '🗑️ 삭제';
      deleteBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: #dc3545;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.8em;
        cursor: pointer;
        z-index: 10;
      `;

      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.deleteStory(card.dataset.storyId);
      });

      card.style.position = 'relative';
      card.appendChild(deleteBtn);
    });
  }

  async deleteStory(storyId) {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?\n(무통보 삭제됩니다)')) {
      return;
    }

    try {
      await deleteDoc(doc(db, "userStories", storyId));
      alert('게시글이 삭제되었습니다.');
      window.location.reload();
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.yourDiaryBoard = new YourDiaryBoard();
  window.diaryBoardAdmin = new DiaryBoardAdmin();
});
