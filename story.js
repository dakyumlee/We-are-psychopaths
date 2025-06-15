import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  updateDoc,
  deleteDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("comment-form");
const list = document.getElementById("comment-list");
const loadMoreBtn = document.getElementById("load-more");
const sortControls = document.querySelectorAll('input[name="sort"]');

let lastVisible = null;
let currentSort = "new";

form.addEventListener("submit", async e => {
  e.preventDefault();
  const nick = document.getElementById("comment-nick").value.trim() || "익명";
  const pw   = document.getElementById("comment-pw").value;
  const text = document.getElementById("comment-text").value.trim();
  await addDoc(collection(db, "ourStories"), {
    nick,
    pw,
    text,
    likes: 0,
    dislikes: 0,
    timestamp: new Date()
  });
  form.reset();
  await loadComments(true);
});

async function loadComments(reset = false) {
  if (reset) {
    list.innerHTML = "";
    lastVisible = null;
  }
  const field = currentSort === "new" ? "timestamp"
              : currentSort === "best" ? "likes"
              : "dislikes";
  let q = query(
    collection(db, "ourStories"),
    orderBy(field, "desc"),
    limit(10)
  );
  if (lastVisible) q = query(q, startAfter(lastVisible));
  const snaps = await getDocs(q);
  snaps.forEach(renderComment);
  lastVisible = snaps.docs[snaps.docs.length - 1];
}

function renderComment(docSnap) {
  const data = docSnap.data();
  const id   = docSnap.id;

  const li = document.createElement("li");
  li.className = "comment-item";

  const rawTs = data.timestamp;
  const dateObj = rawTs.toDate ? rawTs.toDate() : new Date(rawTs);
  const dateStr = dateObj.toLocaleString();

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `${data.nick} · ${dateStr}`;
  li.appendChild(meta);

  const textDiv = document.createElement("div");
  textDiv.className = "text";
  textDiv.textContent = data.text;
  li.appendChild(textDiv);

  const actions = document.createElement("div");
  actions.className = "actions";

  const likeBtn = document.createElement("button");
  likeBtn.className = "like-btn";
  likeBtn.innerHTML = `👍 <span>${data.likes}</span>`;
  likeBtn.addEventListener("click", async e => {
    e.stopPropagation();
    await updateDoc(doc(db, "ourStories", id), { likes: increment(1) });
    await loadComments(true);
  });
  actions.appendChild(likeBtn);

  const dislikeBtn = document.createElement("button");
  dislikeBtn.className = "dislike-btn";
  dislikeBtn.innerHTML = `👎 <span>${data.dislikes}</span>`;
  dislikeBtn.addEventListener("click", async e => {
    e.stopPropagation();
    await updateDoc(doc(db, "ourStories", id), { dislikes: increment(1) });
    await loadComments(true);
  });
  actions.appendChild(dislikeBtn);

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = "✏️";
  editBtn.addEventListener("click", async e => {
    e.stopPropagation();
    const pw = prompt("비밀번호 입력");
    if (pw !== data.pw) return alert("비밀번호가 다릅니다");
    const newText = prompt("수정할 내용", data.text);
    if (newText != null) {
      await updateDoc(doc(db, "ourStories", id), { text: newText });
      await loadComments(true);
    }
  });
  actions.appendChild(editBtn);

  const delBtn = document.createElement("button");
  delBtn.className = "del-btn";
  delBtn.textContent = "🗑️";
  delBtn.addEventListener("click", async e => {
    e.stopPropagation();
    const pw = prompt("비밀번호 입력");
    if (pw !== data.pw) return alert("비밀번호가 다릅니다");
    if (confirm("댓글을 삭제하시겠습니까?")) {
      await deleteDoc(doc(db, "ourStories", id));
      await loadComments(true);
    }
  });
  actions.appendChild(delBtn);

  li.appendChild(actions);
  list.appendChild(li);
}

sortControls.forEach(radio => {
  radio.addEventListener("change", async () => {
    currentSort = radio.value;
    await loadComments(true);
  });
});

loadMoreBtn.addEventListener("click", async () => {
  await loadComments();
});

window.addEventListener("DOMContentLoaded", () => {
  loadComments(true);
});
