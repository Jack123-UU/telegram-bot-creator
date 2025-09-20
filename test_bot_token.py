#!/usr/bin/env python3
"""
Simple test script to verify the Telegram bot token is working
"""

import os
import asyncio
import aiohttp
from aiogram import Bot

# Bot token from environment or hardcoded for testing
BOT_TOKEN = os.getenv("BOT_TOKEN", "8370071788:AAGrc3JKDs-lb_ITqZMAe8ufmQsB_3Qp5cA")

async def test_bot_token():
    """Test if the bot token is valid"""
    print("🤖 Testing Telegram Bot Token...")
    print(f"Token: {BOT_TOKEN}")
    print("-" * 50)
    
    try:
        # Initialize bot
        bot = Bot(token=BOT_TOKEN)
        
        # Test getMe API call
        me = await bot.get_me()
        
        print("✅ Bot token is VALID!")
        print(f"Bot username: @{me.username}")
        print(f"Bot name: {me.first_name}")
        print(f"Bot ID: {me.id}")
        print(f"Can join groups: {me.can_join_groups}")
        print(f"Can read all group messages: {me.can_read_all_group_messages}")
        print(f"Supports inline queries: {me.supports_inline_queries}")
        
        # Test webhook info
        webhook_info = await bot.get_webhook_info()
        print(f"\nWebhook URL: {webhook_info.url or 'Not set (polling mode)'}")
        
        print("\n🎉 Bot is ready for testing!")
        print("You can now start the bot services and test in Telegram")
        
        await bot.session.close()
        return True
        
    except Exception as e:
        print(f"❌ Bot token test FAILED: {e}")
        await bot.session.close() if 'bot' in locals() else None
        return False

async def test_backend_connection():
    """Test connection to backend API"""
    backend_url = os.getenv("API_BASE_URL", "http://localhost:8000")
    print(f"\n🔌 Testing Backend Connection to {backend_url}...")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{backend_url}/health", timeout=5) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Backend is online: {data}")
                    return True
                else:
                    print(f"⚠️ Backend returned status {response.status}")
                    return False
    except aiohttp.ClientConnectorError:
        print("❌ Cannot connect to backend - make sure services are running")
        return False
    except asyncio.TimeoutError:
        print("❌ Backend connection timeout")
        return False
    except Exception as e:
        print(f"❌ Backend test failed: {e}")
        return False

def print_startup_instructions():
    """Print instructions for starting the bot"""
    print("\n" + "="*60)
    print("🚀 STARTUP INSTRUCTIONS")
    print("="*60)
    print("1. Start all services:")
    print("   docker-compose -f docker-compose.dev.yml up --build")
    print("")
    print("2. Or start individual services:")
    print("   docker-compose -f docker-compose.dev.yml up postgres redis vault")
    print("   docker-compose -f docker-compose.dev.yml up backend")
    print("   docker-compose -f docker-compose.dev.yml up bot")
    print("")
    print("3. Test the bot in Telegram:")
    print("   - Search for your bot username")
    print("   - Send /start command")
    print("   - Interact with the menu")
    print("")
    print("4. View logs:")
    print("   docker-compose -f docker-compose.dev.yml logs -f bot")
    print("="*60)

async def main():
    """Main test function"""
    print("🧪 TeleBot Testing & Validation")
    print("=" * 50)
    
    # Test bot token
    bot_valid = await test_bot_token()
    
    # Test backend connection
    backend_online = await test_backend_connection()
    
    # Summary
    print("\n📋 TEST SUMMARY")
    print("-" * 30)
    print(f"Bot Token: {'✅ Valid' if bot_valid else '❌ Invalid'}")
    print(f"Backend:   {'✅ Online' if backend_online else '❌ Offline'}")
    
    if bot_valid and backend_online:
        print("\n🎉 All tests passed! Your bot is ready to use.")
    elif bot_valid and not backend_online:
        print("\n⚠️ Bot token is valid but backend is offline.")
        print("Start the backend services to complete the setup.")
    else:
        print("\n❌ Bot token validation failed.")
        print("Please check your BOT_TOKEN environment variable.")
    
    print_startup_instructions()

if __name__ == "__main__":
    asyncio.run(main())