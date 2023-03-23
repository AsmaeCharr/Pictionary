import React, { useState } from 'react';
import "../styles/Game.css";

<<<<<<< HEAD

function WordForm(props) {
=======
function WordForm({ socket, answerCorrect }) {
>>>>>>> develop
  const [word, setWord] = useState('');

  function handleFormSubmit(e) {
    e.preventDefault();
    if (word.trim() !== "") {
      socket.emit("try_word_attempt", {
        word: word,
      });
    }
  }

  function handleChange(e) {
    setWord(e.target.value);
  }

  if (answerCorrect) {
    return (
      <></>
    )
  } else {
    return (
      <div>
        <form className="WordForm" onSubmit={handleFormSubmit}>
          <input type="text" value={word} onChange={handleChange} placeholder="Enter a word" />
          <button type="submit">Check</button>
        </form>
      </div>
    );
  }

}

export default WordForm;
