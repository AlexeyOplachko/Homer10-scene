// import { getDataSourceSrv, locationService } from '@grafana/runtime';
import { VizPanel, sceneGraph } from '@grafana/scenes';
import { Button, IconButton, Modal } from '@grafana/ui';
import React, { useCallback, useEffect, useState } from 'react';
import { FieldDragAndDrop } from './DragAndDrop';
interface ModalProps {
    // activeLabels: string[]
    // setActiveLabels: Function;
    // inactiveLabels: string[];
    // setInactiveLabels: Function;
    setState: Function;
    getParent: () => VizPanel;
}

export const SettingsModal = ({ setState, getParent }: ModalProps) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const data = sceneGraph.getData(getParent()).useState()
    const [labelNames, setLabelNames] = useState<string[]>([])
    const [activeLabels, setActiveLabels] = useState<string[]>([])

    const [inactiveLabels, setInactiveLabels] = useState<string[]>([])
    const [isLabelsSet, setIsLabelsSet] = useState(false)
    useEffect(() => {

        const [serie] = data?.data?.series || [];
        const fields = serie?.fields || [];
        const [firstField]: any = fields;
        const outData = firstField?.values || [];
        setLabelNames(Object.keys(outData?.[0] || {}))
    }, [data])
    const setLabels = useCallback((inactiveLabels: string[], activeLabels: string[]) => {

        if (typeof activeLabels !== 'undefined' && activeLabels.length > 0) {
            setInactiveLabels(inactiveLabels.filter(label => labelNames.includes(label)))
            setActiveLabels(activeLabels.filter(label => labelNames.includes(label)))
        } else {
            setActiveLabels(labelNames)
        }
    }, [labelNames])

    useEffect(() => {
        const getPluginSettings = async () => {
            // const settings = await getBackendSrv().get(`api/plugins/homer10-app/settings`);
            // console.log(settings)
            // if (settings?.jsonData && Array.isArray(settings?.jsonData?.activeLabels) && Array.isArray(settings?.jsonData?.inactiveLabels)) {
            //     setLabels(settings.jsonData.inactiveLabels, settings?.jsonData?.activeLabels)
            // } else {
            try {
                if (labelNames.length > 0 && !isLabelsSet) {
                    const labels = JSON.parse(localStorage.getItem('search-fields') ?? '{}')
                    console.log(labels)
                    setLabels(labels.inactiveLabels, labels.activeLabels)
                    setIsLabelsSet(true)
                }
            } catch (e) {
                setLabels([], [])
            }
            // }
        };
        getPluginSettings();
    }, [setLabels, setIsLabelsSet, labelNames, isLabelsSet])
    useEffect(() => {
        if (isLabelsSet) {
            console.log("SETTING LABELS", activeLabels, inactiveLabels)
            setState({ activeLabels, inactiveLabels })
            localStorage.setItem('search-fields', JSON.stringify({
                activeLabels,
                inactiveLabels
            }))
        }
    }, [activeLabels, inactiveLabels, setState, isLabelsSet])

    const onModalClose = () => {
        setModalIsOpen(false);
    };
    // const updatePluginSettings = (settings: { jsonData: unknown; pinned: boolean; enabled: boolean }): Promise<undefined> => {
    //     return getBackendSrv().post(`api/plugins/homer10-app/settings`, settings);
    // };
    return (
        <div style={{ display: 'inline-block' }}>
            <IconButton tooltip="Open settings" name='cog' onClick={() => setModalIsOpen(true)}></IconButton>
            {/* <IconButton tooltip="Save field order" name='save' onClick={() =>
                updatePluginSettings({ jsonData: { activeLabels: activeLabels, inactiveLabels: inactiveLabels }, pinned: true, enabled: true })}>

            </IconButton> */}
            <Modal title="Settings" isOpen={modalIsOpen} onDismiss={onModalClose}>

                <FieldDragAndDrop inactiveLabels={inactiveLabels} setInactiveLabels={setInactiveLabels} setActiveLabels={setActiveLabels} activeLabels={activeLabels} />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="primary" onClick={onModalClose}>
                        Close
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
