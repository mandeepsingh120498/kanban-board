import { useMemo, useState } from 'react'
import { Column } from './Column'
import { initialColumns } from '../data/mockData'
import type { ColumnType, DragState } from '../types/kanban'
import './KanbanBoard.css'

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `card-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns)
  const [dragState, setDragState] = useState<DragState | null>(null)

  const totalCards = useMemo(
    () => columns.reduce((sum, column) => sum + column.cards.length, 0),
    [columns],
  )

  const addCard = (columnId: string, title: string) => {
    setColumns((previousColumns) =>
      previousColumns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cards: [...column.cards, { id: createId(), title }],
            }
          : column,
      ),
    )
  }

  const deleteCard = (cardId: string, columnId: string) => {
    setColumns((previousColumns) =>
      previousColumns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cards: column.cards.filter((card) => card.id !== cardId),
            }
          : column,
      ),
    )
  }

  const renameCard = (cardId: string, columnId: string, title: string) => {
    setColumns((previousColumns) =>
      previousColumns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              cards: column.cards.map((card) =>
                card.id === cardId ? { ...card, title } : card,
              ),
            }
          : column,
      ),
    )
  }

  const moveCard = (targetColumnId: string, targetCardId?: string) => {
    if (!dragState) {
      return
    }

    const { cardId, fromColumnId } = dragState

    if (fromColumnId === targetColumnId && !targetCardId) {
      setDragState(null)
      return
    }

    if (targetCardId === cardId) {
      setDragState(null)
      return
    }

    setColumns((previousColumns) => {
      const sourceColumnIndex = previousColumns.findIndex(
        (column) => column.id === fromColumnId,
      )
      const destinationColumnIndex = previousColumns.findIndex(
        (column) => column.id === targetColumnId,
      )

      if (sourceColumnIndex < 0 || destinationColumnIndex < 0) {
        return previousColumns
      }

      const sourceColumn = previousColumns[sourceColumnIndex]
      const draggedCardIndex = sourceColumn.cards.findIndex(
        (card) => card.id === cardId,
      )

      if (draggedCardIndex < 0) {
        return previousColumns
      }

      const draggedCard = sourceColumn.cards[draggedCardIndex]
      const nextColumns = previousColumns.map((column) => ({
        ...column,
        cards: [...column.cards],
      }))

      nextColumns[sourceColumnIndex].cards.splice(draggedCardIndex, 1)

      const destinationCards = nextColumns[destinationColumnIndex].cards
      let insertIndex = destinationCards.length

      if (targetCardId) {
        const foundIndex = destinationCards.findIndex(
          (card) => card.id === targetCardId,
        )
        if (foundIndex >= 0) {
          insertIndex = foundIndex
        }
      }

      if (
        sourceColumnIndex === destinationColumnIndex &&
        draggedCardIndex < insertIndex
      ) {
        insertIndex -= 1
      }

      destinationCards.splice(insertIndex, 0, draggedCard)
      return nextColumns
    })

    setDragState(null)
  }

  const clearDragState = () => {
    setDragState(null)
  }

  return (
    <main className="kanban-board-wrapper">
      <header className="kanban-board-header">
        <h1>Kanban Board</h1>
        <p>{totalCards} cards</p>
      </header>

      <div className="kanban-board-grid">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onRenameCard={renameCard}
            onDragStart={(cardId, fromColId) =>
              setDragState({ cardId, fromColumnId: fromColId })
            }
            onDropOnCard={moveCard}
            onDropToColumnEnd={(columnId) => moveCard(columnId)}
            onCancelDrag={clearDragState}
          />
        ))}
      </div>
    </main>
  )
}
