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
  const listEl = document.getElementById("clip-list");
  listEl.innerHTML = "";

  const snaps = await getDocs(
    query(
      collection(db, "campaignVideos"),
      orderBy("timestamp", "desc")
    )
  );

  snaps.forEach(docSnap => {
    const { title, videoUrl, isYoutube } = docSnap.data();

    const link = document.createElement("a");
    link.href = videoUrl;
    link.target = "_blank";
    link.className = "gallery-item";
    link.style.textDecoration = "none";
    link.style.color = "inherit";

    let thumbEl;
    if (isYoutube) {
      const thumbUrl = youtubeThumbnail(videoUrl);
      thumbEl = document.createElement("img");
      thumbEl.src = thumbUrl;
      thumbEl.alt = title;
    } else {
  
      thumbEl = document.createElement("video");
      thumbEl.src = videoUrl;
      thumbEl.muted = true;
      thumbEl.playsInline = true;
      thumbEl.controls = false;
      thumbEl.autoplay = true;
      thumbEl.loop = true;
    }
    thumbEl.style.width = "100%";
    thumbEl.style.borderRadius = "4px";
    link.appendChild(thumbEl);

    const caption = document.createElement("p");
    caption.textContent = title;
    caption.style.marginTop = "0.5rem";
    link.appendChild(caption);

    listEl.appendChild(link);
  });
}

document.addEventListener("DOMContentLoaded", loadClips);
