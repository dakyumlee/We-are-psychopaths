import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.getElementById("mother-comment-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = document.getElementById("mother-comment-input").value.trim();
  if (!text) return;
  
  try {
    await addDoc(collection(db, "motherComments"), { 
      text, 
      timestamp: serverTimestamp() 
    });
    document.getElementById("mother-comment-input").value = "";
    loadComments();
  } catch (error) {
    console.error("댓글 등록 오류:", error);
    alert("댓글 등록 중 오류가 발생했습니다.");
  }
});

async function loadMusic() {
  try {
    const container = document.getElementById("music-items");
    container.innerHTML = "";
    const snaps = await getDocs(query(collection(db, "motherMusic"), orderBy("timestamp", "desc")));
    
    if (snaps.empty) {
      container.innerHTML = "<p style='text-align: center; color: #f5f0e6; font-style: italic;'>아직 등록된 음악이 없습니다.</p>";
      return;
    }
    
    snaps.forEach(docSnap => {
      const { url, title } = docSnap.data();

      const itemDiv = document.createElement("div");
      itemDiv.className = "music-item";
      itemDiv.innerHTML = `
        <p>${title}</p>
        <iframe
          width="300" height="169"
          src="${url.replace("watch?v=", "embed/")}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      `;

      container.appendChild(itemDiv);
    });
  } catch (error) {
    console.error("음악 로드 오류:", error);
  }
}

// 사진 로드 (읽기 전용)
async function loadPhotos() {
  try {
    const container = document.getElementById("photo-items");
    container.innerHTML = "";
    const snaps = await getDocs(query(collection(db, "motherPhotos"), orderBy("timestamp", "desc")));
    
    if (snaps.empty) {
      container.innerHTML = "<p style='text-align: center; color: #f5f0e6; font-style: italic;'>아직 등록된 사진이 없습니다.</p>";
      return;
    }
    
    snaps.forEach(docSnap => {
      const { photoUrl, caption } = docSnap.data();

      const itemDiv = document.createElement("div");
      itemDiv.className = "photo-item";
      itemDiv.innerHTML = `
        <img src="${photoUrl}" alt="${caption}" />
        <p>${caption}</p>
      `;

      container.appendChild(itemDiv);
    });
  } catch (error) {
    console.error("사진 로드 오류:", error);
  }
}

async function loadComments() {
  try {
    const listEl = document.getElementById("mother-comments-list");
    listEl.innerHTML = "";
    const snaps = await getDocs(query(collection(db, "motherComments"), orderBy("timestamp", "desc")));
    
    snaps.forEach(docSnap => {
      const { text } = docSnap.data();

      const li = document.createElement("li");
      li.textContent = text;
      listEl.appendChild(li);
    });
  } catch (error) {
    console.error("댓글 로드 오류:", error);
  }
}

loadMusic();
loadPhotos();
loadComments();