#!/usr/bin/env python3
"""
能量兑换机器人 (Energy Exchange Bot)
基于 @nengliangduihuanbot 功能的 Telegram 机器人

功能特性：
- 飞机会员服务
- 能量质押/租用服务  
- 地址监听
- TRX/USDT 兑换
- 实时汇率查询
- 个人中心管理
- 联系客服
- 购买星星
- 能量闪租
- 免费克隆
"""

import asyncio
import logging
import os
import aiohttp
import json
import time
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, Any, List, Optional

from aiogram import Bot, Dispatcher, Router, F
from aiogram.types import (
    Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton,
    BotCommand, KeyboardButton, ReplyKeyboardMarkup
)
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
import redis.asyncio as redis
import structlog

# 配置结构化日志
logging.basicConfig(level=logging.INFO)
logger = structlog.get_logger()

# 配置常量
BOT_TOKEN = os.getenv('BOT_TOKEN', 'your-bot-token-here')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:8000')
INTERNAL_API_TOKEN = os.getenv('INTERNAL_API_TOKEN', 'internal-token')

# TRON 网络配置
TRON_API_URL = os.getenv('TRON_API_URL', 'https://api.trongrid.io')
USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"  # USDT-TRC20
PAYMENT_ADDRESS = os.getenv('PAYMENT_ADDRESS', 'your-tron-address')

# 客服联系信息
CUSTOMER_SERVICE_ID = os.getenv('CUSTOMER_SERVICE_ID', '@your_support_bot')

# Bot 初始化
bot = Bot(token=BOT_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)
router = Router()

# 状态管理
class UserStates(StatesGroup):
    main_menu = State()
    telegram_member = State()
    energy_service = State()
    address_monitor = State()
    profile_center = State()
    trx_exchange = State()
    limited_energy = State()
    customer_service = State()
    buy_stars = State()
    energy_flash_rent = State()
    realtime_rate = State()
    free_clone = State()

# 用户数据管理
class UserManager:
    """用户数据管理类"""
    
    @staticmethod
    async def get_or_create_user(user_id: int, username: str = None, first_name: str = None) -> Dict[str, Any]:
        """获取或创建用户"""
        try:
            # 这里应该连接到实际的数据库
            # 暂时返回模拟数据
            return {
                "user_id": user_id,
                "username": username,
                "first_name": first_name,
                "balance_usdt": "0.00",
                "balance_trx": "0.00",
                "total_energy": 0,
                "member_level": "普通用户",
                "register_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "uid": f"83067{str(user_id)[-3:]}"
            }
        except Exception as e:
            logger.error("Failed to get/create user", error=str(e))
            return {
                "user_id": user_id,
                "balance_usdt": "0.00",
                "balance_trx": "0.00",
                "total_energy": 0
            }

# 汇率管理
class ExchangeRateManager:
    """实时汇率管理"""
    
    @staticmethod
    async def get_usdt_cny_rate() -> List[Dict[str, Any]]:
        """获取USDT/CNY实时汇率"""
        try:
            # 模拟OTC汇率数据，实际应该调用真实API
            rates = [
                {"rank": 1, "price": "7.09", "merchant": "showwei"},
                {"rank": 2, "price": "7.12", "merchant": "万泰汇商行"},
                {"rank": 3, "price": "7.13", "merchant": "日进斗金U商-可验流水"},
                {"rank": 4, "price": "7.13", "merchant": "洋芋和土豆"},
                {"rank": 5, "price": "7.14", "merchant": "友海商行"},
                {"rank": 6, "price": "7.15", "merchant": "日进斗金U商-可验流水"},
                {"rank": 7, "price": "7.15", "merchant": "汇聚通商贸"},
                {"rank": 8, "price": "7.16", "merchant": "汇聚通商贸"},
                {"rank": 9, "price": "7.17", "merchant": "闺蜜商行"},
                {"rank": 10, "price": "7.17", "merchant": "汇安通【币商】"}
            ]
            return rates
        except Exception as e:
            logger.error("Failed to get exchange rate", error=str(e))
            return []

# 能量服务管理
class EnergyServiceManager:
    """能量服务管理"""
    
    @staticmethod
    async def get_energy_price() -> Dict[str, Any]:
        """获取能量价格"""
        return {
            "current_price": "0.001",  # USDT per energy
            "available_energy": 50000000,
            "min_rent": 1000,
            "max_rent": 1000000
        }

