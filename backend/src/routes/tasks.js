// Define las rutas REST para el recurso "tasks" y las delega al controlador.
// Montado en /api/tasks por src/index.js.
//
//   GET    /api/tasks        → listar tareas (acepta filtros por query)
//   GET    /api/tasks/:id    → obtener una tarea por ID
//   POST   /api/tasks        → crear nueva tarea
//   PUT    /api/tasks/:id    → reemplazar una tarea existente
//   DELETE /api/tasks/:id    → eliminar una tarea

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tasksController');

router.get('/',       ctrl.getAll);
router.get('/:id',    ctrl.getById);
router.post('/',      ctrl.create);
router.put('/:id',    ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
