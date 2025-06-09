const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('voice-form');
    const input = document.getElementById('voice-input');
    const voicesList = document.getElementById('voices-list');

    db.collection("voices").orderBy("timestamp", "desc")
      .onSnapshot((snapshot) => {
        voicesList.innerHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            addVoiceItem(doc.id, data.message);
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = input.value.trim();
        if (message !== '') {
            db.collection("voices").add({
                message: message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            input.value = '';
        }
    });

    function addVoiceItem(id, message) {
        const newVoice = document.createElement('div');
        newVoice.className = 'voice-item';
        
        const textSpan = document.createElement('span');
        textSpan.textContent = `"${message}"`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '삭제';
        deleteButton.className = 'delete-btn';
        deleteButton.addEventListener('click', function() {
            db.collection("voices").doc(id).delete();
        });

        const editButton = document.createElement('button');
        editButton.textContent = '수정';
        editButton.className = 'edit-btn';
        editButton.addEventListener('click', function() {
            const newText = prompt('메시지를 수정하세요:', message);
            if (newText !== null && newText.trim() !== '') {
                db.collection("voices").doc(id).update({
                    message: newText
                });
            }
        });

        newVoice.appendChild(textSpan);
        newVoice.appendChild(deleteButton);
        newVoice.appendChild(editButton);
        voicesList.appendChild(newVoice);
    }
});
