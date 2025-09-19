import os
import asyncio
import logging
import aiohttp
from aiogram import Bot, Dispatcher, Router
from aiogram.types import Message, BotCommand, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.filters import Command, Text
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.redis import RedisStorage
from aiohttp import web
from aiohttp.web import Application
import redis.asyncio as redis
import json
from typing import Optional, Dict, Any
import structlog
from datetime import datetime

# Configure structured logging
logging.basicConfig(level=logging.INFO)
logger = structlog.get_logger()

# Bot configuration
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:8000")
INTERNAL_API_TOKEN = os.getenv("INTERNAL_API_TOKEN", "dev-internal-token")

# Initialize Redis storage for FSM
redis_client = redis.from_url(REDIS_URL)
storage = RedisStorage(redis_client)

# Initialize bot and dispatcher
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(storage=storage)
router = Router()


class OrderStates(StatesGroup):
    """States for order flow"""
    browsing_products = State()
    selecting_quantity = State()
    confirming_order = State()
    waiting_payment = State()


class UserManager:
    """Manage user data and interactions"""
    
    @staticmethod
    async def create_or_get_user(tg_id: int, username: str = None, first_name: str = None) -> Dict[str, Any]:
        """Create or retrieve user from backend"""
        try:
            # Call backend API to create/get user
            async with aiohttp.ClientSession() as session:
                user_data = {
                    "tg_id": tg_id,
                    "username": username,
                    "first_name": first_name,
                    "registered_at": datetime.now().isoformat()
                }
                headers = {"X-Internal-Token": INTERNAL_API_TOKEN}
                
                async with session.post(
                    f"{BACKEND_API_URL}/api/v1/users",
                    json=user_data,
                    headers=headers
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
                    else:
                        logger.error("Failed to create/get user", status=resp.status)
                        return {"tg_id": tg_id, "balance": 0, "total_orders": 0}
        except Exception as e:
            logger.error("Error creating user", error=str(e))
            return {"tg_id": tg_id, "balance": 0, "total_orders": 0}


class ProductManager:
    """Manage product catalog and inventory"""
    
    @staticmethod
    async def get_products(category: str = None, country: str = None) -> list:
        """Fetch products from backend"""
        try:
            async with aiohttp.ClientSession() as session:
                params = {}
                if category:
                    params["category"] = category
                if country:
                    params["country"] = country
                
                headers = {"X-Internal-Token": INTERNAL_API_TOKEN}
                async with session.get(
                    f"{BACKEND_API_URL}/api/v1/products",
                    params=params,
                    headers=headers
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
                    return []
        except Exception as e:
            logger.error("Error fetching products", error=str(e))
            return []


class OrderManager:
    """Manage order creation and payment"""
    
    @staticmethod
    async def create_order(tg_id: int, product_id: int, quantity: int = 1) -> Dict[str, Any]:
        """Create new order with unique payment amount"""
        try:
            async with aiohttp.ClientSession() as session:
                order_data = {
                    "tg_id": tg_id,
                    "product_id": product_id,
                    "quantity": quantity
                }
                headers = {"X-Internal-Token": INTERNAL_API_TOKEN}
                
                async with session.post(
                    f"{BACKEND_API_URL}/api/v1/orders",
                    json=order_data,
                    headers=headers
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
                    else:
                        logger.error("Failed to create order", status=resp.status)
                        return {}
        except Exception as e:
            logger.error("Error creating order", error=str(e))
            return {}


# Bot handlers
@router.message(Command("start"))
async def start_command(message: Message, state: FSMContext):
    """Handle /start command - register user and show main menu"""
    user_data = await UserManager.create_or_get_user(
        tg_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name
    )
    
    welcome_text = f"""
🤖 **Welcome to TeleBot Sales Platform!**

👤 **Your Profile:**
• TG ID: `{user_data.get('tg_id')}`
• Username: @{message.from_user.username or 'Not set'}
• Registration: {user_data.get('registered_at', 'Just now')}
• Balance: ${user_data.get('balance', 0):.2f}
• Total Orders: {user_data.get('total_orders', 0)}

Choose an option from the menu below:
    """
    
    # Main menu keyboard
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📦 Products", callback_data="menu_products"),
            InlineKeyboardButton(text="💰 Balance", callback_data="menu_balance")
        ],
        [
            InlineKeyboardButton(text="📱 API Login", callback_data="menu_api_login"),
            InlineKeyboardButton(text="📞 Support", callback_data="menu_support")
        ],
        [
            InlineKeyboardButton(text="🌍 English", callback_data="menu_language"),
            InlineKeyboardButton(text="👤 Profile", callback_data="menu_profile")
        ]
    ])
    
    await message.answer(welcome_text, reply_markup=keyboard, parse_mode="Markdown")


