import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const MASTER_KEY = "3292";

document.getElementById("key-btn").addEventListener("click", () => {
    const inputKey = document.getElementById("master-key").value;
    console.log("입력한 키:", inputKey);

    if (inputKey === MASTER_KEY) {
        alert("키 인증 성공! 글쓰기 가능");

        document.getElementById("key-check").style.display = "none";
        document.getElementById("diary-form").style.display = "block";
    } else {
        alert("키가 틀렸습니다.");
    }
});

document.getElementById("diary-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const isPublic = document.getElementById("isPublic").checked;
    const secretPassword = isPublic ? "" : "3292";

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
