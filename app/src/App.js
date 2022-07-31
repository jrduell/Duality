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
          <Router>
            <nav>
              <a href="/">Home</a>
              <a href="/by-user">By User</a>
              <a href="/by-playlist">By Playlist</a>
            </nav>

            <Routes>
              <Route path="/by-user" element={<UserSearch/>}/>
              <Route path="/by-playlist" element={<Playlists/>}/>
              <Route path="/" element={<Home/>}/>
            </Routes>
          </Router>
        )}
      </header>
    </div>
  );
}

function UserSearch() {
  return <h1>User Search!</h1>;
}



function Home() {
  return (
    <>
      <h1>Home!</h1>
      <button onClick={logout}>Log out</button>
    </>
  );
}
/*
function URLSearch () {
  return (
    <button onClick={Playlists()}>Create</button>
  );
}
*/
export default App;
