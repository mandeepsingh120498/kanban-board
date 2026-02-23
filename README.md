# Kanban Board (React + TypeScript)

A responsive Kanban board with three default columns:

- **Todo**
- **In Progress**
- **Done**

This project is built as a reusable component-based UI and supports desktop + mobile drag and drop.

## Features

### 1) Card Management

- Add cards to any column
- Delete cards
- Inline edit card titles

### 2) Drag & Drop

- Move cards across columns
- Reorder cards within the same column
- Preserve card order in each column
- Full-column drop target support
- Mobile touch drag/drop fallback (small screens)

### 3) Responsive UI

- 3-column layout on desktop
- Columns stack vertically on small screens
- Minimal clean styling with column color themes

### 4) Component Structure

- `KanbanBoard` → board state and move logic
- `Column` → column layout, add-card controls, drop zone
- `Card` → card display, edit, delete, drag handlers

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **react-icons**

## Project Structure

```text
src/
	components/
		KanbanBoard.tsx
		Column.tsx
		Card.tsx
		KanbanBoard.css
	data/
		mockData.ts
	types/
		kanban.ts
	App.tsx
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Notes

- Initial cards are loaded from `src/data/mockData.ts`.
- IDs are generated using `crypto.randomUUID()` with a fallback for compatibility.
- Drag behavior supports both traditional desktop drag events and touch interactions.

