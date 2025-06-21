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
  
  const MASTER_KEY = "3292";
  
  const loginSection = document.getElementById("login-section");
  const adminPanel = document.getElementById("admin-panel");
  const masterKeyInput = document.getElementById("master-key");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const loginMessage = document.getElementById("login-message");
  
  console.log("admin-panel-fixed.js 로드됨");
  
  document.addEventListener("DOMContentLoaded", () => {
      console.log("DOM 로드 완료");
      initializeAdmin();
  });
  
  function initializeAdmin() {
      if (!window.db || !window.storage) {
          setTimeout(initializeAdmin, 100);
          return;
      }
      
      console.log("Firebase 준비 완료, 이벤트 리스너 등록 시작");
      
      loginBtn.addEventListener("click", handleLogin);
      
      masterKeyInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
              handleLogin();
          }
      });
      
      logoutBtn.addEventListener("click", handleLogout);
      
      initializeTabs();
      
      initializeForms();
      
      console.log("모든 이벤트 리스너 등록 완료");
  }
  
  function handleLogin() {
      const inputKey = masterKeyInput.value.trim();
      console.log("로그인 시도:", inputKey);
      
      if (inputKey === MASTER_KEY) {
          showMessage(loginMessage, "로그인 성공!", "success");
          setTimeout(() => {
              loginSection.classList.add("hidden");
              adminPanel.classList.remove("hidden");
              console.log("관리자 패널 표시됨");
          }, 500);
      } else {
          showMessage(loginMessage, "마스터키가 올바르지 않습니다.", "error");
          console.log("키 불일치");
      }
  }
  
  function handleLogout() {
      if (confirm("로그아웃 하시겠습니까?")) {
          adminPanel.classList.add("hidden");
          loginSection.classList.remove("hidden");
          masterKeyInput.value = "";
          clearAllForms();
      }
  }
  
  function initializeTabs() {
      const tabButtons = document.querySelectorAll(".tab-button");
      const tabContents = document.querySelectorAll(".tab-content");
      
      tabButtons.forEach(button => {
          button.addEventListener("click", () => {
              const targetTab = button.getAttribute("data-tab");
              
              tabButtons.forEach(btn => btn.classList.remove("active"));
              tabContents.forEach(content => content.classList.remove("active"));

              button.classList.add("active");
              document.getElementById(`${targetTab}-tab`).classList.add("active");
          });
      });
  }
  
  function initializeForms() {
      const diaryForm = document.getElementById("diary-form");
      if (diaryForm) {
          diaryForm.addEventListener("submit", handleDiarySubmit);
      }
      
      const timelineForm = document.getElementById("timeline-form");
      if (timelineForm) {
          timelineForm.addEventListener("submit", handleTimelineSubmit);
      }
      
      const galleryForm = document.getElementById("gallery-form");
      if (galleryForm) {
          galleryForm.addEventListener("submit", handleGallerySubmit);
      }
      
      const videoForm = document.getElementById("video-form");
      if (videoForm) {
          videoForm.addEventListener("submit", handleVideoSubmit);
          
          const videoTypeRadios = document.querySelectorAll('input[name="video-type"]');
          const youtubeInput = document.getElementById("youtube-input");
          const fileInput = document.getElementById("file-input");
          
          videoTypeRadios.forEach(radio => {
              radio.addEventListener("change", () => {
                  if (radio.value === "youtube") {
                      youtubeInput.style.display = "block";
                      fileInput.style.display = "none";
                  } else {
                      youtubeInput.style.display = "none";
                      fileInput.style.display = "block";
                  }
              });
          });
      }
      
      const motherMusicForm = document.getElementById("mother-music-form");
      if (motherMusicForm) {
          motherMusicForm.addEventListener("submit", handleMotherMusicSubmit);
      }
      
      const motherPhotoForm = document.getElementById("mother-photo-form");
      if (motherPhotoForm) {
          motherPhotoForm.addEventListener("submit", handleMotherPhotoSubmit);
      }
  }
  
  async function handleDiarySubmit(e) {
      e.preventDefault();
      
      const title = document.getElementById("diary-title").value.trim();
      const content = document.getElementById("diary-content").value.trim();
      const isPrivate = document.getElementById("diary-private").checked;
      
      if (!title || !content) {
          showMessage(document.getElementById("diary-message"), "제목과 내용을 모두 입력해주세요.", "error");
          return;
      }
      
      try {
          await addDoc(collection(window.db, "diaryPosts"), {
              title,
              content,
              author: "주은",
              isPublic: !isPrivate,
              timestamp: serverTimestamp(),
              secretPassword: isPrivate ? "3292" : ""
          });
          
          showMessage(document.getElementById("diary-message"), "일기가 성공적으로 등록되었습니다!", "success");
          document.getElementById("diary-form").reset();
      } catch (error) {
          console.error("일기 등록 오류:", error);
          showMessage(document.getElementById("diary-message"), "일기 등록 중 오류가 발생했습니다.", "error");
      }
  }
  
  async function handleTimelineSubmit(e) {
      e.preventDefault();
      
      const date = document.getElementById("timeline-date").value;
      const content = document.getElementById("timeline-content").value.trim();
      
      if (!date || !content) {
          showMessage(document.getElementById("timeline-message"), "날짜와 내용을 모두 입력해주세요.", "error");
          return;
      }
      
      try {
          await addDoc(collection(window.db, "timelineEvents"), {
              start: date,
              content,
              timestamp: serverTimestamp()
          });
          
          showMessage(document.getElementById("timeline-message"), "타임라인 이벤트가 성공적으로 추가되었습니다!", "success");
          document.getElementById("timeline-form").reset();
      } catch (error) {
          console.error("타임라인 이벤트 추가 오류:", error);
          showMessage(document.getElementById("timeline-message"), "이벤트 추가 중 오류가 발생했습니다.", "error");
      }
  }
  
  async function handleGallerySubmit(e) {
      e.preventDefault();
      
      const imageFile = document.getElementById("gallery-image").files[0];
      const caption = document.getElementById("gallery-caption").value.trim();
      
      if (!imageFile || !caption) {
          showMessage(document.getElementById("gallery-message"), "이미지와 설명을 모두 입력해주세요.", "error");
          return;
      }
      
      try {
          const storageRef = ref(window.storage, `gallery/${imageFile.name}_${Date.now()}`);
          await uploadBytes(storageRef, imageFile);
          const imageUrl = await getDownloadURL(storageRef);
          
          await addDoc(collection(window.db, "galleryPosts"), {
              imageUrl,
              caption,
              timestamp: serverTimestamp()
          });
          
          showMessage(document.getElementById("gallery-message"), "사진이 성공적으로 업로드되었습니다!", "success");
          document.getElementById("gallery-form").reset();
      } catch (error) {
          console.error("사진 업로드 오류:", error);
          showMessage(document.getElementById("gallery-message"), "사진 업로드 중 오류가 발생했습니다.", "error");
      }
  }
  
  async function handleVideoSubmit(e) {
      e.preventDefault();
      
      const title = document.getElementById("video-title").value.trim();
      const description = document.getElementById("video-description").value.trim();
      const videoType = document.querySelector('input[name="video-type"]:checked').value;
      
      if (!title) {
          showMessage(document.getElementById("video-message"), "영상 제목을 입력해주세요.", "error");
          return;
      }
      
      try {
          let videoUrl = "";
          let isYoutube = false;
          
          if (videoType === "youtube") {
              const youtubeUrl = document.getElementById("youtube-url").value.trim();
              if (!youtubeUrl) {
                  showMessage(document.getElementById("video-message"), "YouTube 링크를 입력해주세요.", "error");
                  return;
              }
              videoUrl = youtubeUrl;
              isYoutube = true;
          } else {
              const videoFile = document.getElementById("video-file").files[0];
              if (!videoFile) {
                  showMessage(document.getElementById("video-message"), "비디오 파일을 선택해주세요.", "error");
                  return;
              }
              
              const storageRef = ref(window.storage, `campaignVideos/${videoFile.name}_${Date.now()}`);
              await uploadBytes(storageRef, videoFile);
              videoUrl = await getDownloadURL(storageRef);
          }
          
          await addDoc(collection(window.db, "campaignVideos"), {
              title,
              description,
              videoUrl,
              isYoutube,
              timestamp: serverTimestamp()
          });
          
          showMessage(document.getElementById("video-message"), "영상이 성공적으로 업로드되었습니다!", "success");
          document.getElementById("video-form").reset();
      } catch (error) {
          console.error("영상 업로드 오류:", error);
          showMessage(document.getElementById("video-message"), "영상 업로드 중 오류가 발생했습니다.", "error");
      }
  }
  
  async function handleMotherMusicSubmit(e) {
      e.preventDefault();
      
      const title = document.getElementById("music-title").value.trim();
      const url = document.getElementById("music-url").value.trim();
      
      if (!title || !url) {
          showMessage(document.getElementById("mother-music-message"), "제목과 YouTube 링크를 모두 입력해주세요.", "error");
          return;
      }
      
      try {
          await addDoc(collection(window.db, "motherMusic"), {
              title,
              url,
              timestamp: serverTimestamp()
          });
          
          showMessage(document.getElementById("mother-music-message"), "음악이 성공적으로 추가되었습니다!", "success");
          document.getElementById("mother-music-form").reset();
      } catch (error) {
          console.error("음악 추가 오류:", error);
          showMessage(document.getElementById("mother-music-message"), "음악 추가 중 오류가 발생했습니다.", "error");
      }
  }
  
  async function handleMotherPhotoSubmit(e) {
      e.preventDefault();
      
      const photoFile = document.getElementById("mother-photo").files[0];
      const caption = document.getElementById("photo-caption").value.trim();
      
      if (!photoFile || !caption) {
          showMessage(document.getElementById("mother-photo-message"), "사진과 설명을 모두 입력해주세요.", "error");
          return;
      }
      
      try {
          const storageRef = ref(window.storage, `motherPhotos/${photoFile.name}_${Date.now()}`);
          await uploadBytes(storageRef, photoFile);
          const photoUrl = await getDownloadURL(storageRef);
          
          await addDoc(collection(window.db, "motherPhotos"), {
              photoUrl,
              caption,
              timestamp: serverTimestamp()
          });
          
          showMessage(document.getElementById("mother-photo-message"), "사진이 성공적으로 추가되었습니다!", "success");
          document.getElementById("mother-photo-form").reset();
      } catch (error) {
          console.error("사진 추가 오류:", error);
          showMessage(document.getElementById("mother-photo-message"), "사진 추가 중 오류가 발생했습니다.", "error");
      }
  }
  
  function showMessage(element, message, type) {
      element.innerHTML = `<div class="status-message ${type}">${message}</div>`;
      setTimeout(() => {
          element.innerHTML = "";
      }, 5000);
  }
  
  function clearAllForms() {
      const forms = ['diary-form', 'timeline-form', 'gallery-form', 'video-form', 'mother-music-form', 'mother-photo-form'];
      forms.forEach(formId => {
          const form = document.getElementById(formId);
          if (form) form.reset();
      });
      
      document.querySelectorAll('[id$="-message"]').forEach(el => {
          el.innerHTML = "";
      });
  }