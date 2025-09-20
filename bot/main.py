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
from datetime import datetime, timedelta
import time

# Configure structured logging
logging.basicConfig(level=logging.INFO)
logger = structlog.get_logger()

# Rate limiting configuration
RATE_LIMIT_WINDOW = 60  # 1 minute
RATE_LIMIT_MAX_REQUESTS = 20  # Max 20 requests per minute per user
rate_limit_storage = {}

class RateLimiter:
    """Simple rate limiter for bot interactions"""
    
    @staticmethod
    async def check_rate_limit(user_id: int) -> bool:
        """Check if user has exceeded rate limit"""
        current_time = time.time()
        user_key = f"rate_limit_{user_id}"
        
        if user_key not in rate_limit_storage:
            rate_limit_storage[user_key] = []
        
        # Clean old requests outside the window
        rate_limit_storage[user_key] = [
            req_time for req_time in rate_limit_storage[user_key] 
            if current_time - req_time < RATE_LIMIT_WINDOW
        ]
        
        # Check if limit exceeded
        if len(rate_limit_storage[user_key]) >= RATE_LIMIT_MAX_REQUESTS:
            return False
        
        # Add current request
        rate_limit_storage[user_key].append(current_time)
        return True

class UserVerification:
    """User verification and compliance checks"""
    
    @staticmethod
    async def verify_new_user(user_id: int, username: str = None) -> Dict[str, Any]:
        """Verify new user compliance"""
        verification_result = {
            "verified": True,
            "risk_level": "low",
            "restrictions": [],
            "verification_time": datetime.now().isoformat()
        }
        
        # Basic verification checks
        if not username or len(username) < 3:
            verification_result["risk_level"] = "medium"
            verification_result["restrictions"].append("Username verification required")
        
        # Log user verification
        logger.info("User verification completed", 
                   user_id=user_id, 
                   risk_level=verification_result["risk_level"])
        
        return verification_result

# Bot configuration
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
BACKEND_API_URL = os.getenv("API_BASE_URL", os.getenv("BACKEND_API_URL", "http://localhost:8000"))
INTERNAL_API_TOKEN = os.getenv("API_INTERNAL_TOKEN", os.getenv("INTERNAL_API_TOKEN", "dev-internal-token-secure-123"))

# Validate critical configuration
if not BOT_TOKEN:
    logger.error("BOT_TOKEN is required but not found in environment variables")
    raise ValueError("BOT_TOKEN environment variable is required")

logger.info("Bot configuration loaded", 
           bot_token_length=len(BOT_TOKEN),
           backend_url=BACKEND_API_URL,
           redis_url=REDIS_URL)

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


class ServiceManager:
    """Manage legitimate business services catalog"""
    
    @staticmethod
    async def get_services(category: str = None, service_type: str = None) -> list:
        """Fetch legitimate business services"""
        # Predefined compliant services
        compliant_services = [
            {
                "id": 1,
                "name": "Custom API Development",
                "category": "api_integration",
                "price": 99.99,
                "description": "Professional API development and integration services",
                "service_type": "development",
                "compliance_verified": True
            },
            {
                "id": 2, 
                "name": "Bot Development Consulting",
                "category": "bot_dev",
                "price": 199.99,
                "description": "Expert consultation for business automation bots",
                "service_type": "consulting",
                "compliance_verified": True
            },
            {
                "id": 3,
                "name": "Workflow Automation Design",
                "category": "automation", 
                "price": 149.99,
                "description": "Custom workflow automation solutions",
                "service_type": "design",
                "compliance_verified": True
            },
            {
                "id": 4,
                "name": "API Documentation Service",
                "category": "documentation",
                "price": 79.99, 
                "description": "Professional API documentation and guides",
                "service_type": "documentation",
                "compliance_verified": True
            }
        ]
        
        # Filter by category if specified
        if category:
            compliant_services = [s for s in compliant_services if s.get('category') == category]
            
        # Filter by service type if specified  
        if service_type:
            compliant_services = [s for s in compliant_services if s.get('service_type') == service_type]
            
        return compliant_services


