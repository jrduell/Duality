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

      // eslint-disable-next-line no-unused-expressions
      //Playlists();
      //if (token) { Playlists(); }
    }

    catchErrors(fetchData());

  }, [])

  return (
    <>
    <head>
      <title>Page title</title>
    </head>
    <body>
          <button>button there</button>
    </body>
    </>
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
      <button onClick={CreateBtnTapped}>Create</button>
    </>
  );
}

function CreateBtnTapped() {
  console.log("hi");
  return <button>this</button>;
}
/*
function URLSearch () {
  return (
    <button onClick={Playlists()}>Create</button>
  );
}
*/
export default App;
