-- =============================================================
-- TaskFlow – Inicialización de base de datos
-- Motor: PostgreSQL
-- Ejecutar una sola vez al arrancar el entorno (dev / staging / prod)
-- =============================================================

-- -------------------------------------------------------------
-- Tabla: tasks
-- Almacena cada tarea del tablero Kanban con su estado, prioridad
-- y fechas de seguimiento.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  -- Identificador único autoincremental
  id          SERIAL PRIMARY KEY,

  -- Título corto visible en la tarjeta del tablero
  title       VARCHAR(255) NOT NULL,

  -- Descripción detallada opcional de la tarea
  description TEXT,

  -- Estado del flujo de trabajo; solo se permiten tres valores:
  --   'todo'        → pendiente de iniciar
  --   'in-progress' → en curso
  --   'done'        → finalizada
  status      VARCHAR(50)  NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo', 'in-progress', 'done')),

  -- Nivel de prioridad; condiciona el orden de visualización:
  --   'low' | 'medium' | 'high'
  priority    VARCHAR(50)  NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high')),

  -- Fecha límite de entrega (NULL = sin fecha definida)
  due_date    DATE,

  -- Marca de tiempo de creación, asignada automáticamente por el servidor
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

  -- Marca de tiempo de la última modificación; debe actualizarse
  -- mediante un trigger o desde la capa de aplicación en cada UPDATE
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- Datos de ejemplo (seed)
-- Carga un conjunto inicial de tareas representativas para
-- facilitar el desarrollo y las demos del proyecto.
-- Eliminar o condicionar este bloque en entornos de producción.
-- -------------------------------------------------------------
INSERT INTO tasks (title, description, status, priority, due_date) VALUES
  -- Tareas finalizadas
  ('Setup design system',      'Configure Tailwind CSS, fonts and base components',  'done',        'high',   '2026-05-10'),

  -- Tareas en progreso
  ('REST API integration',     'Connect Next.js frontend with Express backend',      'in-progress', 'high',   '2026-05-22'),
  ('Mobile responsiveness',    'Make all pages fully responsive on small screens',   'in-progress', 'medium', '2026-05-30'),

  -- Tareas pendientes de alta prioridad
  ('User authentication',      'Implement JWT login/register flow',                  'todo',        'high',   '2026-05-28'),
  ('Deploy to production',     'Configure CI/CD pipeline and deploy to VPS',         'todo',        'high',   '2026-06-01'),

  -- Tareas pendientes de prioridad media
  ('Dashboard analytics',      'Add recharts graphs and KPI summary cards',          'todo',        'medium', '2026-06-05'),

  -- Tareas pendientes de baja prioridad
  ('Write unit tests',         'Reach 80% coverage with Jest + Testing Library',     'todo',        'low',    '2026-06-15'),
  ('Dark mode support',        'Implement theme toggle with next-themes',            'todo',        'low',    '2026-06-20');
