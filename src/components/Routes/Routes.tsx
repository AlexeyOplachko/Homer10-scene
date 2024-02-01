import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';
import { Homer10Home } from 'pages/Home';

export const Routes = () => {
    return (
        <Switch>
            <Route path={prefixRoute(`${ROUTES.Home}`)} component={Homer10Home} />
            <Redirect to={prefixRoute(ROUTES.Home)} />
        </Switch>
    );
};
