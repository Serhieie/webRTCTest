import React from 'react';
import ReactDOM from 'react-dom/client';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import rootReducer from './redux-elements/reducers/rootReducer';
import App from './App';


const theStore = createStore(rootReducer)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={theStore}>
    <App />
   </Provider>
);

