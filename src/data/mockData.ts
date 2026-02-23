import type { ColumnType } from '../types/kanban'

export const initialColumns: ColumnType[] = [
  {
    id: 'todo',
    title: 'Todo',
    cards: [
      { id: 'card-1', title: 'Define board requirements' },
      { id: 'card-2', title: 'Create reusable components' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: [{ id: 'card-3', title: 'Build drag-and-drop interactions' }],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [{ id: 'card-4', title: 'Set up React + TypeScript app' }],
  },
]
