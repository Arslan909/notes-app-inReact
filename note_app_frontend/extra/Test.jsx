import React from "react";
import axios from 'axios';


export default function Test() {
    // const navigate = useNavigate();
    const [notes, setNotes] = React.useState([]);

    React.useEffect(() => {
        const fetchNotes = async () => {
            const userId = localStorage.getItem('userId');
            try {
                const response = await axios.post('http://127.0.0.1:5000/protected', { userId });
                setNotes(response.data.notes);
            } catch (error) {
                console.error('Error fetching notes:', error);
            }
        };

        fetchNotes();
    }, []);

    // console.log(notes);

    return (
        <h1>{notes}</h1>
    );
}
