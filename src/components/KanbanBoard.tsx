import {
  DndContext,
  DragOverlay,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useMemo, useState } from 'react'
import { Column } from './Column'
import { initialColumns } from '../data/mockData'
import type { CardItem, ColumnType } from '../types/kanban'
import './KanbanBoard.css'

const getColumnDndId = (columnId: string) => `column:${columnId}`

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `card-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

const updateColumnCards = (
  columns: ColumnType[],
  columnId: string,
  updater: (cards: CardItem[]) => CardItem[],
) =>
  columns.map((column) =>
    column.id === columnId ? { ...column, cards: updater(column.cards) } : column,
  )

export function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns)
  const [activeDragCard, setActiveDragCard] = useState<{
    id: string
    title: string
    columnId: string
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 4 },
    }),
  )

  const totalCards = useMemo(
    () => columns.reduce((sum, column) => sum + column.cards.length, 0),
    [columns],
  )

  const addCard = useCallback((columnId: string, title: string) => {
    setColumns((previousColumns) =>
      updateColumnCards(previousColumns, columnId, (cards) => [
        ...cards,
        { id: createId(), title },
      ]),
    )
  }, [])

  const deleteCard = useCallback((cardId: string, columnId: string) => {
    setColumns((previousColumns) =>
      updateColumnCards(previousColumns, columnId, (cards) =>
        cards.filter((card) => card.id !== cardId),
      ),
    )
  }, [])

  const renameCard = useCallback(
    (cardId: string, columnId: string, title: string) => {
      setColumns((previousColumns) =>
        updateColumnCards(previousColumns, columnId, (cards) =>
          cards.map((card) => (card.id === cardId ? { ...card, title } : card)),
        ),
      )
    },
    [],
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activeData = event.active.data.current

    if (!activeData || activeData.type !== 'card') {
      setActiveDragCard(null)
      return
    }

    setActiveDragCard({
      id: activeData.cardId as string,
      title: activeData.title as string,
      columnId: activeData.columnId as string,
    })
  }, [])

  const handleDragCancel = useCallback(() => {
    setActiveDragCard(null)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragCard(null)

    if (!over) {
      return
    }

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || activeData.type !== 'card' || !overData) {
      return
    }

    const cardId = activeData.cardId as string
    const fromColumnId = activeData.columnId as string

    let targetColumnId: string | null = null
    let targetCardId: string | undefined

    if (overData.type === 'card') {
      targetColumnId = overData.columnId as string
      targetCardId = overData.cardId as string
    } else if (overData.type === 'column') {
      targetColumnId = overData.columnId as string
    }

    if (!targetColumnId || targetCardId === cardId) {
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

      if (sourceColumnIndex === destinationColumnIndex) {
        if (!targetCardId) {
          return previousColumns
        }

        const targetIndex = sourceColumn.cards.findIndex(
          (card) => card.id === targetCardId,
        )

        if (targetIndex < 0 || targetIndex === draggedCardIndex) {
          return previousColumns
        }

        return previousColumns.map((column, index) =>
          index === sourceColumnIndex
            ? { ...column, cards: arrayMove(column.cards, draggedCardIndex, targetIndex) }
            : column,
        )
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

      destinationCards.splice(insertIndex, 0, draggedCard)
      return nextColumns
    })
  }, [])

  return (
    <main className="kanban-board-wrapper">
      <header className="kanban-board-header">
        <h1>Kanban Board</h1>
        <p>{totalCards} cards</p>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board-grid">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              columnDndId={getColumnDndId(column.id)}
              onAddCard={addCard}
              onDeleteCard={deleteCard}
              onRenameCard={renameCard}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDragCard ? (
            <article
              className="kanban-card kanban-drag-overlay"
              data-column={activeDragCard.columnId}
              data-column-id={activeDragCard.columnId}
              data-card-id={activeDragCard.id}
            >
              <div className="card-body">
                <span className="card-title">{activeDragCard.title}</span>
              </div>
            </article>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  )
}
