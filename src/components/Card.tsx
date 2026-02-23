import { useEffect, useRef, useState } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import type { CardItem } from '../types/kanban'

type CardProps = {
  card: CardItem
  columnId: string
  onDelete: (cardId: string, columnId: string) => void
  onRename: (cardId: string, columnId: string, title: string) => void
  onDragStart: (cardId: string, fromColumnId: string) => void
  onDropOnCard: (targetColumnId: string, targetCardId: string) => void
  onDropToColumnEnd: (targetColumnId: string) => void
  onCancelDrag: () => void
}

export function Card({
  card,
  columnId,
  onDelete,
  onRename,
  onDragStart,
  onDropOnCard,
  onDropToColumnEnd,
  onCancelDrag,
}: CardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(card.title)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const touchDragging = useRef(false)

  useEffect(() => {
    setDraftTitle(card.title)
  }, [card.title])

  const saveTitle = () => {
    const nextTitle = draftTitle.trim()
    if (!nextTitle) {
      setDraftTitle(card.title)
      setIsEditing(false)
      return
    }

    onRename(card.id, columnId, nextTitle)
    setIsEditing(false)
  }

  return (
    <article
      className="kanban-card"
      data-column={columnId}
      data-column-id={columnId}
      data-card-id={card.id}
      draggable
      onDragStart={() => onDragStart(card.id, columnId)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onDropOnCard(columnId, card.id)
      }}
      onTouchStart={(event) => {
        const touch = event.touches[0]
        touchStart.current = { x: touch.clientX, y: touch.clientY }
        touchDragging.current = false
      }}
      onTouchMove={(event) => {
        const touch = event.touches[0]
        const start = touchStart.current
        if (!start) {
          return
        }

        const movedX = Math.abs(touch.clientX - start.x)
        const movedY = Math.abs(touch.clientY - start.y)
        if (!touchDragging.current && movedX + movedY > 10) {
          onDragStart(card.id, columnId)
          touchDragging.current = true
        }

        if (touchDragging.current) {
          event.preventDefault()
        }
      }}
      onTouchEnd={(event) => {
        const touch = event.changedTouches[0]
        touchStart.current = null

        if (!touchDragging.current) {
          return
        }

        const targetElement = document.elementFromPoint(
          touch.clientX,
          touch.clientY,
        ) as HTMLElement | null

        const cardTarget = targetElement?.closest('[data-card-id]') as
          | HTMLElement
          | null
        if (cardTarget) {
          const targetCardId = cardTarget.dataset.cardId
          const targetColumnId = cardTarget.dataset.columnId
          if (targetCardId && targetColumnId) {
            onDropOnCard(targetColumnId, targetCardId)
            touchDragging.current = false
            return
          }
        }

        const columnTarget = targetElement?.closest('[data-column-id]') as
          | HTMLElement
          | null
        if (columnTarget) {
          const targetColumnId = columnTarget.dataset.columnId
          if (targetColumnId) {
            onDropToColumnEnd(targetColumnId)
            touchDragging.current = false
            return
          }
        }

        touchDragging.current = false
        onCancelDrag()
      }}
      onTouchCancel={() => {
        touchStart.current = null
        touchDragging.current = false
        onCancelDrag()
      }}
    >
      <div className="card-body">
        {isEditing ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={saveTitle}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                saveTitle()
              }
              if (event.key === 'Escape') {
                setDraftTitle(card.title)
                setIsEditing(false)
              }
            }}
            className="card-input"
          />
        ) : (
          <button className="card-title" onClick={() => setIsEditing(true)}>
            {card.title}
          </button>
        )}
      </div>

      <button
        className="card-delete"
        onClick={() => onDelete(card.id, columnId)}
        aria-label={`Delete ${card.title}`}
      >
        <FiTrash2 />
      </button>
    </article>
  )
}
