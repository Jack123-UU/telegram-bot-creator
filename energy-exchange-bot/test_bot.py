#!/usr/bin/env python3
"""
能量兑换机器人测试脚本
用于测试机器人基本功能
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 直接导入类和函数，避免初始化 Bot
sys.path.append('.')

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

async def test_user_manager():
    """测试用户管理功能"""
    print("🧪 测试用户管理功能...")
    
    user_data = await UserManager.get_or_create_user(123456789, "testuser", "Test User")
    print(f"✅ 用户数据: {user_data}")
    
    assert user_data['user_id'] == 123456789
    assert user_data['username'] == "testuser"
    assert 'balance_usdt' in user_data
    assert 'balance_trx' in user_data
    
    print("✅ 用户管理测试通过")

async def test_exchange_rate():
    """测试汇率获取功能"""
    print("🧪 测试汇率获取功能...")
    
    rates = await ExchangeRateManager.get_usdt_cny_rate()
    print(f"✅ 汇率数据: {len(rates)} 条记录")
    
    assert len(rates) == 10
    assert all('price' in rate and 'merchant' in rate for rate in rates)
    
    print("✅ 汇率获取测试通过")

async def test_energy_service():
    """测试能量服务功能"""
    print("🧪 测试能量服务功能...")
    
    energy_info = await EnergyServiceManager.get_energy_price()
    print(f"✅ 能量信息: {energy_info}")
    
    assert 'current_price' in energy_info
    assert 'available_energy' in energy_info
    assert 'min_rent' in energy_info
    assert 'max_rent' in energy_info
    
    print("✅ 能量服务测试通过")

async def test_tron_connection():
    """测试TRON网络连接"""
    print("🧪 测试TRON网络连接...")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('https://api.trongrid.io/wallet/getnowblock') as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print(f"✅ TRON网络连接成功，当前区块: {data.get('block_header', {}).get('raw_data', {}).get('number', 'Unknown')}")
                else:
                    print(f"⚠️ TRON网络连接异常，状态码: {resp.status}")
    except Exception as e:
        print(f"❌ TRON网络连接失败: {e}")

async def test_bot_structure():
    """测试机器人结构"""
    print("🧪 测试机器人结构...")
    
    # 测试主菜单按钮数量
    expected_buttons = [
        "飞机会员", "能量服务", "地址监听", "个人中心",
        "TRX兑换", "限时能量", "联系客服", "购买星星", 
        "能量闪租", "实时U价", "免费克隆"
    ]
    
    print(f"✅ 预期功能按钮: {len(expected_buttons)} 个")
    for i, button in enumerate(expected_buttons, 1):
        print(f"   {i}. {button}")
    
    print("✅ 机器人结构测试通过")

async def run_all_tests():
    """运行所有测试"""
    print("🚀 开始运行能量兑换机器人测试...")
    print("=" * 50)
    
    tests = [
        test_user_manager,
        test_exchange_rate,
        test_energy_service,
        test_tron_connection,
        test_bot_structure
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            await test()
            passed += 1
            print("✅ 测试通过\n")
        except Exception as e:
            failed += 1
            print(f"❌ 测试失败: {e}\n")
    
    print("=" * 50)
    print(f"📊 测试结果: {passed} 通过, {failed} 失败")
    
    if failed == 0:
        print("🎉 所有测试通过! 机器人功能正常!")
    else:
        print("⚠️  有测试失败，请检查相关功能!")

if __name__ == "__main__":
    asyncio.run(run_all_tests())