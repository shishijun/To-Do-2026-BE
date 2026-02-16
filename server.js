const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// const username = 'shishijun997_db_user';
// const password = 'zKGoP4axky3j4qQz';
// const cluster = 'cluster0.2mm5ozn';
// const db = 'To-Do-2026';

const username = 'Vercel-Admin-to-do-2026-db';
const password = '1ymLco6ABArxRNdp';
const cluster = 'to-do-2026-db.mn6uzff';
const db = 'to-do';

// 1. Connect to MongoDB
// Replace the string below with your Atlas connection string if using the cloud
// mongoose
//   .connect(
//     `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/?appName=Cluster0B`,
//     {
//       dbName: db,
//     },
//   )
//   .then(() => console.log('Connected to MongoDB...'))
//   .catch((err) => console.error('Could not connect to MongoDB', err));

mongoose
  .connect(
    `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`,
    {
      dbName: db,
    },
  )
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Could not connect to MongoDB', err));

// 2. Define the Schema and Model
const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const Task = mongoose.model('Task', taskSchema);
// 3. API Routes

// GET all todos
// app.get('/tasks', async (req, res) => {
//   const todos = await Task.find();
//   res.json(todos);
// });

app.get('/tasks', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Small chunks
    const skip = (page - 1) * limit;

    const tasks = await Task.find().skip(skip).limit(limit);
    console.log('task len', tasks.length);
    const total = await Task.countDocuments(); // Frontend needs this for page numbers

    res.json({
      tasks,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST a new todo
app.post('/tasks', async (req, res) => {
  const newTodo = new Task({
    name: req.body.name,
  });
  await newTodo.save();
  res.status(201).json(newTodo);
});

// PUT (Update) a todo
app.put('/tasks/:id', async (req, res) => {
  const todo = await Task.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, completed: req.body.completed },
    { new: true }, // returns the updated document
  );
  if (!todo) return res.status(404).send('Todo not found');
  res.json(todo);
});

// DELETE a todo
app.delete('/tasks/:id', async (req, res) => {
  const todo = await Task.findByIdAndDelete(req.params.id);
  if (!todo) return res.status(404).send('Todo not found');
  res.status(204).send();
});

app.listen(3000, () => console.log('Server running on port 3000'));
