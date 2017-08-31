import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { gameApp } from './reducers';
import {defaultGameState} from "./helpers";
import {createStore, applyMiddleware } from "redux";
import { Provider } from 'react-redux';

// check if we'd initial state stored
let initialState = defaultGameState();
if (window.localStorage) {
  let state = window.localStorage.getItem('state');
  if (state) {
    try {
      Object.assign(initialState, JSON.parse(state));
      window.localStorage.clear();
    } catch (e) {
      console.error('Invalid `state` string');
    }
  }
}

const updateLocalStorage = store => next => action => {
  const result = next(action);
  if (window.localStorage) {
    window.localStorage.setItem('state', JSON.stringify(store.getState()));
  }
  return result;
};

const updateHistory = store => next => action => {
  const result = next(action);

  return result;
};

let store = createStore(gameApp, initialState, applyMiddleware(updateLocalStorage));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'));
registerServiceWorker();