@router.callback_query(Text("menu_products"))
async def show_products_menu(callback: CallbackQuery, state: FSMContext):
    """Show product categories"""
    categories_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🇺🇸 USA Accounts", callback_data="cat_usa"),
            InlineKeyboardButton(text="🇬🇧 UK Accounts", callback_data="cat_uk")
        ],
        [
            InlineKeyboardButton(text="🇩🇪 Germany", callback_data="cat_de"),
            InlineKeyboardButton(text="🇫🇷 France", callback_data="cat_fr")
        ],
        [
            InlineKeyboardButton(text="📱 API Login Codes", callback_data="cat_api"),
            InlineKeyboardButton(text="🔐 Session Files", callback_data="cat_session")
        ],
        [
            InlineKeyboardButton(text="🔍 Search by Code", callback_data="search_code"),
            InlineKeyboardButton(text="⬅️ Back", callback_data="menu_main")
        ]
    ])
    
    await callback.message.edit_text(
        "📦 **Product Categories**\n\nSelect a category to browse available products:",
        reply_markup=categories_keyboard,
        parse_mode="Markdown"
    )


@router.callback_query(Text(startswith="cat_"))
async def show_category_products(callback: CallbackQuery, state: FSMContext):
    """Show products in selected category"""
    category = callback.data.split("_")[1]
    
    # Map category codes to readable names
    category_names = {
        "usa": "USA",
        "uk": "UK", 
        "de": "Germany",
        "fr": "France",
        "api": "API Login",
        "session": "Session Files"
    }
    
    products = await ProductManager.get_products(category=category)
    
    if not products:
        await callback.message.edit_text(
            f"❌ No products available in {category_names.get(category, category)} category.\n\n"
            "Please check back later or contact support.",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="⬅️ Back", callback_data="menu_products")]
            ])
        )
        return
    
    # Create product listing
    product_text = f"📦 **{category_names.get(category, category)} Products**\n\n"
    keyboard_buttons = []
    
    for product in products[:10]:  # Limit to 10 products
        product_text += f"🔹 **{product['name']}**\n"
        product_text += f"   💰 Price: ${product['price']:.2f}\n"
        product_text += f"   📦 Stock: {product['stock']} available\n"
        if product.get('description'):
            product_text += f"   📝 {product['description'][:50]}...\n"
        product_text += "\n"
        
        keyboard_buttons.append([
            InlineKeyboardButton(
                text=f"🛒 Buy {product['name']}", 
                callback_data=f"buy_{product['id']}"
            )
        ])
    
    keyboard_buttons.append([
        InlineKeyboardButton(text="⬅️ Back", callback_data="menu_products")
    ])
    
    await callback.message.edit_text(
        product_text,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=keyboard_buttons),
        parse_mode="Markdown"
    )


@router.callback_query(Text(startswith="buy_"))
async def initiate_purchase(callback: CallbackQuery, state: FSMContext):
    """Start purchase flow for selected product"""
    product_id = int(callback.data.split("_")[1])
    
    # Create order
    order = await OrderManager.create_order(
        tg_id=callback.from_user.id,
        product_id=product_id
    )
    
    if not order:
        await callback.message.edit_text(
            "❌ Failed to create order. Please try again or contact support.",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="⬅️ Back", callback_data="menu_products")]
            ])
        )
        return
    
    # Show payment information
    payment_text = f"""
🛒 **Order Created Successfully!**

📦 **Product:** {order.get('product_name', 'Unknown')}
💰 **Amount:** ${order.get('total_amount', 0):.6f} USDT
🏷️ **Order ID:** `{order.get('order_no', 'N/A')}`

💳 **Payment Instructions:**
• Send exactly **${order.get('precise_amount', 0):.6f} USDT** to the address below
• Use TRON network (TRC-20)
• Payment window: **15 minutes**

🏦 **Payment Address:**
`{order.get('payment_address', 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE')}`

⚠️ **Important:**
• Send the EXACT amount shown above
• Any other amount will not be processed
• Payment expires in 15 minutes

Your order will be delivered automatically after payment confirmation.
    """
    
    # Store order info in state
    await state.update_data(order_id=order.get('order_no'))
    await state.set_state(OrderStates.waiting_payment)
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="✅ Check Payment", callback_data=f"check_payment_{order.get('order_no')}"),
            InlineKeyboardButton(text="❌ Cancel", callback_data="cancel_order")
        ],
        [
            InlineKeyboardButton(text="📞 Support", callback_data="menu_support")
        ]
    ])
    
    await callback.message.edit_text(
        payment_text,
        reply_markup=keyboard,
        parse_mode="Markdown"
    )


