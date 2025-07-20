import GlobalHeader from "./GlobalHeader";
import MainMap from "./MainMap";
import SearchBar from "./SearchBar";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

const MapPage = ({ isLogged }) => {
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!location.search.includes("reloaded=1")) {
            window.location.replace(location.pathname + "?reloaded=1");
        } else {
            // Ascunde parametru după reload
            window.history.replaceState({}, "", location.pathname);
        }
    }, [location]);

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchTerm("");
    }, []);

    return (
        <div className="map">
            <GlobalHeader isLogged={isLogged} />
            <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
            <MainMap isLogged={isLogged} searchTerm={searchTerm} />
        </div>
    )
}

export default MapPage;