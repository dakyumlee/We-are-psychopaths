import { db } from "../firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ADMIN_KEY = "3292";
let isAdmin = false;


const adminCheckEl = document.getElementById("admin-check");
const adminKeyEl   = document.getElementById("admin-key");
const adminBtnEl   = document.getElementById("admin-btn");
const formSection  = document.getElementById("event-form-section");
const eventForm    = document.getElementById("event-form");


const itemsDS  = new vis.DataSet();
const container = document.getElementById("timeline");
const options = {
  stack: false,
  editable: false,
  margin: { item: 10, axis: 5 },
  orientation: { axis: "bottom" },
  showCurrentTime: true,
  zoomMin: 1000 * 60 * 60 * 24 * 7,
  zoomMax: 1000 * 60 * 60 * 24 * 365 * 5
};
const timeline = new vis.Timeline(container, itemsDS, options);

async function loadEvents() {
  const snaps = await getDocs(
    query(collection(db, "timelineEvents"), orderBy("timestamp", "asc"))
  );
  itemsDS.clear();
  snaps.forEach(docSnap => {
    const { start, content } = docSnap.data();
    itemsDS.add({ id: docSnap.id, start, content });
  });
}


loadEvents();


adminBtnEl.addEventListener("click", () => {
  if (adminKeyEl.value === ADMIN_KEY) {
    isAdmin = true;
    adminCheckEl.style.display = "none";
    formSection.style.display = "block";
  } else {
    alert("관리자 키가 틀렸습니다");
  }
});

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const date    = document.getElementById("event-date").value;
  const content = document.getElementById("event-content").value.trim();
  if (!date || !content) return alert("날짜와 내용을 모두 입력하세요");
  await addDoc(collection(db, "timelineEvents"), {
    start: date,
    content,
    timestamp: serverTimestamp()
  });
  eventForm.reset();
  loadEvents();
});

timeline.on("select", async (props) => {
  if (!isAdmin || props.items.length === 0) return;
  const id   = props.items[0];
  const item = itemsDS.get(id);

  const action = prompt(
    "수정하려면 `edit`, 삭제하려면 `delete`를 입력하세요."
  );
  if (action === "edit") {
    const newDate    = prompt("새 날짜 (YYYY-MM-DD)", item.start);
    if (newDate === null) return;
    const newContent = prompt("새 내용", item.content);
    if (newContent === null) return;
    await updateDoc(doc(db, "timelineEvents", id), {
      start: newDate,
      content: newContent
    });
    loadEvents();
  } else if (action === "delete") {
    if (confirm("정말 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "timelineEvents", id));
      loadEvents();
    }
  }
});
