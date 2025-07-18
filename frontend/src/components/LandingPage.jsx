import { useEffect, useRef, useState } from "react";
import useFetchUser from "../hooks/useFetchUser";
import Globe from "./Globe.jsx";
import { FaArrowAltCircleDown } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { LOGOUT_ENDPOINT_URL } from '../utils/ApiHost.js';
import axios from 'axios';

import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";

export default function LandingPage({ isLogged, setIsLogged }) {
    const [pfp, setPfp] = useState("");
    const headerRef = useRef(null);
    const [isOpened, setIsOpened] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (e.target.className !== 'dropdownWrapper' && e.target.className !== 'profilePic') {
                setIsOpened(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
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
        window.location.reload();
    };

    useEffect(() => {
        const loadFinisherHeader = async () => {
            const script = document.createElement("script");
            script.src = "/finisher-header.es5.min.js";
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                if (window.FinisherHeader && headerRef.current) {
                    new window.FinisherHeader({
                        "count": 12,
                        "size": {
                            "min": 1300,
                            "max": 1500,
                            "pulse": 0
                        },
                        "speed": {
                            "x": {
                                "min": 0,
                                "max": 1
                            },
                            "y": {
                                "min": 0,
                                "max": 1
                            }
                        },
                        "colors": {
                            "background": "#61eea9",
                            "particles": [
                                "#1cff62",
                                "#231efe"
                            ]
                        },
                        "blending": "lighten",
                        "opacity": {
                            "center": 0.55,
                            "edge": 0.05
                        },
                        "skew": -2,
                        "shapes": [
                            "c"
                        ]
                    });
                }
            };
        };

        loadFinisherHeader();
    }, []);

    // Insert the Voiceflow chat widget
    useEffect(() => {
        (function (d, t) {
            const v = d.createElement(t);
            const s = d.getElementsByTagName(t)[0];
            v.onload = function () {
                window.voiceflow.chat.load({
                    verify: { projectID: '664913a0c40987a6e3806d50' },
                    url: 'https://general-runtime.voiceflow.com',
                    versionID: 'production',
                    voice: {
                        url: "https://runtime-api.voiceflow.com"
                    }
                });
            };
            v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs";
            v.type = "text/javascript";
            s.parentNode.insertBefore(v, s);
        })(document, 'script');
    }, []);
//  ceva
    return (
        <div className="pageWrapper">
            <div className="headerWrapper">
                <div className="headerText">
                    <div className="sections">
                        <div className="title">
                            <div className="titleLogo">
                                <img src="/logo.png" alt="" />
                            </div>
                            <div className="titleText">
                                GlobeTales.
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
                                src="/anonymous.png"
                                alt=""
                            />
                            {
                                isOpened && (
                                    <div className="dropdownContainer">
                                        {
                                            isLogged ? (
                                                <div className="dropdown">
                                                    <Link to='profile'>
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
                                                    <Link to='login'>
                                                        <div className="dropdownItem">
                                                            Login
                                                        </div>
                                                    </Link>

                                                    <Link to='register'>
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
            
            <div className="globeWrapper">
                <Globe />
            </div>
            
            <div className="social-platform-btn">
                <button>GEN INSTA</button>
            </div>
            
            <div className="buttonWrapper">
                <div className="txt">
                    <h2>Travel. Experience. Find Yourself!</h2>
                </div>
                <div className="btns btnsLanding">
                    <Link to='map'><button>World Map</button></Link>
                    <Link to='journal'><button>Travel Journal</button></Link>
                    <Link to='bucketlist'><button>Bucketlist</button></Link>
                </div>
            </div>

            <div className="infoWrapper">
                <div className="info1">
                    <a id="gen"></a>
                    <div className="text1">
                        <h1>Alege unde vrei să călătorești</h1>
                        <p>Cu noi, fiecare călătorie devine mai mult decât o amintire. Îți oferim un spațiu special unde poți să îți setezi obiective de călătorie, să notezi destinațiile deja explorate și să îți planifici următoarele aventuri. E ca un jurnal personalizat, dedicat pasiunii tale pentru descoperirea lumii – un loc unde fiecare țară vizitată capătă un sens mai profund și fiecare experiență se transformă într-o poveste de păstrat și rememorat.</p>
                    </div>
                    <div className="img1">
                        <img src={img1} alt="" />
                    </div>
                </div>
                <div className="info2">
                    <div className="img2">
                        <img src={img2} alt="" />
                    </div>
                    <div className="text2">
                        <h1>Folosește-te de ce îți oferim</h1>
                        <p>Pornește într-o aventură fără sfârșit cu harta noastră interactivă! La fiecare pas, vei descoperi informații fascinante despre țările în care ajungi, povești mai puțin știute și curiozități care îți vor îmbogăți călătoria. Marchează-ți destinațiile, scrie-ți amintirile și lasă fiecare loc vizitat să spună o parte din povestea ta.</p>
                    </div>
                </div>
            </div>

            <div className="footer">
                <div className="footer-container">
                    <div className="footer-logo">
                        <h2>GlobeTales.</h2>
                        <p>Innovative solutions for a modern world.</p>
                    </div>
                    <div className="footer-social">
                        <h4>Follow Us</h4>
                        <ul>
                            <li><a href="#" className="social-icon facebook">Facebook</a></li>
                            <li><a href="#" className="social-icon twitter">Twitter</a></li>
                            <li><a href="#" className="social-icon instagram">Instagram</a></li>
                            <li><a href="#" className="social-icon linkedin">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 GlobeTales. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
