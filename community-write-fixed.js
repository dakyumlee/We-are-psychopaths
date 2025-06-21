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
const authorInput = document.getElementById("author-input");


if (postId) {
  document.getElementById("form-title").textContent = "글 수정";
  document.querySelector('button[type="submit"]').textContent = "수정 완료";
  
  getDoc(doc(db, "posts", postId)).then(snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      titleInput.value = data.title;
      contentInput.value = data.content;
      authorInput.value = data.author || "";
    }
  }).catch(error => {
    console.error("글 로드 오류:", error);
    alert("글을 불러오는 중 오류가 발생했습니다.");
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const author = authorInput.value.trim() || "익명";
  
  if (!title || !content) {
    alert("제목과 내용을 모두 입력해주세요.");
    return;
  }

  try {
    if (postId) {

      await updateDoc(doc(db, "posts", postId), {
        title,
        content,
        author,
        updatedAt: serverTimestamp()
      });
      alert("글이 성공적으로 수정되었습니다!");
      location.href = `community-post.html?id=${postId}`;
    } else {

      const docRef = await addDoc(collection(db, "posts"), {
        title,
        content,
        author,
        timestamp: serverTimestamp(),
        viewCount: 0,
        likeCount: 0
      });
      alert("글이 성공적으로 등록되었습니다!");
      location.href = `community-post.html?id=${docRef.id}`;
    }
  } catch (error) {
    console.error("글 저장 오류:", error);
    alert("글 저장 중 오류가 발생했습니다.");
  }
});