const currentPage = location.pathname === '/wins' ? 'wins'
  : location.pathname === '/tasks' ? 'tasks' : 'overview';

document.querySelector(`[data-nav="${currentPage}"]`)?.classList.add('active');

const todayElement = document.querySelector('[data-today]');
if (todayElement) {
  todayElement.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: 'short', month: 'short', day: 'numeric'
  }).format(new Date());
}

let toastTimeout;
export function showToast(message) {
  const toast = document.querySelector('[data-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('visible'), 2600);
}
