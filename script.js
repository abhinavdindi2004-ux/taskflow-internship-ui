const modal = document.querySelector('#taskModal');
const taskForm = document.querySelector('#taskForm');
const taskList = document.querySelector('#taskList');
const emptyState = document.querySelector('#emptyState');
const toast = document.querySelector('#toast');
const API_URL = '/api/tasks';
let tasks = [];
let currentFilter = 'all';

const avatarClasses = ['avatar-blue', 'avatar-pink', 'avatar-purple', 'avatar-yellow'];
const priorityColors = { high: 'high', medium: 'medium', low: 'low' };
const projectDots = { 'Website redesign': 'dot-purple', 'Mobile app': 'dot-orange', 'Team operations': 'dot-green', Marketing: 'dot-blue' };

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2400);
}
function showModal() { modal.classList.add('visible'); document.querySelector('#taskName').focus(); }
function hideModal() { modal.classList.remove('visible'); taskForm.reset(); }
function escapeText(value) { return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }

function renderTasks() {
  const filtered = tasks.filter(task => currentFilter === 'all' || task.due === currentFilter);
  taskList.innerHTML = '';
  filtered.forEach((task, index) => {
    const row = document.createElement('label');
    row.className = 'task-row';
    row.dataset.id = task.id;
    row.innerHTML = `<input type="checkbox" ${task.status === 'completed' ? 'checked' : ''} /><span class="checkmark"></span><span class="task-info"><strong>${escapeText(task.title)}</strong><small><i class="dot ${projectDots[task.project] || 'dot-purple'}"></i> ${escapeText(task.project)} <span>·</span> ${task.due === 'today' ? 'Today' : 'Upcoming'}</small></span><span class="priority ${priorityColors[task.priority]}">${escapeText(task.priority[0].toUpperCase() + task.priority.slice(1))}</span><span class="task-avatar ${avatarClasses[index % avatarClasses.length]}">${escapeText(task.assignee || 'AD')}</span>`;
    row.querySelector('input').addEventListener('change', event => updateTask(task.id, event.target.checked));
    taskList.appendChild(row);
  });
  emptyState.style.display = filtered.length ? 'none' : 'block';
  document.querySelectorAll('.tab').forEach(tab => {
    const count = tab.dataset.tab === 'all' ? tasks.length : tasks.filter(task => task.due === tab.dataset.tab).length;
    tab.querySelector('b').textContent = count;
  });
}

async function loadTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Unable to load tasks');
    const payload = await response.json();
    tasks = payload.data;
    renderTasks();
  } catch (error) {
    showToast('API unavailable — showing saved screen data');
  }
}

async function updateTask(id, completed) {
  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed }) });
    if (!response.ok) throw new Error('Unable to update task');
    const updated = (await response.json()).data;
    tasks = tasks.map(task => task.id === id ? updated : task);
    showToast(completed ? 'Task marked complete ✓' : 'Task reopened');
  } catch (error) { showToast('Could not save task status'); renderTasks(); }
}

document.querySelectorAll('[data-open-modal]').forEach(button => button.addEventListener('click', showModal));
document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', hideModal));
modal.addEventListener('click', event => { if (event.target === modal) hideModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') hideModal(); });

taskForm.addEventListener('submit', async event => {
  event.preventDefault();
  const payload = { title: document.querySelector('#taskName').value.trim(), project: document.querySelector('#taskProject').value, due: 'upcoming', priority: 'medium' };
  try {
    const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to create task');
    tasks.unshift(result.data);
    currentFilter = 'all';
    document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'all'));
    renderTasks(); hideModal(); showToast('Task created successfully ✓');
  } catch (error) { showToast(error.message); }
});

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  currentFilter = tab.dataset.tab;
  document.querySelectorAll('.tab').forEach(item => item.classList.toggle('active', item === tab));
  renderTasks();
}));
document.querySelector('.mobile-menu').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
document.querySelector('#filterButton').addEventListener('click', () => { renderTasks(); showToast(`Showing ${currentFilter} tasks`); });
loadTasks();
