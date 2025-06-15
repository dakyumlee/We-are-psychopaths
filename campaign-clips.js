import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ADMIN_KEY = "3292";
let isAdmin = false;

const adminCheckEl = document.getElementById("admin-check");
const adminKeyEl   = document.getElementById("admin-key");
const adminBtnEl   = document.getElementById("admin-btn");

adminBtnEl.addEventListener("click", () => {
  if (adminKeyEl.value === ADMIN_KEY) {
    isAdmin = true;
    adminCheckEl.style.display = "none";
    loadClips();
  } else {
    alert("관리자 키가 틀렸습니다");
  }
});

function youtubeThumbnail(url) {
  const m1 = url.match(/youtu\.be\/([^\?]+)/);
  const m2 = url.match(/v=([^&]+)/);
  const id = m1?.[1] || m2?.[1] || null;
  return id
    ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    : null;
}

async function loadClips() {
  const listEl = document.getElementById("clip-list");
  listEl.innerHTML = "";

  const snaps = await getDocs(
    query(
      collection(db, "campaignVideos"),
      orderBy("timestamp", "desc")
    )
  );

  snaps.forEach(docSnap => {
    const data = docSnap.data();
    const id   = docSnap.id;

    const card = document.createElement("div");
    card.className = "gallery-item";

    let mediaEl;
    if (data.isYoutube) {
      mediaEl = document.createElement("img");
      mediaEl.src = youtubeThumbnail(data.videoUrl);
    } else {
      mediaEl = document.createElement("video");
      mediaEl.src = data.videoUrl;
      mediaEl.muted = true;
      mediaEl.playsInline = true;
      mediaEl.loop = true;
      mediaEl.autoplay = true;
      mediaEl.controls = false;
    }
    mediaEl.className = "clip-media";
    card.appendChild(mediaEl);

    const titleEl = document.createElement("h3");
    titleEl.textContent = data.title;
    card.appendChild(titleEl);

    if (data.description) {
      const descEl = document.createElement("p");
      descEl.textContent = data.description;
      descEl.className = "clip-description";
      card.appendChild(descEl);
    }

    card.addEventListener("click", () => {
      window.open(data.videoUrl, "_blank");
    });

    if (isAdmin) {
      const btnWrap = document.createElement("div");
      btnWrap.className = "admin-btn-wrap";

      const editBtn = document.createElement("button");
      editBtn.textContent = "수정";
      editBtn.className = "edit-btn";
      editBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const newTitle = prompt("새 제목", data.title);
        if (newTitle == null) return;
        const newDesc = prompt("새 설명", data.description || "");
        if (newDesc == null) return;
        const newUrl  = prompt("새 링크(URL)", data.videoUrl);
        if (newUrl == null) return;
        const newIsYT = newUrl.includes("youtu");
        await updateDoc(doc(db, "campaignVideos", id), {
          title: newTitle,
          description: newDesc,
          videoUrl: newUrl,
          isYoutube: newIsYT
        });
        alert("수정 완료!");
        loadClips();
      });
      btnWrap.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "삭제";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm("진짜 삭제?")) return;
        await deleteDoc(doc(db, "campaignVideos", id));
        alert("삭제 완료!");
        loadClips();
      });
      btnWrap.appendChild(deleteBtn);

      card.appendChild(btnWrap);
    }

    listEl.appendChild(card);
  });
}

loadClips();
