import { Link } from "react-router-dom"

export default function Entrance() {
    return (
        <>
            <header>
                <Link to='/login'>login</Link>
            </header>
            <h1>this is the intro page for this app</h1>
        </>
    )
}