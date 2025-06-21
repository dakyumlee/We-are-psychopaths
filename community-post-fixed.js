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

if (!postId) {
  alert("잘못된 접근입니다.");
  location.href = "community-list.html";
}

const postRef = doc(db, "posts", postId);

const postTitle = document.getElementById("post-title");
const postContent = document.getElementById("post-content");
const postAuthor = document.getElementById("post-author");
const postDate = document.getElementById("post-date");
const viewCountEl = document.getElementById("view-count");
const likeCountEl = document.getElementById("like-count");
const commentCountEl = document.getElementById("comment-count");
const likeBtn = document.getElementById("like-btn");
const editBtn = document.getElementById("edit-btn");
const deleteBtn = document.getElementById("delete-btn");
const commentForm = document.getElementById("comment-form");
const commentsList = document.getElementById("comments-list");

let postData = null;

async function loadPost() {
  try {
    const snap = await getDoc(postRef);
    if (!snap.exists()) {
      alert("게시글을 찾을 수 없습니다.");
      location.href = "community-list.html";
      return;
    }
    
    postData = snap.data();
    
    await updateDoc(postRef, { viewCount: increment(1) });
    
    postTitle.textContent = postData.title;
    postContent.textContent = postData.content;
    postAuthor.textContent = `작성자: ${postData.author || "익명"}`;
    
    if (postData.timestamp) {
      const date = postData.timestamp.toDate();
      postDate.textContent = `작성일: ${date.toLocaleDateString('ko-KR')} ${date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
    
    viewCountEl.textContent = (postData.viewCount || 0) + 1;
    likeCountEl.textContent = postData.likeCount || 0;
    
    
  } catch (error) {
    console.error("게시글 로드 오류:", error);
    alert("게시글을 불러오는 중 오류가 발생했습니다.");
  }
}

async function loadComments() {
  try {
    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("timestamp", "asc")
    );
    const snaps = await getDocs(q);
    
    commentsList.innerHTML = "";
    commentCountEl.textContent = `(${snaps.size})`;
    
    snaps.forEach(docSnap => {
      const data = docSnap.data();
      const li = document.createElement("li");
      li.style.cssText = `
        background: rgba(245,240,230,0.05);
        border-left: 4px solid #8d6e63;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 4px;
      `;
      
      let dateStr = "방금 전";
      if (data.timestamp) {
        const date = data.timestamp.toDate();
        dateStr = date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <strong style="color: #8d6e63;">${data.author || "익명"}</strong>
          <span style="color: #b0b0b0; font-size: 0.8em;">${dateStr}</span>
        </div>
        <div style="white-space: pre-wrap; line-height: 1.4;">${data.text}</div>
      `;
      
      commentsList.appendChild(li);
    });
  } catch (error) {
    console.error("댓글 로드 오류:", error);
  }
}

likeBtn.addEventListener("click", async () => {
  try {
    await updateDoc(postRef, { likeCount: increment(1) });
    likeCountEl.textContent = Number(likeCountEl.textContent) + 1;
    likeBtn.disabled = true;
    likeBtn.textContent = "👍 좋아요 완료!";
    setTimeout(() => {
      likeBtn.disabled = false;
      likeBtn.textContent = "👍 좋아요";
    }, 2000);
  } catch (error) {
    console.error("좋아요 오류:", error);
  }
});

editBtn.addEventListener("click", () => {
  location.href = `community-write.html?id=${postId}`;
});

deleteBtn.addEventListener("click", async () => {
  if (confirm("정말 삭제하시겠습니까?")) {
    try {
      await deleteDoc(postRef);
      alert("게시글이 삭제되었습니다.");
      location.href = "community-list.html";
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }
});

commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const author = document.getElementById("comment-author").value.trim() || "익명";
  const text = document.getElementById("comment-input").value.trim();
  
  if (!text) {
    alert("댓글 내용을 입력해주세요.");
    return;
  }
  
  try {
    await addDoc(collection(db, "posts", postId, "comments"), {
      author,
      text,
      timestamp: serverTimestamp()
    });
    
    document.getElementById("comment-author").value = "";
    document.getElementById("comment-input").value = "";
    await loadComments();
  } catch (error) {
    console.error("댓글 등록 오류:", error);
    alert("댓글 등록 중 오류가 발생했습니다.");
  }
});

async function init() {
  await loadPost();
  await loadComments();
}

init();