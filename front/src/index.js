import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import LandingPage from './pages/LandingPage';
import Game from './pages/Game';
import Lobby from './pages/Lobby';
import EndGame from './pages/EndGame';

import {BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage/>} />
            <Route path="/game" element={<Game/>} />
            <Route path="/lobby" element={<Lobby/>} />
            <Route path="/endGame" element={<EndGame/>} />
          </Routes>
      </HashRouter>
    
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
