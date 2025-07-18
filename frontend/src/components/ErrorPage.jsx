import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import "../styles/ErrorPage.scss";

const ErrorPage = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="errorPage">
      <b>
        <p>{translations[lang].error || "You need to be logged in to proceed."}</p>
      </b>
      <div className="error-buttons">
        <Link to='/login'>
          <button>{translations[lang].login}</button>
        </Link>
        <Link to='/register'>
          <button>{translations[lang].register}</button>
        </Link>
      </div>
      <button
        className="back-btn"
        onClick={() => navigate('/')}
      >
        ⬅ {translations[lang].back || "Back to Home"}
      </button>
    </div>
  );
};

export default ErrorPage;