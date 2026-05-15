import asyncio
import logging
import uuid
from datetime import datetime, timedelta
import sqlite3
import json
import time
import os
import aiohttp
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, PreCheckoutQuery, LabeledPrice, CallbackQuery
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State

import config

logging.basicConfig(level=logging.INFO)
bot = Bot(token=config.BOT_TOKEN)
dp = Dispatcher()

ADMIN_ID = 7845891363

class PromoState(StatesGroup):
    waiting_for_code = State()
    admin_creating_code = State()
    admin_creating_days = State()
    admin_mailing = State()

def init_db():
    conn = sqlite3.connect('/root/vpn_bot.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tg_id INTEGER,
            client_uuid TEXT,
            email TEXT,
            expiry_time INTEGER,
            plan_name TEXT,
            status TEXT DEFAULT 'active',
            ip_limit INTEGER DEFAULT 1
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def db_query(query, params=(), fetchall=False, commit=False):
    conn = sqlite3.connect('/root/vpn_bot.db')
    cursor = conn.cursor()
    cursor.execute(query, params)
    res = cursor.fetchall() if fetchall else cursor.fetchone()
    if commit:
        conn.commit()
    conn.close()
    return res

async def get_official_xui_link(client_email: str):
    client_email = str(client_email).strip()
    inbound_path_id = str(config.INBOUND_ID).strip()
    base_url = config.XUI_URL.rstrip('/')
    web_path = config.XUI_WEB_BASE_PATH.strip('/')
    link_url = f"{base_url}/{web_path}/panel/api/inbounds/getClientLinks/{inbound_path_id}/{client_email}" if web_path else f"{base_url}/panel/api/inbounds/getClientLinks/{inbound_path_id}/{client_email}"
    headers = {"Authorization": f"Bearer {config.XUI_TOKEN}"}
    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False), headers=headers) as session:
        try:
            async with session.get(link_url, timeout=5) as response:
                if response.status == 200:
                    res_json = await response.json()
                    if res_json.get("success") and res_json.get("obj"):
                        obj_data = res_json.get("obj")
                        return str(obj_data) if isinstance(obj_data, list) and len(obj_data) > 0 else str(obj_data)
        except Exception as e:
            logging.error(f"Исключение при вызове getClientLinks: {e}")
    return None

async def api_add_client(tg_id: int, days: int, plan_name: str, ip_limit: int = 1):
    base_url, web_path = config.XUI_URL.rstrip('/'), config.XUI_WEB_BASE_PATH.strip('/')
    add_client_url = f"{base_url}/{web_path}/panel/api/inbounds/addClient" if web_path else f"{base_url}/panel/api/inbounds/addClient"
    headers = {"Authorization": f"Bearer {config.XUI_TOKEN}", "Content-Type": "application/json"}
    client_uuid, client_email = str(uuid.uuid4()), f"{tg_id}_{uuid.uuid4().hex[:4]}"
    expiry_timestamp = int((datetime.now() + timedelta(days=days)).timestamp() * 1000)
    
    payload = {
        "id": config.INBOUND_ID,
        "settings": f'{{"clients": [{{"id": "{client_uuid}", "email": "{client_email}", "limitIp": {int(ip_limit)}, "totalGB": 0, "expiryTime": {expiry_timestamp}, "enable": true, "tgId": "", "subId": ""}}]}}'
    }
    
    connector = aiohttp.TCPConnector(ssl=False)
    async with aiohttp.ClientSession(connector=connector, headers=headers) as session:
        try:
            async with session.post(add_client_url, json=payload, timeout=10) as response:
                if response.status == 200:
                    res_json = await response.json()
                    if res_json.get("success"):
                        db_query("INSERT INTO subscriptions (tg_id, client_uuid, email, expiry_time, plan_name, ip_limit) VALUES (?, ?, ?, ?, ?, ?)",
                                 (tg_id, client_uuid, client_email, expiry_timestamp, plan_name, ip_limit), commit=True)
                        ready_link = await get_official_xui_link(client_email)
                        if ready_link and "vless://" in ready_link:
                            return {"success": True, "link": ready_link}
                        else:
                            sub_url = f"{base_url}/{web_path}/sub/{client_uuid}" if web_path else f"{base_url}/sub/{client_uuid}"
                            return {"success": True, "link": sub_url}
                    else:
                        logging.error(f"Панель отклонила запрос создания: {res_json}")
        except Exception as e:
            logging.error(f"Ошибка добавления клиента: {e}")
    return {"success": False}

