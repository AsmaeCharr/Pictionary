import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/Game';
import reportWebVitals from './reportWebVitals';
import LandingPage from './pages/LandingPage';
import Game from './pages/Game';
import Lobby from './pages/Lobby';
import LobbyCreation from './pages/LobbyCreation';
import LobbyJoin from './pages/LobbyJoin';
import EndGame from './pages/EndGame';
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import socketIO from "socket.io-client";

const routes = {
  fetchLaravel: "http://g1.pictionary.alumnes.inspedralbes.cat/index.php/",
  // fetchNode: "http://localhost:7500",
  wsNode: "wss://g1.pictionary.alumnes.inspedralbes.cat/",
};


var socket = socketIO(routes.wsNode, {
  withCredentials: true,
  cors: {
    origin: "*",
    credentials: true,
  },
  path: "/node/",
  transports: ["websocket"],
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/game" element={<Game socket={socket} />} />
        <Route path="/lobby" element={<Lobby socket={socket} />} />
        <Route path="/createlobby" element={<LobbyCreation socket={socket} />} />
        <Route path="/joinlobby" element={<LobbyJoin socket={socket} />} />
        <Route path="/endGame" element={<EndGame />} />
      </Routes>
    </HashRouter>

  // {/* </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


export default routes;