@router.callback_query(Text(startswith="check_payment_"))
async def check_payment_status(callback: CallbackQuery, state: FSMContext):
    """Check payment status for order"""
    order_no = callback.data.split("_", 2)[2]
    
    try:
        async with aiohttp.ClientSession() as session:
            headers = {"X-Internal-Token": INTERNAL_API_TOKEN}
            async with session.get(
                f"{BACKEND_API_URL}/api/v1/orders/{order_no}/status",
                headers=headers
            ) as resp:
                if resp.status == 200:
                    order_status = await resp.json()
                    
                    if order_status.get('status') == 'paid':
                        # Payment confirmed - show delivery info
                        await callback.message.edit_text(
                            f"✅ **Payment Confirmed!**\n\n"
                            f"🎉 Your order has been processed successfully.\n"
                            f"📦 Download link: {order_status.get('download_link', 'Check your messages')}\n\n"
                            f"Thank you for your purchase!",
                            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                                [InlineKeyboardButton(text="🏠 Main Menu", callback_data="menu_main")]
                            ]),
                            parse_mode="Markdown"
                        )
                        await state.clear()
                    elif order_status.get('status') == 'expired':
                        await callback.message.edit_text(
                            "⏰ **Payment Expired**\n\n"
                            "The payment window has expired. Please create a new order.",
                            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                                [InlineKeyboardButton(text="🔄 New Order", callback_data="menu_products")]
                            ]),
                            parse_mode="Markdown"
                        )
                        await state.clear()
                    else:
                        await callback.answer("⏳ Payment not yet received. Please wait a moment and try again.")
                else:
                    await callback.answer("❌ Error checking payment status. Please try again.")
    except Exception as e:
        logger.error("Error checking payment", error=str(e))
        await callback.answer("❌ Error checking payment status. Please try again.")


@router.callback_query(Text("menu_api_login"))
async def show_api_login_menu(callback: CallbackQuery):
    """Show API login options"""
    api_text = """
📱 **API Login Services**

Get access to Telegram API endpoints for your applications:

🔹 **Mobile API Access**
   • Format: `https://miha.uk/tgapi/{token}/{uuid}/{action}`
   • Direct HTML/JSON responses
   • Real-time login verification

🔹 **Available Actions:**
   • `GetHTML` - Get account HTML data
   • `GetAuth` - Authentication codes
   • `GetSession` - Session information
   • `Verify` - Account verification

💰 **Pricing:** $2.50 - $15.00 per endpoint
📦 **Delivery:** Instant after payment
    """
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🛒 Browse API Products", callback_data="cat_api"),
            InlineKeyboardButton(text="📖 API Documentation", callback_data="api_docs")
        ],
        [
            InlineKeyboardButton(text="⬅️ Back", callback_data="menu_main")
        ]
    ])
    
    await callback.message.edit_text(
        api_text,
        reply_markup=keyboard,
        parse_mode="Markdown"
    )


@router.callback_query(Text("menu_main"))
async def back_to_main_menu(callback: CallbackQuery, state: FSMContext):
    """Return to main menu"""
    await state.clear()
    
    main_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📦 Products", callback_data="menu_products"),
            InlineKeyboardButton(text="💰 Balance", callback_data="menu_balance")
        ],
        [
            InlineKeyboardButton(text="📱 API Login", callback_data="menu_api_login"),
            InlineKeyboardButton(text="📞 Support", callback_data="menu_support")
        ],
        [
            InlineKeyboardButton(text="🌍 English", callback_data="menu_language"),
            InlineKeyboardButton(text="👤 Profile", callback_data="menu_profile")
        ]
    ])
    
    await callback.message.edit_text(
        "🏠 **Main Menu**\n\nWhat would you like to do?",
        reply_markup=main_keyboard,
        parse_mode="Markdown"
    )


async def setup_bot_commands():
    """Set up bot commands for Telegram menu"""
    commands = [
        BotCommand(command="start", description="🏠 Start bot and show main menu"),
        BotCommand(command="products", description="📦 Browse products"),
        BotCommand(command="balance", description="💰 Check balance"),
        BotCommand(command="orders", description="📋 Order history"),
        BotCommand(command="support", description="📞 Contact support"),
    ]
    await bot.set_my_commands(commands)


async def main():
    """Main function to start the bot"""
    try:
        # Setup bot commands
        await setup_bot_commands()
        
        # Include router
        dp.include_router(router)
        
        # Start polling
        logger.info("Bot started successfully")
        await dp.start_polling(bot)
        
    except Exception as e:
        logger.error("Error starting bot", error=str(e))
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())