import { useState, useEffect } from 'react'
import './styles/main.scss';
import LandingPage from './components/LandingPage';
import React from "react";
import Profile from './components/Profile';
import Journal from './components/Journal';
import Bucketlist from './components/Bucketlist';
import Social from './components/Social'
import {CHECK_LOGIN_ENDPOINT_URL} from './utils/ApiHost'
import axios from 'axios';
import MapPage from './components/MapPage';

import {
  BrowserRouter,
  Route,
  Routes,
  Link
} from "react-router-dom";


import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

function App() {
  const [isLogged, setIsLogged] = useState(false);
  useEffect(() => {
    const checkLoginStatus = async () => {
        try {
            const response = await axios.get(CHECK_LOGIN_ENDPOINT_URL, {
                withCredentials: true, 
            });
            setIsLogged(response.data.isLogged);
        } catch (error) {
            console.error("Error checking login status:", error);
            setIsLogged(false); 
        }
    };

    checkLoginStatus();
  }, []);
  return (
    <div className='container'>

      <BrowserRouter> 
        <Routes>
          <Route path="/" element={<LandingPage isLogged={isLogged} setIsLogged={setIsLogged} />} />
          <Route path="/map" element={<MapPage isLogged={isLogged} />} />
          <Route path="/login" element={<LoginPage setIsLogged={setIsLogged}/>} />
          <Route path="/register" element={<RegisterPage setIsLogged={setIsLogged} />} />
          <Route path="/profile" element={<Profile isLogged={isLogged} />} />
          <Route path="/journal" element={<Journal isLogged={isLogged} />} />
          <Route path="/bucketlist" element={<Bucketlist isLogged={isLogged} />} />
          <Route path='/platform' element={<Social />} />
        </Routes>
      </BrowserRouter>


    </div>
  )
}

export default App
