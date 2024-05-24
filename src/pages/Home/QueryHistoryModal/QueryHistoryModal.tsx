import { AbsoluteTimeRange } from "@grafana/data";
import { VizPanel, sceneGraph } from "@grafana/scenes";
import { Button, Card, Collapse, IconButton, Modal, Tag } from "@grafana/ui";
import { DropdownItem, State } from "components/SettingDropdown/SettingDropdown";
import React, { useEffect, useState } from "react";
import { QueryItem, useQueryStore } from "utils/actions/query";
import { useQueryHistoryStore } from "utils/actions/queryHistory";
interface ModalProps {
    modalIsOpen: boolean
    setModalIsOpen: Function
    getParent: () => VizPanel
}
export const QueryHistoryModal = ({ modalIsOpen, setModalIsOpen, getParent }: ModalProps) => {
    // const queryHistory = useSelector((state: any) => state.queryHistory)
    const { queryHistory, setTimeRangeForLastQuery, setQueryHistory } = useQueryHistoryStore(state => state)
    const data = sceneGraph.getData(getParent()).useState()
    // Move this to QueryHistory modal, use sceneGraph.getData(getParent()).useState() to get timerange and make a reducer for adding timerange to last query
    const onModalClose = () => {
        setModalIsOpen(false);
    };
    useEffect(() => {
        const queryHistory = JSON.parse(localStorage.getItem('query-history') ?? '[]')
        if (queryHistory) {
            setQueryHistory(queryHistory)
        }
    }, [setQueryHistory])
    useEffect(() => {
        if (queryHistory.length > 0) {
            if (data.data?.timeRange) {

                const timeRange: AbsoluteTimeRange = {
                    from: data.data?.timeRange.from.toDate().getTime(),
                    to: data.data?.timeRange.to.toDate().getTime()
                }
                console.log(timeRange, data.data)
                // setTimeRangeForLastQuery(timeRange)
            }
            localStorage.setItem('query-history', JSON.stringify(queryHistory))
        }
    }, [queryHistory, setTimeRangeForLastQuery, getParent, data])

    return (
        <div style={{ display: 'inline-block' }}>

            <Modal title="Settings" isOpen={modalIsOpen} onDismiss={onModalClose}>
                {queryHistory?.map((query: any) => {

                    return (
                        <HistoryPanel key={query.query} label={query.query} queryItem={query} onModalClose={onModalClose} />

                    )
                })}
                {queryHistory.length === 0 && (
                    <Card>
                        <Card.Heading>No query history</Card.Heading>
                    </Card>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '5px' }}>
                    <Button variant="primary" onClick={onModalClose}>
                        Close
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
export const QueryHistoryModalDropdownItem: DropdownItem = {
    label: 'Query history',
    icon: 'backward',
    componentName: 'QueryHistoryModal',
    onClick: (state: State) => {
        state.set(true)
    }
}
interface CollapseProps {
    label: string;
    queryItem: QueryItem;
    onModalClose: Function;
}
const HistoryPanel = ({ label, queryItem, onModalClose }: CollapseProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const { setQuery } = useQueryStore(state => state)
    return (
        <span style={{ position: 'relative', display: 'inline-block', width: '100%' }} >
            <IconButton tooltip={"Set query to search panel"} style={{ position: 'absolute', top: '12px', right: '10px', zIndex: 1 }} name="upload"
                onClick={() => {
                    setQuery(queryItem)
                    onModalClose()
                }}
            />
            <Collapse collapsible={true} isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} label={label}>
                {Object.entries(queryItem).map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return (
                            <Label key={key} label={key} values={value} />
                        )
                    } else {
                        return <></>
                    }
                })}
            </Collapse>
        </span>
    )
}
interface LabelProps {
    label: string
    values: Values[]
}
interface Values {
    value: string
    label: string
}
const Label = ({ label, values }: LabelProps) => {
    return (
        <div>
            {label}: {values.map(value => {
                console.log(value)
                return <Tag style={{ marginRight: '5px' }} key={value.value} name={value.value} />
            })}
        </div>
    )
}
