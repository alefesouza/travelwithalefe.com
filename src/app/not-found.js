import './error.css';
import useI18n from './hooks/use-i18n';

export default function Custom404() {
  const i18n = useI18n();

  return (
    <div className="error-message">
      <h1>404 - {i18n('Not Found')}</h1>
    </div>
  );
}