# 主菜单键盘
def get_main_menu_keyboard() -> InlineKeyboardMarkup:
    """获取主菜单键盘"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🛩️ 飞机会员", callback_data="telegram_member"),
            InlineKeyboardButton(text="⚡ 能量服务", callback_data="energy_service")
        ],
        [
            InlineKeyboardButton(text="👁️ 地址监听", callback_data="address_monitor"),
            InlineKeyboardButton(text="👤 个人中心", callback_data="profile_center")
        ],
        [
            InlineKeyboardButton(text="🔄 TRX兑换", callback_data="trx_exchange"),
            InlineKeyboardButton(text="⏰ 限时能量", callback_data="limited_energy")
        ],
        [
            InlineKeyboardButton(text="📞 联系客服", callback_data="customer_service"),
            InlineKeyboardButton(text="⭐ 购买星星", callback_data="buy_stars")
        ],
        [
            InlineKeyboardButton(text="⚡ 能量闪租", callback_data="energy_flash_rent"),
            InlineKeyboardButton(text="💱 实时U价", callback_data="realtime_rate")
        ],
        [
            InlineKeyboardButton(text="🆓 免费克隆", callback_data="free_clone")
        ]
    ])
    return keyboard

# 返回主菜单键盘
def get_back_to_main_keyboard() -> InlineKeyboardMarkup:
    """返回主菜单按钮"""
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🏠 返回主菜单", callback_data="back_to_main")]
    ])

# 命令处理器
@router.message(Command("start"))
async def start_command(message: Message, state: FSMContext):
    """处理 /start 命令"""
    user_id = message.from_user.id
    username = message.from_user.username
    first_name = message.from_user.first_name
    
    # 获取或创建用户
    user_data = await UserManager.get_or_create_user(user_id, username, first_name)
    
    welcome_text = f"""
🤖 欢迎使用能量兑换机器人！

👋 你好，{first_name or username or '用户'}！
🆔 用户ID: {user_data.get('uid', user_id)}
📅 注册时间: {user_data.get('register_time', '刚刚')}

💰 账户余额: {user_data.get('balance_usdt', '0.00')} USDT | {user_data.get('balance_trx', '0.00')} TRX
⚡ 能量余额: {user_data.get('total_energy', 0)} 能量

🎯 本机器人提供以下服务：
• 飞机会员开通 (Telegram Premium)
• TRC-20 能量质押/租用服务
• 波场地址交易监听
• TRX/USDT 实时兑换
• 实时OTC汇率查询
• 购买星星服务
• 免费克隆部署

💳 支付方式：TRC-20 USDT/TRX
🔒 安全可靠 | 🚀 快速到账 | 📞 24小时客服

请选择你需要的服务：
"""
    
    await message.answer(welcome_text, reply_markup=get_main_menu_keyboard(), parse_mode="Markdown")
    await state.set_state(UserStates.main_menu)

@router.message(Command("help"))
async def help_command(message: Message):
    """帮助命令"""
    help_text = """
📖 **能量兑换机器人使用指南**

🛩️ **飞机会员**
- 为自己或他人开通 Telegram Premium
- 支持各种周期套餐

⚡ **能量服务**
- 基于质押的能量池服务
- 为 TRC-20 交易提供能量租用
- 支持批量能量交易

👁️ **地址监听**
- 监听波场链地址交易动态
- 实时推送交易信息

🔄 **TRX兑换**
- TRX ↔ USDT 实时兑换
- 市场最优汇率

💱 **实时U价**
- OTC 市场实时汇率
- 多商家价格对比

📞 **客服支持**
- 24小时在线客服
- 快速问题解决

使用 /start 返回主菜单
"""
    
    await message.answer(help_text, reply_markup=get_back_to_main_keyboard(), parse_mode="Markdown")

# 回调查询处理器
@router.callback_query(F.data == "back_to_main")
async def back_to_main(callback: CallbackQuery, state: FSMContext):
    """返回主菜单"""
    user_data = await UserManager.get_or_create_user(callback.from_user.id)
    
    main_text = f"""
🏠 **主菜单**