async def api_update_client(client_uuid: str, client_email: str, expiry_time: int, ip_limit: int):
    base_url, web_path = config.XUI_URL.rstrip('/'), config.XUI_WEB_BASE_PATH.strip('/')
    add_url = f"{base_url}/{web_path}/panel/api/inbounds/addClient" if web_path else f"{base_url}/panel/api/inbounds/addClient"
    headers = {"Authorization": f"Bearer {config.XUI_TOKEN}", "Content-Type": "application/json"}
    
    payload = {
        "id": config.INBOUND_ID,
        "settings": f'{{"clients": [{{"id": "{str(client_uuid)}", "email": "{str(client_email)}", "limitIp": {int(ip_limit)}, "totalGB": 0, "expiryTime": {int(expiry_time)}, "enable": true, "tgId": "", "subId": ""}}]}}'
    }
    
    await api_delete_client(client_uuid)
    
    connector = aiohttp.TCPConnector(ssl=False)
    async with aiohttp.ClientSession(connector=connector, headers=headers) as session:
        try:
            async with session.post(add_url, json=payload, timeout=10) as response:
                if response.status == 200:
                    res_json = await response.json()
                    return res_json.get("success", False)
        except Exception as e:
            logging.error(f"Ошибка изменения параметров клиента: {e}")
    return False

async def api_delete_client(client_uuid: str):
    base_url, web_path = config.XUI_URL.rstrip('/'), config.XUI_WEB_BASE_PATH.strip('/')
    del_url = f"{base_url}/{web_path}/panel/api/inbounds/{str(config.INBOUND_ID).strip()}/delClient/{client_uuid}" if web_path else f"{base_url}/panel/api/inbounds/{str(config.INBOUND_ID).strip()}/delClient/{client_uuid}"
    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False), headers={"Authorization": f"Bearer {config.XUI_TOKEN}"}) as session:
        try:
            async with session.post(del_url, timeout=5) as response:
                res_json = await response.json()
                return res_json.get("success", False)
        except: return False

def get_main_keyboard(user_id: int):
    buttons = [
        [InlineKeyboardButton(text="🛍 Купить VPN подписку", callback_data="buy_menu_open")],
        [InlineKeyboardButton(text="👤 Профиль", callback_data="main_profile"), InlineKeyboardButton(text="🔑 Мои Ключи", callback_data="menu_active")],
        [InlineKeyboardButton(text="🎟 Ввести промокод", callback_data="use_promo"), InlineKeyboardButton(text="🆘 Помощь", callback_data="main_help")]
    ]
    if user_id == ADMIN_ID:
        buttons.append([InlineKeyboardButton(text="👑 Admin Панель", callback_data="admin_panel")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

@dp.message(CommandStart())
async def cmd_start(message: Message):
    await message.answer("👋 **Привет!**\nВыбирайте интересующие действия с помощью кнопок меню:", reply_markup=get_main_keyboard(message.from_user.id), parse_mode="Markdown")

@dp.callback_query(F.data == "to_main")
async def to_main(call: CallbackQuery):
    await call.answer()
    await call.message.answer("👋 Главное меню бота:", reply_markup=get_main_keyboard(call.from_user.id))

@dp.callback_query(F.data == "main_profile")
async def view_profile(call: CallbackQuery):
    await call.answer()
    sub_count_row = db_query("SELECT COUNT(*) FROM subscriptions WHERE tg_id = ? AND status = 'active'", (call.from_user.id,))
    sub_count = sub_count_row if sub_count_row else 0
    text = f"👤 **Ваш профиль:**\n\n├ **Имя:** {call.from_user.first_name}\n├ **ID:** `{call.from_user.id}`\n└ **Активных подписок:** `{sub_count}` шт."
    await call.message.answer(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="⬅ Меню", callback_data="to_main")]]), parse_mode="Markdown")

@dp.callback_query(F.data == "main_help")
async def view_help(call: CallbackQuery):
    await call.answer()
    await call.message.answer("🆘 **Тех. поддержка:** @code81\nНапишите администратору для решения любых вопросов.", reply_markup=InlineKeyboardMarkup(inline_keyboard=[[[InlineKeyboardButton(text="⬅ Меню", callback_data="to_main")]]]))

