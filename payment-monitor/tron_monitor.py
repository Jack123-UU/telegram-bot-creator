import asyncio
import logging
import os
from decimal import Decimal
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import aiohttp
import json
from tronpy import Tron
from tronpy.providers import HTTPProvider
import structlog
from dataclasses import dataclass

logger = structlog.get_logger()


@dataclass
class PaymentEvent:
    """Payment event data structure"""
    tx_hash: str
    from_address: str
    to_address: str
    token: str
    amount: Decimal
    confirmations: int
    block_number: int
    timestamp: datetime


class TronPaymentMonitor:
    """TRON blockchain payment monitoring service"""
    
    def __init__(self):
        self.tron_node_url = os.getenv("TRON_NODE_URL", "https://api.trongrid.io")
        self.payment_address = os.getenv("PAYMENT_ADDRESS", "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE")
        self.usdt_contract = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"  # USDT-TRC20
        self.backend_api_url = os.getenv("BACKEND_API_URL", "http://localhost:8000")
        self.internal_api_token = os.getenv("INTERNAL_API_TOKEN", "dev-internal-token")
        self.confirmation_blocks = int(os.getenv("CONFIRMATION_BLOCKS", "1"))
        self.polling_interval = int(os.getenv("POLLING_INTERVAL", "30"))  # seconds
        
        # Initialize Tron client
        self.tron = Tron(HTTPProvider(self.tron_node_url))
        self.last_processed_block = None
        self.processed_transactions = set()
        
        logger.info("TronPaymentMonitor initialized", 
                   payment_address=self.payment_address,
                   node_url=self.tron_node_url)
    
    async def start_monitoring(self):
        """Start the payment monitoring loop"""
        logger.info("Starting TRON payment monitoring")
        
        # Get starting block
        if not self.last_processed_block:
            try:
                latest_block = await self.get_latest_block_number()
                self.last_processed_block = latest_block - 100  # Start 100 blocks back
                logger.info("Starting from block", block=self.last_processed_block)
            except Exception as e:
                logger.error("Failed to get latest block", error=str(e))
                return
        
        while True:
            try:
                await self.check_for_payments()
                await asyncio.sleep(self.polling_interval)
            except Exception as e:
                logger.error("Error in monitoring loop", error=str(e))
                await asyncio.sleep(60)  # Wait longer on error
    
    async def get_latest_block_number(self) -> int:
        """Get the latest block number"""
        try:
            block = self.tron.get_latest_block()
            return block['block_header']['raw_data']['number']
        except Exception as e:
            logger.error("Error getting latest block", error=str(e))
            raise
    
    async def check_for_payments(self):
        """Check for new payments to our address"""
        try:
            latest_block = await self.get_latest_block_number()
            
            if latest_block <= self.last_processed_block:
                return
            
            logger.debug("Checking blocks for payments", 
                        from_block=self.last_processed_block,
                        to_block=latest_block)
            
            # Get transactions for our address
            transactions = await self.get_address_transactions(
                self.payment_address,
                self.last_processed_block + 1,
                latest_block
            )
            
            for tx in transactions:
                await self.process_transaction(tx)
            
            self.last_processed_block = latest_block
            
        except Exception as e:
            logger.error("Error checking for payments", error=str(e))
    
    async def get_address_transactions(self, address: str, from_block: int, to_block: int) -> List[Dict]:
        """Get transactions for an address in block range"""
        try:
            # Use TronGrid API for transaction history
            url = f"{self.tron_node_url}/v1/accounts/{address}/transactions/trc20"
            params = {
                'limit': 200,
                'contract_address': self.usdt_contract
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get('data', [])
                    else:
                        logger.error("Error fetching transactions", status=response.status)
                        return []
        except Exception as e:
            logger.error("Error getting address transactions", error=str(e))
            return []
    
    async def process_transaction(self, tx_data: Dict):
        """Process a single transaction"""
        try:
            tx_hash = tx_data.get('transaction_id')
            
            # Skip if already processed
            if tx_hash in self.processed_transactions:
                return
            
            # Extract transaction details
            to_address = tx_data.get('to')
            from_address = tx_data.get('from')
            amount_raw = tx_data.get('value', '0')
            block_timestamp = tx_data.get('block_timestamp', 0)
            
            # Skip if not to our payment address
            if to_address.lower() != self.payment_address.lower():
                return
            
            # Convert amount (USDT has 6 decimals)
            amount = Decimal(amount_raw) / Decimal('1000000')
            
            # Get transaction details for confirmations
            confirmations = await self.get_transaction_confirmations(tx_hash)
            
            if confirmations < self.confirmation_blocks:
                logger.debug("Transaction not confirmed yet", 
                           tx_hash=tx_hash, 
                           confirmations=confirmations)
                return
            
            # Create payment event
            payment_event = PaymentEvent(
                tx_hash=tx_hash,
                from_address=from_address,
                to_address=to_address,
                token="USDT-TRC20",
                amount=amount,
                confirmations=confirmations,
                block_number=tx_data.get('block', 0),
                timestamp=datetime.fromtimestamp(block_timestamp / 1000)
            )
            
            # Process payment
            await self.handle_payment_event(payment_event)
            
            # Mark as processed
            self.processed_transactions.add(tx_hash)
            
            logger.info("Payment processed", 
                       tx_hash=tx_hash,
                       amount=str(amount),
                       from_address=from_address)
            
        except Exception as e:
            logger.error("Error processing transaction", error=str(e), tx_data=tx_data)
    
    async def get_transaction_confirmations(self, tx_hash: str) -> int:
        """Get number of confirmations for a transaction"""
        try:
            tx_info = self.tron.get_transaction(tx_hash)
            if not tx_info:
                return 0
            
            current_block = await self.get_latest_block_number()
            tx_block = tx_info.get('blockNumber', 0)
            
            if tx_block == 0:
                return 0
            
            return max(0, current_block - tx_block + 1)
            
        except Exception as e:
            logger.error("Error getting confirmations", error=str(e))
            return 0
    
    async def handle_payment_event(self, payment: PaymentEvent):
        """Handle confirmed payment event"""
        try:
            # Notify backend API about payment
            payment_data = {
                "tx_hash": payment.tx_hash,
                "from_address": payment.from_address,
                "to_address": payment.to_address,
                "token": payment.token,
                "amount": str(payment.amount),
                "confirmations": payment.confirmations,
                "block_number": payment.block_number,
                "timestamp": payment.timestamp.isoformat()
            }
            
            headers = {
                "Content-Type": "application/json",
                "X-Internal-Token": self.internal_api_token
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.backend_api_url}/internal/payments/notify",
                    json=payment_data,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info("Payment notification sent", 
                                   tx_hash=payment.tx_hash,
                                   matched_orders=result.get('matched_orders', []))
                    else:
                        logger.error("Failed to notify backend", 
                                   status=response.status,
                                   tx_hash=payment.tx_hash)
        
        except Exception as e:
            logger.error("Error handling payment event", error=str(e))


class PaymentAmountGenerator:
    """Generate unique payment amounts for order identification"""
    
    @staticmethod
    def generate_unique_amount(base_amount: Decimal, order_id: str) -> Decimal:
        """Generate unique amount by adding distinctive decimal places"""
        # Use last 4 digits of order ID to create unique suffix
        order_suffix = int(order_id[-4:]) if len(order_id) >= 4 else int(order_id)
        
        # Create 6-decimal precision unique amount
        # Base amount + 0.00XXXX where XXXX is derived from order ID
        unique_suffix = (order_suffix % 9999) + 1  # Ensure non-zero
        decimal_suffix = Decimal(unique_suffix) / Decimal('1000000')
        
        unique_amount = base_amount + decimal_suffix
        
        # Ensure we have exactly 6 decimal places
        return unique_amount.quantize(Decimal('0.000001'))


class TronWalletManager:
    """Manage TRON wallet operations"""
    
    def __init__(self):
        self.tron = Tron(HTTPProvider(os.getenv("TRON_NODE_URL", "https://api.trongrid.io")))
        self.payment_address = os.getenv("PAYMENT_ADDRESS", "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE")
    
    async def get_balance(self, address: str = None) -> Dict[str, Decimal]:
        """Get TRX and USDT balance for address"""
        try:
            addr = address or self.payment_address
            
            # Get TRX balance
            trx_balance = self.tron.get_account_balance(addr)
            
            # Get USDT balance
            usdt_contract = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
            try:
                usdt_balance_raw = self.tron.get_contract(usdt_contract).functions.balanceOf(addr).call()
                usdt_balance = Decimal(usdt_balance_raw) / Decimal('1000000')
            except:
                usdt_balance = Decimal('0')
            
            return {
                "TRX": Decimal(str(trx_balance)),
                "USDT": usdt_balance
            }
            
        except Exception as e:
            logger.error("Error getting balance", error=str(e))
            return {"TRX": Decimal('0'), "USDT": Decimal('0')}
    
    def validate_address(self, address: str) -> bool:
        """Validate TRON address format"""
        try:
            return self.tron.is_address(address)
        except:
            return False


async def main():
    """Main function to start payment monitoring"""
    monitor = TronPaymentMonitor()
    await monitor.start_monitoring()


if __name__ == "__main__":
    asyncio.run(main())