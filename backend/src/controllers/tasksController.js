// Controlador CRUD para el recurso "tasks".
// Cada función maneja una operación de base de datos y responde con JSON.
// Los errores de BD se capturan y devuelven con status 500.

const pool = require('../db');

// GET /api/tasks — devuelve todas las tareas, ordenadas por fecha de creación.
// Soporta filtros opcionales por query: ?status=&priority=&search=
exports.getAll = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const params = [];
    let where = 'WHERE 1=1'; // base siempre verdadera para concatenar AND dinámicos

    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      where += ` AND priority = $${params.length}`;
    }
    if (search) {
      // Búsqueda case-insensitive en título y descripción
      params.push(`%${search}%`);
      const i = params.length;
      where += ` AND (title ILIKE $${i} OR description ILIKE $${i})`;
    }

    const { rows } = await pool.query(
      `SELECT * FROM tasks ${where} ORDER BY created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/tasks/:id — devuelve una tarea por su ID; 404 si no existe
exports.getById = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/tasks — crea una tarea nueva y devuelve el registro insertado (201)
exports.create = async (req, res) => {
  try {
    const { title, description, status = 'todo', priority = 'medium', due_date } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title.trim(), description || null, status, priority, due_date || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/tasks/:id — reemplaza todos los campos editables de una tarea existente
exports.update = async (req, res) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

    const { rows } = await pool.query(
      `UPDATE tasks
       SET title=$1, description=$2, status=$3, priority=$4, due_date=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [title.trim(), description || null, status, priority, due_date || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/tasks/:id — elimina la tarea y confirma con el ID borrado; 404 si no existe
exports.remove = async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM tasks WHERE id=$1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