@dp.callback_query(F.data == "buy_menu_open")
async def view_buy_options(call: CallbackQuery):
    await call.answer()
    buttons = [
        [InlineKeyboardButton(text="💎 1 месяц (50 Stars)", callback_data="buy_plan_1")],
        [InlineKeyboardButton(text="🔥 3 месяца (130 Stars)", callback_data="buy_plan_3")],
        [InlineKeyboardButton(text="👑 1 год (400 Stars)", callback_data="buy_plan_12")]
    ]
    if call.from_user.id == ADMIN_ID:
        buttons.insert(0, [InlineKeyboardButton(text="🛠 Бесплатный тест (Для Админа)", callback_data="test_free")])
    await call.message.answer("🛒 **Выберите тарифный план VPN:**", reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons), parse_mode="Markdown")

@dp.callback_query(F.data == "test_free")
async def handle_test_free(call: CallbackQuery):
    await call.answer()
    if call.from_user.id != ADMIN_ID: return
    res = await api_add_client(tg_id=call.from_user.id, days=30, plan_name="Тест (Админ)", ip_limit=1)
    if res.get("success"):
        await call.message.answer(f"✅ **Тест создан!**\nСсылка (Лимит IP: 1):\n`{res['link']}`", parse_mode="Markdown")
    else:
        await call.message.answer("❌ Ошибка панели при создании подписки.")

@dp.callback_query(F.data.startswith("buy_plan_"))
async def handle_buy_plans(call: CallbackQuery):
    await call.answer()
    plan_type = call.data.split("_")[-1]
    title, price, payload = ("VPN 1 месяц", 50, "vpn_30") if plan_type == "1" else ("VPN 3 месяца", 130, "vpn_90") if plan_type == "3" else ("VPN 1 год", 400, "vpn_365")
    await bot.send_invoice(chat_id=call.message.chat.id, title=title, description="Доступ к приватному VPN-серверу", payload=f"{payload}_{call.from_user.id}", provider_token="", currency="XTR", prices=[LabeledPrice(label="Telegram Stars", amount=price)])

@dp.pre_checkout_query()
async def process_pre_checkout(pre_checkout_query: PreCheckoutQuery):
    await bot.answer_pre_checkout_query(pre_checkout_query.id, ok=True)

@dp.message(F.successful_payment)
async def process_successful_payment(message: Message):
    invoice_payload = message.successful_payment.invoice_payload
    
    if "vpn_dev_" in invoice_payload:
        sub_id = int(invoice_payload.split("_")[-1])
        row = db_query("SELECT client_uuid, email, expiry_time, ip_limit FROM subscriptions WHERE id = ?", (sub_id,))
        if row:
            new_limit = int(row) + 1
            await api_update_client(row, row, row, new_limit)
            db_query("UPDATE subscriptions SET ip_limit = ? WHERE id = ?", (new_limit, sub_id), commit=True)
            await message.answer(f"🎉 Лимит устройств успешно увеличен! Текущий лимит: **{new_limit} IP**.")
        return
        
    if "vpn_renew_pay_" in invoice_payload:
        parts = invoice_payload.split("_")
        days, sub_id = int(parts[-2]), int(parts[-1])
        row = db_query("SELECT client_uuid, email, expiry_time, ip_limit FROM subscriptions WHERE id = ?", (sub_id,))
        if row:
            new_expiry = max(int(row), int(time.time() * 1000)) + (days * 24 * 60 * 60 * 1000)
            await api_update_client(row, row, new_expiry, int(row))
            db_query("UPDATE subscriptions SET expiry_time = ? WHERE id = ?", (new_expiry, sub_id), commit=True)
            await message.answer("🎉 Подписка успешно продлена на сервере!")
        return

    days, label = (30, "Подписка 1 мес.") if "vpn_30" in invoice_payload else (90, "Подписка 3 мес.") if "vpn_90" in invoice_payload else (365, "Подписка 1 год.")
    res = await api_add_client(tg_id=message.from_user.id, days=days, plan_name=label, ip_limit=1)
    if res.get("success"):
        await message.answer(f"🚀 **VPN Активирован!**\nСсылка (Лимит IP: 1):\n`{res['link']}`", parse_mode="Markdown")

