import { escapeHtml, formatDate, request } from './api.js';
import { showToast } from './app.js';

const list = document.querySelector('#tasks-list');
const dialog = document.querySelector('#task-dialog');
const form = document.querySelector('#task-form');
const errorElement = form.querySelector('[data-form-error]');
const filter = document.querySelector('#task-filter');
let tasks = [];

function statusLabel(status) {
  return status === 'in_progress' ? 'In progress' : status === 'done' ? 'Completed' : 'To do';
}

function renderTask(task) {
  const done = task.status === 'done';
  return `<article class="collection-item ${done ? 'task-is-done' : ''}"><input class="task-toggle" type="checkbox" data-toggle="${task.id}" aria-label="Mark ${escapeHtml(task.title)} ${done ? 'not completed' : 'completed'}"${done ? ' checked' : ''}><div class="item-content"><h3>${escapeHtml(task.title)}</h3>${task.notes ? `<p>${escapeHtml(task.notes)}</p>` : ''}</div><span class="task-badge status-${escapeHtml(task.status)}">${escapeHtml(statusLabel(task.status))}</span><span class="task-badge"><span class="priority-dot priority-${escapeHtml(task.priority)}"></span>${escapeHtml(task.priority)}</span><span class="item-meta">${task.due_on ? `Due ${escapeHtml(formatDate(task.due_on, { month: 'short', day: 'numeric' }))}` : 'No due date'}</span><div class="item-actions"><button class="small-button" type="button" data-edit="${task.id}">Edit</button><button class="small-button danger" type="button" data-delete="${task.id}">Delete</button></div></article>`;
}

function render() {
  list.innerHTML = tasks.length
    ? tasks.map(renderTask).join('')
    : '<p class="empty-state">Nothing here for now. Make a small plan when you’re ready.</p>';
}

async function loadTasks() {
  list.innerHTML = '<div class="loading">Loading your tasks…</div>';
  const params = new URLSearchParams();
  if (filter.value) params.set('status', filter.value);
  try {
    tasks = await request(`/api/tasks${params.size ? `?${params}` : ''}`);
    render();
  } catch (error) {
    list.innerHTML = '<p class="empty-state">We couldn’t load your tasks. Please try again.</p>';
    console.error('Could not load tasks:', error);
  }
}

function openForm(task) {
  form.reset();
  errorElement.textContent = '';
  form.elements.id.value = task?.id ?? '';
  form.elements.title.value = task?.title ?? '';
  form.elements.notes.value = task?.notes ?? '';
  form.elements.priority.value = task?.priority ?? 'medium';
  form.elements.due_on.value = task?.due_on ?? '';
  form.elements.status.value = task?.status ?? 'todo';
  document.querySelector('#task-dialog-title').textContent = task ? 'Adjust your task' : 'What’s on your mind?';
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
filter.addEventListener('change', loadTasks);

list.addEventListener('change', async (event) => {
  const toggle = event.target.closest('[data-toggle]');
  if (!toggle) return;
  const task = tasks.find((item) => item.id === Number(toggle.dataset.toggle));
  if (!task) return;
  try {
    await request(`/api/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: toggle.checked ? 'done' : 'todo' })
    });
    showToast(toggle.checked ? 'Task completed. Nice work.' : 'Task moved back to your list.');
    await loadTasks();
  } catch (error) {
    toggle.checked = !toggle.checked;
    showToast(error.message);
  }
});

list.addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit]');
  const deleteButton = event.target.closest('[data-delete]');
  if (editButton) {
    const task = tasks.find((item) => item.id === Number(editButton.dataset.edit));
    if (task) openForm(task);
  }
  if (deleteButton) {
    const task = tasks.find((item) => item.id === Number(deleteButton.dataset.delete));
    if (!task || !confirm(`Delete “${task.title}”? This can’t be undone.`)) return;
    try {
      await request(`/api/tasks/${task.id}`, { method: 'DELETE' });
      showToast('Task removed.');
      await loadTasks();
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
    priority: form.elements.priority.value,
    due_on: form.elements.due_on.value || null,
    status: form.elements.status.value
  };
  try {
    await request(id ? `/api/tasks/${id}` : '/api/tasks', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(body)
    });
    dialog.close();
    showToast(id ? 'Task updated.' : 'One step on the list.');
    await loadTasks();
  } catch (error) {
    errorElement.textContent = error.details?.[0]?.message || error.message;
  }
});

await loadTasks();
