const express = require('express');
const cors = require("cors");
const sessions = require("express-session");
var cookieParser = require("cookie-parser");
const app = express();
const http = require('http');
const server = http.createServer(app);
const PORT = 7878;
const host = '0.0.0.0';
const axios = require("axios");

const socketIO = require("socket.io")(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// ================= SAVE TOKEN AS COOKIE ================
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
  next();
});
app.use(
  sessions({
    key: "session.sid",
    secret: "soy secreto",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 600000,
    },
  })
);

app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      console.log(origin);
      return callback(null, true);
    },
  })
);

let i = 0;
const laravelRoute = "http://127.0.0.1:8000/index.php/";
let lobbies = [];
const measurements = {
  width: "700",
  height: "700"
}

// ------------------------------------------------------------------

socketIO.on('connection', socket => {

  i++
  socket.data.id = i;
  console.log(socket.data.id + " connected ");

  const random_hex_color_code = () => {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return n.slice(0, 6);
  };

  socket.on("new_lobby", () => {
    let existeix = false;
    let newLobbyIdentifier;

    do {
      newLobbyIdentifier = random_hex_color_code();

      lobbies.forEach((element) => {
        if (element.lobbyIdentifier == newLobbyIdentifier) {
          existeix = true;
        }
      });
    } while (existeix);

    if (!existeix) {
      let lobbyData = {
        lobbyIdentifier: newLobbyIdentifier,
        ownerId: socket.data.id,
        members: [],
        currentDrawer: "",
        words: [],
        rounds: 0,
        actualRound: 0,
        ended: false,
        boardData: undefined,
        settings: {
          contadorMax: 60,
          ownerPlay: false
        }
      }
      lobbies.push(lobbyData);
      socketIO.to(socket.id).emit("lobby_info", lobbyData)
      socket.join(newLobbyIdentifier);
      socket.data.current_lobby = newLobbyIdentifier;
    }

  });

  socket.on("lobby_data", () => {
    sendUserList(socket.data.current_lobby)
  })

  socket.on("join_room", (data) => {
    socket.data.username = data.username;
    joinLobby(socket, data.lobbyIdentifier, socket.data.username)
  });

  socket.on("leave_lobby", (data) => {
    leaveLobby(socket);
    sendUserList(data.lobbyIdentifier);
  });

  socket.on("start_game", (data) => {
    let amountOfRounds;

    lobbies.forEach(lobby => {
      if (lobby.lobbyIdentifier == data.lobbyIdentifier) {
        lobby.rounds = lobby.members.length;
        amountOfRounds = lobby.rounds;
        socketIO.to(data.lobbyIdentifier).emit('game_started');
        setLobbyWord(socket.data.current_lobby, amountOfRounds);
        enviarPintor(data.lobbyIdentifier)
        sendUserList(data.lobbyIdentifier);
        setCounter(data.lobbyIdentifier);
      }
    });
  });

  socket.on("get_game_data", () => {
    enviarPintor(socket.data.current_lobby)
    let data;
    let word;
    lobbies.forEach(lobby => {
      if (lobby.lobbyIdentifier == socket.data.current_lobby) {
        data = lobby
        word = lobby.words[lobby.actualRound];
      }
    });
    socketIO.to(socket.id).emit('game_data', data);
    socketIO.to(socket.id).emit('current_word', {
      word: word
    });
  });

  socket.on('save_coord', (arrayDatos) => {
    lobbies.forEach(lobby => {
      if (lobby.lobbyIdentifier == socket.data.current_lobby) {
        lobby.boardData = arrayDatos;
      }
    });
    // boardData = arrayDatos;

    sendBoardData(socket.data.current_lobby);
  });

  socket.on('give_me_the_board', () => {
    let boardData;
    lobbies.forEach(lobby => {
      if (lobby.lobbyIdentifier == socket.data.current_lobby) {
        boardData = lobby.boardData;
      }
    });

    if (boardData != undefined) {
      sendBoardData(socket.data.current_lobby);
    }
  });

  socket.on('try_word_attempt', (data) => {
    let wordToCheck;
    lobbies.forEach(lobby => {
      if (lobby.lobbyIdentifier == socket.data.current_lobby) {
        if (!lobby.ended) {
          wordToCheck = lobby.words[lobby.actualRound].name

          if (data.word.toLowerCase() === wordToCheck.toLowerCase()) {
            socketIO.to(socket.id).emit('answer_result', {
              resultsMatch: true,
            })

            lobby.members.forEach(member => {
              if (member.idUser == socket.data.id) {
                member.lastAnswerCorrect = true;
                member.lastAnswer = data.word;
              }
            });
            sendUserList(socket.data.current_lobby)
          } else {
            socketIO.to(socket.id).emit('answer_result', {
              resultsMatch: false,
            })

            lobby.members.forEach(member => {
              if (member.idUser == socket.data.id) {
                member.lastAnswerCorrect = false;
                member.lastAnswer = data.word;
              }
            });
            sendUserList(socket.data.current_lobby)
          }
        }
      }
    });
  });

  socket.on('disconnect', () => {
    console.log(socket.data.id + " disconnected");
    leaveLobby(socket);
  })
});

function setCounter(lobbyId) {
  let timer;
  lobbies.forEach(lobby => {
    if (lobby.lobbyIdentifier == lobbyId && !lobby.ended) {
      let cont = lobby.settings.contadorMax
      timer = setInterval(() => {
        cont--;
        socketIO.to(lobbyId).emit("counter_down", {
          counter: cont
        })

        if (cont == 45) {
          if (lobby.actualRound < lobby.rounds) {
            lobby.actualRound++;
          }

          if (lobby.actualRound == lobby.rounds) {
            lobby.ended = true;
          } else {
            socketIO.to(lobbyId).emit("round_ended", { roundIndex: lobby.actualRound });
          }

          enviarPintor(lobbyId);
          acabarRonda(lobbyId);
          clearInterval(timer)
        }
      }, 1000)
    }
  });
}

