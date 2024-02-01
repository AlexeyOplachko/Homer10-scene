import React, { useState } from 'react';
import { Modal, Button, Select, IconButton } from '@grafana/ui';
import { getDataSourceSrv, locationService } from '@grafana/runtime';
import { PanelProps } from '@grafana/data';
interface ModalProps {
}
interface Props extends PanelProps<ModalProps> { }

export const SettingsModal = ({ data, width, height, replaceVariables }: Props) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const dataSources = getDataSourceSrv().getList({ pluginId: "loki" })
    const currentSource = replaceVariables(' $Datasource');

    console.log(currentSource)
    const onModalClose = () => {
        setModalIsOpen(false);
    };

    return (
        <div>
            <IconButton tooltip="Open settings" name='cog' onClick={() => setModalIsOpen(true)}></IconButton>

            <Modal title="Settings" isOpen={modalIsOpen} onDismiss={onModalClose}>
                <Select
                    placeholder={"Select datasource"}
                    key={'datasources'}
                    options={dataSources.map((i) => ({ label: i.name, value: i.uid }))}
                    value={currentSource || dataSources[0]}
                    onChange={(v) => {
                        if (v.value) {
                            locationService.partial({ "var-Datasource": v.value }, true);
                        }
                    }}
                />
                <Button variant="primary" onClick={onModalClose}>
                    Close
                </Button>
            </Modal>
        </div>
    );
};