👋 欢迎回来！
💰 余额: {user_data.get('balance_usdt', '0.00')} USDT | {user_data.get('balance_trx', '0.00')} TRX
⚡ 能量: {user_data.get('total_energy', 0)}

请选择你需要的服务：
"""
    
    await callback.message.edit_text(main_text, reply_markup=get_main_menu_keyboard(), parse_mode="Markdown")
    await state.set_state(UserStates.main_menu)

@router.callback_query(F.data == "telegram_member")
async def telegram_member_menu(callback: CallbackQuery, state: FSMContext):
    """飞机会员功能"""
    member_text = """
🛩️ **Telegram 会员服务**

✨ 为自己或他人开通 Telegram Premium 会员

📋 **套餐选择：**
• 1个月 - 4.99 USDT
• 3个月 - 13.99 USDT  
• 6个月 - 26.99 USDT
• 12个月 - 49.99 USDT

🎁 **会员特权：**
• 更大文件上传限制 (4GB)
• 更快下载速度
• 专属贴纸和表情
• 高级聊天功能
• 无广告体验

💳 支付方式：TRC-20 USDT/TRX
⏱️ 开通时间：付款后5-10分钟

请选择套餐周期：
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="1个月 - 4.99 USDT", callback_data="member_1m"),
            InlineKeyboardButton(text="3个月 - 13.99 USDT", callback_data="member_3m")
        ],
        [
            InlineKeyboardButton(text="6个月 - 26.99 USDT", callback_data="member_6m"),
            InlineKeyboardButton(text="12个月 - 49.99 USDT", callback_data="member_12m")
        ],
        [
            InlineKeyboardButton(text="🏠 返回主菜单", callback_data="back_to_main")
        ]
    ])
    
    await callback.message.edit_text(member_text, reply_markup=keyboard, parse_mode="Markdown")
    await state.set_state(UserStates.telegram_member)

@router.callback_query(F.data == "energy_service")
async def energy_service_menu(callback: CallbackQuery, state: FSMContext):
    """能量服务功能"""
    energy_info = await EnergyServiceManager.get_energy_price()
    
    energy_text = f"""
⚡ **能量质押/租用服务**

🔋 **当前能量池状态：**
• 可用能量：{energy_info['available_energy']:,} 能量
• 当前价格：{energy_info['current_price']} USDT/能量
• 最小租用：{energy_info['min_rent']:,} 能量
• 最大租用：{energy_info['max_rent']:,} 能量

💡 **服务说明：**
• 为 TRC-20 转账提供能量
• 避免 TRX 燃烧，节省手续费
• 支持批量能量质押
• 24小时自动续费

⚡ **租用流程：**
1. 选择租用数量
2. 提供接收地址
3. 支付 USDT/TRX
4. 系统自动质押能量

请选择操作：
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="⚡ 租用能量", callback_data="rent_energy"),
            InlineKeyboardButton(text="📊 查看订单", callback_data="energy_orders")
        ],
        [
            InlineKeyboardButton(text="💰 价格计算", callback_data="energy_calc"),
            InlineKeyboardButton(text="❓ 使用说明", callback_data="energy_help")
        ],
        [
            InlineKeyboardButton(text="🏠 返回主菜单", callback_data="back_to_main")
        ]
    ])
    
    await callback.message.edit_text(energy_text, reply_markup=keyboard, parse_mode="Markdown")
    await state.set_state(UserStates.energy_service)

@router.callback_query(F.data == "address_monitor")
async def address_monitor_menu(callback: CallbackQuery, state: FSMContext):
    """地址监听功能"""
    monitor_text = """
👁️ **波场地址监听服务**

🔍 **监听功能：**
• 实时监控波场地址交易
• TRX/USDT 转账通知
• 智能合约交互提醒
• 大额交易预警

📊 **监听类型：**
• 转入交易监听
• 转出交易监听
• 合约调用监听
• 余额变动监听

💰 **收费标准：**
• 单地址监听：5 USDT/月
• 批量监听：优惠价格
• VIP套餐：无限监听

⚡ **特色功能：**
• 毫秒级推送
• 多维度筛选
• 自定义通知
• 历史数据查询

