import update from 'immutability-helper';
import React, { memo, useCallback, useState } from 'react';
import { useDrop } from 'react-dnd';
import { Card } from './DragAndDropCard';


const style = {
    width: 400,
}

export interface ContainerState {
    cards: any[]
}

interface FieldDragAndDropModel {
    labels: string[]
    setLabels: Function;
    inactiveLabels: string[];
    setInactiveLabels: Function;
}
export const FieldDragAndDrop = memo(function Container({ labels, setLabels, inactiveLabels, setInactiveLabels }: FieldDragAndDropModel) {
    const [currentCardID, setCurrentCardID] = useState('')
    const [inactiveCards, setInactiveCards] = useState<string[]>(inactiveLabels)
    const [activeCards, setActiveCards] = useState(labels)
    const findCard = useCallback(
        (id: string, side: "active" | "inactive") => {
            const array = side === 'active' ? activeCards : inactiveCards;
            const card = array.find((c) => c === id.replace("_active", "").replace('_inactive', ''))
            const index = array.indexOf(card || '')
            return {
                card,
                index: index !== -1 ? index : 0,
            }
        },
        [inactiveCards, activeCards],
    )
    const moveCard = useCallback(
        (id: string, atIndex: number) => {
            const side = id.endsWith("_active") ? "active" : "inactive"
            const { card, index } = findCard(id, side)
            if (typeof card === 'undefined' || index === -1) {
                return
            }
            // Reordering of Inactive column
            if (id.endsWith("_inactive")) {
                setInactiveCards(
                    update(inactiveCards, {
                        $splice: [
                            [index, 1],
                            [atIndex, 0, card],
                        ],
                    }),
                )
                setInactiveLabels(
                    update(inactiveCards, {
                        $splice: [
                            [index, 1],
                            [atIndex, 0, card],
                        ],
                    }),)
            }
            // Reordering of Active column
            if (id.endsWith("_active")) {
                setActiveCards(
                    update(activeCards, {
                        $splice: [
                            [index, 1],
                            [atIndex, 0, card],
                        ],
                    }),
                )

                setLabels(update(activeCards, {
                    $splice: [
                        [index, 1],
                        [atIndex, 0, card],
                    ],
                }))
            }
        },
        [findCard, inactiveCards, setInactiveCards, activeCards, setActiveCards, setLabels, setInactiveLabels],
    )

    const switchSide = useCallback((side: 'active' | 'inactive', id: string) => {
        const array = side === 'active' ? activeCards : inactiveCards
        console.log(side, id, array)
        if (side === 'inactive' && id.endsWith("_active")) {
            return
        }
        if (side === 'active' && id.endsWith("_inactive")) {
            return
        }
        let index = array.indexOf(id.replace("_active", "").replace('_inactive', ''))

        if (index === -1) {
            index = 0;
        }
        // Moving from Active to Inactive
        if (id.endsWith("_active")) {
            const movedActive = activeCards[index]
            const newActive = update(activeCards, {
                $splice: [
                    [index, 1]
                ],
            })
            const card = findCard(currentCardID, 'inactive')

            setActiveCards(newActive)
            setInactiveCards(
                update(inactiveCards, {
                    $splice: [
                        [index, 0],
                        [card.index, 0, movedActive],
                    ],
                }),
            )
            setLabels(newActive)
            setInactiveLabels(
                update(inactiveCards, {
                    $splice: [
                        [index, 0],
                        [card.index, 0, movedActive],
                    ],
                }),
            )
        }
        // Moving from Inactive ot Active
        if (id.endsWith("_inactive")) {
            const [movedInactive] = inactiveCards.slice(index, 1)
            const newInactive = update(inactiveCards, {
                $splice: [
                    [index, 1]
                ],
            })
            const card = findCard(currentCardID, 'active')

            setInactiveCards(newInactive)
            setActiveCards(
                update(activeCards, {
                    $splice: [
                        [index, 0],
                        [card.index, 0, movedInactive],
                    ],
                }),
            )

            setLabels(
                update(activeCards, {
                    $splice: [
                        [index, 0],
                        [card.index, 0, movedInactive],
                    ],
                }),
            )
            setInactiveLabels(newInactive)
        }
    }, [activeCards, inactiveCards, setActiveCards, setInactiveCards, setInactiveLabels, setLabels, currentCardID, findCard])
    const [, drop] = useDrop(() => ({
        accept: 'card', drop: (item: any) => { switchSide('active', item.id) },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
        hover: (item, monitor) => {
            // console.log(item, monitor)
        },
        canDrop: () => true,
    }), [switchSide])
    const [, drop2] = useDrop(() => ({
        accept: 'card', drop: (item: any) => { switchSide('inactive', item.id) },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
        hover: (item, monitor) => {
            // console.log(item, monitor)
        },
        canDrop: () => true,
    }), [switchSide])

    return (

        <div style={{ display: 'flex' }} >
            <div ref={drop} style={style}>
                {inactiveCards.map(label =>
                    <Card
                        key={label}
                        id={label + "_inactive"}
                        text={label}
                        moveCard={moveCard}
                        setCurrentCardID={setCurrentCardID}
                        findCard={(id) => findCard(id, "inactive")}
                    />
                )}

            </div>
            <div ref={drop2} style={style}>
                {activeCards.map(label =>
                    <Card
                        key={label}
                        id={label + "_active"}
                        text={label}
                        moveCard={moveCard}
                        setCurrentCardID={setCurrentCardID}
                        findCard={(id) => findCard(id, "active")}
                    />
                )}
            </div>
        </div>
    )
})
