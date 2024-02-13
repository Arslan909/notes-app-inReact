import React from "react";
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [loginData, setLoginData] = React.useState({
        username: "",
        password: ""
    });
    const navigate = useNavigate();

    React.useEffect(()=>{
        fetch("http://127.0.0.1:5000/")
            .then(res => res.json())
            .then(data => console.log(data))
    }, [])

    function handleSubmit(event) {
        event.preventDefault();
        // console.log(loginData);


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
            console.log(data.userId);
            localStorage.setItem('userId', data.userId);
            navigate('/notes');
            
        })


    }

    function handleChange(event) {
        const { name, value } = event.target;
        setLoginData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <input
                id="username"
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
            />
            <input
                id="password"
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
            />
            <button type="submit">Login</button>
        </form>
    );
}
