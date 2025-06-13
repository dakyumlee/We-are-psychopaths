import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");
const form = document.getElementById("post-form");
const titleInput = document.getElementById("title-input");
const contentInput = document.getElementById("content-input");

if (postId) {
  getDoc(doc(db, "posts", postId)).then(snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      titleInput.value = data.title;
      contentInput.value = data.content;
    }
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!title || !content) return alert("제목과 내용을 입력해주세요");

  if (postId) {
    await updateDoc(doc(db, "posts", postId), {
      title,
      content
    });
  } else {
    await addDoc(collection(db, "posts"), {
      title,
      content,
      timestamp: serverTimestamp(),
      viewCount: 0,
      likeCount: 0
    });
  }

  alert("저장 완료!");
  location.href = postId
    ? `community-post.html?id=${postId}`
    : "community-list.html";
});
s