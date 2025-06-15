import { db, storage } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const ADMIN_KEY = "3292";
let isAdmin = false;

const adminCheckEl = document.getElementById("admin-check");
const adminKeyEl   = document.getElementById("admin-key");
const adminBtnEl   = document.getElementById("admin-btn");

adminBtnEl.addEventListener("click", () => {
  if (adminKeyEl.value === ADMIN_KEY) {
    isAdmin = true;
    adminCheckEl.style.display = "none";
    document.getElementById("music-section").style.display = "block";
    document.getElementById("photo-section").style.display = "block";
    loadMusic();
    loadPhotos();
    loadComments();
  } else {
    alert("관리자 키가 틀렸습니다");
  }
});

document.getElementById("music-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const url   = document.getElementById("music-url").value.trim();
  const title = document.getElementById("music-title").value.trim();
  if (!url || !title) return alert("링크와 제목을 입력해주세요");
  await addDoc(collection(db, "motherMusic"), { url, title, timestamp: serverTimestamp() });
  e.target.reset();
  loadMusic();
});

document.getElementById("photo-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const file    = document.getElementById("photo-input").files[0];
  const caption = document.getElementById("photo-caption").value.trim();
  if (!file || !caption) return alert("사진과 캡션을 모두 입력해주세요");

  const storageRef = ref(storage, `motherPhotos/${file.name}_${Date.now()}`);
  await uploadBytes(storageRef, file);
  const photoUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, "motherPhotos"), {
    photoUrl,
    caption,
    timestamp: serverTimestamp()
  });
  e.target.reset();
  loadPhotos();
});

document.getElementById("mother-comment-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = document.getElementById("mother-comment-input").value.trim();
  if (!text) return;
  await addDoc(collection(db, "motherComments"), { text, timestamp: serverTimestamp() });
  e.target.reset();
  loadComments();
});

async function loadMusic() {
  const container = document.getElementById("music-items");
  container.innerHTML = "";
  const snaps = await getDocs(query(collection(db, "motherMusic"), orderBy("timestamp", "desc")));
  snaps.forEach(docSnap => {
    const { url, title } = docSnap.data();
    const id = docSnap.id;

    const itemDiv = document.createElement("div");
    itemDiv.className = "music-item";
    itemDiv.innerHTML = `
      <p>${title}</p>
      <iframe
        width="300" height="169"
        src="${url.replace("watch?v=", "embed/")}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    `;

    if (isAdmin) {
      const btnWrap = document.createElement("div");
      btnWrap.className = "admin-btn-wrap";

      const editBtn = document.createElement("button");
      editBtn.textContent = "수정";
      editBtn.className = "edit-btn";
      editBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const newTitle = prompt("새 제목을 입력하세요", title);
        if (newTitle == null) return;
        const newUrl = prompt("새 YouTube 링크", url);
        if (newUrl == null) return;
        await updateDoc(doc(db, "motherMusic", id), { title: newTitle, url: newUrl });
        loadMusic();
      });
      btnWrap.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "삭제";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm("정말 삭제하시겠습니까?")) return;
        await deleteDoc(doc(db, "motherMusic", id));
        loadMusic();
      });
      btnWrap.appendChild(deleteBtn);

      itemDiv.appendChild(btnWrap);
    }

    container.appendChild(itemDiv);
  });
}

async function loadPhotos() {
  const container = document.getElementById("photo-items");
  container.innerHTML = "";
  const snaps = await getDocs(query(collection(db, "motherPhotos"), orderBy("timestamp", "desc")));
  snaps.forEach(docSnap => {
    const { photoUrl, caption } = docSnap.data();
    const id = docSnap.id;

    const itemDiv = document.createElement("div");
    itemDiv.className = "photo-item";
    itemDiv.innerHTML = `
      <img src="${photoUrl}" alt="${caption}" />
      <p>${caption}</p>
    `;

    if (isAdmin) {
      const btnWrap = document.createElement("div");
      btnWrap.className = "admin-btn-wrap";

      const editBtn = document.createElement("button");
      editBtn.textContent = "수정";
      editBtn.className = "edit-btn";
      editBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const newCaption = prompt("새 캡션을 입력하세요", caption);
        if (newCaption == null) return;
        await updateDoc(doc(db, "motherPhotos", id), { caption: newCaption });
        loadPhotos();
      });
      btnWrap.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "삭제";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm("정말 삭제하시겠습니까?")) return;
        await deleteDoc(doc(db, "motherPhotos", id));
        loadPhotos();
      });
      btnWrap.appendChild(deleteBtn);

      itemDiv.appendChild(btnWrap);
    }

    container.appendChild(itemDiv);
  });
}

async function loadComments() {
  const listEl = document.getElementById("mother-comments-list");
  listEl.innerHTML = "";
  const snaps = await getDocs(query(collection(db, "motherComments"), orderBy("timestamp", "desc")));
  snaps.forEach(docSnap => {
    const { text } = docSnap.data();
    const id = docSnap.id;

    const li = document.createElement("li");
    li.textContent = text;

    if (isAdmin) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "삭제";
      deleteBtn.className = "delete-btn";
      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm("댓글 삭제?")) return;
        await deleteDoc(doc(db, "motherComments", id));
        loadComments();
      });
      li.appendChild(deleteBtn);
    }

    listEl.appendChild(li);
  });
}

loadMusic();
loadPhotos();
loadComments();
