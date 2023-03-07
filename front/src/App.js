import logo from "./logo.svg";
import "./App.css";
import { useState, useEffect } from "react";
import Board from "./components/Board";
import WordForm from './components/WordForm';
import React from 'react';
import routes from "./index.js";

function App({ socket }) {
  const [result, setResult] = useState(null);
  const [wordToCheck, setWordToCheck] = useState();

  function handleFormSubmit(word) {
    fetch(routes.fetchLaravel + 'checkWord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word: word,
        wordToCheck: wordToCheck
      })
    })
      .then(response => response.json())
      .then(data => setResult(data.result))
      .catch(error => console.error(error));
  }
  useEffect(() => {
    socket.on('word_to_check', (data) => {
      setWordToCheck(data.word);
    });
  }, [])

  return (
    <div>
      {wordToCheck && <p>{wordToCheck}</p>}
      {result && <p>{result}</p>}
      <WordForm onSubmit={handleFormSubmit} /><br></br>
      <Board socket={socket}></Board>
    </div>
  );
}

export default App;
