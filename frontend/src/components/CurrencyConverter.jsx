import React, { useState, useEffect } from 'react';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import '../styles/CurrencyConverter.scss';

const CurrencyConverter = ({ countryCurrency }) => {
    const { lang } = useLanguage();
    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [convertedAmount, setConvertedAmount] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [exchangeRates, setExchangeRates] = useState({});

    const targetCurrency = countryCurrency 
        ? Object.keys(countryCurrency)[0]
        : 'USD';

    const commonCurrencies = [
        'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
        'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR', 'KRW'
    ];

    useEffect(() => {
        const fetchExchangeRates = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                const data = await response.json();
                setExchangeRates(data.rates);
            } catch (error) {
                console.error('Failed to fetch exchange rates:', error);
                setError(translations[lang]?.exchangeRateError || 'Failed to fetch exchange rates');
            } finally {
                setIsLoading(false);
            }
        };

        fetchExchangeRates();
    }, [lang]);

    const handleConvert = () => {
        if (!amount || !exchangeRates[fromCurrency] || !exchangeRates[targetCurrency]) {
            setError(translations[lang]?.invalidAmount || 'Please enter a valid amount');
            return;
        }

        setError('');
        
        const usdAmount = parseFloat(amount) / exchangeRates[fromCurrency];
        const converted = usdAmount * exchangeRates[targetCurrency];
        
        setConvertedAmount(converted.toFixed(2));
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
            setConvertedAmount(null);
            setError('');
        }
    };

    return (
        <div className="currency-converter">
            <h2>{translations[lang]?.currencyConverter || 'Currency Converter'}</h2>
            
            <div className="converter-form">
                <div className="input-group">
                    <label htmlFor="amount">
                        {translations[lang]?.amount || 'Amount'}:
                    </label>
                    <input
                        id="amount"
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        className="amount-input"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="fromCurrency">
                        {translations[lang]?.fromCurrency || 'From Currency'}:
                    </label>
                    <select
                        id="fromCurrency"
                        value={fromCurrency}
                        onChange={(e) => {
                            setFromCurrency(e.target.value);
                            setConvertedAmount(null);
                        }}
                        className="currency-select"
                    >
                        {commonCurrencies.map(currency => (
                            <option key={currency} value={currency}>
                                {currency}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="convert-button-container">
                    <button
                        onClick={handleConvert}
                        disabled={!amount || isLoading}
                        className="convert-button"
                    >
                        {isLoading 
                            ? (translations[lang]?.converting || 'Converting...') 
                            : (translations[lang]?.convert || 'Convert')
                        }
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {convertedAmount && !error && (
                    <div className="conversion-result">
                        <div className="result-text">
                            <span className="amount-from">
                                {parseFloat(amount).toLocaleString()} {fromCurrency}
                            </span>
                            <span className="equals">=</span>
                            <span className="amount-to">
                                {parseFloat(convertedAmount).toLocaleString()} {targetCurrency}
                            </span>
                        </div>
                        <div className="target-currency-name">
                            {countryCurrency && countryCurrency[targetCurrency] 
                                ? countryCurrency[targetCurrency].name 
                                : targetCurrency
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurrencyConverter;