请选择操作：
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="➕ 添加监听", callback_data="add_monitor"),
            InlineKeyboardButton(text="📋 监听列表", callback_data="monitor_list")
        ],
        [
            InlineKeyboardButton(text="⚙️ 设置通知", callback_data="monitor_settings"),
            InlineKeyboardButton(text="📊 监听统计", callback_data="monitor_stats")
        ],
        [
            InlineKeyboardButton(text="🏠 返回主菜单", callback_data="back_to_main")
        ]
    ])
    
    await callback.message.edit_text(monitor_text, reply_markup=keyboard, parse_mode="Markdown")
    await state.set_state(UserStates.address_monitor)

@router.callback_query(F.data == "profile_center")
async def profile_center_menu(callback: CallbackQuery, state: FSMContext):
    """个人中心功能"""
    user_data = await UserManager.get_or_create_user(callback.from_user.id, callback.from_user.username, callback.from_user.first_name)
    
    profile_text = f"""
👤 **个人中心**

📊 **账户信息：**
**Name:** {user_data.get('first_name', callback.from_user.first_name or '用户')}
**UID:** {user_data.get('uid', '83067XXX')}
**余额:** {user_data.get('balance_usdt', '0.00')} USDT | {user_data.get('balance_trx', '0.00')} TRX

⚡ **能量信息：**
• 可用能量：{user_data.get('total_energy', 0)} 能量
• 会员等级：{user_data.get('member_level', '普通用户')}
• 注册时间：{user_data.get('register_time', '未知')}

📈 **统计数据：**
• 累计交易：0 次
• 总消费：0.00 USDT
• 推荐用户：0 人
• 获得佣金：0.00 USDT

🎯 **操作选项：**
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="💰 余额充值", callback_data="recharge"),
            InlineKeyboardButton(text="💸 提现申请", callback_data="withdraw")
        ],
        [
            InlineKeyboardButton(text="📊 交易记录", callback_data="transaction_history"),
            InlineKeyboardButton(text="👥 推荐用户", callback_data="referral")
        ],
        [
            InlineKeyboardButton(text="⚙️ 设置", callback_data="settings"),
            InlineKeyboardButton(text="🎫 优惠券", callback_data="coupons")
        ],
        [
            InlineKeyboardButton(text="🏠 返回主菜单", callback_data="back_to_main")
        ]
    ])
    
    await callback.message.edit_text(profile_text, reply_markup=keyboard, parse_mode="Markdown")
    await state.set_state(UserStates.profile_center)

@router.callback_query(F.data == "trx_exchange")
async def trx_exchange_menu(callback: CallbackQuery, state: FSMContext):
    """TRX兑换功能"""
    exchange_text = """
🔄 **TRX/USDT 兑换服务**

💱 **当前汇率：**
• TRX → USDT: 1 TRX = 0.1234 USDT
• USDT → TRX: 1 USDT = 8.1234 TRX
• 手续费：0.1%

⚡ **兑换特色：**
• 实时市场汇率
• 秒级到账
• 24小时自动兑换
• 最低手续费

💰 **兑换限制：**
• 最小兑换：10 USDT 或 100 TRX
• 最大兑换：10,000 USDT 或 100,000 TRX
• 日限额：50,000 USDT

🔒 **安全保障：**
• 冷钱包存储
• 多重签名
• 实时风控
• 资金保险

请选择兑换方向：
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="💱 TRX → USDT", callback_data="trx_to_usdt"),
            InlineKeyboardButton(text="💱 USDT → TRX", callback_data="usdt_to_trx")
        ],
        [
            InlineKeyboardButton(text="📊 汇率查询", callback_data="exchange_rates"),
            InlineKeyboardButton(text="📋 兑换记录", callback_data="exchange_history")
        ],
        [
            InlineKeyboardButton(text="🏠 返回主菜单", callback_data="back_to_main")
        ]
    ])
    
    await callback.message.edit_text(exchange_text, reply_markup=keyboard, parse_mode="Markdown")
    await state.set_state(UserStates.trx_exchange)

