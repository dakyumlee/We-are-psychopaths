import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");
const docRef = doc(db, "galleryPosts", postId);

const imgPreview = document.getElementById("edit-image");
const captionInput = document.getElementById("caption-input");
const form = document.getElementById("edit-form");

getDoc(docRef).then((snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.data();
    imgPreview.src = data.imageUrl;
    captionInput.value = data.caption;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newCaption = captionInput.value.trim();
  if (!newCaption) return alert("캡션을 입력해라");

  await updateDoc(docRef, { caption: newCaption });
  alert("수정 완료!");
  window.location.href = "gallery.html";
});
