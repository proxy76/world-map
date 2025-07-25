import React, {
  useState,
  lazy,
  Suspense,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

import "../styles/map.scss";
const Menu = lazy(() => import("./Menu"));
const GEO_URL = "/features.json";

const largestCountries = [
  "RUS", // Russia
  "CAN", // Canada
  "USA", // United States
  "CHN", // China
  "BRA", // Brazil
  "AUS", // Australia
  "IND", // India
  "ARG", // Argentina
  "KAZ", // Kazakhstan
  "DZA", // Algeria
];

const LIGHT_GREEN = "#b6f5c6";
const LIGHTER_GREEN = "#e3fbe9";
const HOVER_LIGHT = "#f8fff9";
const DARKER_GREEN = "#3eb262"; 
const SEARCH_HIGHLIGHT = "#ff4444"; 



const MainMap = forwardRef(({ isLogged, searchTerm = "" }, ref) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });

  const isCountryMatching = useCallback((countryName) => {
    if (!searchTerm) return false;
    return countryName.toLowerCase().startsWith(searchTerm.toLowerCase());
  }, [searchTerm]);

  const handleZoomIn = useCallback(() => {
    if (position.zoom >= 8) return;
    setPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }));
  }, [position.zoom]);

  const handleZoomOut = useCallback(() => {
    if (position.zoom <= 0.5) return;
    setPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 0.5) }));
  }, [position.zoom]);

  const handleResetView = useCallback(() => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
  }, []);

  const handleMoveUp = useCallback(() => {
    setPosition(pos => ({
      ...pos,
      coordinates: [pos.coordinates[0], Math.min(pos.coordinates[1] + 10, 80)]
    }));
  }, []);

  const handleMoveDown = useCallback(() => {
    setPosition(pos => ({
      ...pos,
      coordinates: [pos.coordinates[0], Math.max(pos.coordinates[1] - 10, -80)]
    }));
  }, []);

  const handleMoveLeft = useCallback(() => {
    setPosition(pos => ({
      ...pos,
      coordinates: [Math.max(pos.coordinates[0] - 10, -180), pos.coordinates[1]]
    }));
  }, []);

  const handleMoveRight = useCallback(() => {
    setPosition(pos => ({
      ...pos,
      coordinates: [Math.min(pos.coordinates[0] + 10, 180), pos.coordinates[1]]
    }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (position.zoom <= 1) return;
      
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          handleMoveUp();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          handleMoveDown();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          handleMoveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          handleMoveRight();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [position.zoom, handleMoveUp, handleMoveDown, handleMoveLeft, handleMoveRight]);

  useImperativeHandle(ref, () => ({
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    resetView: handleResetView,
  }), [handleZoomIn, handleZoomOut, handleResetView]);

  const handleMoveEnd = useCallback((position) => {
    setPosition(position);
  }, []);

  const handleClick = useCallback((geo) => {
    setSelectedCountry(() => geo.id);
    setCountryName(() => geo.properties.name);
    setCountryCode(() => geo.id); 
    setMenuOpen(() => true);
  }, []);
  
  return (
    <div
      className="mainMap"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <Suspense fallback={<div className="menu-fallback">Loading menu…</div>}>
        {selectedCountry && (
          <Menu
            setMenuOpen={setMenuOpen}
            menuOpen={menuOpen}
            country={countryName}
            countryCode={countryCode}
            isLogged={isLogged}
          />
        )}
      </Suspense>

      <div className="mapContainer">
        <ComposableMap 
          className="map"
          projectionConfig={{
            rotate: [-10, 0, 0],
            scale: 147
          }}
          style={{
            width: "100%",
            height: "auto"
          }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={0.5}
            maxZoom={8}
            onMoveEnd={handleMoveEnd}
            filterZoomEvent={(evt) => {
              return evt.type !== 'wheel';
            }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isLargest = largestCountries.includes(geo.id);
                  const isSelected = selectedCountry === geo.id;
                  const isMatching = isCountryMatching(geo.properties.name);
                  
                  let fillColor;
                  if (isSelected) {
                    fillColor = DARKER_GREEN;
                  } else if (isMatching) {
                    fillColor = SEARCH_HIGHLIGHT;
                  } else {
                    fillColor = isLargest ? LIGHT_GREEN : LIGHTER_GREEN;
                  }
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleClick(geo)}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: "#000",
                          strokeWidth: isMatching ? 2 : 1,
                          outline: "none",
                          transition: "fill 0.2s, stroke-width 0.2s",
                        },
                        hover: {
                          fill: HOVER_LIGHT,
                          stroke: "#000",
                          strokeWidth: isMatching ? 2 : 1,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: DARKER_GREEN,
                          stroke: "#000",
                          strokeWidth: 1,
                          outline: "none",
                        },
                      }}
                      onFocus={(e) => e.target.blur()}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
});

export default React.memo(MainMap);
