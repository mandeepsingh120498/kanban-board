import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { FiTrash2 } from 'react-icons/fi'
import type { CardItem } from '../types/kanban'

type CardProps = {
  dndId: string
  card: CardItem
  columnId: string
  onDelete: (cardId: string, columnId: string) => void
  onRename: (cardId: string, columnId: string, title: string) => void
}

export function Card({
  dndId,
  card,
  columnId,
  onDelete,
  onRename,
}: CardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(card.title)
  const [isTitleClipped, setIsTitleClipped] = useState(false)
  const titleButtonRef = useRef<HTMLButtonElement | null>(null)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: dndId,
      disabled: isEditing,
      data: {
        type: 'card',
        cardId: card.id,
        columnId,
        title: card.title,
      },
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

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

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`kanban-card${isDragging ? ' is-dragging' : ''}`}
      data-column={columnId}
      data-column-id={columnId}
      data-card-id={card.id}
      {...attributes}
      {...listeners}
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
