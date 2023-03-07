import React, { useState } from 'react';

function WordForm(props) {
  const [word, setWord] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    props.onSubmit(word);
  }

  function handleChange(event) {
    setWord(event.target.value);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={word} onChange={handleChange} placeholder="Enter a word" />
        <button type="submit">Check</button>
      </form>
    </div>
  );
}

export default WordForm;
