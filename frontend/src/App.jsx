import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  async function loadTasks() {
    const response = await fetch(`${API_URL}/tasks`);
    const data = await response.json();
    setTasks(data);
  }

  async function addTask(e) {
    e.preventDefault();

    if (!title.trim()) return;

    await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    setTitle("");
    loadTasks();
  }

  async function toggleTask(task) {
    await fetch(`${API_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: !task.completed }),
    });

    loadTasks();
  }

  async function deleteTask(id) {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
    });

    loadTasks();
  }

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadTasks();
}, []);

  return (
    <main className="container">
      <h1>Docker Task Manager</h1>

      <form onSubmit={addTask}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task..."
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span
              onClick={() => toggleTask(task)}
              style={{
                textDecoration: task.completed ? "line-through" : "none",
                cursor: "pointer",
              }}
            >
              {task.title}
            </span>

            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;