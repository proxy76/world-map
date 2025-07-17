import { ADD_WISHLIST_ENDPOINT_URL, ADD_JOURNAL_ENDPOINT_URL } from "../utils/ApiHost";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "./Card";
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";

export default function Menu({ setMenuOpen, menuOpen, country, countryCode, isLogged }) {
  const [cardOpened, setCardOpened] = useState(false);
  const { lang } = useLanguage();

  const toggleCard = () => setCardOpened(!cardOpened);
  const toggleMenu = () => setMenuOpen(false);

  const add_wishlist = () => {
    axios.post(ADD_WISHLIST_ENDPOINT_URL, { country }, { withCredentials: true });
  };

  const add_journal = () => {
    axios.post(ADD_JOURNAL_ENDPOINT_URL, { country }, { withCredentials: true });
  };

  return (
    <div className="menus">
      {menuOpen && (
        <div className="backgroundMenu">
          <div className="countryMenu">
            <h1>{country}</h1>
            {isLogged ? (
              <>
                <button onClick={add_wishlist}>{translations[lang].add} {translations[lang].bucketlist}</button>
                <button onClick={add_journal}>{translations[lang].add} {translations[lang].travelJournal}</button>
              </>
            ) : (
              <p>{translations[lang].unloggedMessage}.</p>
            )}
            <Link to={`/country/${countryCode}`}>
              <button onClick={toggleMenu}>{translations[lang].countryPage}</button>
            </Link>
            <button onClick={toggleCard}>{translations[lang].showCard}</button>
            <button onClick={toggleMenu}>{translations[lang].close}</button>
          </div>
          {cardOpened && <Card name={country} />}
        </div>
      )}
    </div>
  );
}