import { useState, useEffect, useRef } from "react";
import React from "react";
import "../Board.css"
import CanvasDraw from "react-canvas-draw";
import heart from "../img/Heart_corazón.svg.png"
import { CirclePicker } from "react-color";
import CountdownTimer from "./CountdownTimer";

//REFERENCIA: https://github.com/embiem/react-canvas-draw

function Board({ socket, pintor }) {
  const firstCanvas = useRef(null); //Serveix per agafar un component com a referencia
  const secondCanvas = useRef(null);
  //Color picker
  const [currentColor, setCurrentColor] = useState("#000");
  //Tamaño de brocha
  const [brushRadius, setBrushRadius] = useState(1);


  const handleChangeComplete = (color) => {
    setCurrentColor(color.hex);
  };

  const clear = () => {
    // poner control de si es pintor o no
    firstCanvas.current.clear();
    sendBoardDataToSocketIo();
  };

  const sendBoardDataToSocketIo = () => {
    const data = firstCanvas.current.getSaveData(); //Dona totes les coordenades utilitzades en el CanvasDraw
    socket.emit("save_coord", data);
  };

  useEffect(() => {
    socket.emit("give_me_the_board");

    socket.on("new_board_data", (data) => {
      if (secondCanvas.current != null) {
        secondCanvas.current.loadSaveData(data.board);
      }
    });

    socket.on("round_change", () => {
      if (secondCanvas.current != null)
        secondCanvas.current.clear();
    })
  }, []);

  useEffect(() => {
    if (!pintor) {
      secondCanvas.current.clear();
    }
  }, [pintor])

  const keydown = (e) => {
    if (e.ctrlKey && e.key === "z" && pintor) {
      firstCanvas.current.undo();
      sendBoardDataToSocketIo();
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    }
  });

  return (
    <div className="Board">
      {pintor ?
        <>
          <CountdownTimer socket={socket} />
          <button onClick={clear}>Clear</button>
          <CirclePicker
            style={{ border: "4px solid #000" }}
            color={currentColor}
            onChangeComplete={(color) => setCurrentColor(color.hex)}
          ></CirclePicker>
          <input id="brushRadius" type={"range"} min="1" max="50" step={0} value={brushRadius} onChange={(e) => setBrushRadius(e.target.value)} ></input>
          <CanvasDraw
            className="Board__draw"
            canvasWidth={700}
            canvasHeight={700}
            brushRadius={brushRadius}
            brushColor={currentColor}
            hideGrid={true}
            hideInterface={true}
            loadTimeOffset={0}
            lazyRadius={1}
            style={{ border: "4px solid #000" }}
            ref={firstCanvas}
            onChange={sendBoardDataToSocketIo}
          // onMouseDown={sendBoardDataToSocketIo}
          />
        </>
        :
        <>
          <div className="Board">
            <CountdownTimer socket={socket} />
            <CanvasDraw
              canvasWidth={700}
              canvasHeight={700}
              hideGrid={true}
              disabled={true}
              immediateLoading={true}
              ref={secondCanvas}
              style={{ border: "4px solid #000" }}
            />
          </div>
        </>
      }

    </div>
  );
}

export default Board;
