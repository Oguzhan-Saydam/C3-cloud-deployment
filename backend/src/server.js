const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function log(level, event, message) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    message,
  }));
}

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  log("info", "database_initialized", "Tasks table is ready");
}

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.get("/tasks", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
  res.json(result.rows);
});

app.post("/tasks", async (req, res) => {
  const { title } = req.body;

  const result = await pool.query(
    "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
    [title]
  );

  log("info", "task_created", `Task created: ${title}`);
  res.status(201).json(result.rows[0]);
});

app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  const result = await pool.query(
    "UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *",
    [completed, id]
  );

  res.json(result.rows[0]);
});

app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

  log("info", "task_deleted", `Task deleted with id: ${id}`);
  res.json({ message: "Task deleted" });
});

const port = process.env.PORT || 3000;

initDatabase()
  .then(() => {
    app.listen(port, () => {
      log("info", "server_started", `Backend running on port ${port}`);
    });
  })
  .catch((error) => {
    log("error", "startup_failed", error.message);
    process.exit(1);
  });