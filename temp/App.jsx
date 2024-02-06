import React from 'react'
import './App.css'

function App() {
  const [msg, setMsg] = React.useState(null)


  React.useEffect(()=>{

    async function test(){
      const response = await fetch("http://127.0.0.1:5000/message")
      const data = await response.json()
      setMsg(data.message);
      
      // console.log(data); 
    }
    test()
    
  }, [])
  
  return (
    <>
    <h1>testing</h1>
    {/* {msg != null ? <h1>{msg}</h1> : null} */}
    <h1>{msg}</h1>
  
    </>
  )
}

export default App
