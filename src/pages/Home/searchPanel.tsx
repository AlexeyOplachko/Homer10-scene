import { PanelPlugin, PanelProps } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, MultiSelect } from '@grafana/ui';
import React, { useCallback, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { baseQuery } from './labels';
import { SettingsModal } from './SettingsModal/SettingsModal';
// import { TableModal } from './TableModal';
interface CustomVizOptions {

    labels: string[]
    setLabels: Function;
    inactiveLabels: string[];
    setInactiveLabels: Function;
}
interface CustomVizFieldOptions {
    // data: SceneDataProvider;
    labels: string[]
}
export interface Props extends PanelProps<CustomVizOptions> { }
export const CustomVizPanel = (props: Props) => {
    const [labelValues, setLabelValues] = useState({})

    const [serie] = props.data.series || [];
    const fields = serie?.fields || [];
    const [firstField]: any = fields;
    const outData = firstField?.values || [];
    const [labelNames] = useState(Object.keys(outData?.[0] || {}))
    const [activeLabels, setActiveLabels] = useState<string[]>([])

    const [inactiveLabels, setInactiveLabels] = useState<string[]>([])

    useEffect(() => {
        const getPluginSettings = async () => {
            const settings = await getBackendSrv().get(`api/plugins/homer10-app/settings`);
            console.log(settings)
            if (settings?.jsonData && Array.isArray(settings?.jsonData?.activeLabels) && Array.isArray(settings?.jsonData?.inactiveLabels)) {
                setLabels(settings.jsonData.inactiveLabels, settings?.jsonData?.activeLabels)

            } else {
                try {
                    const labels = JSON.parse(localStorage.getItem('search-fields') ?? '')
                    setLabels(labels.inactiveLabels, labels.activeLabels)
                } catch (e) {

                }
            }
        };
        getPluginSettings();
    }, [])
    const setLabels = useCallback((inactiveLabels: string[], activeLabels: string[]) => {
        if (activeLabels.length > 0) {
            setInactiveLabels(inactiveLabels.filter(label => labelNames.includes(label)))
            setActiveLabels(activeLabels.filter(label => labelNames.includes(label)))
        } else {
            setActiveLabels(labelNames)
        }
    }, [labelNames])
    useEffect(() => {
        localStorage.setItem('search-fields', JSON.stringify({
            activeLabels,
            inactiveLabels
        }))
    }, [activeLabels, inactiveLabels])
    const labels: any = {};
    outData.forEach((entry: any) => {
        for (const label in entry) {
            if (Array.isArray(labels[label])) {
                labels[label].push(entry[label])
            } else {
                labels[label] = [entry[label]]
            }
        }
    });
    for (const label in labels) {
        labels[label] = [...new Set(labels[label])]
    }
    return (
        <div style={{ display: 'flex', height: "100%", flexDirection: "column" }}>


            <DndProvider backend={HTML5Backend}>
                <SettingsModal setLabels={setActiveLabels} labels={activeLabels} inactiveLabels={inactiveLabels} setInactiveLabels={setInactiveLabels} {...props}></SettingsModal></DndProvider>


            {/* <TableModal  {...props} width={1000}></TableModal> */}
            <div style={{ overflow: "auto", display: 'flex', height: "100%", flexDirection: "column" }}>
                {activeLabels.map(label => {
                    return (
                        <MyMultiSelect
                            key={label}
                            label={label}
                            labels={labels}
                            setLabelValues={setLabelValues}
                            labelValues={labelValues}
                        />
                    )
                })}
            </div>
            <div>
                <Button variant="primary" onClick={() => {
                    locationService.partial({ "var-flowQuery": baseQuery }, true);
                    locationService.partial({ "var-tableQuery": baseQuery }, true);
                    setLabelValues({})
                }}>
                    Clear
                </Button>
                <SearchButton
                    setLabelValues={setLabelValues}
                    labelValues={labelValues} />
            </div>
        </div>)
};
interface MyMultiSelectProps {
    label: string;
    labels: any;
    labelValues: {
        [key: string]: any
    }
    setLabelValues: Function
    key: string;
}
const MyMultiSelect = ({ label, labels, labelValues, setLabelValues }: MyMultiSelectProps) => {
    const [selectValue, setSelectValue] = useState<any>([]);

    useEffect(() => {
        const labelValue = labelValues[label]
        console.log(labelValue)
        if (typeof labelValue !== 'undefined') {
            // setSelectValue(labelValue)

            // setSelectValue({
            //     label: labelValue[0],
            //     value: labelValue[0]
            // })
        } else {
            // setSelectValue([])
        }
    }, [labelValues, label])

    return (
        <MultiSelect
            onKeyDown={(e: any) => {
                if (e.code === 'Enter') {
                    const text = e.target.value;
                    labelValues[label] = [...labelValues[label] ?? [], text];
                    setLabelValues(labelValues);
                    labels[label] = [...labels[label] ?? [], text];
                    const newValue = [...selectValue, { label: text, value: text }]
                    const newValueSet = new Set(newValue.map((i: any) => i.value));
                    setSelectValue([...newValueSet].map((i: any) => ({ label: i, value: i })));
                    setTimeout(() => {
                        const input: any = document.getElementById(e.target.id)
                        input.value = "";
                        console.log(document.getElementById(e.target.id))
                    }, 0);
                }

            }}
            placeholder={label}
            key={label}
            options={labels[label]?.map((i: string) => ({ label: i, value: i }))}
            value={selectValue}
            onChange={(v: any) => {
                console.log(structuredClone(v))
                labelValues[label] = v;
                setLabelValues(labelValues)
                setSelectValue(v)
            }}
        />)
}
interface SearchButtonProps {
    labelValues: {
        [key: string]: any
    }
    setLabelValues: Function
}
const SearchButton = ({ labelValues }: SearchButtonProps) => {
    return (<Button variant="primary"
        onClick={() => {
            let query = "{"
            const labelValuesArr = Object.entries(labelValues);
            labelValuesArr.forEach((value, index) => {
                console.log(value)
                if (Array.isArray(value[1])) {
                    query += `${value[0]}=~"${value[1].map((value) => value.value).join("|")}"`
                }
                if (labelValuesArr.length > 1 && index !== labelValuesArr.length - 1) {
                    query += ", "
                }
            });
            if (labelValuesArr.length === 0) {
                locationService.partial({ "var-flowQuery": '{job="heplify-server"} |= `` | regexp \"Call-ID:\\s+(?<callid>.+?\\r\\n)\"' }, true);

            } else {
                console.log(labelValuesArr)
                query += "} |= ``"
                console.log(query)
                locationService.partial({ "var-flowQuery": query }, true);
            }
        }
        }
    >Search</Button>)

}
export const searchPanel = new PanelPlugin<CustomVizOptions, CustomVizFieldOptions>(CustomVizPanel).useFieldConfig({});

