import { db } from "./firebase-config.js";
import { doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const MASTER_KEY = "3292";

const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

console.log("diary-post.html → postId:", postId);

if (!postId) {
    alert("잘못된 접근입니다 (post id 없음)");
    window.location.href = "diary-list.html";
}

const editModal = document.getElementById("edit-modal");
const modalClose = document.getElementById("modal-close");

async function loadPost() {
    try {
        const docRef = doc(db, "diaryPosts", postId);
        const docSnap = await getDoc(docRef);

        console.log("getDoc() 실행 완료 → docSnap.exists():", docSnap.exists());

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("docSnap data:", data);

            if (!data.isPublic) {
                const passwordModal = document.getElementById("password-modal");
                passwordModal.style.display = "block";

                document.getElementById("password-submit-btn").addEventListener("click", () => {
                    const inputPassword = document.getElementById("password-input").value;
                    if (inputPassword === "3292") {
                        passwordModal.style.display = "none";
                        showPost(data);
                    } else {
                        alert("비밀번호가 틀렸습니다.");
                    }
                });

                document.getElementById("password-modal-close").addEventListener("click", () => {
                    window.location.href = "diary-list.html";
                });

            } else {
                showPost(data);
            }
        } else {
            alert("글이 존재하지 않습니다 (docSnap.exists() === false).");
            window.location.href = "diary-list.html";
        }
    } catch (err) {
        console.error("loadPost() 오류 발생:", err);
        alert("글 로드 중 오류 발생");
    }
}

function showPost(data) {
    document.getElementById("post-title").textContent = data.title || "(제목 없음)";
    document.getElementById("post-content").textContent = data.content || "(내용 없음)";
    document.getElementById("post-author").textContent = `작성자: ${data.author || "익명"}`;

    document.getElementById("edit-title").value = data.title;
    document.getElementById("edit-content").value = data.content;
  
    updateAdminButtons();
}

function updateAdminButtons() {
    const editBtn = document.getElementById("edit-btn");
    const deleteBtn = document.getElementById("delete-btn");
    
    const isAdminLoggedIn = window.isAdmin && window.isAdmin();
    
    if (isAdminLoggedIn) {
        editBtn.style.display = "inline-block";
        deleteBtn.style.display = "inline-block";
    } else {
        editBtn.style.display = "none";
        deleteBtn.style.display = "none";
    }
}

window.onAdminLogin = function() {
    updateAdminButtons();
};

document.addEventListener('DOMContentLoaded', () => {
    updateAdminButtons();
});

document.getElementById("delete-btn").addEventListener("click", async () => {
    if (!window.isAdmin || !window.isAdmin()) {
        if (window.adminSystem) {
            window.adminSystem.createLoginModal();
        } else {
            alert("관리자 권한이 필요합니다.");
        }
        return;
    }

    if (confirm("정말 삭제하시겠습니까?")) {
        try {
            const docRef = doc(db, "diaryPosts", postId);
            await deleteDoc(docRef);
            alert("삭제 완료");
            window.location.href = "diary-list.html";
        } catch (err) {
            console.error("deleteDoc 오류 발생:", err);
            alert("삭제 실패");
        }
    }
});

document.getElementById("edit-btn").addEventListener("click", () => {
    if (!window.isAdmin || !window.isAdmin()) {
        if (window.adminSystem) {
            window.adminSystem.createLoginModal();
        } else {
            alert("관리자 권한이 필요합니다.");
        }
        return;
    }

    editModal.style.display = "block";
});

modalClose.addEventListener("click", () => {
    editModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === editModal) {
        editModal.style.display = "none";
    }
});

document.getElementById("save-btn").addEventListener("click", async () => {
    if (!window.isAdmin || !window.isAdmin()) {
        alert("관리자 권한이 필요합니다.");
        return;
    }

    const newTitle = document.getElementById("edit-title").value;
    const newContent = document.getElementById("edit-content").value;

    try {
        const docRef = doc(db, "diaryPosts", postId);
        await updateDoc(docRef, {
            title: newTitle,
            content: newContent
        });
        alert("수정 완료!");

        window.location.href = `diary-post.html?id=${postId}`;
    } catch (err) {
        console.error("updateDoc 오류 발생:", err);
        alert("수정 실패");
    }
});

loadPost();