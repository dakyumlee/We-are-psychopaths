import { db, storage } from "./firebase-config.js";
import {
  collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const MASTER_KEY = "3292";
const keyCheckEl = document.getElementById("key-check");
const uploadSecEl = document.getElementById("upload-section");
const videoInputEl = document.getElementById("video-input");
const linkInputEl  = document.getElementById("link-input");
const titleInputEl = document.getElementById("title-input");
const descInputEl  = document.getElementById("desc-input");
const formEl       = document.getElementById("video-upload-form");

document.getElementById("key-btn").addEventListener("click", () => {
  if (document.getElementById("master-key").value === MASTER_KEY) {
    keyCheckEl.style.display = "none";
    uploadSecEl.style.display = "block";
  } else alert("키가 틀렸습니다");
});

formEl.addEventListener("submit", async e => {
  e.preventDefault();
  const file = videoInputEl.files[0];
  const link = linkInputEl.value.trim();
  const title = titleInputEl.value.trim();
  const desc = descInputEl.value.trim();

  if ((file && link) || (!file && !link)) {
    return alert("파일 업로드 또는 링크 입력 중 하나만 선택해주세요");
  }
  if (!title) return alert("제목을 입력해주세요");

  try {
    let videoUrl, isYoutube = false;
    if (file) {
      const vidRef = ref(storage, `campaignVideos/${file.name}_${Date.now()}`);
      await uploadBytes(vidRef, file);
      videoUrl = await getDownloadURL(vidRef);
    } else {
      videoUrl = link;
      isYoutube = true;
    }

    await addDoc(collection(db, "campaignVideos"), {
      title,
      description: desc,
      videoUrl,
      isYoutube,
      timestamp: serverTimestamp()
    });

    alert("업로드 완료!");
  
    location.href = "campaign-clips.html";
  } catch (err) {
    console.error(err);
    alert("업로드 실패");
  }
});
