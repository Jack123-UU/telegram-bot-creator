"""
Telegram Bot for TeleBot Sales Platform
Using aiogram framework with TRON payment integration
"""

import asyncio
import logging
import os
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime, timedelta

from aiogram import Bot, Dispatcher, Router, F
from aiogram.types import (
    Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton,
    ReplyKeyboardMarkup, KeyboardButton, WebAppInfo
)
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.redis import RedisStorage
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
import aiohttp
import redis.asyncio as redis

from vault_client import VaultClient

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
VAULT_ADDR = os.getenv("VAULT_ADDR", "http://localhost:8200")
VAULT_TOKEN = os.getenv("VAULT_TOKEN", "dev-root-token")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/1")

# Global variables
bot: Optional[Bot] = None
vault_client: Optional[VaultClient] = None

# FSM States
class UserStates(StatesGroup):
    main_menu = State()
    browsing_products = State()
    creating_order = State()
    waiting_payment = State()
    contact_support = State()

# Multilingual support
TEXTS = {
    "en": {
        "welcome": "🤖 Welcome to TeleBot Sales Platform!\n\nYour digital marketplace for premium accounts and services.",
        "main_menu": "📋 Main Menu",
        "products": "🛍️ Products",
        "my_orders": "📦 My Orders", 
        "balance": "💰 Balance",
        "contact": "💬 Contact Support",
        "language": "🌐 Language",
        "user_info": "👤 User Information",
        "back": "⬅️ Back",
        "cancel": "❌ Cancel",
        "loading": "⏳ Loading...",
        "error": "❌ An error occurred. Please try again.",
        "user_created": "✅ Account created successfully!",
        "order_created": "✅ Order created! Please make payment to complete.",
        "payment_address": "💳 Payment Address",
        "payment_amount": "💰 Amount to Pay",
        "payment_expires": "⏰ Payment expires in",
        "payment_qr": "📱 Scan QR code to pay",
        "minutes": "minutes",
        "no_products": "📭 No products available in this category.",
        "insufficient_stock": "❌ Insufficient stock available.",
        "order_expired": "⏰ Order expired. Please create a new order.",
        "payment_confirmed": "✅ Payment confirmed! Your order is being processed.",
        "product_delivered": "📦 Product delivered! Check your files.",
        "invalid_amount": "❌ Invalid amount. Please enter a valid number.",
        "api_login": "🔐 API Login",
        "session_files": "📁 Session Files"
    },
    "zh": {
        "welcome": "🤖 欢迎来到 TeleBot 销售平台！\n\n您的优质账号和服务数字市场。",
        "main_menu": "📋 主菜单",
        "products": "🛍️ 商品",
        "my_orders": "📦 我的订单",
        "balance": "💰 余额",
        "contact": "💬 联系客服",
        "language": "🌐 语言",
        "user_info": "👤 用户信息",
        "back": "⬅️ 返回",
        "cancel": "❌ 取消",
        "loading": "⏳ 加载中...",
        "error": "❌ 发生错误，请重试。",
        "user_created": "✅ 账户创建成功！",
        "order_created": "✅ 订单已创建！请付款完成购买。",
        "payment_address": "💳 付款地址",
        "payment_amount": "💰 付款金额",
        "payment_expires": "⏰ 付款将在",
        "payment_qr": "📱 扫描二维码付款",
        "minutes": "分钟后过期",
        "no_products": "📭 此分类暂无商品。",
        "insufficient_stock": "❌ 库存不足。",
        "order_expired": "⏰ 订单已过期，请创建新订单。",
        "payment_confirmed": "✅ 付款已确认！正在处理您的订单。",
        "product_delivered": "📦 商品已送达！请查看您的文件。",
        "invalid_amount": "❌ 无效金额。请输入有效数字。",
        "api_login": "🔐 API 登录",
        "session_files": "📁 会话文件"
    }
}

def get_text(lang: str, key: str) -> str:
    """Get localized text"""
    return TEXTS.get(lang, TEXTS["en"]).get(key, key)

def create_main_keyboard(lang: str = "en") -> ReplyKeyboardMarkup:
    """Create main menu keyboard"""
    keyboard = [
        [
            KeyboardButton(text=get_text(lang, "products")),
            KeyboardButton(text=get_text(lang, "my_orders"))
        ],
        [
            KeyboardButton(text=get_text(lang, "balance")),
            KeyboardButton(text=get_text(lang, "contact"))
        ],
        [
            KeyboardButton(text=get_text(lang, "language")),
            KeyboardButton(text=get_text(lang, "user_info"))
        ]
    ]
    
    return ReplyKeyboardMarkup(
        keyboard=keyboard,
        resize_keyboard=True,
        one_time_keyboard=False
    )