@dp.callback_query(F.data == "menu_active")
async def view_active_subs(call: CallbackQuery):
    await call.answer()
    rows = db_query("SELECT id, expiry_time FROM subscriptions WHERE tg_id = ? AND status = 'active'", (call.from_user.id,), fetchall=True)
    if not rows:
        await call.message.answer("😔 У вас пока нет активных VPN подписок.")
        return
    buttons = [[InlineKeyboardButton(text=f"🔑 Ключ #{r} (до {datetime.fromtimestamp(r/1000).strftime('%d.%m.%Y')})", callback_data=f"sub_manage_{r}")] for r in rows]
    await call.message.answer("📋 Ваши ключи подписок:", reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))

@dp.callback_query(F.data.startswith("sub_manage_"))
async def manage_sub(call: CallbackQuery):
    await call.answer()
    sub_id = int(call.data.split("_")[-1])
    row = db_query("SELECT id, client_uuid, email, expiry_time, plan_name, ip_limit FROM subscriptions WHERE id = ?", (sub_id,))
    if not row: return
    
    client_uuid, client_email, expiry_time, plan_name, ip_limit = row, row, row, row, row
    vless_link = await get_official_xui_link(client_email) or f"{config.XUI_URL}/sub/{client_uuid}"
    
    text = f"⚙ **Управление ключом #{sub_id}**\n\n├ Тариф: {plan_name}\n├ Лимит устройств: **{ip_limit} IP**\n├ Действует до: `{datetime.fromtimestamp(expiry_time/1000).strftime('%d.%m.%Y %H:%M')}`\n\nСсылка:\n`{vless_link}`"
    
    buttons = [
        [InlineKeyboardButton(text="📱 Добавить устройство (25 Stars)", callback_data=f"sub_add_device_{sub_id}")],
        [InlineKeyboardButton(text="🔄 Продлить подписку", callback_data=f"sub_renew_menu_{sub_id}")],
        [InlineKeyboardButton(text="❌ Отменить подписку", callback_data=f"sub_cancel_conf_{sub_id}")]
    ]
    if call.from_user.id == ADMIN_ID:
        buttons.insert(1, [InlineKeyboardButton(text="🛠 Добавить устройство (БЕСПЛАТНО ТЕСТ)", callback_data=f"admin_free_dev_{sub_id}")])
        buttons.insert(3, [InlineKeyboardButton(text="🛠 Продлить на 1 мес (БЕСПЛАТНО ТЕСТ)", callback_data=f"admin_free_ren_{sub_id}")])
        
    await call.message.answer(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons), parse_mode="Markdown")

@dp.callback_query(F.data.startswith("admin_free_dev_"))
async def admin_free_device(call: CallbackQuery):
    await call.answer()
    sub_id = int(call.data.split("_")[-1])
    row = db_query("SELECT client_uuid, email, expiry_time, ip_limit FROM subscriptions WHERE id = ?", (sub_id,))
    if row:
        new_limit = int(row) + 1
        await api_update_client(row, row, row, new_limit)
        db_query("UPDATE subscriptions SET ip_limit = ? WHERE id = ?", (new_limit, sub_id), commit=True)
        await call.message.answer(f"🛠 [Тест Админ] Лимит успешно увеличен до **{new_limit} IP**.")

@dp.callback_query(F.data.startswith("admin_free_ren_"))
async def admin_free_renew(call: CallbackQuery):
    await call.answer()
    sub_id = int(call.data.split("_")[-1])
    row = db_query("SELECT client_uuid, email, expiry_time, ip_limit FROM subscriptions WHERE id = ?", (sub_id,))
    if row:
        new_expiry = max(int(row), int(time.time() * 1000)) + (30 * 24 * 60 * 60 * 1000)
        await api_update_client(row, row, new_expiry, int(row))
        db_query("UPDATE subscriptions SET expiry_time = ? WHERE id = ?", (new_expiry, sub_id), commit=True)
        await call.message.answer("🛠 [Тест Admin] Ключ успешно продлен на 30 дней.")

@dp.callback_query(F.data.startswith("sub_add_device_"))
async def bill_device(call: CallbackQuery):
    await call.answer()
    sub_id = call.data.split("_")[-1]
    await bot.send_invoice(chat_id=call.message.chat.id, title="+1 Устройство", description="Увеличение лимита одновременно подключенных IP на 1", payload=f"vpn_dev_{sub_id}", provider_token="", currency="XTR", prices=[LabeledPrice(label="Доп. IP лимит", amount=25)])

