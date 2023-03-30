import "./App.css";
import { useState, useEffect } from "react";
import Board from "./components/Board";
import WordForm from './components/WordForm';
import React from 'react';

function App({ socket }) {
  const [result, setResult] = useState(null);
  const [wordToCheck, setWordToCheck] = useState("");
  const [pintor, setPintor] = useState(false);
  const [userMessages, setUserMessages] = useState([]);

  const messageResponses = {
    wordAttemptError: "Wrong word! Try again <i className='icon-smile-o'></i>",
    wordAttemptSuccess: "Well done! You're the best!"
  }

  function handleFormSubmit(word) {
    if (word.trim() !== "") {
      socket.emit("try_word_attempt", {
        word: word,
      });
    }
  }

  useEffect(() => {
      socket.emit('get_game_data')

    socket.on('word_to_check', (data) => {
      setWordToCheck(data.word);
    });

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

    socket.on('game_data', (data) => {
      setWordToCheck(data.words[0]);
    });

    return () => {
      socket.off('word_to_check');
      socket.off('send_guessed_word');
      socket.off('answer_result');
      socket.off('pintor');
    };
  }, []);

  if (pintor) {
    return (
      <div>
        <div style={{ display: "flex" }}>
          <div style={{ marginRight: "20px" }}>
            {wordToCheck && <p>{wordToCheck}</p>}
            {result && <p>{result}</p>}
            <Board socket={socket}></Board>
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
        </div>
      </div>
    )
  }
  else {
    return (
      <div>
        {result && <p>{result}</p>}
        <WordForm onSubmit={handleFormSubmit} socket={socket} /><br></br>
        <Board socket={socket} pintor={pintor}></Board>
      </div>
    )
  }
}

export default App;
