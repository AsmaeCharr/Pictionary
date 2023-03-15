import logo from "../logo.svg";
import "../App.css";
import { useState, useEffect } from "react";
import Board from "../components/Board";
import WordForm from '../components/WordForm';
import React from 'react';
import ConnectedUsersInGame from "../components/ConnectedUsersInGame";
import WordGuess from "../components/WordGuess";
import Description from "../components/Description";

function Game({ socket }) {
  const [result, setResult] = useState(null);
  const [pintor, setPintor] = useState(false);
  const [spectator, setSpectator] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [userMessages, setUserMessages] = useState([]);

  const messageResponses = {
    wordAttemptError: "You failed the attempt!",
    wordAttemptSuccess: "Well done! You're the best!"
  }

  useEffect(() => {
    if (firstTime) {
      socket.emit('get_game_data')
    }

    socket.on('send_guessed_word', (data) => {
      const userId = data.id;
      const userMessage = data.wordGuessed;

      setUserMessages(prevUserMessages => [...prevUserMessages, { userId, userMessage }]);
    });

    socket.on('answer_result', (data) => {
      if (data.resultsMatch) {
        setResult(messageResponses.wordAttemptSuccess)
      } else {
        setResult(messageResponses.wordAttemptError)
      }
    });

    socket.on('pintor', (data) => {
      setPintor(data.pintor);
    });

    socket.on('spectator', (data) => {
      setSpectator(data.spectator);
    });

    return () => {
      socket.off('send_guessed_word');
      socket.off('answer_result');
      socket.off('pintor');
    };
  }, []);


  return (
    <>
      <ConnectedUsersInGame socket={socket}></ConnectedUsersInGame>
      {spectator ?
        <>
          <Board socket={socket} pintor={pintor}></Board>
        </> :
        <>
          {pintor ? <div style={{ display: "flex" }}>
            <div style={{ marginRight: "20px" }}>
              <WordGuess socket={socket}></WordGuess>
              <Description socket={socket}></Description>
              {result && <p>{result}</p>}
              <Board socket={socket} pintor={pintor}></Board>
            </div>
            {userMessages.length > 0 && (
              <div>
                <ul style={{ listStyle: "none" }}>
                  {userMessages.map((message, index) => (
                    <li key={index}>User {message.userId}: {message.userMessage}</li>
                  ))}
                </ul>
              </div>
            )}
          </div> : <>
            {result && <p>{result}</p>}
            <WordForm socket={socket} /><br></br>
            <Board socket={socket} pintor={pintor}></Board>
          </>}
        </>}
    </>
  )

}

export default Game;
