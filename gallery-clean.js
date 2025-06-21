import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function loadGallery() {
  try {
    const querySnapshot = await getDocs(collection(db, "galleryPosts"));
    const galleryGrid = document.getElementById("gallery-grid");
    galleryGrid.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const item = document.createElement("div");
      item.className = "gallery-item";
      item.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.caption}" />
        <p>${data.caption}</p>
      `;

      const img = item.querySelector("img");
      img.addEventListener("click", () => {
        showImageModal(data.imageUrl, data.caption);
      });

      galleryGrid.appendChild(item);
    });
  } catch (error) {
    console.error("갤러리 로드 오류:", error);
  }
}

function showImageModal(imageUrl, caption) {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const modalCaption = document.getElementById("modal-caption");
  
  modal.style.display = "block";
  modalImg.src = imageUrl;
  modalCaption.textContent = caption;
}

document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("image-modal").style.display = "none";
});

document.getElementById("image-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("image-modal")) {
    document.getElementById("image-modal").style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", loadGallery);