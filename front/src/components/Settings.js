import { useState, useEffect } from "react";

function Settings({ socket, start }) {
    const [roundDuration, setRoundDuration] = useState(0);
    const [ownerPlay, setOwnerPlay] = useState(false);
    const [nickname, setNickname] = useState("");
    const [turns, setTurns] = useState(0);
    const [error, setError] = useState("");
    const [firstTime, setFirstTime] = useState(true);

    function handleChangeOwnerPlay() {
        setOwnerPlay(!ownerPlay);
    }

    function handleChangeNickname(e) {
        setNickname(e.target.value);
    }

    function handleChangeRoundDuration(e) {
        setRoundDuration(e.target.value);
    }

    function handleChangeTurns(e) {
        setTurns(e.target.value);
    }

    useEffect(() => {
        if (firstTime) {
            socket.emit("get_username")
            setFirstTime(false);
        }

        if (firstTime) {
            socket.emit("get_username")
            setFirstTime(false);
        }

        socket.on("lobby_settings", (data) => {
            setRoundDuration(data.roundDuration)
            setTurns(data.amountOfTurns)
        })

        socket.on("username_saved", (data) => {
            setNickname(data.name);
        })

        socket.on("username_saved", (data) => {
            setNickname(data.name);
        })

        socket.on("ROUND_TIME_UNDER_MIN", (data) => {
            setError(`Selected round duration was too low -> Minimum: ${data.min}`)
        })

        socket.on("ROUND_TIME_ABOVE_MAX", (data) => {
            setError(`Selected round duration was too high -> Maximum: ${data.max}`)
        })

        socket.on("TURNS_AMT_UNDER_MIN", (data) => {
            setError(`Selected amount of turns was too low -> Minimum: ${data.min}`)
        })

        socket.on("TURNS_AMT_ABOVE_MAX", (data) => {
            setError(`Selected amount of turns was too high -> Maximum: ${data.max}`)
        })

        socket.on("INVALID_SETTINGS", () => {
            setError(`Can't start the game with invalid settings`)
        })

        socket.on("USER_ALR_CHOSEN_ERROR", () => {
            setError("The chosen username is already on use")
        })

        socket.on("NO_USR_DEFINED", () => {
            setError("You need to choose a nickname in order to play!")
        })
    }, [])

    useEffect(() => {
        if (start) {
            setError("")
            socket.emit("save_settings", {
                roundDuration: roundDuration,
                amountOfTurns: turns,
                ownerPlay: ownerPlay,
                nickname: nickname
            });
        }
    }, [start])

    return (
        <div>
            {error != "" && (<h1 className="error">{error}</h1>)}
            <form>
                <label>{"Round duration (seconds)"} <input type="number" value={roundDuration} onChange={handleChangeRoundDuration} /></label><br />
                <label>{"Amount of turns per player:"} <input type="number" value={turns} onChange={handleChangeTurns} /></label><br />
                <label>{"Will the lobby creator play?"} <input type="checkbox" value={ownerPlay} onChange={handleChangeOwnerPlay} /></label><br />
                {ownerPlay ?
                    <>
                        <label>{"Enter your nickname:"}
                            <input type="text" value={nickname} onChange={handleChangeNickname} />
                        </label><br />
                    </> :
                    <>
                    </>}
            </form>
        </div>
    );

}

export default Settings;