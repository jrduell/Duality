import logo from './logo.svg';
import { catchErrors } from './utils';
import { useEffect, useState } from 'react';
import { accessToken, logout, getCurrentUserProfile, getCurrentUserPlaylists } from './spotify';
import { getCurrentUserSavedTracks } from './spotify';
import './App.css';
import axios from 'axios';
//import { Playlists, setStatus, status } from './dataCollecting/playlists';
import { Playlists, MergePlaylists, CurrentPlaylists } from './dataCollecting/playlists'
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation
 } from "react-router-dom";

function App() {

  //useState hook
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedTracks, setSavedTracks] = useState(null);

  useEffect(() => {
    //assign token to imported access token
    setToken(accessToken);

    const fetchData = async() => {
      const { data } = await getCurrentUserProfile();
      setProfile(data);
    }

    catchErrors(fetchData());

  }, [])

  

  return (
    <div className="App">
      <header className="App-header">
        {!token ? (
          <a
          className="App-link"
          href="http://localhost:8888/login"
        >
          Log in to Spotify
        </a>
        ) : (
          <div>
            <Home/>
          </div>
        )}
      </header>
    </div>
  );
}

function Home() {
  const handleSearch = (event) => {
    console.log("loading")
  }

  const [userName, setUsername] = useState('')
  const [didEnterUser, setDidEnterUser] = useState(false)

  return (
    <>
      
      <h1>Home</h1>
      <hr/>

      {didEnterUser ? (
        <Playlists name={userName}/>
      ) : (
        <p>Enter valid spotify user id to begin</p>
      )
      }

      <label htmlFor='search'>Search: </label>
      <SearchInput onSearch={handleSearch} setName={setUsername} setDidEnter={setDidEnterUser}/>
      <hr/>
      <button onClick={logout}>Log out</button>
    </>
  );
}

const SearchInput = (props) => {

  const [disabled, setDisabled] = useState(false);

  const handleKeydown = (event) => {
    if (event.key === 'Enter') {
      props.onSearch(event)
      props.setName(event.target.value)
      props.setDidEnter(true)
      setDisabled(!disabled)
    }
  }
  return <input id="search" type="text" disabled={disabled} onKeyDown={handleKeydown}/>
}

export default App;
