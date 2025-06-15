import { db, storage } from "../firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const ADMIN_KEY = "3292";
let isAdmin = false;


const adminKeyEl = document.getElementById("admin-key");
const adminBtnEl = document.getElementById("admin-btn");
const uploadSection = document.getElementById("upload-section");
const form = document.getElementById("upload-form");
const modeRadios = document.querySelectorAll('input[name="mode"]');
const ytInput = document.getElementById("youtube-input");
const fileInput = document.getElementById("file-input");
const listContainer = document.getElementById("video-list");


adminBtnEl.addEventListener("click", () => {
  if (adminKeyEl.value === ADMIN_KEY) {
    isAdmin = true;
    uploadSection.style.display = "block";
    adminKeyEl.parentElement.style.display = "none";
    loadVideos();
  } else {
    alert("관리자 키가 틀렸습니다.");
  }
});


modeRadios.forEach(r => {
  r.addEventListener("change", () => {
    if (r.value === "youtube" && r.checked) {
      ytInput.style.display = "";
      fileInput.style.display = "none";
    } else if (r.value === "file" && r.checked) {
      ytInput.style.display = "none";
      fileInput.style.display = "";
    }
  });
});


form.addEventListener("submit", async e => {
  e.preventDefault();
  const title = document.getElementById("video-title").value.trim();
  const mode = document.querySelector('input[name="mode"]:checked').value;

  let youtubeUrl = "";
  let videoUrl = "";

  if (mode === "youtube") {
    youtubeUrl = document.getElementById("youtube-url").value.trim();
    if (!youtubeUrl) return alert("YouTube 링크를 입력하세요.");
  } else {
    const file = document.getElementById("video-file").files[0];
    if (!file) return alert("비디오 파일을 선택하세요.");
    const storageRef = ref(storage, `interview/${file.name}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    videoUrl = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, "interviewVideos"), {
    title,
    youtubeUrl,
    videoUrl,
    timestamp: serverTimestamp()
  });
  form.reset();
  loadVideos();
});

async function loadVideos() {
  listContainer.innerHTML = "";
  const snaps = await getDocs(
    query(collection(db, "interviewVideos"), orderBy("timestamp", "desc"))
  );
  snaps.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.className = "video-item";

    div.innerHTML = `<h3>${data.title}</h3>`;

    if (data.youtubeUrl) {
      const iframe = document.createElement("iframe");
      iframe.src = data.youtubeUrl.replace("watch?v=", "embed/");
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      div.appendChild(iframe);
    } else if (data.videoUrl) {
      const video = document.createElement("video");
      video.src = data.videoUrl;
      video.controls = true;
      div.appendChild(video);
    }

    if (isAdmin) {
      const actions = document.createElement("div");
      actions.className = "actions";

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.addEventListener("click", async () => {
        const newTitle = prompt("새 제목을 입력하세요", data.title);
        if (newTitle != null) {
          await updateDoc(doc(db, "interviewVideos", id), { title: newTitle });
          loadVideos();
        }
      });
      actions.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.addEventListener("click", async () => {
        if (confirm("정말 삭제하시겠습니까?")) {
          await deleteDoc(doc(db, "interviewVideos", id));
          loadVideos();
        }
      });
      actions.appendChild(delBtn);

      div.appendChild(actions);
    }

    listContainer.appendChild(div);
  });
}

loadVideos();
