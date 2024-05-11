import React from "react";
import { useNavigate, Link } from 'react-router-dom';
import "./Css/login.css"

export default function Login() {
    const [loginData, setLoginData] = React.useState({
        username: "",
        password: ""
    });
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = React.useState("")

    // React.useEffect(() => {
    //     fetch("http://127.0.0.1:5000/")
    //         .then(res => res.json())
    //         .then(data => console.log(data))
    // }, [])

    function handleSubmit(event) {
        event.preventDefault();
        // console.log(loginData);
        if(loginData.username === ""){
            setErrorMsg("Email is not valid")
            return 
        }
        else if(loginData.password === ""){
            setErrorMsg("Password is not valid")
            return
        }


        fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            body: JSON.stringify(loginData),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Invalid credentials');
                }
            })
            .then(data => {
                // console.log(data.userId);
                // console.log(data.access_token);

                localStorage.setItem('userId', data.userId);
                if(data.access_token !== "" ){
                    localStorage.setItem('access_token', data.access_token);
                }
                navigate('/notes');

            })


    }

    function handleChange(event) {
        setErrorMsg("")
        const { name, value } = event.target;
        setLoginData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    return (
        <div className="login-container">

            <form className="login-form" onSubmit={handleSubmit}>
                <img src="obsidian-logo.svg" alt="obsidian logo" />
                <h1>Sign in to your account</h1>
                {errorMsg !== "" ?  <h3 className="error-msg">{errorMsg}</h3> : null}
                <input
                    id="username"
                    type="text"
                    name="username"
                    value={loginData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    // required
                    autoFocus
                />
                <p className="forgot-text">Forgot password?</p>
                <input
                    id="password"
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    // required
                />
                <button type="submit">Sign in</button>
                <p className="create-account-text">Dont have an account? <span><Link to="/signup" className="sign-up-link">Create an account</Link></span></p>
            </form>
        </div>
    );
}
