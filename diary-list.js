import { db } from "./firebase-config.js";
import { collection, query, orderBy, where, getDocs, limit, startAfter, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentPage = 1;
const postsPerPage = 5;
let lastVisible = null;
let selectedDate = null;

document.addEventListener("DOMContentLoaded", function() {
  const elem = document.getElementById('datepicker');
  const datepicker = new Datepicker(elem, {
    language: 'ko',
    autohide: true
  });

  elem.addEventListener('changeDate', (event) => {
    selectedDate = event.target.value;
    console.log("selectedDate:", selectedDate);

    document.getElementById("current-page").textContent = "1";
    currentPage = 1;
    lastVisible = null;
    loadPosts();
  });
});

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
    orderBy("timestamp", "desc"),
    limit(postsPerPage)
  );

  if (lastVisible && currentPage > 1) {
    q = query(
      collection(db, "diaryPosts"),
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      where("timestamp", "<=", Timestamp.fromDate(endDate)),
      orderBy("timestamp", "desc"),
      startAfter(lastVisible),
      limit(postsPerPage)
    );
  }

  const postList = document.getElementById("post-list");
  postList.innerHTML = "";

  const querySnapshot = await getDocs(q);
  console.log("쿼리 결과 개수:", querySnapshot.size);

  if (querySnapshot.empty) {
    postList.innerHTML = "<li>해당 날짜에 작성된 일기가 없습니다.</li>";
    document.getElementById("current-page").textContent = currentPage;
    return;
  }

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");

    const titleDisplay = data.isPublic
        ? `${data.title} - ${data.author}`
        : `비밀글입니다. - ${data.author}`;

    li.innerHTML = `
      <a href="diary-post.html?id=${docSnap.id}">${titleDisplay}</a>
    `;

    postList.appendChild(li);
  });

  lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
  document.getElementById("current-page").textContent = currentPage;
}

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    lastVisible = null;
    loadPosts();
  }
});

document.getElementById("next-page").addEventListener("click", () => {
  currentPage++;
  loadPosts();
});