@router.callback_query(F.data == "realtime_rate")
async def realtime_rate_menu(callback: CallbackQuery, state: FSMContext):
    """实时U价功能"""
    rates = await ExchangeRateManager.get_usdt_cny_rate()
    
    rate_text = "🌎 **OTC实时汇率**\n\n"
    rate_text += "**来源：欧易**\n\n"
    rate_text += "**卖出价格**\n"
    
    for rate in rates:
        rate_text += f"⓵  {rate['price']} {rate['merchant']}\n" if rate['rank'] == 1 else f"{'⓶⓷⓸⓹⓺⓻⓼⓽⓾'[rate['rank']-2]}  {rate['price']} {rate['merchant']}\n"
    
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    rate_text += f"\n**更新时间：{current_time}**"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🔄 刷新汇率", callback_data="refresh_rate"),
            InlineKeyboardButton(text="📊 汇率走势", callback_data="rate_chart")
        ],
        [
            InlineKeyboardButton(text="🏠 返回主菜单", callback_data="back_to_main")
        ]
    ])
    
    await callback.message.edit_text(rate_text, reply_markup=keyboard, parse_mode="Markdown")
    await state.set_state(UserStates.realtime_rate)

@router.callback_query(F.data == "customer_service")
async def customer_service_menu(callback: CallbackQuery, state: FSMContext):
    """联系客服功能"""
    service_text = f"""
📞 **联系客服**

👨‍💼 **客服信息：**
• 客服ID：{CUSTOMER_SERVICE_ID}
• 服务时间：24小时在线
• 响应时间：< 5分钟
• 支持语言：中文/英文

🎯 **服务范围：**
• 账户问题咨询
• 交易异常处理
• 技术支持
• 投诉建议
• 业务合作

💬 **联系方式：**
• Telegram 私聊
• 机器人在线客服
• 邮件支持

🔥 **常见问题：**
• 能量租用说明
• 支付问题解决
• 账户安全设置
• 手续费说明

点击下方按钮直接联系客服：
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="💬 私聊客服", url=f"https://t.me/{CUSTOMER_SERVICE_ID.replace('@', '')}")
        ],
        [
            InlineKeyboardButton(text="❓ 常见问题", callback_data="faq"),
            InlineKeyboardButton(text="📧 邮件支持", callback_data="email_support")
        ],
        [
            InlineKeyboardButton(text="🏠 返回主菜单", callback_data="back_to_main")
        ]
    ])
    
    await callback.message.edit_text(service_text, reply_markup=keyboard, parse_mode="Markdown")
    await state.set_state(UserStates.customer_service)

@router.callback_query(F.data == "buy_stars")
async def buy_stars_menu(callback: CallbackQuery, state: FSMContext):
    """购买星星功能"""
    stars_text = """
⭐ **购买星星服务**

✨ **Telegram Stars 介绍：**
• Telegram 官方虚拟货币
• 用于打赏和购买服务
• 支持应用内购买
• 安全便捷支付方式

💰 **星星套餐：**
• 100 Stars - 1.99 USDT
• 500 Stars - 9.99 USDT
• 1000 Stars - 19.99 USDT
• 2500 Stars - 49.99 USDT
• 5000 Stars - 99.99 USDT

🎁 **用途说明：**
• 打赏频道和群组
• 购买 Telegram 应用
• 支付数字内容
• 解锁高级功能

⚡ **购买流程：**
1. 选择星星数量
2. 支付 USDT/TRX
3. 系统自动充值
4. 即时到账使用

请选择星星套餐：
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="100 Stars - 1.99 USDT", callback_data="stars_100"),
            InlineKeyboardButton(text="500 Stars - 9.99 USDT", callback_data="stars_500")
        ],
        [
            InlineKeyboardButton(text="1000 Stars - 19.99 USDT", callback_data="stars_1000"),
            InlineKeyboardButton(text="2500 Stars - 49.99 USDT", callback_data="stars_2500")
        ],
        [
            InlineKeyboardButton(text="5000 Stars - 99.99 USDT", callback_data="stars_5000")
        ],
        [
            InlineKeyboardButton(text="🏠 返回主菜单", callback_data="back_to_main")
        ]
    ])
    
    await callback.message.edit_text(stars_text, reply_markup=keyboard, parse_mode="Markdown")
    await state.set_state(UserStates.buy_stars)

