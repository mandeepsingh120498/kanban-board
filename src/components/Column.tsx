import { useRef, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { Card } from './Card'
import type { ColumnType } from '../types/kanban'

type ColumnProps = {
  column: ColumnType
  onAddCard: (columnId: string, title: string) => void
  onDeleteCard: (cardId: string, columnId: string) => void
  onRenameCard: (cardId: string, columnId: string, title: string) => void
  onDragStart: (cardId: string, fromColumnId: string) => void
  onDropOnCard: (targetColumnId: string, targetCardId: string) => void
  onDropToColumnEnd: (targetColumnId: string) => void
  onCancelDrag: () => void
}

export function Column({
  column,
  onAddCard,
  onDeleteCard,
  onRenameCard,
  onDragStart,
  onDropOnCard,
  onDropToColumnEnd,
  onCancelDrag,
}: ColumnProps) {
  const [newCardTitle, setNewCardTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const submitCard = () => {
    const title = newCardTitle.trim()
    if (!title) {
      return
    }

    onAddCard(column.id, title)
    setNewCardTitle('')
    setIsAdding(false)
  }

  const openAddForm = () => {
    setIsAdding(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <section
      className={`kanban-column${isDragOver ? ' is-drag-over' : ''}`}
      data-column={column.id}
      data-column-id={column.id}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={(event) => {
        const relatedTarget = event.relatedTarget as Node | null
        if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
          return
        }

        setIsDragOver(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragOver(false)
        onDropToColumnEnd(column.id)
      }}
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
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                submitCard()
              }
              if (event.key === 'Escape') {
                setIsAdding(false)
                setNewCardTitle('')
              }
            }}
          />
          <div className="column-add-actions">
            <button onClick={submitCard} className="add-card-btn">
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false)
                setNewCardTitle('')
              }}
              className="cancel-card-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="column-cards">
        {column.cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            columnId={column.id}
            onDelete={onDeleteCard}
            onRename={onRenameCard}
            onDragStart={onDragStart}
            onDropOnCard={onDropOnCard}
            onDropToColumnEnd={onDropToColumnEnd}
            onCancelDrag={onCancelDrag}
          />
        ))}
      </div>
    </section>
  )
}
