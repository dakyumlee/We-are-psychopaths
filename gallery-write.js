import { db, storage } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

document.addEventListener("DOMContentLoaded", () => {
    const MASTER_KEY = "3292";

    document.getElementById("key-btn").addEventListener("click", () => {
        const inputKey = document.getElementById("master-key").value;
        if (inputKey === MASTER_KEY) {
            alert("인증 성공! 사진 업로드 가능.");
            document.getElementById("upload-section").style.display = "block";
            document.getElementById("key-check").style.display = "none";
        } else {
            alert("마스터키가 틀렸습니다.");
        }
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
            const storageRef = ref(storage, `gallery/${imageFile.name}_${Date.now()}`);

            await uploadBytes(storageRef, imageFile);
            const imageUrl = await getDownloadURL(storageRef);

            await addDoc(collection(db, "galleryPosts"), {
                imageUrl,
                caption,
                timestamp: serverTimestamp()
            });

            alert("업로드 완료!");
            window.location.href = "gallery.html";

        } catch (err) {
            console.error(err);
            alert("업로드 실패");
        }
    });
});
