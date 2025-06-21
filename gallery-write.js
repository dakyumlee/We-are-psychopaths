import { db, storage } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const keyChk = document.getElementById("key-check");
const uplSec = document.getElementById("upload-section");

window.onAdminLogin = function() {
    keyChk.style.display = "none";
    uplSec.style.display = "block";
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.isAdmin && window.isAdmin()) {
        window.onAdminLogin();
    }
});

document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  if (!window.isAdmin || !window.isAdmin()) {
    alert("관리자 권한이 필요합니다.");
    return;
  }
  
  const file = document.getElementById("image-input").files[0];
  const caption = document.getElementById("caption-input").value.trim();
  if (!file || !caption) return alert("이미지와 설명을 모두 입력해주세요");

  try {
    const storageRef = ref(storage, `gallery/${file.name}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);

    await addDoc(collection(db, "galleryPosts"), {
      imageUrl,
      caption,
      timestamp: serverTimestamp()
    });

    alert("업로드 완료!");
    location.href = "gallery.html";
  } catch (err) {
    console.error(err);
    alert("업로드 실패");
  }
});