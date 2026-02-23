import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
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
  const [isTitleClipped, setIsTitleClipped] = useState(false)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const pointerDragging = useRef(false)
  const activePointerId = useRef<number | null>(null)
  const titleButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setDraftTitle(card.title)
  }, [card.title])

  useEffect(() => {
    if (isEditing) {
      setIsTitleClipped(false)
      return
    }

    const updateClippedState = () => {
      const titleElement = titleButtonRef.current
      if (!titleElement) {
        setIsTitleClipped(false)
        return
      }

      const clipped =
        titleElement.scrollWidth > titleElement.clientWidth ||
        titleElement.scrollHeight > titleElement.clientHeight
      setIsTitleClipped(clipped)
    }

    updateClippedState()
    window.addEventListener('resize', updateClippedState)

    return () => {
      window.removeEventListener('resize', updateClippedState)
    }
  }, [card.title, isEditing])

  const cancelEditing = useCallback(() => {
    setDraftTitle(card.title)
    setIsEditing(false)
  }, [card.title])

  const saveTitle = useCallback(() => {
    const nextTitle = draftTitle.trim()
    if (!nextTitle) {
      cancelEditing()
      return
    }

    onRename(card.id, columnId, nextTitle)
    setIsEditing(false)
  }, [cancelEditing, card.id, columnId, draftTitle, onRename])

  const handleTitleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        saveTitle()
      }
      if (event.key === 'Escape') {
        cancelEditing()
      }
    },
    [cancelEditing, saveTitle],
  )

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'touch' || isEditing) {
        return
      }

      pointerStart.current = { x: event.clientX, y: event.clientY }
      pointerDragging.current = false
      activePointerId.current = event.pointerId
    },
    [isEditing],
  )

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (
        event.pointerType !== 'touch' ||
        activePointerId.current !== event.pointerId
      ) {
        return
      }

      const start = pointerStart.current
      if (!start) {
        return
      }

      const movedX = Math.abs(event.clientX - start.x)
      const movedY = Math.abs(event.clientY - start.y)
      if (!pointerDragging.current && movedX + movedY > 10) {
        onDragStart(card.id, columnId)
        pointerDragging.current = true
      }

      if (pointerDragging.current) {
        event.preventDefault()
      }
    },
    [card.id, columnId, onDragStart],
  )

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (
        event.pointerType !== 'touch' ||
        activePointerId.current !== event.pointerId
      ) {
        return
      }

      pointerStart.current = null
      activePointerId.current = null

      if (!pointerDragging.current) {
        return
      }

      const targetElement = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null

      const cardTarget = targetElement?.closest('[data-card-id]') as
        | HTMLElement
        | null
      if (cardTarget) {
        const targetCardId = cardTarget.dataset.cardId
        const targetColumnId = cardTarget.dataset.columnId
        if (targetCardId && targetColumnId) {
          onDropOnCard(targetColumnId, targetCardId)
          pointerDragging.current = false
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
          pointerDragging.current = false
          return
        }
      }

      pointerDragging.current = false
      onCancelDrag()
    },
    [onCancelDrag, onDropOnCard, onDropToColumnEnd],
  )

  const handlePointerCancel = useCallback(() => {
    pointerStart.current = null
    pointerDragging.current = false
    activePointerId.current = null
    onCancelDrag()
  }, [onCancelDrag])

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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div className="card-body">
        {isEditing ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={saveTitle}
            onKeyDown={handleTitleInputKeyDown}
            className="card-input"
          />
        ) : (
          <button
            ref={titleButtonRef}
            className="card-title"
            onClick={() => setIsEditing(true)}
            title={isTitleClipped ? card.title : undefined}
          >
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
