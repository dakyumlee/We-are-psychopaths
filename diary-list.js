import { db } from "./firebase-config.js";
import { collection, query, orderBy, where, getDocs, limit, startAfter, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let selectedDate = null;
let allDatesWithPosts = [];
let currentDateIndex = -1;

document.addEventListener("DOMContentLoaded", function() {
  const elem = document.getElementById('datepicker');
  const datepicker = new Datepicker(elem, {
    language: 'ko',
    autohide: true
  });

  elem.addEventListener('changeDate', (event) => {
    selectedDate = event.target.value;
    console.log("selectedDate:", selectedDate);
    
    currentDateIndex = allDatesWithPosts.findIndex(date => date === selectedDate);
    
    loadPosts();
    updateNavigationButtons();
  });

  loadDatesWithPosts();
});

async function loadDatesWithPosts() {
  try {
    const q = query(
      collection(db, "diaryPosts"),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const dates = new Set();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.timestamp) {
        const date = data.timestamp.toDate();
        const dateStr = date.toISOString().split('T')[0];
        dates.add(dateStr);
      }
    });
    
    allDatesWithPosts = Array.from(dates).sort((a, b) => new Date(b) - new Date(a));
    console.log("글이 있는 날짜들:", allDatesWithPosts);
    
    highlightDatesWithPosts();
    
  } catch (error) {
    console.error("날짜 로드 중 오류:", error);
  }
}

function highlightDatesWithPosts() {
  setTimeout(() => {
    const datepickerElement = document.getElementById('datepicker');
    if (datepickerElement) {
      const observer = new MutationObserver(() => {
        const dateCells = document.querySelectorAll('.datepicker-cell[data-date]');
        
        dateCells.forEach(cell => {
          const dateStr = cell.getAttribute('data-date');
          if (dateStr && allDatesWithPosts.includes(dateStr)) {
            cell.classList.add('has-posts');
          }
        });
      });
      
      const pickerContainer = document.querySelector('.datepicker-picker');
      if (pickerContainer) {
        observer.observe(pickerContainer, {
          childList: true,
          subtree: true
        });
      }
      
      console.log("달력 하이라이트 준비 완료");
    }
  }, 500);
}

async function loadPosts() {
  console.log("selectedDate:", selectedDate);

  if (!selectedDate) return;

  document.getElementById("selected-date-title").textContent = selectedDate + " 의 일기";

  const startDate = new Date(selectedDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(selectedDate);
  endDate.setHours(23, 59, 59, 999);

  let q = query(
    collection(db, "diaryPosts"),
    where("timestamp", ">=", Timestamp.fromDate(startDate)),
    where("timestamp", "<=", Timestamp.fromDate(endDate)),
    orderBy("timestamp", "desc")
  );

  const postList = document.getElementById("post-list");
  postList.innerHTML = "";

  const querySnapshot = await getDocs(q);
  console.log("쿼리 결과 개수:", querySnapshot.size);

  if (querySnapshot.empty) {
    postList.innerHTML = "<li>해당 날짜에 작성된 일기가 없습니다.</li>";
    return;
  }

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");

    const titleDisplay = data.isPublic
        ? `${data.title}`
        : `비밀글입니다.`;

    li.innerHTML = `
      <a href="diary-post.html?id=${docSnap.id}">${titleDisplay}</a>
    `;

    postList.appendChild(li);
  });
}


function updateNavigationButtons() {
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  const currentPageSpan = document.getElementById("current-page");
  
  if (currentDateIndex === -1) {
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    currentPageSpan.textContent = "날짜 선택";
    return;
  }

  prevBtn.disabled = currentDateIndex === 0;

  nextBtn.disabled = currentDateIndex === allDatesWithPosts.length - 1;
  
  currentPageSpan.textContent = `${currentDateIndex + 1} / ${allDatesWithPosts.length}`;
}

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentDateIndex > 0) {
    currentDateIndex--;
    selectedDate = allDatesWithPosts[currentDateIndex];

    const datepicker = document.getElementById('datepicker');
    datepicker.value = selectedDate;
    
    loadPosts();
    updateNavigationButtons();
  }
});

document.getElementById("next-page").addEventListener("click", () => {
  if (currentDateIndex < allDatesWithPosts.length - 1) {
    currentDateIndex++;
    selectedDate = allDatesWithPosts[currentDateIndex];
  
    const datepicker = document.getElementById('datepicker');
    datepicker.value = selectedDate;
    
    loadPosts();
    updateNavigationButtons();
  }
});

updateNavigationButtons();