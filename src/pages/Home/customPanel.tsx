import { PanelProps, PanelPlugin } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { SceneDataProvider } from '@grafana/scenes';
import { Button, MultiSelect } from '@grafana/ui';
import React, { useEffect, useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { TableModal } from './TableModal';
interface CustomVizOptions {
}
interface CustomVizFieldOptions {
    data: SceneDataProvider;
}
export interface Props extends PanelProps<CustomVizOptions> { }
export const CustomVizPanel = (props: Props) => {
    const [labelValues, setLabelValues] = useState({})
    // const [selectValue, setSelectValue] = React.useState<any>(value);
    // const [forRerender, setForRerender] = React.useState<any>(0);
    // if (bufferCheck !== JSON.stringify(valueLabelsName) || valueLabelsName?.length === 0) {
    //   setTimeout(() => {
    //     bufferCheck = JSON.stringify(valueLabelsName)
    //     setSelectValue(value);
    //     setForRerender(forRerender + 1);
    //   }, 200)
    // }
    const [serie] = props.data.series || [];
    const fields = serie?.fields || [];
    const [firstField]: any = fields;
    const outData = firstField?.values || [];
    const valueLabelsName = Object.keys(outData?.[0] || {});
    console.log("serie:", serie)
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
        <div>

            <SettingsModal {...props}></SettingsModal>
            <TableModal  {...props} width={1000}></TableModal>
            {valueLabelsName.map(label => {
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
            <Button variant="primary" onClick={() => {
                locationService.partial({ "var-flowQuery": '{job="heplify-server"} |= `` | regexp \"Call-ID:\\s+(?<callid>.+?\\r\\n)\"' }, true);
                locationService.partial({ "var-tableQuery": '{job="heplify-server"} |= `` | regexp \"Call-ID:\\s+(?<callid>.+?\\r\\n)\"' }, true);
                setLabelValues({})
            }}>
                Clear
            </Button>
            <SearchButton
                setLabelValues={setLabelValues}
                labelValues={labelValues} />
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
            options={labels[label].map((i: string) => ({ label: i, value: i }))}
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
export const myCustomPanel = new PanelPlugin<CustomVizOptions, CustomVizFieldOptions>(CustomVizPanel).useFieldConfig({
    useCustomConfig: (builder) => {
        builder.addNumberInput({
            path: 'numericOption',
            name: 'Numeric option',
            description: 'A numeric option',
            defaultValue: 1,
        });
    },
});