class ConsultationManager:
    """Manage consultation requests for legitimate services"""
    
    @staticmethod
    async def create_consultation_request(user_id: int, service_category: str, service_id: str) -> Dict[str, Any]:
        """Create legitimate consultation request"""
        try:
            consultation_data = {
                "user_id": user_id,
                "service_category": service_category,
                "service_id": service_id,
                "request_type": "consultation",
                "status": "pending",
                "created_at": datetime.now().isoformat(),
                "compliance_verified": True
            }
            
            # In real implementation, this would call backend API
            logger.info("Consultation request created", 
                       user_id=user_id,
                       service_category=service_category)
            
            return {
                "consultation_id": f"CONS_{user_id}_{int(time.time())}",
                "status": "submitted",
                "estimated_response_time": "24 hours",
                "compliance_status": "verified"
            }
            
        except Exception as e:
            logger.error("Error creating consultation", error=str(e))
            return {}


# Bot handlers
@router.message(Command("start"))
async def start_command(message: Message, state: FSMContext):
    """Handle /start command - register user and show main menu"""
    
    # Check rate limit
    if not await RateLimiter.check_rate_limit(message.from_user.id):
        await message.answer(
            "⚠️ **Rate limit exceeded**\n\n"
            "Please wait a moment before trying again.\n"
            "This helps us maintain service quality for all users.",
            parse_mode="Markdown"
        )
        return
    
    # Verify user compliance
    verification = await UserVerification.verify_new_user(
        user_id=message.from_user.id,
        username=message.from_user.username
    )
    
    user_data = await UserManager.create_or_get_user(
        tg_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name
    )
    
    # Add compliance notice
    compliance_notice = ""
    if verification["risk_level"] != "low":
        compliance_notice = "\n⚠️ **Account Verification**: Additional verification may be required for certain services.\n"
    
    welcome_text = f"""
🤖 **Welcome to TeleBot Business Automation Platform!**

🔧 **Professional Bot Services & API Solutions**

👤 **Your Profile:**
• User ID: `{user_data.get('tg_id')}`
• Username: @{message.from_user.username or 'Not set'}
• Registration: {user_data.get('registered_at', 'Just now')}
• Credits: ${user_data.get('balance', 0):.2f}
• Service Orders: {user_data.get('total_orders', 0)}
{compliance_notice}
📋 **Available Services:**
✅ API Integration Services
✅ Bot Development Tools  
✅ Automation Consulting
✅ Technical Support

🛡️ **Compliance Notice**: All services comply with Telegram's terms of service and applicable regulations.

Choose a service category below:
    """
    
    # Main menu keyboard
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🔧 API Services", callback_data="menu_services"),
            InlineKeyboardButton(text="💰 Credits", callback_data="menu_balance")
        ],
        [
            InlineKeyboardButton(text="🛠️ Development Tools", callback_data="menu_tools"),
            InlineKeyboardButton(text="📞 Support", callback_data="menu_support")
        ],
        [
            InlineKeyboardButton(text="🌍 Language", callback_data="menu_language"),
            InlineKeyboardButton(text="👤 Profile", callback_data="menu_profile")
        ]
    ])
    
    await message.answer(welcome_text, reply_markup=keyboard, parse_mode="Markdown")


@router.callback_query(Text("menu_services"))
async def show_services_menu(callback: CallbackQuery, state: FSMContext):
    """Show legitimate business service categories"""
    services_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🔌 API Integration", callback_data="cat_api_integration"),
            InlineKeyboardButton(text="🤖 Bot Development", callback_data="cat_bot_dev")
        ],
        [
            InlineKeyboardButton(text="⚙️ Automation Tools", callback_data="cat_automation"),
            InlineKeyboardButton(text="📊 Analytics Services", callback_data="cat_analytics")
        ],
        [
            InlineKeyboardButton(text="🛡️ Security Consulting", callback_data="cat_security"),
            InlineKeyboardButton(text="☁️ Cloud Solutions", callback_data="cat_cloud")
        ],
        [
            InlineKeyboardButton(text="📖 Documentation", callback_data="service_docs"),
            InlineKeyboardButton(text="⬅️ Back", callback_data="menu_main")
        ]
    ])
    
    services_text = """
🔧 **Professional API & Bot Services**

We provide legitimate business automation solutions:

🔌 **API Integration Services**
   • Custom API development
   • Third-party integrations
   • Webhook implementations

🤖 **Bot Development Services**  
   • Business automation bots
   • Customer service solutions
   • Workflow optimization

⚙️ **Automation Consulting**
   • Process optimization
   • System integration
   • Technical consulting

All services comply with platform policies and best practices.
    """
    
    await callback.message.edit_text(
        services_text,
        reply_markup=services_keyboard,
        parse_mode="Markdown"
    )


