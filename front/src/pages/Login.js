import { useState, useEffect } from "react";
import routes from "../index";
import Cookies from "universal-cookie";
import { Link, useNavigate } from "react-router-dom"; //Rutas

function Login({ socket }) {
    const [login, setLogin] = useState(0);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorText, setErrorText] = useState("");
    const cookies = new Cookies();
    const navigate = useNavigate();

    useEffect(() => {
        if (login != 0) {
            const user = new FormData();
            user.append("email", email);
            user.append("password", password);

            fetch(routes.fetchLaravel + "login", {
                method: "POST",
                mode: "cors",
                body: user,
                credentials: "include",
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.valid) {
                        //Si se ha logueado
                        cookies.set("token", data.token, { path: "/" });
                        socket.emit("send token", {
                            token: cookies.get("token"),
                        });
                        navigate("/lobbies");
                    } else {
                        setErrorText(data.message)
                    }
                });
        }
    }, [login]);

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            setLogin(login + 1);
        }
    };
    return (
        <div className="form">
            <h1>LOGIN</h1>
            <br />
            <div className="form__form">
                <p>{errorText}</p>

                <div className="form__inputGroup">
                    <input
                        id="email"
                        className="form__input"
                        placeholder=" "
                        type="text"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    ></input>
                    <span className="form__inputBar"></span>
                    <label className="form__inputlabel">E-mail</label>
                </div>
                <div className="form__inputGroup">
                    <input
                        id="password"
                        className="form__input"
                        placeholder=" "
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        required
                    ></input>
                </div>
            </div>
            <div className="form__buttonsLinks">
                <div className="form__buttons">
                    <Link to="/">
                        <div className="form__goBack">
                            <div className="form__button--flex">
                                <button id="goBack__button">
                                    <span className="circle" aria-hidden="true">
                                        <span className="icon arrow"></span>
                                    </span>
                                    <span className="button-text">GO BACK</span>
                                </button>
                            </div>
                        </div>
                    </Link>

                    <div className="form__submit submit">
                        <button onClick={() => setLogin(login + 1)} id="submit__button">
                            <span className="circle2" aria-hidden="true">
                                <span className="icon2 arrow2"></span>
                            </span>
                            <span className="button-text">SUBMIT</span>
                        </button>
                    </div>
                </div>
                <div className="form__links link">
                    <Link className="link__ForgotPass" to="/forgotPassword">
                        <p>Forgot your password?</p>
                    </Link>
                    <Link className="link__CreateAcc" to="/register">
                        <p>Create account</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;