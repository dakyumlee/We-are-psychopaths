import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let lastVisible = null;
let isLoading = false;

async function loadPosts(isLoadMore = false) {
  if (isLoading) return;
  isLoading = true;
  
  try {
    const listEl = document.getElementById("post-list");
    const loadMoreBtn = document.getElementById("load-more");
    
    if (!isLoadMore) {
      listEl.innerHTML = "";
      lastVisible = null;
    }

    let q = query(
      collection(db, "posts"),
      orderBy("timestamp", "desc"),
      limit(10)
    );
    
    if (lastVisible && isLoadMore) {
      q = query(
        collection(db, "posts"),
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(10)
      );
    }

    const snaps = await getDocs(q);
    
    if (snaps.empty) {
      if (!isLoadMore) {
        listEl.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #f5f0e6; font-style: italic;">
            아직 작성된 글이 없습니다. 첫 번째 글을 작성해보세요!
          </div>
        `;
      }
      loadMoreBtn.style.display = 'none';
      return;
    }

    snaps.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;

      let dateStr = "방금 전";
      if (data.timestamp) {
        const date = data.timestamp.toDate();
        dateStr = date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      const item = document.createElement("div");
      item.className = "post-item";
      item.innerHTML = `
        <h3 style="margin-bottom: 0.5rem; color: #f5f0e6;">${data.title}</h3>
        <p style="margin: 0.5rem 0; color: #d0d0d0; line-height: 1.4;">
          ${data.content.length > 150 ? data.content.substring(0, 150) + "..." : data.content}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 0.9em; color: #b0b0b0;">
          <span>작성일: ${dateStr}</span>
          <div>
            <span style="margin-right: 15px;">👀 ${data.viewCount || 0}</span>
            <span>❤️ ${data.likeCount || 0}</span>
          </div>
        </div>
        <button style="
          margin-top: 0.5rem;
          padding: 5px 10px;
          background-color: #8d6e63;
          color: #f5f0e6;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Song Myung', serif;
        ">자세히 보기</button>
      `;
      
      item.querySelector("button").addEventListener("click", () => {
        location.href = `community-post.html?id=${id}`;
      });
      
      item.querySelector("h3").style.cursor = "pointer";
      item.querySelector("h3").addEventListener("click", () => {
        location.href = `community-post.html?id=${id}`;
      });
      
      listEl.appendChild(item);
    });

    lastVisible = snaps.docs[snaps.docs.length - 1];
    
    if (snaps.docs.length < 10) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
    
  } catch (error) {
    console.error("게시글 로드 오류:", error);
    const listEl = document.getElementById("post-list");
    if (!isLoadMore) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #f5f0e6;">
          게시글을 불러오는 중 오류가 발생했습니다.
        </div>
      `;
    }
  } finally {
    isLoading = false;
  }
}

document.getElementById("load-more").addEventListener("click", () => {
  loadPosts(true);
});

document.addEventListener("DOMContentLoaded", () => {
  loadPosts();
});