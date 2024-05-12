import React from 'react'
import Login from "./components/Login.jsx"
import Signup from "./components/Signup.jsx"
import "./Landing.css"

const Landing = () => {
  return (
    <div className='landing-container'>
      <Signup/>
      <Login/>
    </div>
  )
}

export default Landing