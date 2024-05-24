import { getDataSourceSrv, locationService } from '@grafana/runtime';
import {
    CustomVariable,
    DataSourceVariable, EmbeddedScene, SceneApp,
    SceneAppPage, SceneFlexItem,
    SceneFlexLayout,
    SceneQueryRunner,
    SceneRefreshPicker,
    SceneTimePicker,
    SceneTimeRange,
    SceneVariableSet,
    VizPanel,
    sceneUtils
} from '@grafana/scenes';
import { SettingDropdown } from 'components/SettingDropdown/SettingDropdown';
import React, { useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { prefixRoute } from 'utils/utils.routing';
import { ROUTES } from '../../constants';
import { DebugModalDropdownItem } from './QueryDebugModal/DebugModal';
import { QueryHistoryModalDropdownItem } from './QueryHistoryModal/QueryHistoryModal';
import { SettingsModal } from './SettingsModal/SettingsModal';
import { ExportButtonPCAP, ExportButtonPNG, ExportButtonTXT } from './exportButton';
import { baseQuery, searchPanelQuery } from './labels';
import { searchPanel } from './searchPanel';
const queryRunner3 = new SceneQueryRunner({
    datasource: {
        type: 'loki',
        uid: '$Datasource',
    },
    queries: [
        {
            refId: 'A',
            expr: searchPanelQuery,
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
const flowQueryVariable = new CustomVariable({
    name: "flowQuery",
})
sceneUtils.registerRuntimePanelPlugin({ pluginId: 'search-panel', plugin: searchPanel });
const getScene = (props: any) => {
    const searchPanel = new VizPanel({
        headerActions: (
            <DndProvider backend={HTML5Backend}>
                <SettingsModal
                    setState={(value: any) => {
                        console.log(value)
                        searchPanel.setState({ options: value })
                    }}
                    getParent={() => { return searchPanel }}
                />
            </DndProvider>


        ),
        title: 'Search',
        pluginId: 'search-panel',
        $data: queryRunner3,
        options: {
            activeLabels: [],
            inactiveLabels: [],
        }
    },)
    const flowPluginPanel = new VizPanel({
        title: 'Flow',
        pluginId: 'qxip-flow-panel',
        $data: queryRunner2,
        $timeRange: new SceneTimeRange({ from: 'now-10m', to: 'now' }),
        headerActions: (<SettingDropdown

            getParent={() => { return flowPluginPanel }}
            getSearchPanel={() => { return searchPanel }}
            dropdownItems={[ExportButtonPNG, ExportButtonTXT, ExportButtonPCAP, DebugModalDropdownItem, QueryHistoryModalDropdownItem]} />),
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
    return new EmbeddedScene({


        $variables: new SceneVariableSet({
            variables: [dsVariable, flowQueryVariable]
        }),
        body: new SceneFlexLayout({
            children: [
                new SceneFlexItem({
                    width: "200px",
                    body: searchPanel
                }),
                new SceneFlexItem({
                    body: flowPluginPanel
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
        locationService.partial({ "var-flowQuery": baseQuery }, true);
    }
    return new SceneApp({
        pages: [
            new SceneAppPage({
                $timeRange: new SceneTimeRange({ from: 'now-6h', to: 'now' }), controls: [new SceneTimePicker({ isOnCanvas: true }), new SceneRefreshPicker({ isOnCanvas: true })],

                title: '',
                subTitle: '',
                url: prefixRoute(`${ROUTES.Home}`),
                hideFromBreadcrumbs: true,
                getScene,
            }),
        ],
    });
};

export const Homer10Home = () => {
    const scene = useMemo(() => getHomer10AppScene(), []);
    return <scene.Component model={scene} />
}