def create_products_keyboard(lang: str = "en") -> InlineKeyboardMarkup:
    """Create products category keyboard"""
    keyboard = [
        [
            InlineKeyboardButton(
                text=f"📁 {get_text(lang, 'session_files')}",
                callback_data="category:session"
            )
        ],
        [
            InlineKeyboardButton(
                text=f"🔐 {get_text(lang, 'api_login')}",
                callback_data="category:api"
            )
        ],
        [
            InlineKeyboardButton(
                text="🇺🇸 USA",
                callback_data="country:US"
            ),
            InlineKeyboardButton(
                text="🇬🇧 UK",
                callback_data="country:GB"
            )
        ],
        [
            InlineKeyboardButton(
                text="🇨🇳 China",
                callback_data="country:CN"
            ),
            InlineKeyboardButton(
                text="🇷🇺 Russia",
                callback_data="country:RU"
            )
        ],
        [
            InlineKeyboardButton(
                text=get_text(lang, "back"),
                callback_data="back:main"
            )
        ]
    ]
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def create_language_keyboard() -> InlineKeyboardMarkup:
    """Create language selection keyboard"""
    keyboard = [
        [
            InlineKeyboardButton(
                text="🇺🇸 English",
                callback_data="lang:en"
            ),
            InlineKeyboardButton(
                text="🇨🇳 中文",
                callback_data="lang:zh"
            )
        ],
        [
            InlineKeyboardButton(
                text="⬅️ Back",
                callback_data="back:main"
            )
        ]
    ]
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

async def api_request(method: str, endpoint: str, data: Optional[Dict] = None) -> Optional[Dict]:
    """Make API request to backend"""
    try:
        url = f"{API_BASE_URL}{endpoint}"
        
        async with aiohttp.ClientSession() as session:
            async with session.request(method, url, json=data) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(f"API request failed: {response.status} - {await response.text()}")
                    return None
                    
    except Exception as e:
        logger.error(f"API request error: {e}")
        return None

async def get_user_language(user_id: int) -> str:
    """Get user's preferred language"""
    # In production, this would fetch from database
    # For now, return default
    return "en"

async def create_or_get_user(message: Message) -> Optional[Dict]:
    """Create or get user from backend"""
    user_data = {
        "tg_id": message.from_user.id,
        "username": message.from_user.username,
        "first_name": message.from_user.first_name,
        "last_name": message.from_user.last_name,
        "language_code": message.from_user.language_code or "en"
    }
    
    return await api_request("POST", "/api/v1/users", user_data)

async def get_products(category: Optional[str] = None, country: Optional[str] = None) -> List[Dict]:
    """Get products from backend"""
    params = []
    if category:
        params.append(f"category={category}")
    if country:
        params.append(f"country={country}")
    
    query_string = "?" + "&".join(params) if params else ""
    result = await api_request("GET", f"/api/v1/products{query_string}")
    
    return result if result else []

# Bot handlers
router = Router()

@router.message(CommandStart())
async def start_handler(message: Message, state: FSMContext):
    """Handle /start command"""
    await state.set_state(UserStates.main_menu)
    
    # Create or get user
    user = await create_or_get_user(message)
    if not user:
        await message.answer(get_text("en", "error"))
        return
    
    lang = await get_user_language(message.from_user.id)
    
    # Welcome message with user info
    welcome_text = f"{get_text(lang, 'welcome')}\n\n"
    welcome_text += f"👤 ID: {user['tg_id']}\n"
    welcome_text += f"📅 Registered: {user['created_at'][:10]}\n"
    welcome_text += f"💰 Balance: ${user['balance']}\n"
    welcome_text += f"📦 Total Orders: {user['total_orders']}\n"
    welcome_text += f"💳 Total Spent: ${user['total_spent']}"
    
    await message.answer(
        welcome_text,
        reply_markup=create_main_keyboard(lang)
    )

@router.message(F.text.in_(["🛍️ Products", "🛍️ 商品"]))
async def products_handler(message: Message, state: FSMContext):
    """Handle products menu"""
    await state.set_state(UserStates.browsing_products)
    
    lang = await get_user_language(message.from_user.id)
    
    await message.answer(
        f"{get_text(lang, 'products')} - Select category:",
        reply_markup=create_products_keyboard(lang)
    )

