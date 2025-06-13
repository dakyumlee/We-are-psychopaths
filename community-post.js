import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");
const postRef = doc(db, "posts", postId);

const postTitle = document.getElementById("post-title");
const postContent = document.getElementById("post-content");
const viewCountEl = document.getElementById("view-count");
const likeCountEl = document.getElementById("like-count");
const likeBtn = document.getElementById("like-btn");
const editBtn = document.getElementById("edit-btn");
const deleteBtn = document.getElementById("delete-btn");
const commentForm = document.getElementById("comment-form");
const commentInput = document.getElementById("comment-input");
const commentsList = document.getElementById("comments-list");

async function loadPost() {
  const snap = await getDoc(postRef);
  if (!snap.exists()) return alert("게시글을 찾을 수 없음");
  const data = snap.data();
  postTitle.textContent = data.title;
  postContent.textContent = data.content;
  viewCountEl.textContent = data.viewCount || 0;
  likeCountEl.textContent = data.likeCount || 0;
}

async function loadComments() {
  commentsList.innerHTML = "";
  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("timestamp", "asc")
  );
  const snaps = await getDocs(q);
  snaps.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.textContent = data.text;
    commentsList.appendChild(li);
  });
}

async function init() {
  await updateDoc(postRef, { viewCount: increment(1) });
  await loadPost();
  await loadComments();
}

likeBtn.addEventListener("click", async () => {
  await updateDoc(postRef, { likeCount: increment(1) });
  likeCountEl.textContent = Number(likeCountEl.textContent) + 1;
});

editBtn.addEventListener("click", () => {
  location.href = `community-write.html?id=${postId}`;
});

deleteBtn.addEventListener("click", async () => {
  if (confirm("정말 삭제할건가요?")) {
    await deleteDoc(postRef);
    location.href = "community-list.html";
  }
});

commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = commentInput.value.trim();
  if (!text) return;
  await addDoc(collection(db, "posts", postId, "comments"), {
    text,
    timestamp: serverTimestamp()
  });
  commentInput.value = "";
  await loadComments();
});

init();
