import { useState, useEffect } from 'react';
import axios from 'axios';  
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import '../styles/Card.scss'; 

const Card = ({ name }) => {
    const { lang } = useLanguage();
    const [info, setInfo] = useState(null);

    useEffect(() => {
        let countryName = name;
        if (countryName === "United States") countryName = 'usa';
        if (countryName === "India") countryName = 'Republic of India';
        if (countryName === "China") countryName = 'Zhonghua';
        const getInfo = async () => {
            try {
                const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);
                setInfo(response.data[0]);
            } catch (error) {
                console.error('Failed to fetch country info:', error);
            }
        };
        if (countryName) getInfo();
    }, [name]);

    if (!info) return <p>{translations[lang].loading}</p>;

    return (
        <div className='card'>
            <img src={info.flags.png} alt="" />
            <div className="name">
                <p><b>{translations[lang].name}</b></p>
                <p>{info.name.common}</p>
            </div>
            <div className="currencies">
                <p><b>{translations[lang].currency}</b></p>
                <p>{Object.values(info.currencies)[0].name}</p>
            </div>
            <div className="capital">
                <p><b>{translations[lang].capital}</b></p>
                <p>{info.capital?.[0]}</p>
            </div>
            <div className="languages">
                <p><b>{translations[lang].officialLanguage}</b></p>
                <p>{Object.values(info.languages)[0]}</p>
            </div>
            <div className="population">
                <p><b>{translations[lang].population}</b></p>
                <p>{info.population.toLocaleString()}</p>
            </div>
            <div className="continent">
                <p><b>{translations[lang].continent}</b></p>
                <p>{info.continents[0]}</p>
            </div>
        </div>
    );
};

export default Card;
