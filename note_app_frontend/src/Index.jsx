import { BrowserRouter, Routes, Route } from "react-router-dom"


// import Entrance from './components/Entrance.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import App from './Notes.jsx'
// import Test from './components/Test.jsx'


export default function Index() {

	return (
		<>
			<BrowserRouter>

				<Routes>
                    <Route path="/login" element={<Login/>}></Route>
                    <Route path="/signup" element={<Signup/>}></Route>
                    <Route path="/notes" element={<App/>}></Route>

				</Routes>
			</BrowserRouter>

		</>
	)
}
