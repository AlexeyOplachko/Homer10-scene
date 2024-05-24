import { PanelPlugin, PanelProps } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { Button, IconButton, MultiSelect } from '@grafana/ui';
import React, { useEffect, useState } from 'react';
import { useQueryStore } from 'utils/actions/query';
import { useQueryHistoryStore } from 'utils/actions/queryHistory';
import { baseQuery, getLabelExtractions } from './labels';
// import { TableModal } from './TableModal';
interface CustomVizOptions {
    activeLabels: string[]
    inactiveLabels: string[];
}
interface CustomVizFieldOptions {
    activeLabels: string[];
    inactiveLabels: string[];
}
export interface Props extends PanelProps<CustomVizOptions> { }
export const CustomVizPanel = ({ options: { activeLabels: activeLabelsProp, inactiveLabels: inactiveLabelsProp }, data, onChangeTimeRange }: Props) => {
    // const query = useSelector((state: any) => state.query)
    const { query, timeRange } = useQueryStore(state => state)
    const [labelValues, setLabelValues] = useState({})
    useEffect(() => {
        if (query !== '') {
            setLabelValues(structuredClone(query))
            if (timeRange) {
                onChangeTimeRange({ from: timeRange?.from, to: timeRange?.to })
            }
        }
    }, [query, timeRange, onChangeTimeRange])
    const [serie] = data.series || [];
    const fields = serie?.fields || [];
    const [firstField]: any = fields;
    const outData = firstField?.values || [];
    const [activeLabels, setActiveLabels] = useState<string[]>(activeLabelsProp)

    const [_, setInactiveLabels] = useState<string[]>(inactiveLabelsProp)
    useEffect(() => {
        setActiveLabels(activeLabelsProp)
        setInactiveLabels(inactiveLabelsProp)
    }, [activeLabelsProp, inactiveLabelsProp, setActiveLabels, setInactiveLabels])

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
        <div style={{ display: 'flex', height: "100%", flexDirection: "column", margin: "0 -4px 0 -4px" }}>





            {/* <TableModal  {...props} width={1000}></TableModal> */}
            <div style={{ overflow: "auto", display: 'flex', height: "100%", flexDirection: "column", padding: "4px 4px 0 4px" }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '5px' }}>
                <Button variant="primary" style={{ marginRight: '5px' }} onClick={() => {
                    locationService.partial({ "var-flowQuery": baseQuery }, true);
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
    const [clearVisibility, setClearVisibility] = useState(false)
    useEffect(() => {
        const labelValue = labelValues[label]
        console.log(labelValue)
        if (typeof labelValue === 'undefined') {
            setSelectValue([])
        } else {
            setSelectValue(labelValue)
        }
    }, [labelValues, label])
    return (
        <span style={{ position: "relative", display: "inline-block" }} onMouseEnter={() => setClearVisibility(true)} onMouseLeave={() => setClearVisibility(false)}>
            <MultiSelect
                style={{ marginBottom: "2px" }}
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
                        }, 0);
                    }

                }}
                placeholder={label}
                key={label}
                options={labels[label]?.map((i: string) => ({ label: i, value: i }))}
                value={selectValue}
                onChange={(v: any) => {
                    labelValues[label] = v;
                    setLabelValues(labelValues)
                    setSelectValue(v)
                }}
            />
            <IconButton tooltip="Clear field"
                style={{ position: "absolute", right: '22px', top: '10px', zIndex: 1, visibility: clearVisibility ? 'visible' : 'hidden' }} size='sm' name="times" onClick={() => {
                    delete labelValues[label]
                    setLabelValues(labelValues);
                    setSelectValue([])
                }}></IconButton>
        </span>)
}
interface SearchButtonProps {
    labelValues: {
        [key: string]: any
    }
    setLabelValues: Function
}
const SearchButton = ({ labelValues }: SearchButtonProps) => {
    const queryHistoryStore = useQueryHistoryStore(state => state)
    return (<Button variant="primary"
        onClick={() => {
            let query = `{job="heplify-server", `
            const labelValuesArr = Object.entries(labelValues);
            labelValuesArr.forEach((value, index) => {
                console.log(value)
                if (Array.isArray(value[1])) {
                    query += `${value[0]}=~"${value[1].map((value) => value.value).join("|")}"`
                    if (labelValuesArr.length > 1 && index !== labelValuesArr.length - 1) {
                        query += ", "
                    }
                }


            });
            if (labelValuesArr.length === 0 && Object.values(labelValues).length === 0) {
                locationService.partial({ "var-flowQuery": baseQuery }, true);

            } else {
                console.log(labelValuesArr)
                query += "} "
                console.log(query)
                locationService.partial({
                    "var-flowQuery": `${query} ${getLabelExtractions(Object.keys(labelValues))}`,
                }, true);
                delete labelValues["timeRange"]
                const queryForHistory = {
                    ...labelValues,
                    query
                }
                queryHistoryStore.addToQueryHistory(queryForHistory)
            }
        }
        }
    >Search</Button>)

}
export const searchPanel = new PanelPlugin<CustomVizOptions, CustomVizFieldOptions>(CustomVizPanel).useFieldConfig({});

