import React, {
  useState,
  lazy,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import "../styles/map.scss";
const Menu = lazy(() => import("./Menu"));
const GEO_URL = "/features.json";
const largestCountries = [
  "RUS", 
  "CAN", 
  "USA", 
  "CHN", 
  "BRA", 
  "AUS", 
  "IND", 
  "ARG", 
  "KAZ", 
  "DZA", 
];
const LIGHT_GREEN = "#b6f5c6";
const LIGHTER_GREEN = "#e3fbe9";
const HOVER_LIGHT = "#f8fff9";
const DARKER_GREEN = "#3eb262"; 
const MainMap = ({ isLogged }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
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
      <Suspense fallback={<div className="menu-fallback">Loading menuâ€¦</div>}>
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
        <ComposableMap className="map">
          <ZoomableGroup center={[0, 20]} zoom={1}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isLargest = largestCountries.includes(geo.id);
                  const baseColor = isLargest ? LIGHT_GREEN : LIGHTER_GREEN;
                  const isSelected = selectedCountry === geo.id;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleClick(geo)}
                      style={{
                        default: {
                          fill: isSelected ? DARKER_GREEN : baseColor,
                          stroke: "#000",
                          outline: "none",
                          transition: "fill 0.2s",
                        },
                        hover: {
                          fill: HOVER_LIGHT,
                          stroke: "#000",
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: DARKER_GREEN,
                          stroke: "#000",
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
};
export default React.memo(MainMap);
