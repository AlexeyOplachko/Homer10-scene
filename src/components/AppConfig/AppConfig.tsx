import { css } from '@emotion/css';
import { AppPluginMeta, GrafanaTheme2, PluginConfigPageProps, PluginMeta } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, FieldSet, useStyles2 } from '@grafana/ui';
import React from 'react';
import { lastValueFrom } from 'rxjs';
import { testIds } from '../testIds';

export type JsonData = {
    apiUrl?: string;
    isApiKeySet?: boolean;
};


interface Props extends PluginConfigPageProps<AppPluginMeta<JsonData>> { }

export const AppConfig = ({ plugin }: Props) => {
    const s = useStyles2(getStyles);
    const { enabled, jsonData } = plugin.meta;



    return (
        <div data-testid={testIds.appConfig.container}>
            {/* ENABLE / DISABLE PLUGIN */}
            <FieldSet label="Enable / Disable">
                {!enabled && (
                    <>
                        <div className={s.colorWeak}>The plugin is currently not enabled.</div>
                        <Button
                            className={s.marginTop}
                            variant="primary"
                            onClick={() =>
                                updatePluginAndReload(plugin.meta.id, {
                                    enabled: true,
                                    pinned: true,
                                    jsonData,
                                })
                            }
                        >
                            Enable plugin
                        </Button>
                    </>
                )}

                {/* Disable the plugin */}
                {enabled && (
                    <>
                        <div className={s.colorWeak}>The plugin is currently enabled.</div>
                        <Button
                            className={s.marginTop}
                            variant="destructive"
                            onClick={() =>
                                updatePluginAndReload(plugin.meta.id, {
                                    enabled: false,
                                    pinned: false,
                                    jsonData,
                                })
                            }
                        >
                            Disable plugin
                        </Button>
                    </>
                )}
            </FieldSet>
        </div>
    );
};

const getStyles = (theme: GrafanaTheme2) => ({
    colorWeak: css`
    color: ${theme.colors.text.secondary};
  `,
    marginTop: css`
    margin-top: ${theme.spacing(3)};
  `,
    marginTopXl: css`
    margin-top: ${theme.spacing(6)};
  `,
});

const updatePluginAndReload = async (pluginId: string, data: Partial<PluginMeta<JsonData>>) => {
    try {
        await updatePlugin(pluginId, data);

        // Reloading the page as the changes made here wouldn't be propagated to the actual plugin otherwise.
        // This is not ideal, however unfortunately currently there is no supported way for updating the plugin state.
        locationService.reload();
    } catch (e) {
        console.error('Error while updating the plugin', e);
    }
};

export const updatePlugin = async (pluginId: string, data: Partial<PluginMeta>) => {
    const response = getBackendSrv().fetch({
        url: `/api/plugins/${pluginId}/settings`,
        method: 'POST',
        data,
    });

    const dataResponse = await lastValueFrom(response);

    return dataResponse.data;
};
