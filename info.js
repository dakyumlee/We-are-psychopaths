document.querySelectorAll('.acc-header').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const panel = btn.nextElementSibling;
      panel.style.maxHeight = panel.style.maxHeight
        ? null
        : panel.scrollHeight + 'px';
    });
  });
  
  document.getElementById('quiz-form').addEventListener('submit', e => {
    e.preventDefault();
    const checkedCount = Array.from(
      e.target.querySelectorAll('input[type=checkbox]')
    ).filter(i => i.checked).length;
    let result = '정상 범위로 보입니다.';
    if (checkedCount >= 2) {
      result = '정신건강 전문가 상담을 권고합니다.';
    }
    document.getElementById('quiz-result').textContent = result;
  });

  document.getElementById('faq-search').addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('#faq-acc .acc-header').forEach(h => {
      const txt = h.textContent.toLowerCase();
      h.style.display = txt.includes(term) ? 'block' : 'none';
      h.nextElementSibling.style.maxHeight = null;
    });
  });
  