@router.callback_query(F.data == "energy_flash_rent")
async def energy_flash_rent_menu(callback: CallbackQuery, state: FSMContext):
    """能量闪租功能"""
    flash_text = """
⚡ **能量闪租服务**

🚀 **闪租特色：**
• 1分钟内到账
• 按小时计费
• 灵活租用期限
• 无需长期质押

⏱️ **租用时长：**
• 1小时 - 0.001 USDT/能量
• 6小时 - 0.005 USDT/能量
• 24小时 - 0.018 USDT/能量
• 3天 - 0.05 USDT/能量

🎯 **适用场景：**
• 紧急交易需求
• 临时大额转账
• 合约交互操作
• 批量交易处理

💡 **使用说明：**
1. 选择租用时长
2. 输入需要能量数量
3. 提供接收地址
4. 支付完成即时到账

⚡ **当前可租用：1,000,000 能量**

请选择租用时长：
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="1小时租用", callback_data="flash_1h"),
            InlineKeyboardButton(text="6小时租用", callback_data="flash_6h")
        ],
        [
            InlineKeyboardButton(text="24小时租用", callback_data="flash_24h"),
            InlineKeyboardButton(text="3天租用", callback_data="flash_3d")
        ],
        [
            InlineKeyboardButton(text="📊 闪租记录", callback_data="flash_history"),
            InlineKeyboardButton(text="💰 价格计算", callback_data="flash_calc")
        ],
        [
            InlineKeyboardButton(text="🏠 返回主菜单", callback_data="back_to_main")
        ]
    ])
    
    await callback.message.edit_text(flash_text, reply_markup=keyboard, parse_mode="Markdown")
    await state.set_state(UserStates.energy_flash_rent)

@router.callback_query(F.data == "free_clone")
async def free_clone_menu(callback: CallbackQuery, state: FSMContext):
    """免费克隆功能"""
    clone_text = """
🆓 **免费克隆服务**

🚀 **容器化管理系统：**
• Docker 容器部署
• 自动化配置
• 一键克隆部署
• 分布式管理

👥 **代理商发展：**
• 发展下线商家
• 自定义分润规则
• 独立后台管理
• 品牌定制服务

💰 **收益模式：**
• 服务费抽成：10%
• 推荐佣金：5%
• 月度奖励：最高1000 USDT
• VIP专属福利

🔧 **克隆包含：**
• 完整机器人功能
• 支付系统集成
• 客服系统配置
• 数据统计面板

🎯 **适用人群：**
• 有推广资源的用户
• 社群运营者
• 数字货币从业者
• 技术服务商

请选择操作：
"""
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🆓 申请克隆", callback_data="apply_clone"),
            InlineKeyboardButton(text="📊 收益查看", callback_data="clone_earnings")
        ],
        [
            InlineKeyboardButton(text="👥 我的下线", callback_data="my_agents"),
            InlineKeyboardButton(text="⚙️ 分润设置", callback_data="profit_settings")
        ],
        [
            InlineKeyboardButton(text="📖 使用教程", callback_data="clone_tutorial"),
            InlineKeyboardButton(text="💬 技术支持", callback_data="tech_support")
        ],
        [
            InlineKeyboardButton(text="🏠 返回主菜单", callback_data="back_to_main")
        ]
    ])
    
    await callback.message.edit_text(clone_text, reply_markup=keyboard, parse_mode="Markdown")
    await state.set_state(UserStates.free_clone)

# 设置机器人命令菜单
async def setup_bot_commands():
    """设置机器人命令菜单"""
    commands = [
        BotCommand(command="start", description="🏠 开始使用机器人"),
        BotCommand(command="help", description="📖 获取帮助信息"),
        BotCommand(command="menu", description="📋 显示主菜单"),
        BotCommand(command="profile", description="👤 个人中心"),
        BotCommand(command="energy", description="⚡ 能量服务"),
        BotCommand(command="rate", description="💱 实时汇率"),
        BotCommand(command="support", description="📞 联系客服")
    ]
    
    await bot.set_my_commands(commands)
    logger.info("Bot commands set successfully")

# 主函数
async def main():
    """启动机器人"""
    try:
        # 注册路由
        dp.include_router(router)
        
        # 设置命令菜单
        await setup_bot_commands()
        
        # 启动机器人
        logger.info("Starting Energy Exchange Bot...")
        await dp.start_polling(bot)
        
    except Exception as e:
        logger.error("Failed to start bot", error=str(e))
    finally:
        await bot.session.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error("Bot crashed", error=str(e))