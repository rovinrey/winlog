import { escapeHtml, formatDate, request } from './api.js';

const winsContainer = document.querySelector('#recent-wins');
const tasksContainer = document.querySelector('#upcoming-tasks');

function renderWin(win) {
  return `<article class="win-preview"><span class="preview-symbol">✳</span><span class="preview-copy"><strong>${escapeHtml(win.title)}</strong><small>${escapeHtml(formatDate(win.won_on))}</small></span><span class="preview-date">A win well earned</span></article>`;
}

function renderTask(task) {
  return `<article class="task-preview"><span class="preview-symbol">${task.status === 'in_progress' ? '↗' : '○'}</span><span class="preview-copy"><strong>${escapeHtml(task.title)}</strong><small><span class="priority-dot priority-${escapeHtml(task.priority)}"></span>${escapeHtml(task.priority)} priority${task.due_on ? ` · Due ${escapeHtml(formatDate(task.due_on, { month: 'short', day: 'numeric' }))}` : ''}</small></span><span class="preview-date">${task.status === 'in_progress' ? 'In progress' : 'To do'}</span></article>`;
}

function renderEmpty(message) {
  return `<p class="empty-state">${message}</p>`;
}

try {
  const [wins, tasks] = await Promise.all([request('/api/wins'), request('/api/tasks')]);
  const openTasks = tasks.filter((task) => task.status !== 'done');
  document.querySelector('#win-count').textContent = wins.length;
  document.querySelector('#task-count').textContent = openTasks.length;
  document.querySelector('#done-count').textContent = tasks.filter((task) => task.status === 'done').length;
  winsContainer.innerHTML = wins.length
    ? wins.slice(0, 4).map(renderWin).join('')
    : renderEmpty('Your first win is waiting to be remembered.');
  tasksContainer.innerHTML = openTasks.length
    ? openTasks.slice(0, 4).map(renderTask).join('')
    : renderEmpty('Nothing on your list right now. Enjoy the space.');
} catch (error) {
  winsContainer.innerHTML = renderEmpty('We couldn’t load your wins. Refresh to try again.');
  tasksContainer.innerHTML = renderEmpty('We couldn’t load your tasks. Refresh to try again.');
  console.error('Could not load overview:', error);
}
