import { PanelProps } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
// import { getDataSourceSrv, locationService } from '@grafana/runtime';
import { Button, IconButton, Modal } from '@grafana/ui';
import React, { useState } from 'react';
import { FieldDragAndDrop } from './DragAndDrop';
interface ModalProps {
    labels: string[]
    setLabels: Function;
    inactiveLabels: string[];
    setInactiveLabels: Function;
}
interface Props extends PanelProps<ModalProps> {
    labels: string[]
    setLabels: Function;
    inactiveLabels: string[];
    setInactiveLabels: Function;
}

export const SettingsModal = ({ labels: activeLabels, setLabels, inactiveLabels, setInactiveLabels, data, width, height, replaceVariables }: Props) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    // const dataSources = getDataSourceSrv().getList({ pluginId: "loki" })
    const currentSource = replaceVariables(' $Datasource');

    console.log(currentSource)
    const onModalClose = () => {
        setModalIsOpen(false);
    };
    const updatePluginSettings = (settings: { jsonData: unknown; pinned: boolean; enabled: boolean }): Promise<undefined> => {
        return getBackendSrv().post(`api/plugins/homer10-app/settings`, settings);
    };
    return (
        <div style={{ display: 'inline-block' }}>
            <IconButton tooltip="Open settings" name='cog' onClick={() => setModalIsOpen(true)}></IconButton>
            <IconButton tooltip="Save field order" name='save' onClick={() =>
                updatePluginSettings({ jsonData: { activeLabels: activeLabels, inactiveLabels: inactiveLabels }, pinned: true, enabled: true })}>

            </IconButton>
            <Modal title="Settings" isOpen={modalIsOpen} onDismiss={onModalClose}>
                {/* <Select
                    placeholder={"Select datasource"}
                    key={'datasources'}
                    options={dataSources.map((i) => ({ label: i.name, value: i.uid }))}
                    value={currentSource || dataSources[0]}
                    onChange={(v) => {
                        if (v.value) {
                            locationService.partial({ "var-Datasource": v.value }, true);
                        }
                    }}
                /> */}
                <FieldDragAndDrop inactiveLabels={inactiveLabels} setInactiveLabels={setInactiveLabels} setLabels={setLabels} labels={activeLabels} />
                <Button variant="primary" onClick={onModalClose}>
                    Close
                </Button>
            </Modal>
        </div>
    );
};
