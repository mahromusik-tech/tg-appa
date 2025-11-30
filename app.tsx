import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import './App.css';

function App() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Сообщаем Телеграму, что приложение готово к показу
    WebApp.ready();
    // Разворачиваем на весь экран
    WebApp.expand();

    // Получаем данные пользователя (если запущен в ТГ)
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user);
    }
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>TON Strategy MVP</h1>

      <div className="card">
        {userData ? (
          <>
            <h2>Привет, {userData.first_name}! 👋</h2>
            <p>Твой ID: {userData.id}</p>
            <p>Платформа: {WebApp.platform}</p>
          </>
        ) : (
          <p>Запустите приложение внутри Telegram</p>
        )}
      </div>

      <button onClick={() => WebApp.showAlert(`Клик! Баланс: 0 TON`)}>
        Моя база
      </button>
    </div>
  );
}

export default App;
