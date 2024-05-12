import React from 'react'
import OutlinedInput from '@mui/material/OutlinedInput';
import axios from 'axios';
import PropTypes from 'prop-types';



export default function SearchNotes(props) {
  const [searchQuery, setSearchQuery] = React.useState('');
  // const [searchResults, setSearchResults] = React.useState([]);
  const token = localStorage.getItem("access_token")

  const handleSearch = (e) => {
    const { value } = e.target
    setSearchQuery(value)

    try {
      axios.post('http://127.0.0.1:5000/searchNotes', { searchQuery: value }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          // console.log(res.data.notes)
          // setSearchResults(res.data.notes)
          props.setNotes(res.data.notes)

        })

    } catch (error) {
      console.log("failed to search fot note " + error);
    }
  }

  return (
    <div>
      <OutlinedInput
        placeholder="Search Note title"
        fullWidth
        sx={{
          color: "#9f9e9f"
        }}
        value={searchQuery}
        // onChange={(e) => setSearchQuery(e.target.value)}
        // onKeyDown={(e) => {
        //   if (e.key === 'Enter') {
        //     handleSearch();

        //   }
        // }}
        onChange={handleSearch}
      />


    </div>
  )
}



SearchNotes.propTypes = {

  setNotes: PropTypes.func,

};