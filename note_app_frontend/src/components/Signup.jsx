import React from "react";
import { useNavigate, Link } from 'react-router-dom';
import "./Css/login.css"

export default function Login() {
  const [loginData, setLoginData] = React.useState({
    fullName: "",
    username: "",
    password: ""
  });
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = React.useState("")

  function handleSubmit(event) {
    event.preventDefault();
    // console.log(loginData);

    // full name validate
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(loginData.fullName)) {
      setErrorMsg("Full Name only contain letters and spaces");
      return;
    }
    
    else if (loginData.username === "") {
      setErrorMsg("Email is not valid")
      return
    }
    else if (loginData.password === "") {
      setErrorMsg("Password is not valid")
      return
    }
    else if (loginData.password.length < 6) {
      setErrorMsg("Password length should be atleast 6 characters")
      return
    }


    fetch("http://127.0.0.1:5000/signup", {
      method: "POST",
      body: JSON.stringify(loginData),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setErrorMsg(data.error);
          throw new Error(data.error);
        }
        // console.log(data);
        // navigate('/login');
        navigate('/');
      })
      .catch(error => {
        console.error("Error:", error.message);
      });


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
        <h1>Create an account</h1>
        {errorMsg !== "" ? <h3 className="error-msg">{errorMsg}</h3> : null}
        <input
          id="fullname"
          type="text"
          name="fullName"
          value={loginData.fullName}
          onChange={handleChange}
          placeholder="Enter Full Name"
          // required
          autoFocus
        />
        <input
          id="username"
          type="text"
          name="username"
          value={loginData.username}
          onChange={handleChange}
          placeholder="Enter username"
        // required
        />
        <input
          id="password"
          type="password"
          name="password"
          value={loginData.password}
          onChange={handleChange}
          placeholder="Enter password"
        // required
        />
        <button type="submit">Sign up</button>
        <p className="create-account-text">Already have an account? <span><Link to="/" className="sign-up-link">Sign in</Link></span></p>
      </form>
    </div>
  );
}
