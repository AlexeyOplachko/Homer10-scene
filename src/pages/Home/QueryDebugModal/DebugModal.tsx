import { locationService } from "@grafana/runtime";
import { Button, Card, Modal } from "@grafana/ui";
import { CopyText } from "components/CopyText/CopyText";
import { DropdownItem, State } from "components/SettingDropdown/SettingDropdown";
import React, { useEffect, useState } from "react";
interface ModalProps {
    modalIsOpen: boolean
    setModalIsOpen: Function
}
export const DebugModal = ({ modalIsOpen, setModalIsOpen }: ModalProps) => {

    const searchObject = locationService.getSearchObject()
    const [query, setQuery] = useState('')
    useEffect(() => {
        if (searchObject?.['var-flowQuery'] && typeof searchObject?.['var-flowQuery'] === 'string') {
            setQuery(searchObject['var-flowQuery'])
        }
    }, [searchObject])

    const onModalClose = () => {
        setModalIsOpen(false);
    };
    return (
        <div style={{ display: 'inline-block' }}>

            <Modal title="Settings" isOpen={modalIsOpen} onDismiss={onModalClose}>

                <Card>
                    <Card.Heading>Current query</Card.Heading>
                    <Card.Description><span style={{ position: 'absolute', right: '10px', top: '10px' }}><CopyText text={query}></CopyText></span> {query}</Card.Description>
                </Card>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '5px' }}>
                    <Button variant="primary" onClick={onModalClose}>
                        Close
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
export const DebugModalDropdownItem: DropdownItem = {
    label: 'Debug query',
    icon: 'bug',
    componentName: 'DebugModal',
    onClick: (state: State) => {
        state.set(true)
    }
}