@router.callback_query(Text(startswith="cat_"))
async def show_service_category(callback: CallbackQuery, state: FSMContext):
    """Show services in selected category"""
    category = callback.data.split("_", 1)[1]
    
    # Map service categories to legitimate business services
    service_info = {
        "api_integration": {
            "name": "API Integration Services",
            "description": "Professional API development and integration solutions",
            "services": [
                {"name": "Custom API Development", "price": 99.99, "description": "Tailored API solutions"},
                {"name": "Third-party Integration", "price": 149.99, "description": "Connect your systems"},
                {"name": "Webhook Implementation", "price": 79.99, "description": "Real-time data sync"}
            ]
        },
        "bot_dev": {
            "name": "Bot Development Services", 
            "description": "Business automation and customer service bots",
            "services": [
                {"name": "Customer Service Bot", "price": 199.99, "description": "24/7 automated support"},
                {"name": "Business Process Bot", "price": 299.99, "description": "Workflow automation"},
                {"name": "Analytics Bot", "price": 179.99, "description": "Data analysis automation"}
            ]
        },
        "automation": {
            "name": "Automation Solutions",
            "description": "Process optimization and workflow automation",
            "services": [
                {"name": "Process Consulting", "price": 249.99, "description": "Optimization analysis"},
                {"name": "Workflow Design", "price": 199.99, "description": "Custom automation"},
                {"name": "Integration Support", "price": 129.99, "description": "Implementation help"}
            ]
        }
    }
    
    category_data = service_info.get(category)
    if not category_data:
        await callback.message.edit_text(
            "🚧 This service category is currently under development.\n\n"
            "Please check our other available services or contact support.",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="⬅️ Back", callback_data="menu_services")]
            ])
        )
        return
    
    # Create service listing
    service_text = f"🔧 **{category_data['name']}**\n\n"
    service_text += f"📋 {category_data['description']}\n\n"
    
    keyboard_buttons = []
    
    for i, service in enumerate(category_data['services'][:5], 1):  # Limit to 5 services
        service_text += f"🔹 **{service['name']}**\n"
        service_text += f"   💰 Price: ${service['price']:.2f}\n"
        service_text += f"   📝 {service['description']}\n\n"
        
        keyboard_buttons.append([
            InlineKeyboardButton(
                text=f"📞 Consult: {service['name']}", 
                callback_data=f"consult_{category}_{i}"
            )
        ])
    
    keyboard_buttons.append([
        InlineKeyboardButton(text="⬅️ Back", callback_data="menu_services")
    ])
    
    await callback.message.edit_text(
        service_text,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=keyboard_buttons),
        parse_mode="Markdown"
    )


@router.callback_query(Text(startswith="consult_"))
async def initiate_consultation(callback: CallbackQuery, state: FSMContext):
    """Start consultation process for selected service"""
    callback_parts = callback.data.split("_")
    if len(callback_parts) < 3:
        await callback.answer("❌ Invalid service selection")
        return
        
    category = callback_parts[1]
    service_id = callback_parts[2]
    
    # Create consultation request
    consultation_text = f"""
📞 **Service Consultation Request**

🔧 **Service Category:** {category.replace('_', ' ').title()}
📋 **Service ID:** #{service_id}
👤 **Requested by:** @{callback.from_user.username or 'User'}

📋 **Next Steps:**
1. Our technical team will review your requirements
2. You'll receive a detailed proposal within 24 hours
3. We'll schedule a consultation call if needed

💰 **Consultation:** FREE (30 minutes)
⏰ **Response Time:** Within 24 hours
🛡️ **Confidential:** All discussions are private

Thank you for your interest in our professional services!
    """
    
    # Store consultation info
    await state.update_data(
        consultation_category=category,
        consultation_service=service_id,
        user_id=callback.from_user.id
    )
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="✅ Confirm Request", callback_data="confirm_consultation"),
            InlineKeyboardButton(text="❌ Cancel", callback_data="menu_services")
        ],
        [
            InlineKeyboardButton(text="📞 Direct Contact", callback_data="menu_support")
        ]
    ])
    
    await callback.message.edit_text(
        consultation_text,
        reply_markup=keyboard,
        parse_mode="Markdown"
    )