@router.callback_query(F.data.startswith("category:"))
async def category_handler(callback: CallbackQuery, state: FSMContext):
    """Handle category selection"""
    category = callback.data.split(":")[1]
    lang = await get_user_language(callback.from_user.id)
    
    products = await get_products(category=category)
    
    if not products:
        await callback.message.edit_text(
            get_text(lang, "no_products"),
            reply_markup=create_products_keyboard(lang)
        )
        return
    
    # Create products list
    text = f"📦 {category.upper()} Products:\n\n"
    keyboard = []
    
    for product in products[:10]:  # Limit to 10 products
        text += f"• {product['name']} - ${product['price']}\n"
        text += f"  Stock: {product['stock']} | {product['country'] or 'Global'}\n\n"
        
        keyboard.append([
            InlineKeyboardButton(
                text=f"Buy {product['name']} - ${product['price']}",
                callback_data=f"buy:{product['id']}"
            )
        ])
    
    keyboard.append([
        InlineKeyboardButton(
            text=get_text(lang, "back"),
            callback_data="back:products"
        )
    ])
    
    await callback.message.edit_text(
        text,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=keyboard)
    )

@router.callback_query(F.data.startswith("country:"))
async def country_handler(callback: CallbackQuery, state: FSMContext):
    """Handle country selection"""
    country = callback.data.split(":")[1]
    lang = await get_user_language(callback.from_user.id)
    
    products = await get_products(country=country)
    
    if not products:
        await callback.message.edit_text(
            get_text(lang, "no_products"),
            reply_markup=create_products_keyboard(lang)
        )
        return
    
    # Create products list
    text = f"🌍 {country} Products:\n\n"
    keyboard = []
    
    for product in products[:10]:
        text += f"• {product['name']} - ${product['price']}\n"
        text += f"  Category: {product['category']} | Stock: {product['stock']}\n\n"
        
        keyboard.append([
            InlineKeyboardButton(
                text=f"Buy {product['name']} - ${product['price']}",
                callback_data=f"buy:{product['id']}"
            )
        ])
    
    keyboard.append([
        InlineKeyboardButton(
            text=get_text(lang, "back"),
            callback_data="back:products"
        )
    ])
    
    await callback.message.edit_text(
        text,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=keyboard)
    )

@router.callback_query(F.data.startswith("buy:"))
async def buy_handler(callback: CallbackQuery, state: FSMContext):
    """Handle product purchase"""
    product_id = int(callback.data.split(":")[1])
    lang = await get_user_language(callback.from_user.id)
    
    # Create order
    order_data = {
        "tg_id": callback.from_user.id,
        "product_id": product_id,
        "quantity": 1
    }
    
    order = await api_request("POST", "/api/v1/orders", order_data)
    
    if not order:
        await callback.answer(get_text(lang, "error"))
        return
    
    await state.set_state(UserStates.waiting_payment)
    await state.update_data(order_id=order["id"])
    
    # Calculate expiry time
    expires_at = datetime.fromisoformat(order["expires_at"].replace("Z", "+00:00"))
    time_left = expires_at - datetime.utcnow().replace(tzinfo=expires_at.tzinfo)
    minutes_left = int(time_left.total_seconds() / 60)
    
    # Payment information
    payment_text = f"💳 {get_text(lang, 'order_created')}\n\n"
    payment_text += f"🔢 Order ID: {order['id']}\n"
    payment_text += f"💰 {get_text(lang, 'payment_amount')}: {order['total_amount']} USDT\n"
    payment_text += f"📍 {get_text(lang, 'payment_address')}:\n"
    payment_text += f"`{order['payment_address']}`\n\n"
    payment_text += f"⏰ {get_text(lang, 'payment_expires')} {minutes_left} {get_text(lang, 'minutes')}\n\n"
    payment_text += f"⚠️ Send EXACTLY {order['total_amount']} USDT to complete payment!"
    
    keyboard = [
        [
            InlineKeyboardButton(
                text="🔄 Check Payment",
                callback_data=f"check_payment:{order['id']}"
            )
        ],
        [
            InlineKeyboardButton(
                text=get_text(lang, "cancel"),
                callback_data="cancel_order"
            )
        ]
    ]
    
    await callback.message.edit_text(
        payment_text,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=keyboard),
        parse_mode=ParseMode.MARKDOWN
    )