@dp.callback_query(F.data.startswith("sub_renew_menu_"))
async def view_renew_menu(call: CallbackQuery):
    await call.answer()
    sub_id = call.data.split("_")[-1]
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="💎 1 месяц (50 Stars)", callback_data=f"execute_renew_1_{sub_id}")],
        [InlineKeyboardButton(text="🔥 3 месяца (130 Stars)", callback_data=f"execute_renew_3_{sub_id}")],
        [InlineKeyboardButton(text="👑 1 год (400 Stars)", callback_data=f"execute_renew_12_{sub_id}")]
    ])
    await call.message.answer("🔄 **Выберите срок продления вашей подписки:**", reply_markup=kb, parse_mode="Markdown")

@dp.callback_query(F.data.startswith("execute_renew_"))
async def process_renew_invoice(call: CallbackQuery):
    await call.answer()
    parts = call.data.split("_")
    plan, sub_id = parts[-2], parts[-1]
    days, price = (30, 50) if plan == "1" else (90, 130) if plan == "3" else (365, 400)
    await bot.send_invoice(chat_id=call.message.chat.id, title="Продление VPN", description=f"Продление подписки на {days} дней", payload=f"vpn_renew_pay_{days}_{sub_id}", provider_token="", currency="XTR", prices=[LabeledPrice(label="Продление", amount=price)])

@dp.callback_query(F.data.startswith("sub_cancel_conf_"))
async def confirm_cancel(call: CallbackQuery):
    await call.answer()
    kb = InlineKeyboardMarkup(inline_keyboard=[[[InlineKeyboardButton(text="⚠️ ДА, ТОЧНО УДАЛИТЬ", callback_data=f"sub_delete_execute_{call.data.split('_')[-1]}")]]])
    await call.message.answer("❓ Вы уверены, что хотите полностью удалить этот ключ?", reply_markup=kb)

@dp.callback_query(F.data.startswith("sub_delete_execute_"))
async def execute_delete(call: CallbackQuery):
    await call.answer()
    sub_id = int(call.data.split("_")[-1])
    row = db_query("SELECT client_uuid FROM subscriptions WHERE id = ?", (sub_id,))
    if row:
        await api_delete_client(row)
        db_query("DELETE FROM subscriptions WHERE id = ?", (sub_id,), commit=True)
        await call.message.answer("✅ Подписка аннулирована, ссылка полностью отключена.")

# --- ПРОМОКОДЫ ---
@dp.callback_query(F.data == "use_promo")
async def promo_input(call: CallbackQuery, state: FSMContext):
    await call.answer()
    await call.message.answer("🎟 **Введите промокод:**")
    await state.set_state(PromoState.waiting_for_code)

@dp.message(PromoState.waiting_for_code)
async def promo_process(message: Message, state: FSMContext):
    code = message.text.strip()
    await state.clear()
    
    promo = db_query("SELECT days, uses FROM promo_codes WHERE code = ?", (code,))
    if not promo:
        await message.answer("❌ Промокод не существует.")
        return
        
    already_used = db_query("SELECT tg_id FROM used_promo WHERE tg_id = ? AND code = ?", (message.from_user.id, code))
    if already_used:
        await message.answer("❌ Вы уже активировали данный промокод.")
        return
        
    if int(promo) <= 0:
        await message.answer("❌ Количество активаций данного промокода исчерпано.")
        return
        
    res = await api_add_client(tg_id=message.from_user.id, days=int(promo), plan_name=f"Промокод ({promo} дн.)", ip_limit=1)
    if res.get("success"):
        db_query("UPDATE promo_codes SET uses = uses - 1 WHERE code = ?", (code,), commit=False)
        db_query("INSERT INTO used_promo (tg_id, code) VALUES (?, ?)", (message.from_user.id, code), commit=True)
        await message.answer(f"🎉 Промокод успешно активирован на **{promo} дней**!\nВаша ссылка (Лимит IP: 1):\n`{res['link']}`", parse_mode="Markdown")
    else:
        await message.answer("❌ Ошибка API при создании клиента по промокоду.")

# --- РАСШИРЕННАЯ АДМИН ПАНЕЛЬ ---
@dp.callback_query(F.data == "admin_panel")
async def view_admin(call: CallbackQuery):
    await call.answer()
    if call.from_user.id != ADMIN_ID: return
    
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="➕ Создать промокод", callback_data="admin_create_promo")],
        [InlineKeyboardButton(text="📊 Статистика сервера", callback_data="admin_stats")],
        [InlineKeyboardButton(text="📢 Сделать рассылку", callback_data="admin_mail_start")]
    ])
    await call.message.answer("👑 **Панель управления администратора:**", reply_markup=kb)