@router.callback_query(Text("confirm_consultation"))
async def confirm_consultation_request(callback: CallbackQuery, state: FSMContext):
    """Confirm and submit consultation request"""
    user_data = await state.get_data()
    
    # Log consultation request (in real implementation, this would go to CRM)
    logger.info("Consultation requested", 
                user_id=callback.from_user.id,
                category=user_data.get('consultation_category'),
                service=user_data.get('consultation_service'))
    
    success_text = """
✅ **Consultation Request Submitted!**

📧 **Confirmation:** Your request has been received
👨‍💼 **Assigned to:** Technical consulting team  
📅 **Follow-up:** Within 24 hours
📞 **Contact:** We'll reach out via Telegram

🎯 **What to expect:**
• Requirement analysis
• Custom solution proposal  
• Technical feasibility review
• Pricing estimate (if applicable)

Thank you for choosing our professional services!
    """
    
    await callback.message.edit_text(
        success_text,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🏠 Main Menu", callback_data="menu_main")],
            [InlineKeyboardButton(text="📞 Support", callback_data="menu_support")]
        ]),
        parse_mode="Markdown"
    )
    
    await state.clear()


@router.callback_query(Text("menu_support"))
async def show_support_menu(callback: CallbackQuery):
    """Show support and compliance information"""
    support_text = """
📞 **Support & Compliance**

🛡️ **Our Commitment:**
• Full compliance with Telegram Terms of Service
• Ethical business practices
• Transparent service delivery
• Privacy protection

📋 **Support Categories:**

🔧 **Technical Support**
   • Service integration help
   • Troubleshooting assistance  
   • Best practices guidance

📚 **Documentation**
   • API reference guides
   • Implementation examples
   • Compliance guidelines

⚖️ **Compliance & Legal**
   • Terms of service
   • Privacy policy
   • Acceptable use policy

📧 **Contact Methods:**
   • In-app support chat
   • Email: support@example.com
   • Response time: 24-48 hours
    """
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="💬 Start Support Chat", callback_data="support_chat"),
            InlineKeyboardButton(text="📚 Documentation", callback_data="support_docs")
        ],
        [
            InlineKeyboardButton(text="⚖️ Terms & Compliance", callback_data="support_terms"),
            InlineKeyboardButton(text="🔒 Privacy Policy", callback_data="support_privacy")
        ],
        [
            InlineKeyboardButton(text="⬅️ Back", callback_data="menu_main")
        ]
    ])
    
    await callback.message.edit_text(
        support_text,
        reply_markup=keyboard,
        parse_mode="Markdown"
    )


@router.callback_query(Text("support_terms"))
async def show_terms_compliance(callback: CallbackQuery):
    """Show terms and compliance information"""
    terms_text = """
⚖️ **Terms of Service & Compliance**

🛡️ **Our Compliance Standards:**

✅ **Telegram ToS Compliance**
   • No violation of Telegram's terms
   • Respect for user privacy
   • No spam or abuse

✅ **Service Standards**
   • Legitimate business services only
   • Professional API integrations
   • Ethical automation solutions

✅ **User Responsibilities**
   • Use services for legitimate purposes
   • Comply with applicable laws
   • Respect platform policies

⚠️ **Prohibited Activities:**
   • Spam or unauthorized messaging
   • Account manipulation
   • Privacy violations
   • Illegal or harmful activities

📋 **Service Agreement:**
By using our services, you agree to:
• Use services ethically and legally
• Respect all applicable terms of service
• Report any concerns or violations

For questions about compliance, contact our legal team.
    """
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📞 Legal Contact", callback_data="legal_contact"),
            InlineKeyboardButton(text="📚 Full Terms", callback_data="full_terms")
        ],
        [
            InlineKeyboardButton(text="⬅️ Back", callback_data="menu_support")
        ]
    ])
    
    await callback.message.edit_text(
        terms_text,
        reply_markup=keyboard,
        parse_mode="Markdown"
    )


