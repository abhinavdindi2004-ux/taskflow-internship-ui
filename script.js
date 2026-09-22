const modal = document.querySelector('#taskModal');
const taskForm = document.querySelector('#taskForm');
const taskList = document.querySelector('#taskList');
const emptyState = document.querySelector('#emptyState');
const toast = document.querySelector('#toast');

function showModal() { modal.classList.add('visible'); document.querySelector('#taskName').focus(); }
function hideModal() { modal.classList.remove('visible'); taskForm.reset(); }
document.querySelectorAll('[data-open-modal]').forEach(button => button.addEventListener('click', showModal));
document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', hideModal));
modal.addEventListener('click', event => { if (event.target === modal) hideModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') hideModal(); });

taskForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#taskName').value.trim();
  const project = document.querySelector('#taskProject').value;
  const row = document.createElement('label');
  row.className = 'task-row';
  row.dataset.due = 'upcoming';
  row.innerHTML = `<input type="checkbox" /><span class="checkmark"></span><span class="task-info"><strong>${name}</strong><small><i class="dot dot-purple"></i> ${project} <span>·</span> Upcoming</small></span><span class="priority medium">Medium</span><span class="task-avatar avatar-purple">AD</span>`;
  taskList.prepend(row);
  hideModal();
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
});

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(item => item.classList.remove('active'));
  tab.classList.add('active');
  const selected = tab.dataset.tab;
  let visible = 0;
  taskList.querySelectorAll('.task-row').forEach(row => {
    const show = selected === 'all' || (selected === 'today' && row.dataset.due === 'today') || (selected === 'upcoming' && row.dataset.due === 'upcoming');
    row.style.display = show ? 'flex' : 'none';
    if (show) visible++;
  });
  emptyState.style.display = visible ? 'none' : 'block';
}));

document.querySelector('.mobile-menu').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
document.querySelector('#filterButton').addEventListener('click', () => {
  const activeTab = document.querySelector('.tab.active');
  activeTab.click();
  toast.textContent = 'Showing your current task view';
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); toast.textContent = 'Task created successfully ✓'; }, 2000);
});
