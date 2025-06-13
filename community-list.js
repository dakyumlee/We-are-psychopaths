import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function loadPosts() {
  const listEl = document.getElementById("post-list");
  listEl.innerHTML = "";

  const q = query(
    collection(db, "posts"),
    orderBy("timestamp", "desc")
  );
  const snaps = await getDocs(q);
  snaps.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const item = document.createElement("div");
    item.className = "post-item";
    item.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.content.substring(0, 100)}${data.content.length > 100 ? "..." : ""}</p>
      <p>조회수: ${data.viewCount || 0} | 좋아요: ${data.likeCount || 0}</p>
      <button>자세히 보기</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      location.href = `community-post.html?id=${id}`;
    });
    listEl.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", loadPosts);
