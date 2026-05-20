// Punto de entrada del servidor Express.
// Registra middlewares globales (CORS, JSON), monta las rutas
// y arranca el servidor en el puerto definido por la variable PORT.

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Carga variables de entorno desde .env

const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 4000;

// Permite peticiones desde cualquier origen (ajustar en producción)
app.use(cors({ origin: '*' }));
// Parsea el body de las peticiones como JSON
app.use(express.json());

// Rutas CRUD de tareas bajo /api/tasks
app.use('/api/tasks', tasksRouter);

// Endpoint de salud: confirma que el servidor está activo
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
