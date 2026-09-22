const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

app.use(express.json());
app.use(express.static(__dirname));

async function readTasks() {
  return JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
}

async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, `${JSON.stringify(tasks, null, 2)}\n`);
}

function validateTask(payload) {
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  const project = typeof payload.project === 'string' ? payload.project.trim() : '';
  const due = ['today', 'upcoming'].includes(payload.due) ? payload.due : 'upcoming';
  const priority = ['high', 'medium', 'low'].includes(payload.priority) ? payload.priority : 'medium';
  if (!title || title.length > 120) return { error: 'Task name is required and must be 120 characters or fewer.' };
  if (!project || project.length > 80) return { error: 'A valid project is required.' };
  return { task: { title, project, due, priority } };
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'taskflow-api' }));

app.get('/api/tasks', async (_req, res, next) => {
  try {
    const tasks = await readTasks();
    const { status, due } = _req.query;
    const filtered = tasks.filter(task => (!status || task.status === status) && (!due || task.due === due));
    res.json({ data: filtered, count: filtered.length });
  } catch (error) { next(error); }
});

app.post('/api/tasks', async (req, res, next) => {
  try {
    const result = validateTask(req.body);
    if (result.error) return res.status(400).json({ error: result.error });
    const tasks = await readTasks();
    const task = {
      id: crypto.randomUUID(),
      ...result.task,
      status: 'open',
      assignee: 'AD',
      createdAt: new Date().toISOString()
    };
    tasks.unshift(task);
    await writeTasks(tasks);
    res.status(201).json({ data: task });
  } catch (error) { next(error); }
});

app.patch('/api/tasks/:id', async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const index = tasks.findIndex(task => task.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Task not found.' });
    if (typeof req.body.completed !== 'boolean') return res.status(400).json({ error: 'completed must be a boolean.' });
    tasks[index].status = req.body.completed ? 'completed' : 'open';
    tasks[index].completedAt = req.body.completed ? new Date().toISOString() : null;
    await writeTasks(tasks);
    res.json({ data: tasks[index] });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(PORT, () => console.log(`TaskFlow running at http://localhost:${PORT}`));
