import { useState, useEffect, useRef } from "react";
import { render } from "react-dom";


function Ranking({ socket }) {
  const [userList, setUserList] = useState([]);
  const [firstTime, setFirstTime] = useState(true);


  useEffect(() => {
    if (firstTime) {
      socket.emit("lobby_data");
      setFirstTime(false)
    }

    socket.on("lobby_user_list", (data) => {
      data.list.sort((a, b) => b.points - a.points);
      setUserList(data.list);
    });
  }, [firstTime, socket])

  return (
    <div>
      <div className="endgame__ranking">
        <h1>Ranking</h1>
        <ul id="userList" className="connectedUsers__userList userList">
          {userList.map((user, index) => {
            return (
              <li className="userList__item item" key={index}>
                <div className="item__name">
                  <h3 id="list">{user.name}</h3>
                  <h2>Points {user.points}</h2>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
export default Ranking;
