const message = document.querySelector('#cf-message');
try {
  const brief = sessionStorage.getItem('everiart-brief');
  if (brief && message) {
    message.value = brief;
    sessionStorage.removeItem('everiart-brief');
    const note = document.createElement('p');
    note.textContent = 'Your Peaches conversation is included below. Review and edit it before sending.';
    note.className = 'direct__note';
    message.before(note);
  }
} catch { /* The normal form remains usable without storage. */ }
