import { BrowserRouter, Routes, Route } from "react-router-dom"


// import Entrance from './components/Entrance.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import App from './Notes.jsx'
// import Landing from "./Landing.jsx"
// import Test from './components/Test.jsx'


export default function Index() {
	// not really complete
	return (
		<>
			<BrowserRouter>

				<Routes>
                    {/* <Route path="/" element={<Landing/>}></Route> */}
                    <Route path="/" element={<Login/>}></Route>
                    <Route path="/signup" element={<Signup/>}></Route>
										
                    <Route path="/notes" element={<App/>}></Route>

				</Routes>
			</BrowserRouter>

		</>
	)
}
