import {
    CustomVariable,
    DataSourceVariable, EmbeddedScene, SceneApp,
    SceneAppPage, SceneFlexItem,
    SceneFlexLayout, SceneQueryRunner,
    SceneTimePicker,
    SceneTimeRange,
    SceneVariableSet,
    VizPanel,
    sceneUtils
} from '@grafana/scenes';
import React, { useMemo } from 'react';
import { prefixRoute } from 'utils/utils.routing';
import { ROUTES } from '../../constants';
import { searchPanel } from './searchPanel';
import { getDataSourceSrv, locationService } from '@grafana/runtime';
import { ExportButtonPCAP, ExportButtonPNG, ExportButtonTXT } from './exportButton';
import { SettingDropdown } from 'components/SettingDropdown/SettingDropdown';
const queryRunner3 = new SceneQueryRunner({
    datasource: {
        type: 'loki',
        uid: '$Datasource',
    },
    queries: [
        {
            refId: 'A',
            expr: '$tableQuery',
            queryType: "range",
            instant: true,
        },
    ],
});
const queryRunner2 = new SceneQueryRunner({
    datasource: {
        type: 'loki',
        uid: '$Datasource',
    },
    queries: [
        {
            refId: 'A',
            expr: '$flowQuery',
            queryType: "range",
            instant: true,
            maxLines: 100
        },
    ],
});
const dsVariable = new DataSourceVariable({
    name: "Datasource",
    label: 'Datasource for Flow 1',
    regex: "flow",
    pluginId: 'loki'
});
const tableQueryVariable = new CustomVariable({
    name: "tableQuery",
})
const flowQueryVariable = new CustomVariable({
    name: "flowQuery",
})
sceneUtils.registerRuntimePanelPlugin({ pluginId: 'search-panel', plugin: searchPanel });
const getScene = () => {
    return new EmbeddedScene({


        $variables: new SceneVariableSet({
            variables: [dsVariable, tableQueryVariable, flowQueryVariable]
        }),
        $timeRange: new SceneTimeRange({ from: 'now-10m', to: 'now' }),
        controls: [new SceneTimePicker({ isOnCanvas: true })],
        body: new SceneFlexLayout({
            children: [
                new SceneFlexItem({
                    width: "200px",
                    body: new VizPanel({
                        title: 'Search',
                        pluginId: 'search-panel',
                        $data: queryRunner3
                    },)
                })
                , new SceneFlexItem({
                    body: new VizPanel({
                        title: 'Flow',
                        pluginId: 'qxip-flow-panel',
                        $data: queryRunner2,
                        headerActions: (<SettingDropdown
                            dropdownItems={[ExportButtonPNG, ExportButtonTXT, ExportButtonPCAP]} />),
                        options: {
                                aboveArrow: "hostname",
                                belowArrow: "node",
                                colorGenerator: [
                                    "callid",
                                    "type"
                                ],
                                destination: [
                                    "dst_ip",
                                    "dst_port"
                                ],
                                destinationLabel: [
                                    "dst_port"
                                ],
                                showbody: false,
                                sortoption: "time_old",
                                source: [
                                    "src_ip",
                                    "src_port"
                                ],
                                sourceLabel: [
                                    "src_port"
                                ],
                                title: [
                                    "response",
                                    "type"
                                ]
                            }
                    })
                }),
            ],
        }),
    })
};

const getHomer10AppScene = () => {
    const searchObject = locationService.getSearchObject()
    console.log(searchObject)
    if (!searchObject?.['var-Datasource']) {
        const dataSources = getDataSourceSrv().getList({ pluginId: "loki" })
        locationService.partial({ "var-Datasource": dataSources[0].uid }, true);
    }

    if (!searchObject?.['var-flowQuery']) {
        locationService.partial({ "var-flowQuery": '{job="heplify-server"} |= `` | regexp \"Call-ID:\\s+(?<callid>.+?\\r\\n)\"' }, true);
    }
    if (!searchObject?.['var-tableQuery']) {
        locationService.partial({ "var-tableQuery": '{job="heplify-server"} |= `` | regexp \"Call-ID:\\s+(?<callid>.+?\\r\\n)\"' }, true);
    }
    // 
    // const currentSource = replaceVariables(' $Datasource');
    console.log(prefixRoute(`${ROUTES.Home}`))
    return new SceneApp({
        pages: [
            new SceneAppPage({
                $timeRange: new SceneTimeRange({ from: 'now-6h', to: 'now' }),
                title: '',
                subTitle: '',
                url: prefixRoute(`${ROUTES.Home}`),
                hideFromBreadcrumbs: true,
                getScene,
            }),
        ],
    });
};

export const Homer10Home = (props: any) => {
    console.log(props)
    const scene = useMemo(() => getHomer10AppScene(), []);
    return <scene.Component model={scene} />
}
