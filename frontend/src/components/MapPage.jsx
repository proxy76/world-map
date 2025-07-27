import GlobalHeader from "./GlobalHeader";
import MainMap from "./MainMap";
import SearchBar from "./SearchBar";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import PackingLoader from './PackingLoader.jsx';

const MapPage = ({ isLogged }) => {
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const mapRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!location.search.includes("reloaded=1")) {
            window.location.replace(location.pathname + "?reloaded=1");
        } else {
            window.history.replaceState({}, "", location.pathname);
        }
    }, [location]);

    useEffect(() => {
        // Simulate loading for 1s, or replace with real data loading logic
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchTerm("");
    }, []);

    const handleZoomIn = useCallback(() => {
        if (mapRef.current && mapRef.current.zoomIn) {
            mapRef.current.zoomIn();
        }
    }, []);

    const handleZoomOut = useCallback(() => {
        if (mapRef.current && mapRef.current.zoomOut) {
            mapRef.current.zoomOut();
        }
    }, []);

    const handleResetView = useCallback(() => {
        if (mapRef.current && mapRef.current.resetView) {
            mapRef.current.resetView();
        }
    }, []);

    if (loading) {
        return <PackingLoader />;
    }
    return (
        <div className="map">
            <GlobalHeader isLogged={isLogged} />
            <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
            <div className="mapPageControls">
                <div className="zoomControls">
                    <button 
                        className="controlButton zoomIn" 
                        onClick={handleZoomIn}
                        title="Zoom In"
                    >
                        +
                    </button>
                    <button 
                        className="controlButton zoomOut" 
                        onClick={handleZoomOut}
                        title="Zoom Out"
                    >
                        −
                    </button>
                    <button 
                        className="controlButton resetView" 
                        onClick={handleResetView}
                        title="Reset View"
                    >
                        🌍
                    </button>
                </div>
                <div className="controlsHint">
                    Use WASD keys to navigate when zoomed in
                </div>
            </div>
            <MainMap ref={mapRef} isLogged={isLogged} searchTerm={searchTerm} />
        </div>
    )
}

export default MapPage;