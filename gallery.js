import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function loadGallery() {
  const querySnapshot = await getDocs(collection(db, "galleryPosts"));
  const galleryGrid = document.getElementById("gallery-grid");
  galleryGrid.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    const item = document.createElement("div");
    item.className = "gallery-item";
    item.innerHTML = `
      <img src="${data.imageUrl}" alt="${data.caption}" />
      <p>${data.caption}</p>
    `;

    const editBtn = document.createElement("button");
    editBtn.textContent = "수정";
    editBtn.addEventListener("click", () => {
      window.location.href = `gallery-edit.html?id=${id}`;
    });
    item.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "삭제";
    deleteBtn.addEventListener("click", async () => {
      if (confirm("정말 삭제하시겠습니까?")) {
        await deleteDoc(doc(db, "galleryPosts", id));
        item.remove();
      }
    });
    item.appendChild(deleteBtn);

    galleryGrid.appendChild(item);
  });
}

document.addEventListener("DOMContentLoaded", loadGallery);
