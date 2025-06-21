import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function youtubeThumbnail(url) {
  const m1 = url.match(/youtu\.be\/([^\?]+)/);
  const m2 = url.match(/v=([^&]+)/);
  const id = m1?.[1] || m2?.[1] || null;
  return id
    ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    : null;
}

async function loadClips() {
  try {
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

      listEl.appendChild(card);
    });
  } catch (error) {
    console.error("영상 로드 오류:", error);
  }
}

loadClips();