function acabarRonda(lobbyId) {
  lobbies.forEach(lobby => {
    if (lobby.lobbyIdentifier == lobbyId) {
      if (!lobby.ended) {
        lobby.members.forEach(member => {
          member.lastAnswerCorrect = false;
          member.lastAnswer = "";
        });

        lobby.boardData = {
          arrayDatos: [],
          limpiar: true,
          cambioDeRonda: true
        };
        sendBoardData(lobbyId);
        sendUserList(lobbyId);
        setCounter(lobbyId);
      } else {
        socketIO.to(lobbyId).emit("game_ended")
      }
    }
  });

}

function joinLobby(socket, lobbyIdentifier, username) {
  var disponible = false;
  lobbies.forEach((lobby) => {
    if (lobby.lobbyIdentifier == lobbyIdentifier) {
      disponible = true;

      lobby.members.forEach(member => {
        if (member.username == username || lobby.ownerId == socket.data.id) {
          disponible = false;
        }
      });

      if (disponible) {
        lobby.members.push({
          idUser: socket.data.id,
          username: username,
          lastAnswerCorrect: false,
          lastAnswer: ""
        });

        socketIO.to(socket.id).emit("lobby_info", lobby)
      } else {
        socketIO.to(socket.id).emit("USER_ALR_CHOSEN_ERROR")
      }
    }
  });

  if (disponible) {
    socket.join(lobbyIdentifier);
    socket.data.current_lobby = lobbyIdentifier;

    sendUserList(lobbyIdentifier);
  }

}

function leaveLobby(socket) {
  lobbies.forEach((lobby, ind_lobby) => {
    if (lobby.lobbyIdentifier == socket.data.current_lobby) {
      lobby.members.forEach((member, index) => {
        if (member.idUser == socket.data.id) {
          lobby.members.splice(index, 1);
        }
      });
      if (lobby.members.length == 0) {
        lobbies.splice(ind_lobby, 1);
      } else if (lobby.ownerId == socket.data.id) {
        lobbies.splice(ind_lobby, 1);
        socketIO.to(lobby.lobbyIdentifier).emit("lobby_deleted", {
          message: "Lobby has been deleted by the owner"
        })
      }
    }
  });

  socket.leave(socket.data.current_lobby);
  socket.data.current_lobby = null
  socketIO.to(socket.id).emit("YOU_LEFT_LOBBY")
}

async function setLobbyWord(room, amount) {
  let words;
  let category = "null";
  let difficulty = "null";
  await axios

    .post(laravelRoute + "getWords", {
      category: category,
      difficulty: difficulty,
      amount: amount
    })
    .then(function (response) {
      words = response.data.wordsToCheck
      console.log(words);
    })
    .catch(function (error) {
      console.log(error);
    });
  lobbies.forEach((lobby) => {
    if (lobby.lobbyIdentifier == room) {
      lobby.words = words;
      socketIO.to(room).emit('started');
      socketIO.to(room).emit('game_data', lobby);
    }
  });
}

function sendUserList(room) {
  var list = [];

  lobbies.forEach(lobby => {
    if (lobby.lobbyIdentifier == room) {
      lobby.members.forEach(member => {
        if (member.idUser != lobby.ownerId) {
          list.push({
            name: member.username,
            lastAnswerCorrect: member.lastAnswerCorrect,
            lastAnswer: member.lastAnswer,
            painting: member.painting
          });
        }
      });
    }
  });

  console.log("");
  socketIO.to(room).emit("lobby_user_list", {
    list: list,
    message: "user list",
  });
}

async function sendBoardData(room) {
  const sockets = await socketIO.in(room).fetchSockets();

  let boardData;

  lobbies.forEach(lobby => {
    if (lobby.lobbyIdentifier == room) {
      if (lobby.actualRound < lobby.rounds) {
        boardData = lobby.boardData;

        sockets.forEach(user => {
          if (user.data.id != lobby.members[lobby.actualRound].idUser) {
            socketIO.to(user.id).emit("new_board_data", {
              board: boardData
            })
          }
        });
      }
    }
  });


}

async function enviarPintor(room) {
  const sockets = await socketIO.in(room).fetchSockets();

  lobbies.forEach((lobby) => {
    if (lobby.lobbyIdentifier == room) {
      if (lobby.actualRound < lobby.rounds && !lobby.ended) {

        sockets.forEach(user => {
          if (user.data.id == lobby.members[lobby.actualRound].idUser) {
            lobby.currentDrawer = lobby.members[lobby.actualRound].username
            socketIO.to(user.id).emit("pintor", {
              pintor: true
            })
            socketIO.to(lobby.lobbyIdentifier).emit("drawer_name", {
              name: lobby.currentDrawer
            })

            lobby.members.forEach(member => {
              if (member.idUser == user.data.id) {
                member.painting = true;
              }
            });
          } else {
            if (user.data.id != lobby.ownerId) {
              socketIO.to(user.id).emit("pintor", {
                pintor: false
              })

              lobby.members.forEach(member => {
                if (member.idUser == user.data.id) {
                  member.painting = false;
                }
              });
            } else {
              socketIO.to(user.id).emit("spectator", {
                spectator: true
              })

              lobby.members.forEach(member => {
                if (member.idUser == user.data.id) {
                  member.painting = false;
                }
              });
            }

          }
        });
        socketIO.to(room).emit("round_change");
      } else {
        lobby.ended = true;
      }
    }
  });

}

server.listen(PORT, host, () => {
  console.log("Listening on *:" + PORT);
});
