import React, { CSSProperties, FC, memo } from 'react'
import { useDrag, useDrop } from 'react-dnd'


const style: CSSProperties = {
    border: '1px solid hsl(214, 13%, 20%)',
    padding: '0.5rem 1rem',
    borderRadius: "3px",
    marginBottom: '.5rem',
    backgroundColor: 'hsl(214, 13%, 17%)',
    cursor: 'move',
}

export interface CardProps {
    id: string
    text: string
    moveCard: (id: string, to: number) => void
    setCurrentCardID: (id: string) => void
    findCard: (id: string) => { index: number }
}
interface Item {
    id: string
    originalIndex: number
}

export const Card: FC<CardProps> = memo(function Card({
    id: cardID,
    text,
    moveCard,
    findCard,
    setCurrentCardID
}) {
    const originalIndex = findCard(cardID).index
    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: 'card',
            item: { id: cardID, originalIndex },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
            end: (item, monitor) => {
                const { id: droppedId, originalIndex } = item
                const didDrop = monitor.didDrop()
                if (!didDrop) {
                    moveCard(droppedId, originalIndex)
                }
            },
        }),
        [cardID, originalIndex, moveCard],
    )

    const [, drop] = useDrop(
        () => ({
            accept: 'card',
            hover({ id: draggedId }: Item) {
                console.log(draggedId, cardID)
                if (draggedId !== cardID) {
                    const { index: overIndex } = findCard(cardID)
                    moveCard(draggedId, overIndex)
                    setCurrentCardID(cardID)
                }
            },
        }),
        [findCard, moveCard],
    )

    const opacity = isDragging ? 0 : 1
    return (
        <div ref={(node) => drag(drop(node))} style={{ ...style, opacity }}>
            {text}
        </div>
    )
})
