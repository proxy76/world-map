import React, { useState, useEffect, useRef } from 'react';
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
    const { countryCode } = useParams();
    const { lang } = useLanguage();
    const [countryInfo, setCountryInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const [translatedData, setTranslatedData] = useState({});
    const [isTranslating, setIsTranslating] = useState(false);

    // Persist cache across renders
    const translationCache = useRef(new Map());

    const translateBatch = async (texts) => {
        if (!texts || texts.length === 0) return [];
        if (lang !== 'ro') return texts;

        try {
            const uncachedTexts = texts.filter(text => !translationCache.current.has(text));
            if (uncachedTexts.length === 0) {
                return texts.map(text => translationCache.current.get(text) || text);
            }

            const combinedText = uncachedTexts.join(' ||| ');
            const res = await axios.get(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(combinedText)}&langpair=en|ro`
            );

            const translatedCombined = res.data.responseData.translatedText;
            const translatedTexts = translatedCombined.split(' ||| ');

            uncachedTexts.forEach((text, index) => {
                if (translatedTexts[index]) {
                    translationCache.current.set(text, translatedTexts[index]);
                }
            });

            return texts.map(text => translationCache.current.get(text) || text);
        } catch (err) {
            console.error('Batch translation error:', err);
            return texts;
        }
    };

    const translateCountryData = async (countryData) => {
        if (lang !== 'ro') return;

        setIsTranslating(true);

        try {
            const textsToTranslate = [];
            const textKeys = [];

            if (countryData.name?.common) {
                textsToTranslate.push(countryData.name.common);
                textKeys.push('commonName');
            }
            if (countryData.name?.official) {
                textsToTranslate.push(countryData.name.official);
                textKeys.push('officialName');
            }
            if (countryData.capital?.[0]) {
                textsToTranslate.push(countryData.capital[0]);
                textKeys.push('capital');
            }
            if (countryData.continents?.[0]) {
                textsToTranslate.push(countryData.continents[0]);
                textKeys.push('continent');
            }
            if (countryData.region) {
                textsToTranslate.push(countryData.region);
                textKeys.push('region');
            }
            if (countryData.subregion) {
                textsToTranslate.push(countryData.subregion);
                textKeys.push('subregion');
            }

            if (countryData.languages) {
                const languageValues = Object.values(countryData.languages);
                languageValues.forEach(lang => {
                    textsToTranslate.push(lang);
                    textKeys.push('language_' + lang);
                });
            }

            if (countryData.currencies) {
                const currencyNames = Object.values(countryData.currencies).map(curr => curr.name);
                currencyNames.forEach(curr => {
                    textsToTranslate.push(curr);
                    textKeys.push('currency_' + curr);
                });
            }

            const batchSize = 10;
            const translatedResults = {};

            for (let i = 0; i < textsToTranslate.length; i += batchSize) {
                const batch = textsToTranslate.slice(i, i + batchSize);
                const batchKeys = textKeys.slice(i, i + batchSize);
                const translatedBatch = await translateBatch(batch);

                batchKeys.forEach((key, index) => {
                    translatedResults[key] = translatedBatch[index];
                });
            }

            const translations = {
                commonName: translatedResults.commonName,
                officialName: translatedResults.officialName,
                capital: translatedResults.capital,
                continent: translatedResults.continent,
                region: translatedResults.region,
                subregion: translatedResults.subregion,
            };

            if (countryData.languages) {
                const languageValues = Object.values(countryData.languages);
                const translatedLanguages = languageValues.map(lang =>
                    translatedResults['language_' + lang] || lang
                );
                translations.languages = translatedLanguages.join(', ');
            }

            if (countryData.currencies) {
                const currencyNames = Object.values(countryData.currencies).map(curr => curr.name);
                const translatedCurrencies = currencyNames.map(curr =>
                    translatedResults['currency_' + curr] || curr
                );
                translations.currencies = translatedCurrencies.join(', ');
            }

            setTranslatedData(translations);
        } catch (error) {
            console.error('Translation error:', error);
        } finally {
            setIsTranslating(false);
        }
    };

    useEffect(() => {
        const fetchCountryInfo = async () => {
            try {
                setLoading(true);
                setError(false);

                const response = await axios.get(`https://restcountries.com/v3.1/alpha/${countryCode}`);
                const countryData = response.data[0];
                setCountryInfo(countryData);
                setLoading(false); // ✅ allow immediate render
                translateCountryData(countryData); // ✅ async translate after render
            } catch (error) {
                console.error('Failed to fetch country info:', error);
                setError(true);
                setLoading(false);
            }
        };

        if (countryCode) {
            fetchCountryInfo();
        }
    }, [countryCode, lang]);

    const getDisplayValue = (originalValue, translatedKey) => {
        if (lang === 'ro' && translatedData[translatedKey]) {
            return translatedData[translatedKey];
        }
        return originalValue;
    };

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
                        <h1 className="country-title">
                            {getDisplayValue(countryInfo.name.common, 'commonName')}
                            {isTranslating && lang === 'ro' && (
                                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}> (translating...)</span>
                            )}
                        </h1>
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
                                <span>{getDisplayValue(countryInfo.name.official, 'officialName')}</span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.capital || 'Capital'}:</strong>
                                <span>{getDisplayValue(countryInfo.capital?.[0] || 'N/A', 'capital')}</span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.continent || 'Continent'}:</strong>
                                <span>{getDisplayValue(countryInfo.continents?.[0] || 'N/A', 'continent')}</span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.region || 'Region'}:</strong>
                             kj   <span>{getDisplayValue(countryInfo.region, 'region')}</span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.subregion || 'Subregion'}:</strong>
                                <span>{getDisplayValue(countryInfo.subregion || 'N/A', 'subregion')}</span>
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
                                    {getDisplayValue(
                                        countryInfo.languages ? Object.values(countryInfo.languages).join(', ') : 'N/A',
                                        'languages'
                                    )}
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.currency || 'Currencies'}:</strong>
                                <span>
                                    {getDisplayValue(
                                        countryInfo.currencies
                                            ? Object.values(countryInfo.currencies).map(curr => curr.name).join(', ')
                                            : 'N/A',
                                        'currencies'
                                    )}
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.timezone || 'Timezones'}:</strong>
                                <span>{countryInfo.timezones ? countryInfo.timezones.join(', ') : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h2>{translations[lang]?.geographicInfo || 'Geographic Information'}</h2>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <strong>{translations[lang]?.area || 'Area'}:</strong>
                                <span>
                                    {countryInfo.area ? `${countryInfo.area.toLocaleString()} km²` : 'N/A'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.borders || 'Borders'}:</strong>
                                <span>
                                    {countryInfo.borders
                                        ? countryInfo.borders.join(', ')
                                        : translations[lang]?.none || 'None'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>{translations[lang]?.landlocked || 'Landlocked'}:</strong>
                                <span>
                                    {countryInfo.landlocked
                                        ? translations[lang]?.yes || 'Yes'
                                        : translations[lang]?.no || 'No'}
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

            <MapModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                capital={countryInfo.capital?.[0]}
                countryName={countryInfo.name.common}
            />

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

