import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.onAdminLogin = function() {
    document.getElementById("key-check").style.display = "none";
    document.getElementById("diary-form").style.display = "block";
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.isAdmin && window.isAdmin()) {
        window.onAdminLogin();
    }
});

document.getElementById("diary-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!window.isAdmin || !window.isAdmin()) {
        alert("관리자 권한이 필요합니다.");
        return;
    }

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const isPrivate = document.getElementById("isPrivate").checked;
    const isPublic = !isPrivate;
    const secretPassword = isPrivate ? "3292" : "";

    if (!title || !content) {
        alert("제목과 내용을 모두 입력해주세요.");
        return;
    }

    try {
        await addDoc(collection(db, "diaryPosts"), {
            title,
            content,
            author: "주은",
            isPublic,
            timestamp: serverTimestamp(),
            secretPassword
        });
        alert("등록 완료!");
        window.location.href = "/diary-list.html";
    } catch (err) {
        console.error(err);
        alert("에러 발생");
    }
});