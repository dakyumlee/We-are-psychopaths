import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp 
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

class MyDiaryTimeline {
  constructor() {
    this.timeline = null;
    this.itemsDataset = new vis.DataSet();
    this.currentPerson = 'jueun';
    this.timelineData = {
      jueun: [],
      soonkyung: []
    };
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.setupTimeline();
    await this.loadTimelineData();
    this.showPersonTimeline(this.currentPerson);
    this.checkAdminAccess();
  }

  setupEventListeners() {
    document.querySelectorAll('.timeline-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const person = e.target.dataset.person;
        this.switchTimeline(person);
      });
    });

    document.querySelectorAll('.person-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const person = e.target.closest('.person-card').dataset.person;
        this.switchTimeline(person);
      });
    });

    const timelineForm = document.getElementById('timeline-form');
    if (timelineForm) {
      timelineForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addTimelineEvent();
      });
    }
  }

  setupTimeline() {
    const container = document.getElementById('timeline-visualization');
    const options = {
      stack: false,
      editable: false,
      selectable: true,
      margin: { item: 10, axis: 5 },
      orientation: { axis: "bottom" },
      showCurrentTime: true,
      zoomMin: 1000 * 60 * 60 * 24 * 30, // 최소 1개월
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 10, // 최대 10년
      format: {
        minorLabels: {
          day: 'D',
          month: 'MMM',
          year: 'YYYY'
        },
        majorLabels: {
          day: 'MMMM YYYY',
          month: 'YYYY',
          year: ''
        }
      },
      locale: 'ko'
    };

    this.timeline = new vis.Timeline(container, this.itemsDataset, options);

    this.timeline.on('select', (properties) => {
      if (properties.items.length > 0) {
        const selectedId = properties.items[0];
        this.showEventDetails(selectedId);
      }
    });
  }

  async loadTimelineData() {
    try {

      await this.loadDefaultData();
      
      const snaps = await getDocs(
        query(collection(db, "personalTimeline"), orderBy("date", "asc"))
      );
      
      snaps.forEach(doc => {
        const data = doc.data();
        if (this.timelineData[data.person]) {
          this.timelineData[data.person].push({
            id: doc.id,
            start: new Date(data.date),
            content: data.title,
            title: data.title,
            description: data.content,
            type: 'point',
            className: `person-${data.person}`,
            isCustom: true
          });
        }
      });
    } catch (error) {
      console.error("타임라인 데이터 로드 오류:", error);
    }
  }

  loadDefaultData() {
    this.timelineData.jueun = [
      {
        id: 'jueun-1',
        start: new Date('2001-03-15'),
        content: '👶 출생',
        title: '주은 탄생',
        description: '부산에서 태어남. 엄마 순경의 조현병 진단 이후 첫 아이로 태어났다.',
        type: 'point',
        className: 'person-jueun milestone'
      },
      {
        id: 'jueun-2',
        start: new Date('2007-03-01'),
        content: '🎒 초등학교 입학',
        title: '초등학교 입학',
        description: '동네 초등학교에 입학. 어릴 때부터 엄마의 상태를 조심스럽게 살피며 자라기 시작했다.',
        type: 'point',
        className: 'person-jueun'
      },
      {
        id: 'jueun-3',
        start: new Date('2010-06-15'),
        content: '😰 엄마의 재발',
        title: '어린 시절의 혼란',
        description: '초등학교 3학년 때 엄마의 증상이 심해지면서 가족 전체가 어려운 시기를 겪었다. 이때부터 엄마에 대한 복잡한 감정을 갖게 되었다.',
        type: 'point',
        className: 'person-jueun difficult'
      },
      {
        id: 'jueun-4',
        start: new Date('2013-03-01'),
        content: '🏫 중학교 입학',
        title: '사춘기의 시작',
        description: '중학교에 입학하면서 또래들과 다른 가정환경에 대한 부끄러움과 혼란을 느끼기 시작했다.',
        type: 'point',
        className: 'person-jueun'
      },
      {
        id: 'jueun-5',
        start: new Date('2016-03-01'),
        content: '📚 고등학교 입학',
        title: '진로에 대한 고민',
        description: '고등학교에 진학하면서 미래에 대한 고민이 깊어졌다. 가족을 벗어나고 싶은 마음과 책임감 사이에서 갈등했다.',
        type: 'point',
        className: 'person-jueun'
      },
      {
        id: 'jueun-6',
        start: new Date('2019-03-01'),
        content: '🎓 대학교 입학',
        title: '영상과 입학',
        description: '영상 관련 학과에 입학. 카메라를 통해 세상을 바라보는 방법을 배우기 시작했다.',
        type: 'point',
        className: 'person-jueun milestone'
      },
      {
        id: 'jueun-7',
        start: new Date('2021-09-01'),
        content: '📹 첫 다큐멘터리',
        title: '다큐멘터리에 눈뜨다',
        description: '대학교 과제로 제작한 첫 다큐멘터리가 주변의 좋은 반응을 얻으면서 다큐멘터리 감독의 꿈을 키우기 시작했다.',
        type: 'point',
        className: 'person-jueun milestone'
      },
      {
        id: 'jueun-8',
        start: new Date('2023-02-15'),
        content: '🎬 졸업 작품',
        title: '대학교 졸업',
        description: '가족을 소재로 한 졸업 작품을 제작하면서 엄마와 가족에 대해 다시 생각하게 되었다.',
        type: 'point',
        className: 'person-jueun milestone'
      },
      {
        id: 'jueun-9',
        start: new Date('2024-06-01'),
        content: '💡 기획 시작',
        title: '다큐 기획 시작',
        description: '엄마와 가족의 이야기를 본격적으로 다큐멘터리로 만들기로 결심하고 기획을 시작했다.',
        type: 'point',
        className: 'person-jueun milestone'
      },
      {
        id: 'jueun-10',
        start: new Date('2024-11-15'),
        content: '🎥 촬영 시작',
        title: '본격적인 제작 시작',
        description: '부산 영상위원회 지원을 받아 본격적인 다큐멘터리 제작에 돌입했다.',
        type: 'point',
        className: 'person-jueun milestone current'
      }
    ];

    this.timelineData.soonkyung = [
      {
        id: 'soonkyung-1',
        start: new Date('1968-08-20'),
        content: '👶 출생',
        title: '순경 탄생',
        description: '경상남도 시골 마을에서 태어남. 7남매 중 셋째로 활발하고 명랑한 성격이었다.',
        type: 'point',
        className: 'person-soonkyung milestone'
      },
      {
        id: 'soonkyung-2',
        start: new Date('1987-05-15'),
        content: '💒 결혼',
        title: '결혼',
        description: '19세에 채욱과 결혼. 젊은 나이에 가정을 꾸리며 행복한 신혼 시절을 보냈다.',
        type: 'point',
        className: 'person-soonkyung milestone'
      },
      {
        id: 'soonkyung-3',
        start: new Date('1990-03-10'),
        content: '😷 첫 증상',
        title: '이상 증상 시작',
        description: '22세 무렵부터 이상한 소리가 들리고 피해망상이 시작되었다. 당시에는 그저 스트레스로 여겨졌다.',
        type: 'point',
        className: 'person-soonkyung difficult'
      },
      {
        id: 'soonkyung-4',
        start: new Date('1993-11-25'),
        content: '🏥 첫 진단',
        title: '조현병 진단',
        description: '25세에 정신분열병(현 조현병) 진단을 받았다. 가족 모두에게 충격적인 소식이었다.',
        type: 'point',
        className: 'person-soonkyung milestone difficult'
      },
      {
        id: 'soonkyung-5',
        start: new Date('1995-07-01'),
        content: '💊 치료 시작',
        title: '본격적인 치료',
        description: '꾸준한 약물 치료와 상담을 통해 증상이 어느 정도 안정되기 시작했다.',
        type: 'point',
        className: 'person-soonkyung'
      },
      {
        id: 'soonkyung-6',
        start: new Date('2001-03-15'),
        content: '👶 딸 출생',
        title: '주은이 태어남',
        description: '33세에 딸 주은을 낳았다. 아이에게 좋은 엄마가 되고 싶다는 마음이 컸다.',
        type: 'point',
        className: 'person-soonkyung milestone'
      },
      {
        id: 'soonkyung-7',
        start: new Date('2005-08-20'),
        content: '🌧️ 재발',
        title: '증상 재발',
        description: '육아 스트레스와 여러 요인으로 증상이 재발했다. 가족 모두가 힘든 시기를 보냈다.',
        type: 'point',
        className: 'person-soonkyung difficult'
      },
      {
        id: 'soonkyung-8',
        start: new Date('2010-06-15'),
        content: '😰 심한 재발',
        title: '증상 악화',
        description: '주은이 초등학교 시절, 증상이 크게 악화되어 입원 치료를 받았다.',
        type: 'point',
        className: 'person-soonkyung difficult'
      },
      {
        id: 'soonkyung-9',
        start: new Date('2015-12-01'),
        content: '🌱 안정기',
        title: '증상 안정화',
        description: '꾸준한 치료와 가족의 도움으로 증상이 많이 안정되었다. 일상생활이 가능해졌다.',
        type: 'point',
        className: 'person-soonkyung milestone'
      },
      {
        id: 'soonkyung-10',
        start: new Date('2020-03-01'),
        content: '💪 자립 노력',
        title: '작은 일자리',
        description: '증상이 안정되면서 집 근처에서 간단한 일을 시작했다. 자립에 대한 의지가 생겼다.',
        type: 'point',
        className: 'person-soonkyung milestone'
      },
      {
        id: 'soonkyung-11',
        start: new Date('2024-11-15'),
        content: '📹 다큐 촬영',
        title: '딸의 다큐멘터리 참여',
        description: '주은이의 다큐멘터리 프로젝트에 참여하면서 자신의 이야기를 세상에 들려주기로 했다.',
        type: 'point',
        className: 'person-soonkyung milestone current'
      }
    ];
  }

  switchTimeline(person) {
    if (person === this.currentPerson) return;
    
    this.currentPerson = person;
    
    document.querySelectorAll('.timeline-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.person === person) {
        btn.classList.add('active');
      }
    });
    
    document.querySelectorAll('.person-card').forEach(card => {
      card.classList.remove('active');
      if (card.dataset.person === person) {
        card.classList.add('active');
      }
    });
    
    const descriptions = {
      jueun: '감독이자 딸인 주은의 삶의 궤적을 따라가보세요.',
      soonkyung: '조현병과 함께 살아가는 엄마 순경의 인생 여정을 만나보세요.'
    };
    
    document.getElementById('timeline-description').textContent = descriptions[person];

    this.showPersonTimeline(person);
    
    this.hideEventDetails();
  }

  showPersonTimeline(person) {
    const timelineData = this.timelineData[person] || [];
    
    this.itemsDataset.clear();
    this.itemsDataset.add(timelineData);
    
    if (timelineData.length > 0) {
      const dates = timelineData.map(item => item.start);
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      minDate.setFullYear(minDate.getFullYear() - 1);
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      
      this.timeline.setWindow(minDate, maxDate);
    }
  }

  showEventDetails(eventId) {
    const allData = [...this.timelineData.jueun, ...this.timelineData.soonkyung];
    const event = allData.find(item => item.id === eventId);
    
    if (!event) return;
    
    const detailsContainer = document.getElementById('timeline-details');
    
    detailsContainer.innerHTML = `
      <div class="event-detail active">
        <h3>${event.title}</h3>
        <div class="event-date">${event.start.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</div>
        <div class="event-content">${event.description}</div>
      </div>
    `;
  }

  hideEventDetails() {
    const detailsContainer = document.getElementById('timeline-details');
    detailsContainer.innerHTML = `
      <div class="details-placeholder">
        <p>타임라인의 특정 시점을 클릭하면 자세한 내용을 볼 수 있습니다.</p>
      </div>
    `;
  }

  checkAdminAccess() {
    if (window.adminSystem && window.adminSystem.isLoggedIn) {
      this.showAdminSection();
    }

    window.addEventListener('adminLogin', () => {
      this.showAdminSection();
    });
  }

  showAdminSection() {
    const adminSection = document.getElementById('admin-section');
    if (adminSection) {
      adminSection.style.display = 'block';
    }
  }

  async addTimelineEvent() {
    if (!window.adminSystem || !window.adminSystem.isLoggedIn) {
      alert('관리자 권한이 필요합니다.');
      return;
    }
    
    const person = document.getElementById('person-select').value;
    const date = document.getElementById('event-date').value;
    const title = document.getElementById('event-title').value.trim();
    const content = document.getElementById('event-content').value.trim();
    
    if (!person || !date || !title || !content) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    
    try {
      await addDoc(collection(db, "personalTimeline"), {
        person,
        date,
        title,
        content,
        timestamp: serverTimestamp()
      });

      const newEvent = {
        id: `custom-${Date.now()}`,
        start: new Date(date),
        content: title,
        title,
        description: content,
        type: 'point',
        className: `person-${person}`,
        isCustom: true
      };
      
      this.timelineData[person].push(newEvent);
      this.timelineData[person].sort((a, b) => a.start - b.start);

      if (this.currentPerson === person) {
        this.showPersonTimeline(person);
      }
  
      document.getElementById('timeline-form').reset();
      
      alert('이벤트가 성공적으로 추가되었습니다!');
      
    } catch (error) {
      console.error('이벤트 추가 오류:', error);
      alert('이벤트 추가 중 오류가 발생했습니다.');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.myDiaryTimeline = new MyDiaryTimeline();
});