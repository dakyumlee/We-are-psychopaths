import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    loadGallery();
});

async function loadGallery() {
    const querySnapshot = await getDocs(collection(db, "galleryPosts"));

    const galleryGrid = document.getElementById("gallery-grid");
    galleryGrid.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();

        const imgDiv = document.createElement("div");
        imgDiv.className = "gallery-item";

        imgDiv.innerHTML = `
            <img src="${data.imageUrl}" alt="${data.caption}" />
            <p>${data.caption}</p>
        `;

        imgDiv.querySelector("img").addEventListener("click", () => {
            openModal(data.imageUrl, data.caption);
        });

        galleryGrid.appendChild(imgDiv);
    });
}

const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-img");
const modalCaption = document.getElementById("modal-caption");
const modalClose = document.getElementById("modal-close");

function openModal(url, caption) {
    modal.style.display = "block";
    modalImg.src = url;
    modalCaption.textContent = caption;
}

modalClose.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});
