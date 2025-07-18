import GlobalHeader from "./GlobalHeader";
import MainMap from "./MainMap";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
const MapPage = ({ isLogged }) => {
    const location = useLocation();
    useEffect(() => {
        if (!location.search.includes("reloaded=1")) {
            window.location.replace(location.pathname + "?reloaded=1");
        } else {
            // Ascunde parametru după reload
            window.history.replaceState({}, "", location.pathname);
        }
    }, [location]);
    return (
        <div className="map">
            <GlobalHeader isLogged={isLogged} />
            <MainMap isLogged={isLogged} />
        </div>
    )
}

export default MapPage;