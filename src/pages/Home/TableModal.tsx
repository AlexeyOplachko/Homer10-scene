import { PanelProps } from '@grafana/data';
import { Button, IconButton, Modal, useTheme2 } from '@grafana/ui';
import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import './TableModal.scss'
import { locationService } from '@grafana/runtime';
import { ColDef } from 'ag-grid-community';


interface ModalProps {
}
interface Props extends PanelProps<ModalProps> { }

export const TableModal = ({ data, width, height, replaceVariables, options }: Props) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const onModalClose = () => {
        setModalIsOpen(false);
    };


    const [colDefs, setColDefs] = useState<ColDef[]>([
    ]);
    const [rowData, setRowData] = useState();
    const { isDark } = useTheme2()
    // Column Definitions: Defines & controls grid columns.
    useEffect(() => {


        const [serie] = data.series || [];
        const fields = serie?.fields || [];
        const [firstField]: any = fields;
        const outData = firstField?.values || [];
        const columns: ColDef[] = []
        console.log(outData)
        fields.forEach(field => {
            if (typeof field.values[0] !== 'object') {
                field.values.forEach((value, index) => {
                    outData[index][field.name] = value;
                });
                const column = { colId: field.name, field: field.name }
                if (field.name === 'callid') {
                    columns.splice(0, 0, column);
                } else {
                    columns.push(column)
                }
            } else {
                const valueLabelsName = Object.keys(outData?.[0] || {});
                valueLabelsName.forEach(label => {

                    columns.push({ colId: label, field: label })
                });
            }
        });

        let uniqueArray = columns.filter((value, index, self) => {
            return self.findIndex(item => item.colId === value.colId) === index;
        });

        setColDefs(uniqueArray)
        setRowData(outData)
    }, [data])
    const gridOptions = {
        onRowDoubleClicked: (row: any) => {
            console.log('test', row.data)
            if (row.data.callid) {
                locationService.partial({ "var-flowQuery": `{job="heplify-server"} |~ "${row.data.callid}" | regexp \"Call-ID:\\s+(?<callid>.+?\\r\\n)\"` }, true);
                onModalClose()
            }
        }
    }
    return (
        <div>
            <IconButton tooltip="Open table" name='search' onClick={() => setModalIsOpen(true)}></IconButton>


            <Modal className='modal' title="Settings" isOpen={modalIsOpen} onDismiss={onModalClose}>

                <div className={isDark ? "ag-theme-quartz-dark" : "ag-theme-quartz"} style={{ height: 500 }}>
                    <AgGridReact gridOptions={gridOptions} columnDefs={colDefs} rowData={rowData} />
                </div>
                <Button variant="primary" onClick={onModalClose}>
                    Close
                </Button>
            </Modal>
        </div>
    );
};
