import React from 'react';
import { Switch, Route } from 'react-router';
import Loadable from 'react-loadable';
import App from './containers/App';

const style = {
  width: '100%',
  display: 'flex',
  position: 'absolute',
  top: '50%'
};

const LoadableHelper = (component, opts = {}) =>
  Loadable({
    loader: () => component.then(e => e.default).catch(console.log),
    loading: () => <div style={style}></div>,
    delay: 2000,
    ...opts
  });

const HomePage = LoadableHelper(import('./containers/HomePage'));

export default () => (
  <App>
    <Switch>
      <Route exact strict component={HomePage} />
    </Switch>
  </App>
);
