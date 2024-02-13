import React from "react";
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export default function Login() {
    const [loginData, setLoginData] = React.useState({
        username: "",
        password: ""
    });
    // const navigate = useNavigate();

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
                // console.log(data.userId);
                localStorage.setItem('userId', data.userId);
                // navigate('/notes');
                // navigate('/test');
                const userId = localStorage.getItem('userId');
                console.log(userId);

                axios.get('http://127.0.0.1:5000/protected')
                    .then(response => {
                        if (response.status === 200) {
                            return response.data;
                        } else {
                            throw new Error('Failed to fetch data from server.');
                        }
                    })
                    .then(data => {
                        console.log(data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });

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