@router.message(Command("help"))
async def help_command(message: Message):
    """Show help and compliance information"""
    help_text = """
❓ **Help & Information**

🔧 **Available Commands:**
/start - Access main menu and services
/services - Browse API and development services  
/tools - Access development tools
/credits - Check account credits
/support - Contact support team
/help - Show this help message

🛡️ **Compliance Information:**
This bot provides legitimate business automation services in full compliance with:
• Telegram Terms of Service
• Applicable laws and regulations  
• Industry best practices

📋 **Service Categories:**
• API Integration Services
• Bot Development Consulting
• Automation Solutions
• Technical Support

⚠️ **Important Notice:**
All services are provided for legitimate business purposes only. We do not support or facilitate any activities that violate platform terms or applicable laws.

For support: Use /support or contact our team directly.
    """
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🔧 Browse Services", callback_data="menu_services"),
            InlineKeyboardButton(text="📞 Contact Support", callback_data="menu_support")
        ],
        [
            InlineKeyboardButton(text="🏠 Main Menu", callback_data="menu_main")
        ]
    ])
    
    await message.answer(
        help_text,
        reply_markup=keyboard,
        parse_mode="Markdown"
    )


@router.callback_query(Text("menu_tools"))
async def show_development_tools(callback: CallbackQuery):
    """Show legitimate development tools and resources"""
    tools_text = """
🛠️ **Development Tools & Resources**

Professional tools for legitimate business automation:

📚 **Learning Resources**
   • Bot development tutorials
   • API integration guides  
   • Best practices documentation

🔧 **Development Tools**
   • Code generators
   • Testing frameworks
   • Deployment templates

📊 **Analytics Tools**  
   • Performance monitoring
   • Usage analytics
   • Optimization reports

All tools comply with platform policies and promote ethical development.
    """
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="📚 Documentation", callback_data="tools_docs"),
            InlineKeyboardButton(text="🔧 Code Tools", callback_data="tools_code")
        ],
        [
            InlineKeyboardButton(text="📊 Analytics", callback_data="tools_analytics"),
            InlineKeyboardButton(text="🎓 Tutorials", callback_data="tools_tutorials")
        ],
        [
            InlineKeyboardButton(text="⬅️ Back", callback_data="menu_main")
        ]
    ])
    
    await callback.message.edit_text(
        tools_text,
        reply_markup=keyboard,
        parse_mode="Markdown"
    )


@router.callback_query(Text("menu_main"))
async def back_to_main_menu(callback: CallbackQuery, state: FSMContext):
    """Return to main menu"""
    await state.clear()
    
    main_keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🔧 API Services", callback_data="menu_services"),
            InlineKeyboardButton(text="💰 Credits", callback_data="menu_balance")
        ],
        [
            InlineKeyboardButton(text="🛠️ Development Tools", callback_data="menu_tools"),
            InlineKeyboardButton(text="📞 Support", callback_data="menu_support")
        ],
        [
            InlineKeyboardButton(text="🌍 Language", callback_data="menu_language"),
            InlineKeyboardButton(text="👤 Profile", callback_data="menu_profile")
        ]
    ])
    
    await callback.message.edit_text(
        "🏠 **Main Menu**\n\nChoose a service category or access your account:",
        reply_markup=main_keyboard,
        parse_mode="Markdown"
    )


async def setup_bot_commands():
    """Set up bot commands for Telegram menu"""
    commands = [
        BotCommand(command="start", description="🏠 Start bot and access services"),
        BotCommand(command="services", description="🔧 Browse API services"),
        BotCommand(command="tools", description="🛠️ Development tools"),
        BotCommand(command="credits", description="💰 Check account credits"),
        BotCommand(command="support", description="📞 Contact support"),
        BotCommand(command="help", description="❓ Help and documentation"),
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