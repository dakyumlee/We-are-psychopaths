import { db } from "../js/firebase-config.js";
import { collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

document.addEventListener("DOMContentLoaded", () => {
    const MASTER_KEY = "3292";

    document.getElementById("key-btn").addEventListener("click", () => {
        console.log("마스터키 버튼 클릭됨");
        const inputKey = document.getElementById("master-key").value;
        if (inputKey === MASTER_KEY) {
            alert("인증 성공! 사진 업로드 가능.");
            document.getElementById("upload-form").style.display = "block";
        } else {
            alert("마스터키가 틀렸습니다.");
        }
    });
});



document.getElementById("upload-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const imageFile = document.getElementById("image-input").files[0];
    const caption = document.getElementById("caption-input").value.trim();

    if (!imageFile || !caption) {
        alert("이미지와 설명을 모두 입력해주세요.");
        return;
    }

    try {
        const storage = getStorage();
        const storageRef = ref(storage, `gallery/${imageFile.name}_${Date.now()}`);

        await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(storageRef);

        await addDoc(collection(db, "galleryPosts"), {
            imageUrl,
            caption,
            timestamp: serverTimestamp()
        });

        alert("업로드 완료!");
        document.getElementById("upload-form").reset();
        loadGallery();

    } catch (err) {
        console.error(err);
        alert("업로드 실패");
    }
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

loadGallery();