import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";

import './index.css';
import * as serviceWorker from './serviceWorker';

import firebaseApp, { FirebaseContext } from './modules/firebase';
import BaseLayout from './BaseLayout';
import Routes from './Routes';
import GlobalStyle from './GlobalStyle';


ReactDOM.render(
  <FirebaseContext.Provider value={firebaseApp}>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <BaseLayout>
        <Routes />
        <GlobalStyle />
      </BaseLayout>
    </BrowserRouter>
  </FirebaseContext.Provider>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
