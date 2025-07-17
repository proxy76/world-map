import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import GlobalHeader from './GlobalHeader';
import ErrorPage from './ErrorPage';
import MapModal from './MapModal';
import CurrencyConverterModal from './CurrencyConverterModal';
import '../styles/CountryPage.scss';

const CountryPage = ({ isLogged }) => {
    const { countryCode } = useParams(); // Get country code from URL
    const { lang } = useLanguage();
    const [countryInfo, setCountryInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

    useEffect(() => {
        const fetchCountryInfo = async () => {
            try {
                setLoading(true);
                setError(false);
                
                // Fetch country info by country code (alpha2Code or alpha3Code)
                const response = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`);
                setCountryInfo(response.data[0]);
            } catch (error) {
                console.error('Failed to fetch country info:', error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (countryCode) {
            fetchCountryInfo();
        }
    }, [countryCode]);

    if (loading) {
        return (
            <div className="country-page">
                <GlobalHeader isLogged={isLogged} />
                <div className="loading-container">
                    <p>{translations[lang]?.loading || 'Loading...'}</p>
                </div>
            </div>
        );
    }

    if (error || !countryInfo) {
        return <ErrorPage />;
    }

    return (
        <div className="country-page">
            <GlobalHeader isLogged={isLogged} />
            
            <div className="country-content">
                <div className="country-header">
                    <img 
                        src={countryInfo.flags.png} 
                        alt={`${countryInfo.name.common} flag`}
                        className="country-flag"
                    />
                    <div className="country-title-section">
                        <h1 className="country-title">{countryInfo.name.common}</h1>
                        <div className="action-buttons">
                            {countryInfo.capital?.[0] && (
                                <button 
                                    className="map-button"
                                    onClick={() => setIsMapModalOpen(true)}
                                    title={translations[lang]?.viewOnMap || 'View on Map'}
                                >
                                    🗺️ {translations[lang]?.viewOnMap || 'View on Map'}
                                </button>
                            )}
                            {countryInfo.currencies && (
                                <button 
                                    className="currency-button"
                                    onClick={() => setIsCurrencyModalOpen(true)}
                                    title={translations[lang]?.currencyConverter || 'Currency Converter'}
                                >
                                    💱 {translations[lang]?.currencyConverter || 'Currency Converter'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="country-details">
                    <div className="detail-section">
                        <h2>{translations[lang]?.basicInfo || 'Basic Information'}</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <strong>{translations[lang]?.officialName || 'Official Name'}:</strong>
                                <span>{countryInfo.name.official}</span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.capital || 'Capital'}:</strong>
                                <span>{countryInfo.capital?.[0] || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.continent || 'Continent'}:</strong>
                                <span>{countryInfo.continents?.[0] || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.region || 'Region'}:</strong>
                                <span>{countryInfo.region}</span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.subregion || 'Subregion'}:</strong>
                                <span>{countryInfo.subregion || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.population || 'Population'}:</strong>
                                <span>{countryInfo.population?.toLocaleString() || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h2>{translations[lang]?.culturalInfo || 'Cultural Information'}</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <strong>{translations[lang]?.officialLanguage || 'Languages'}:</strong>
                                <span>
                                    {countryInfo.languages 
                                        ? Object.values(countryInfo.languages).join(', ')
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.currency || 'Currencies'}:</strong>
                                <span>
                                    {countryInfo.currencies 
                                        ? Object.values(countryInfo.currencies).map(curr => curr.name).join(', ')
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.timezone || 'Timezones'}:</strong>
                                <span>
                                    {countryInfo.timezones 
                                        ? countryInfo.timezones.join(', ')
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h2>{translations[lang]?.geographicInfo || 'Geographic Information'}</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <strong>{translations[lang]?.area || 'Area'}:</strong>
                                <span>
                                    {countryInfo.area 
                                        ? `${countryInfo.area.toLocaleString()} km²`
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.borders || 'Borders'}:</strong>
                                <span>
                                    {countryInfo.borders 
                                        ? countryInfo.borders.join(', ')
                                        : translations[lang]?.none || 'None'
                                    }
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.landlocked || 'Landlocked'}:</strong>
                                <span>
                                    {countryInfo.landlocked 
                                        ? translations[lang]?.yes || 'Yes'
                                        : translations[lang]?.no || 'No'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    {countryInfo.coatOfArms?.png && (
                        <div className="detail-section">
                            <h2>{translations[lang]?.coatOfArms || 'Coat of Arms'}</h2>
                            <img 
                                src={countryInfo.coatOfArms.png} 
                                alt={`${countryInfo.name.common} coat of arms`}
                                className="coat-of-arms"
                            />
                        </div>
                    )}
                </div>
            </div>
            
            {/* Map Modal */}
            <MapModal 
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                capital={countryInfo.capital?.[0]}
                countryName={countryInfo.name.common}
            />

            {/* Currency Converter Modal */}
            <CurrencyConverterModal 
                isOpen={isCurrencyModalOpen}
                onClose={() => setIsCurrencyModalOpen(false)}
                countryCurrency={countryInfo.currencies}
                countryName={countryInfo.name.common}
            />
        </div>
    );
};

export default CountryPage;
