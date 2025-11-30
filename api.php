<?php
/ --- ЛЕЧИМ CORS (Разрешаем доступ отовсюду) ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Если браузер просто спрашивает "можно ли?", отвечаем "можно" и выходим
if ($_SERVER['REQUEST METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// --- НАСТРОЙКИ БАЗЫ ДАННЫХ (Взять в панели хостинга) ---
$host = 'localhost';      // Обычно localhost
$db   = 'f1198077_ton'; // Например: a01234_casino
$user = 'f1198077_ton'; // Например: a01234_admin
$pass = 'slawa2004';   // Пароль который ты создавал

// Подключение к БД
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(['error' => 'Ошибка подключения к БД']));
}

// Получаем данные от игры
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';
$tg_id = $input['tg_id'] ?? 0;
$username = $input['username'] ?? 'Player';

if (!$tg_id) {
    die(json_encode(['error' => 'No ID']));
}

// --- ЛОГИКА ---

if ($action === 'get_user') {
    // 1. Пробуем найти пользователя
    $stmt = $pdo->prepare("SELECT balance FROM users WHERE tg_id = ?");
    $stmt->execute([$tg_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Пользователь есть, возвращаем баланс
        echo json_encode(['balance' => (int)$user['balance']]);
    } else {
        // Новичок! Создаем запись с 100 монетами
        $stmt = $pdo->prepare("INSERT INTO users (tg_id, username, balance) VALUES (?, ?, 100)");
        $stmt->execute([$tg_id, $username]);
        echo json_encode(['balance' => 100]);
    }
}

elseif ($action === 'update_balance') {
    // Обновляем баланс после игры
    $new_balance = (int)$input['balance'];
    
    // Защита от накрутки (простая): нельзя сделать баланс отрицательным
    if ($new_balance < 0) $new_balance = 0;

    $stmt = $pdo->prepare("UPDATE users SET balance = ? WHERE tg_id = ?");
    $stmt->execute([$new_balance, $tg_id]);
    
    echo json_encode(['status' => 'ok', 'balance' => $new_balance]);
}

else {
    echo json_encode(['error' => 'Unknown action']);
}
?>