@dp.callback_query(F.data == "admin_stats")
async def view_admin_stats(call: CallbackQuery):
    await call.answer()
    if call.from_user.id != ADMIN_ID: return
    
    # Чтение аптайма и ОЗУ сервера из Linux директорий напрямую
    try:
        with open('/proc/uptime', 'r') as f:
            uptime_seconds = float(f.readline().split()[0])
            uptime_string = str(timedelta(seconds=int(uptime_seconds)))
        
        with open('/proc/meminfo', 'r') as f:
            lines = f.readlines()
            mem_total = int(lines[0].split()[1]) // 1024
            mem_free = int(lines[1].split()[1]) // 1024
            mem_used = mem_total - mem_free
    except:
        uptime_string, mem_used, mem_total = "Недоступно", 0, 0
        
    total_users = db_query("SELECT COUNT(DISTINCT tg_id) FROM subscriptions WHERE status='active'")
    total_keys = db_query("SELECT COUNT(*) FROM subscriptions WHERE status='active'")
    
    text = (
        f"📊 **Системная статистика VPN сервера:**\n\n"
        f"├ **Аптайм сервера:** `{uptime_string}`\n"
        f"├ **ОЗУ Сервера:** `{mem_used} MB` / `{mem_total} MB`\n"
        f"├ **Уникальных клиентов:** `{total_users if total_users else 0}` чел.\n"
        f"└ **Всего выданных VLESS ключей:** `{total_keys if total_keys else 0}` шт."
    )
    await call.message.answer(text, parse_mode="Markdown")

@dp.callback_query(F.data == "admin_mail_start")
async def start_mailing(call: CallbackQuery, state: FSMContext):
    await call.answer()
    if call.from_user.id != ADMIN_ID: return
    await call.message.answer("📢 **Введите текст сообщения для массовой рассылки:**\n\n_(Внимание: сообщение будет мгновенно отправлено всем пользователям из базы бота)_")
    await state.set_state(PromoState.admin_mailing)

@dp.message(PromoState.admin_mailing)
async def process_mailing(message: Message, state: FSMContext):
    if message.from_user.id != ADMIN_ID: return
    mail_text = message.text
    await state.clear()
    
    # Получаем уникальные ID всех пользователей бота
    users = db_query("SELECT DISTINCT tg_id FROM subscriptions", fetchall=True)
    if not users:
        await message.answer("❌ База данных пользователей пуста.")
        return
        
    await message.answer(f"⏳ Начинаю отправку сообщения для `{len(users)}` пользователей...")
    
    success_count = 0
    for u in users:
        try:
            await bot.send_message(chat_id=int(u[0]), text=mail_text)
            success_count += 1
            await asyncio.sleep(0.05) # Безопасная микропауза для лимитов Telegram API
        except Exception:
            pass
            
    await message.answer(f"✅ **Рассылка завершена!**\nУспешно доставлено: `{success_count}` / `{len(users)}` пользователям.")

@dp.callback_query(F.data == "admin_create_promo")
async def admin_promo_code(call: CallbackQuery, state: FSMContext):
    await call.answer()
    if call.from_user.id != ADMIN_ID: return
    await call.message.answer("Введите название нового промокода (слово):")
    await state.set_state(PromoState.admin_creating_code)

@dp.message(PromoState.admin_creating_code)
async def admin_set_code(message: Message, state: FSMContext):
    await state.update_data(new_code=message.text.strip())
    await message.answer("На сколько дней будет выдаваться подписка по этому промокоду?")
    await state.set_state(PromoState.admin_creating_days)

@dp.message(PromoState.admin_creating_days)
async def admin_finalize_promo(message: Message, state: FSMContext):
    if not message.text.isdigit():
        await message.answer("Введите число.")
        return
    days = int(message.text)
    data = await state.get_data()
    code = data['new_code']
    await state.clear()
    
    db_query("INSERT OR REPLACE INTO promo_codes (code, days, uses) VALUES (?, ?, 9999)", (code, days), commit=True)
    await message.answer(f"✅ Промокод `{code}` успешно создан на **{days} дней** с бесконечными активациями!")

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
