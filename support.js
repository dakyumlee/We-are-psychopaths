document.getElementById('hospital-search-btn').addEventListener('click', () => {
    const region = document.getElementById('hospital-search-input').value.trim() || '대한민국';
    const query = encodeURIComponent(region + ' 정신건강의학과 병원');
    const iframe = document.getElementById('hospital-map');
    iframe.src = `https://maps.google.com/maps?q=${query}&output=embed`;
  });
  
  window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('hospital-search-btn').click();
  });
  