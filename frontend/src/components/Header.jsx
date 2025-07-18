import React from 'react';

import { useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';

import "../styles/header.scss";

import axios from 'axios';
import { LOGOUT_ENDPOINT_URL } from '../utils/ApiHost.js';
import { getProfileInfo } from '../utils/profileInfo.js';

import pfp from '../assets/anonymous.png';

const Header = ({isLogged}) => {

    const headerRef = useRef(null);
    const [isOpened, setIsOpened] = useState(false);
    const [profilePic, setProfilePic] = useState('')
    
      useEffect(() => {
        getProfileInfo()
          .then(data => setProfilePic(data.profilePic))
      }, []);

    // Close dropdown when clicking outside
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (e.target.className != 'dropdownWrapper' || e.target.className != 'profilePic') {
                setIsOpened(false);
            }
        };
        document.addEventListener("onclick", handleClickOutside);
        return () => {
            document.removeEventListener("onclick", handleClickOutside);
        };
    }, []);

    const handleLogout = async (e) => {
        e.preventDefault();

        axios.post(LOGOUT_ENDPOINT_URL, {}, { withCredentials: true })
            .then((response) => {
                setIsLogged(false); // Update state to indicate user is logged out
            })
            .catch((error) => {
                console.log(error); // Log any errors that occur
            })
            .finally(() => {
                // Optional: Any final cleanup or actions can be placed here
            });
        window.location.pathname = '/'; // Redirect to home page after logout

    };

    return (
        <>
            <div className="headerWrapper">
                <div className="headerText">
                    <div className="sections">
                        <div className="title">
                            <div className="titleLogo">
                                <img src="/vite.png" alt="" />
                            </div>
                            <div className="titleText" style={{ color: "black" }}>
                                <a href='/'>GlobeTales.</a>
                            </div>
                        </div>
                        <div
                            onClick={() => {
                                console.log("Profile picture clicked!"); // Debugging
                                setIsOpened(!isOpened);
                            }}
                            ref={dropdownRef} className="dropdownWrapper" >
                            <img
                                className="profilePic"
                                src={profilePic}
                                alt=""
                                onError = {(e) => {
                                    e.target.onerror = null;
                                    e.target.src = pfp
                                    }}
                            />
                            {
                                isOpened && (
                                    <div className="dropdownContainer">
                                        {
                                            isLogged ? (
                                                <div className="dropdown">
                                                    <Link to='/profile'>
                                                        <div className="dropdownItem">
                                                            Profile
                                                        </div>
                                                    </Link>

                                                    <div onClick={(e) => handleLogout(e)} className="dropdownItem">
                                                        Logout
                                                    </div>

                                                </div>
                                            ) : (
                                                <div className="dropdown">
                                                    <Link to='/login'>
                                                        <div className="dropdownItem">
                                                            Login
                                                        </div>
                                                    </Link>

                                                    <Link to='/register'>
                                                        <div className="dropdownItem">
                                                            Register
                                                        </div>
                                                    </Link>

                                                </div>
                                            )
                                        }
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
                <div
                    ref={headerRef}
                    className="header finisher-header"
                    style={{ width: "150%", height: "1000px" }}
                >
                </div>
            </div>
        </>

    );
};

export default Header;
