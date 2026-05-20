// Tipos compartidos para el recurso "task".
// Task refleja exactamente la fila de la tabla PostgreSQL.
// TaskFormData es el subconjunto editable que maneja el formulario.

export type Status   = 'todo' | 'in-progress' | 'done'
export type Priority = 'low'  | 'medium'      | 'high'

// Representa una tarea tal como la devuelve la API
export interface Task {
  id:          number
  title:       string
  description: string | null
  status:      Status
  priority:    Priority
  due_date:    string | null  // ISO date "YYYY-MM-DD" o null
  created_at:  string
  updated_at:  string
}

// Datos del formulario de creación/edición (sin campos de solo lectura)
export interface TaskFormData {
  title:       string
  description: string
  status:      Status
  priority:    Priority
  due_date:    string  // vacío cuando no hay fecha
}
