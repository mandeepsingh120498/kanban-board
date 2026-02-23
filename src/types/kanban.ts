export type CardItem = {
  id: string
  title: string
}

export type ColumnType = {
  id: string
  title: string
  cards: CardItem[]
}

export type DragState = {
  cardId: string
  fromColumnId: string
}
