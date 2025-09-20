"""
TRON blockchain client for payment processing
"""

import asyncio
import logging
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import datetime
import aiohttp
import json
from tronpy import Tron
from tronpy.providers import HTTPProvider

from vault_client import VaultClient

logger = logging.getLogger(__name__)

class TronClient:
    """TRON blockchain client for payment monitoring and processing"""
    
    def __init__(self, vault_client: VaultClient, node_url: Optional[str] = None):
        self.vault_client = vault_client
        self.node_url = node_url or "https://api.trongrid.io"
        self.client = None
        self.private_key = None
        self.payment_address = None
        
    async def initialize(self):
        """Initialize TRON client with secrets from Vault"""
        try:
            # Get secrets from Vault
            self.private_key = await self.vault_client.get_secret("tron/private-key")
            self.payment_address = await self.vault_client.get_secret("payment/tron-address")
            
            # Initialize TRON client
            provider = HTTPProvider(self.node_url)
            self.client = Tron(provider)
            
            logger.info(f"TRON client initialized with address: {self.payment_address}")
            
        except Exception as e:
            logger.error(f"Failed to initialize TRON client: {e}")
            raise
    
    async def get_account_info(self, address: str) -> Dict[str, Any]:
        """Get account information"""
        try:
            if not self.client:
                await self.initialize()
                
            account = self.client.get_account(address)
            return {
                "address": address,
                "balance": account.get("balance", 0) / 1_000_000,  # Convert from sun to TRX
                "trc20_balances": await self.get_trc20_balances(address)
            }
            
        except Exception as e:
            logger.error(f"Error getting account info: {e}")
            return {"address": address, "balance": 0, "trc20_balances": {}}
    
    async def get_trc20_balances(self, address: str) -> Dict[str, float]:
        """Get TRC20 token balances"""
        balances = {}
        
        # USDT contract on TRON
        usdt_contract = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
        
        try:
            async with aiohttp.ClientSession() as session:
                # Get USDT balance
                url = f"{self.node_url}/v1/accounts/{address}/transactions/trc20"
                params = {
                    "contract_address": usdt_contract,
                    "limit": 1
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        # This is a simplified implementation
                        # In production, you'd need to query the contract directly
                        balances["USDT"] = 0.0
                        
        except Exception as e:
            logger.error(f"Error getting TRC20 balances: {e}")
            
        return balances
    
    async def get_recent_transactions(
        self, 
        address: str, 
        limit: int = 50,
        only_to: bool = True
    ) -> list:
        """Get recent transactions for an address"""
        transactions = []
        
        try:
            async with aiohttp.ClientSession() as session:
                # Get TRX transactions
                url = f"{self.node_url}/v1/accounts/{address}/transactions"
                params = {
                    "limit": limit,
                    "only_to": "true" if only_to else "false"
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        trx_txs = data.get("data", [])
                        
                        for tx in trx_txs:
                            transactions.append({
                                "tx_hash": tx.get("txID"),
                                "from_address": tx.get("raw_data", {}).get("contract", [{}])[0].get("parameter", {}).get("value", {}).get("owner_address"),
                                "to_address": address,
                                "amount": tx.get("raw_data", {}).get("contract", [{}])[0].get("parameter", {}).get("value", {}).get("amount", 0) / 1_000_000,
                                "token": "TRX",
                                "timestamp": datetime.fromtimestamp(tx.get("block_timestamp", 0) / 1000),
                                "confirmations": self._calculate_confirmations(tx.get("block_timestamp", 0))
                            })
                
                # Get TRC20 transactions (USDT)
                url = f"{self.node_url}/v1/accounts/{address}/transactions/trc20"
                params = {
                    "limit": limit,
                    "only_to": "true" if only_to else "false"
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        trc20_txs = data.get("data", [])
                        
                        for tx in trc20_txs:
                            # Focus on USDT transactions
                            if tx.get("token_info", {}).get("symbol") == "USDT":
                                transactions.append({
                                    "tx_hash": tx.get("transaction_id"),
                                    "from_address": tx.get("from"),
                                    "to_address": tx.get("to"),
                                    "amount": float(tx.get("value", 0)) / pow(10, tx.get("token_info", {}).get("decimals", 6)),
                                    "token": "USDT-TRC20",
                                    "timestamp": datetime.fromtimestamp(tx.get("block_timestamp", 0) / 1000),
                                    "confirmations": self._calculate_confirmations(tx.get("block_timestamp", 0))
                                })
                
        except Exception as e:
            logger.error(f"Error getting recent transactions: {e}")
            
        # Sort by timestamp, most recent first
        transactions.sort(key=lambda x: x["timestamp"], reverse=True)
        return transactions[:limit]
    
    def _calculate_confirmations(self, block_timestamp: int) -> int:
        """Calculate number of confirmations based on block timestamp"""
        # Simplified calculation - in production, you'd query current block height
        if block_timestamp == 0:
            return 0
            
        now = datetime.utcnow().timestamp() * 1000
        time_diff = now - block_timestamp
        
        # Assume 3 second block time on TRON
        confirmations = max(0, int(time_diff / 3000))
        return min(confirmations, 200)  # Cap at 200 confirmations
    
    async def validate_address(self, address: str) -> bool:
        """Validate TRON address format"""
        try:
            if not address.startswith("T") or len(address) != 34:
                return False
                
            # Additional validation could be added here
            return True
            
        except Exception as e:
            logger.error(f"Error validating address {address}: {e}")
            return False
    
    async def estimate_transaction_fee(self) -> Decimal:
        """Estimate transaction fee for TRON network"""
        # TRON has very low fees, typically around 1 TRX for basic transfers
        return Decimal("1.0")
    
    async def get_network_status(self) -> Dict[str, Any]:
        """Get TRON network status"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.node_url}/wallet/getnowblock"
                
                async with session.post(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        block_height = data.get("block_header", {}).get("raw_data", {}).get("number", 0)
                        
                        return {
                            "status": "online",
                            "block_height": block_height,
                            "node_url": self.node_url,
                            "last_updated": datetime.utcnow()
                        }
                        
        except Exception as e:
            logger.error(f"Error getting network status: {e}")
            
        return {
            "status": "offline",
            "block_height": 0,
            "node_url": self.node_url,
            "last_updated": datetime.utcnow(),
            "error": str(e) if 'e' in locals() else "Unknown error"
        }

class PaymentMonitor:
    """Background service to monitor payments"""
    
    def __init__(self, tron_client: TronClient, api_base_url: str):
        self.tron_client = tron_client
        self.api_base_url = api_base_url
        self.is_running = False
        self.monitor_interval = 30  # seconds
        
    async def start_monitoring(self):
        """Start payment monitoring loop"""
        self.is_running = True
        logger.info("Payment monitoring started")
        
        while self.is_running:
            try:
                await self.check_payments()
                await asyncio.sleep(self.monitor_interval)
                
            except Exception as e:
                logger.error(f"Error in payment monitoring: {e}")
                await asyncio.sleep(5)  # Brief pause before retry
    
    def stop_monitoring(self):
        """Stop payment monitoring"""
        self.is_running = False
        logger.info("Payment monitoring stopped")
    
    async def check_payments(self):
        """Check for new payments to our address"""
        try:
            if not self.tron_client.payment_address:
                return
                
            # Get recent transactions
            transactions = await self.tron_client.get_recent_transactions(
                self.tron_client.payment_address,
                limit=20
            )
            
            # Process each transaction
            for tx in transactions:
                await self.process_transaction(tx)
                
        except Exception as e:
            logger.error(f"Error checking payments: {e}")
    
    async def process_transaction(self, transaction: Dict[str, Any]):
        """Process a single transaction"""
        try:
            # Skip if insufficient confirmations
            if transaction["confirmations"] < 1:
                return
                
            # Skip if not USDT (we only accept USDT payments)
            if transaction["token"] != "USDT-TRC20":
                return
                
            # Send notification to backend API
            async with aiohttp.ClientSession() as session:
                url = f"{self.api_base_url}/internal/payments/notify"
                
                payload = {
                    "tx_hash": transaction["tx_hash"],
                    "from_address": transaction["from_address"],
                    "to_address": transaction["to_address"],
                    "amount": str(transaction["amount"]),
                    "token": transaction["token"],
                    "confirmations": transaction["confirmations"],
                    "timestamp": transaction["timestamp"].isoformat()
                }
                
                headers = {
                    "Content-Type": "application/json",
                    "X-Internal-Token": os.getenv("INTERNAL_API_TOKEN") or os.getenv("DEV_INTERNAL_TOKEN")
                }
                
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"Payment notification sent: {transaction['tx_hash']} -> {result}")
                    else:
                        logger.warning(f"Failed to send payment notification: {response.status}")
                        
        except Exception as e:
            logger.error(f"Error processing transaction {transaction.get('tx_hash', 'unknown')}: {e}")