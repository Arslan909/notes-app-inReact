import { BrowserRouter, Routes, Route } from "react-router-dom"


import Entrance from './components/Entrance.jsx'
import Login from './components/Login.jsx'
import App from './Notes.jsx'
import Test from './components/Test.jsx'


export default function Index() {

	return (
		<>
			<BrowserRouter>

				<Routes>
                    <Route path="/" element={<Entrance/>}></Route>
                    <Route path="/login" element={<Login/>}></Route>
                    <Route path="/notes" element={<App/>}></Route>

                    {/* <Route path="/test/:id" element={<Test/>}></Route> */}
                    <Route path="/test" element={<Test/>}></Route>
				</Routes>
			</BrowserRouter>

		</>
	)
}
