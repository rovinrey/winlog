import { escapeHtml, formatDate, request, todayInputValue } from './api.js';
import { showToast } from './app.js';

const list = document.querySelector('#wins-list');
const dialog = document.querySelector('#win-dialog');
const form = document.querySelector('#win-form');
const errorElement = form.querySelector('[data-form-error]');
let wins = [];

function renderWin(win) {
  return `<article class="collection-item"><span class="item-symbol">✳</span><div class="item-content"><h3>${escapeHtml(win.title)}</h3>${win.notes ? `<p>${escapeHtml(win.notes)}</p>` : ''}</div><span class="item-meta">${escapeHtml(formatDate(win.won_on))}</span><div class="item-actions"><button class="small-button" type="button" data-edit="${win.id}">Edit</button><button class="small-button danger" type="button" data-delete="${win.id}">Delete</button></div></article>`;
}

function render() {
  list.innerHTML = wins.length
    ? wins.map(renderWin).join('')
    : '<p class="empty-state">No wins in this date range yet. Small things count — save one when you’re ready.</p>';
}

async function loadWins() {
  list.innerHTML = '<div class="loading">Loading your wins…</div>';
  const params = new URLSearchParams();
  const from = document.querySelector('#win-from').value;
  const to = document.querySelector('#win-to').value;
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  try {
    wins = await request(`/api/wins${params.size ? `?${params}` : ''}`);
    render();
  } catch (error) {
    list.innerHTML = '<p class="empty-state">We couldn’t load your wins. Please try again.</p>';
    console.error('Could not load wins:', error);
  }
}

function openForm(win) {
  form.reset();
  errorElement.textContent = '';
  form.elements.id.value = win?.id ?? '';
  form.elements.title.value = win?.title ?? '';
  form.elements.notes.value = win?.notes ?? '';
  form.elements.won_on.value = win?.won_on ?? todayInputValue();
  document.querySelector('#win-dialog-title').textContent = win ? 'Edit this win' : 'A win worth keeping';
  dialog.showModal();
  form.elements.title.focus();
}

document.querySelector('[data-open-form]').addEventListener('click', () => openForm());
document.querySelectorAll('[data-close-form]').forEach((button) => {
  button.addEventListener('click', () => dialog.close());
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
document.querySelectorAll('#win-from, #win-to').forEach((input) => {
  input.addEventListener('change', loadWins);
});

list.addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit]');
  const deleteButton = event.target.closest('[data-delete]');
  if (editButton) {
    const win = wins.find((item) => item.id === Number(editButton.dataset.edit));
    if (win) openForm(win);
  }
  if (deleteButton) {
    const win = wins.find((item) => item.id === Number(deleteButton.dataset.delete));
    if (!win || !confirm(`Delete “${win.title}”? This can’t be undone.`)) return;
    try {
      await request(`/api/wins/${win.id}`, { method: 'DELETE' });
      showToast('Win removed.');
      await loadWins();
    } catch (error) {
      showToast(error.message);
    }
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorElement.textContent = '';
  const id = form.elements.id.value;
  const body = {
    title: form.elements.title.value,
    notes: form.elements.notes.value,
    won_on: form.elements.won_on.value
  };
  try {
    await request(id ? `/api/wins/${id}` : '/api/wins', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(body)
    });
    dialog.close();
    showToast(id ? 'Win updated.' : 'A little win, remembered.');
    await loadWins();
  } catch (error) {
    errorElement.textContent = error.details?.[0]?.message || error.message;
  }
});

await loadWins();
