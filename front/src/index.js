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

import socketIO from "socket.io-client";

const routes = {
  // fetchLaravel: "http://localhost:8000",
  // fetchNode: "http://localhost:7500",
  wsNode: "ws://localhost:7500",
};

var socket = socketIO(routes.wsNode, {
  withCredentials: true,
  cors: {
    origin: "*",
    credentials: true,
  },
  transports: ["websocket"],
});

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
    
    <App socket={socket} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
