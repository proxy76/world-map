import React, { useState, useEffect } from 'react';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import '../styles/CurrencyConverterModal.scss';

const CurrencyConverterModal = ({ isOpen, onClose, countryCurrency, countryName }) => {
    const { lang } = useLanguage();
    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('RON');
    const [convertedAmount, setConvertedAmount] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [exchangeRates, setExchangeRates] = useState({});
    const [isClosing, setIsClosing] = useState(false);
    const [animatedAmount, setAnimatedAmount] = useState(null);

    const targetCurrency = countryCurrency 
        ? Object.keys(countryCurrency)[0]
        : 'RON';

    const commonCurrencies = [
        'RON', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
        'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR', 'KRW', 
    ];

    useEffect(() => {
        if (isOpen) {
            const fetchExchangeRates = async () => {
                try {
                    setIsLoading(true);
                    setError('');
                    const response = await fetch('https://api.exchangerate-api.com/v4/latest/RON');
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
        }
    }, [isOpen, lang]);

    useEffect(() => {
        if (convertedAmount && !isNaN(convertedAmount)) {
            const targetValue = parseFloat(convertedAmount);
            const duration = 800;
            const steps = 60;
            const stepValue = targetValue / steps;
            const stepTime = duration / steps;
            
            let currentValue = 0;
            let currentStep = 0;
            
            const timer = setInterval(() => {
                currentStep++;
                currentValue = stepValue * currentStep;
                
                if (currentStep >= steps) {
                    currentValue = targetValue;
                    clearInterval(timer);
                }
                
                setAnimatedAmount(currentValue.toFixed(2));
            }, stepTime);
            
            return () => clearInterval(timer);
        } else {
            setAnimatedAmount(null);
        }
    }, [convertedAmount]);

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setConvertedAmount(null);
            setAnimatedAmount(null);
            setError('');
            setFromCurrency('RON');
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); 
    };

    if (!isOpen && !isClosing) return null;

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
            setAnimatedAmount(null);
            setError('');
        }
    };

    return (
        <div 
            className={`currency-modal-overlay ${isClosing ? 'closing' : ''}`} 
            onClick={handleClose}
        >
            <div 
                className={`currency-modal-content ${isClosing ? 'closing' : ''}`} 
                onClick={e => e.stopPropagation()}
            >
                <div className="currency-modal-header">
                    <h2>{translations[lang]?.currencyConverter || 'Currency Converter'}</h2>
                    <button 
                        className="currency-modal-close"
                        onClick={handleClose}
                        aria-label={translations[lang]?.close || 'Close'}
                    >
                        ✕
                    </button>
                </div>
                
                <div className="currency-modal-body">
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
                                disabled={isLoading}
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
                                    setAnimatedAmount(null);
                                }}
                                className="currency-select"
                                disabled={isLoading}
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
                                        {animatedAmount ? parseFloat(animatedAmount).toLocaleString() : '0'} {targetCurrency}
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
                
                <div className="currency-modal-footer">
                    <p className="currency-info">
                        {translations[lang]?.convertingTo || 'Converting to'} <strong>{countryName}</strong> {translations[lang]?.currency || 'currency'} ({targetCurrency})
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CurrencyConverterModal;
