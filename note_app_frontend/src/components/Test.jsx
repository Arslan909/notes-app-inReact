import React from "react";
import axios from 'axios';


export default function Test() {
    const userId = localStorage.getItem('userId');
    console.log(userId);

    React.useEffect(()=>{
        fetch('http://127.0.0.1:5000/protected', {
            method: 'GET',
            credentials: 'include' 
        })
        .then(response => {
            if (response.ok) {
                return response.json();
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

    return (
        // <h1>{notes}</h1>
        <h1>test</h1>
    );
}
