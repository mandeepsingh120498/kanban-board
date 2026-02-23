import {
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { FiPlus } from 'react-icons/fi'
import { Card } from './Card'
import type { ColumnType } from '../types/kanban'

type ColumnProps = {
  column: ColumnType
  columnDndId: string
  onAddCard: (columnId: string, title: string) => void
  onDeleteCard: (cardId: string, columnId: string) => void
  onRenameCard: (cardId: string, columnId: string, title: string) => void
}

export function Column({
  column,
  columnDndId,
  onAddCard,
  onDeleteCard,
  onRenameCard,
}: ColumnProps) {
  const [newCardTitle, setNewCardTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { setNodeRef, isOver } = useDroppable({
    id: columnDndId,
    data: {
      type: 'column',
      columnId: column.id,
    },
  })

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus()
    }
  }, [isAdding])

  const resetAddForm = useCallback(() => {
    setIsAdding(false)
    setNewCardTitle('')
  }, [])

  const submitCard = useCallback(() => {
    const title = newCardTitle.trim()
    if (!title) {
      return
    }

    onAddCard(column.id, title)
    resetAddForm()
  }, [column.id, newCardTitle, onAddCard, resetAddForm])

  const openAddForm = useCallback(() => {
    setIsAdding(true)
  }, [])

  const handleCardInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        submitCard()
      }
      if (event.key === 'Escape') {
        resetAddForm()
      }
    },
    [resetAddForm, submitCard],
  )

  return (
    <section
      ref={setNodeRef}
      className={`kanban-column${isOver ? ' is-drag-over' : ''}`}
      data-column={column.id}
      data-column-id={column.id}
    >
      <header className="column-header">
        <div className="column-header-title">
          <h2>{column.title}</h2>
          <span className="column-count">{column.cards.length}</span>
        </div>
        <button className="column-add-icon" onClick={openAddForm} aria-label={`Add card in ${column.title}`}>
          <FiPlus />
        </button>
      </header>

      {isAdding && (
        <div className="column-add-card">
          <input
            ref={inputRef}
            value={newCardTitle}
            onChange={(event) => setNewCardTitle(event.target.value)}
            placeholder="Enter card title"
            className="card-input"
            onKeyDown={handleCardInputKeyDown}
          />
          <div className="column-add-actions">
            <button onClick={submitCard} className="add-card-btn">
              Add
            </button>
            <button onClick={resetAddForm} className="cancel-card-btn">
              Cancel
            </button>
          </div>
        </div>
      )}

      <SortableContext
        items={column.cards.map((card) => `card:${card.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="column-cards">
          {column.cards.map((card) => (
            <Card
              key={card.id}
              dndId={`card:${card.id}`}
              card={card}
              columnId={column.id}
              onDelete={onDeleteCard}
              onRename={onRenameCard}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  )
}