@router.callback_query(F.data.startswith("check_payment:"))
async def check_payment_handler(callback: CallbackQuery, state: FSMContext):
    """Check payment status"""
    order_id = int(callback.data.split(":")[1])
    lang = await get_user_language(callback.from_user.id)
    
    # Get order status from backend
    order = await api_request("GET", f"/api/v1/orders/{order_id}")
    
    if not order:
        await callback.answer(get_text(lang, "error"))
        return
    
    if order["status"] == "paid":
        await callback.message.edit_text(
            f"✅ {get_text(lang, 'payment_confirmed')}\n\n"
            f"📦 Your order is being processed and will be delivered shortly.",
            reply_markup=None
        )
        await state.clear()
        
    elif order["status"] == "completed":
        await callback.message.edit_text(
            f"🎉 {get_text(lang, 'product_delivered')}\n\n"
            f"Order #{order['id']} completed successfully!",
            reply_markup=None
        )
        await state.clear()
        
    elif order["status"] == "expired":
        await callback.message.edit_text(
            get_text(lang, "order_expired"),
            reply_markup=create_products_keyboard(lang)
        )
        await state.set_state(UserStates.browsing_products)
        
    else:
        await callback.answer("⏳ Payment not yet detected. Please wait...")

@router.message(F.text.in_(["🌐 Language", "🌐 语言"]))
async def language_handler(message: Message):
    """Handle language selection"""
    await message.answer(
        "🌐 Select your language / 选择语言:",
        reply_markup=create_language_keyboard()
    )

@router.callback_query(F.data.startswith("lang:"))
async def set_language_handler(callback: CallbackQuery):
    """Set user language"""
    lang = callback.data.split(":")[1]
    
    # In production, save language to database
    await callback.message.edit_text(
        f"✅ Language set to {'English' if lang == 'en' else '中文'}",
        reply_markup=create_main_keyboard(lang)
    )

@router.callback_query(F.data.startswith("back:"))
async def back_handler(callback: CallbackQuery, state: FSMContext):
    """Handle back navigation"""
    destination = callback.data.split(":")[1]
    lang = await get_user_language(callback.from_user.id)
    
    if destination == "main":
        await state.set_state(UserStates.main_menu)
        await callback.message.edit_text(
            get_text(lang, "main_menu"),
            reply_markup=create_main_keyboard(lang)
        )
    elif destination == "products":
        await state.set_state(UserStates.browsing_products)
        await callback.message.edit_text(
            f"{get_text(lang, 'products')} - Select category:",
            reply_markup=create_products_keyboard(lang)
        )

@router.message(F.text.in_(["👤 User Information", "👤 用户信息"]))
async def user_info_handler(message: Message):
    """Handle user information request"""
    user = await api_request("GET", f"/api/v1/users/{message.from_user.id}")
    
    if not user:
        await message.answer(get_text("en", "error"))
        return
    
    lang = await get_user_language(message.from_user.id)
    
    info_text = f"👤 {get_text(lang, 'user_info')}\n\n"
    info_text += f"🆔 Telegram ID: {user['tg_id']}\n"
    info_text += f"👤 Username: @{user['username'] or 'N/A'}\n"
    info_text += f"📅 Registered: {user['created_at'][:10]}\n"
    info_text += f"💰 Balance: ${user['balance']}\n"
    info_text += f"📦 Total Orders: {user['total_orders']}\n"
    info_text += f"💳 Total Spent: ${user['total_spent']}\n"
    info_text += f"🌐 Language: {user['language_code']}"
    
    await message.answer(info_text)

async def main():
    """Main bot function"""
    global bot, vault_client
    
    # Initialize Vault client
    vault_client = VaultClient(VAULT_ADDR, VAULT_TOKEN)
    await vault_client.initialize_secrets()
    
    # Get bot token from Vault
    bot_token = await vault_client.get_secret("bot/token")
    if not bot_token:
        logger.error("Bot token not found in Vault")
        return
    
    # Initialize Redis storage for FSM
    redis_client = redis.from_url(REDIS_URL)
    storage = RedisStorage(redis_client)
    
    # Initialize bot and dispatcher
    bot = Bot(
        token=bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    
    dp = Dispatcher(storage=storage)
    dp.include_router(router)
    
    # Start polling
    logger.info("Starting Telegram bot...")
    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()
        await vault_client.close()
        await redis_client.close()

if __name__ == "__main__":
    asyncio.run(main())