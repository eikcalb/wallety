import "react-app-polyfill/ie9";
import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import '@yaireo/tagify/dist/tagify.css'
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ToastProvider } from 'react-toast-notifications';
import { BrowserRouter } from 'react-router-dom';
import { APPLICATION_CONTEXT, DEFAULT_APPLICATION } from "./lib";

ReactDOM.render(
  <React.StrictMode>
    <ToastProvider autoDismiss={5000} placement='top-center'>
      <BrowserRouter basename='/'>
        <APPLICATION_CONTEXT.Provider value={DEFAULT_APPLICATION}>
          <App />
        </APPLICATION_CONTEXT.Provider>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
