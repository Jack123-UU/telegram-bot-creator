"""
TRON Payment Monitor Service
Continuously monitors blockchain for payments and notifies backend
"""

import asyncio
import logging
import os
import sys
from datetime import datetime, timedelta
from typing import Set, Dict, Any
import json

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.tron_client import TronClient, PaymentMonitor
from backend.vault_client import VaultClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment variables
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
VAULT_ADDR = os.getenv("VAULT_ADDR", "http://localhost:8200")
VAULT_TOKEN = os.getenv("VAULT_TOKEN", "dev-root-token")
TRON_NODE_URL = os.getenv("TRON_NODE_URL", "https://api.trongrid.io")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
MONITOR_INTERVAL = int(os.getenv("MONITOR_INTERVAL", "30"))  # seconds

class PaymentMonitorService:
    """Main payment monitoring service"""
    
    def __init__(self):
        self.vault_client = None
        self.tron_client = None
        self.payment_monitor = None
        self.processed_transactions: Set[str] = set()
        self.is_running = False
        
    async def initialize(self):
        """Initialize all clients and services"""
        try:
            logger.info("Initializing Payment Monitor Service...")
            
            # Initialize Vault client
            self.vault_client = VaultClient(VAULT_ADDR, VAULT_TOKEN)
            await self.vault_client.initialize_secrets()
            
            # Initialize TRON client
            self.tron_client = TronClient(self.vault_client, TRON_NODE_URL)
            await self.tron_client.initialize()
            
            # Initialize payment monitor
            self.payment_monitor = PaymentMonitor(self.tron_client, API_BASE_URL)
            
            logger.info("Payment Monitor Service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Payment Monitor Service: {e}")
            raise
    
    async def start_monitoring(self):
        """Start the payment monitoring loop"""
        self.is_running = True
        logger.info("Starting payment monitoring...")
        
        # Start background tasks
        tasks = [
            asyncio.create_task(self.monitor_payments()),
            asyncio.create_task(self.cleanup_old_transactions()),
            asyncio.create_task(self.health_check_loop())
        ]
        
        try:
            await asyncio.gather(*tasks)
        except Exception as e:
            logger.error(f"Error in monitoring loop: {e}")
        finally:
            self.is_running = False
            logger.info("Payment monitoring stopped")
    
    async def monitor_payments(self):
        """Main payment monitoring loop"""
        while self.is_running:
            try:
                await self.check_for_payments()
                await asyncio.sleep(MONITOR_INTERVAL)
                
            except Exception as e:
                logger.error(f"Error in payment monitoring: {e}")
                await asyncio.sleep(5)  # Brief pause before retry
    
    async def check_for_payments(self):
        """Check for new payments"""
        try:
            if not self.tron_client.payment_address:
                logger.warning("Payment address not configured")
                return
            
            # Get recent transactions
            transactions = await self.tron_client.get_recent_transactions(
                self.tron_client.payment_address,
                limit=50,
                only_to=True
            )
            
            # Process new transactions
            new_transactions = 0
            for tx in transactions:
                if tx["tx_hash"] not in self.processed_transactions:
                    await self.process_transaction(tx)
                    self.processed_transactions.add(tx["tx_hash"])
                    new_transactions += 1
            
            if new_transactions > 0:
                logger.info(f"Processed {new_transactions} new transactions")
            
        except Exception as e:
            logger.error(f"Error checking for payments: {e}")
    
    async def process_transaction(self, transaction: Dict[str, Any]):
        """Process a single transaction"""
        try:
            # Only process USDT transactions with sufficient confirmations
            if transaction["token"] != "USDT-TRC20":
                logger.debug(f"Skipping non-USDT transaction: {transaction['tx_hash']}")
                return
            
            if transaction["confirmations"] < 1:
                logger.debug(f"Skipping unconfirmed transaction: {transaction['tx_hash']}")
                return
            
            # Send to payment monitor for backend notification
            await self.payment_monitor.process_transaction(transaction)
            
            logger.info(
                f"Processed payment: {transaction['tx_hash']} - "
                f"{transaction['amount']} {transaction['token']} - "
                f"{transaction['confirmations']} confirmations"
            )
            
        except Exception as e:
            logger.error(f"Error processing transaction {transaction.get('tx_hash', 'unknown')}: {e}")
    
    async def cleanup_old_transactions(self):
        """Clean up old processed transactions to prevent memory growth"""
        while self.is_running:
            try:
                # Clean up every hour
                await asyncio.sleep(3600)
                
                # Keep only recent transactions (last 24 hours worth)
                # This is a simple implementation - in production you'd use a more sophisticated approach
                if len(self.processed_transactions) > 10000:
                    # Remove oldest half of transactions
                    transactions_list = list(self.processed_transactions)
                    self.processed_transactions = set(transactions_list[5000:])
                    logger.info("Cleaned up old processed transactions")
                    
            except Exception as e:
                logger.error(f"Error in transaction cleanup: {e}")
    
    async def health_check_loop(self):
        """Periodic health checks"""
        while self.is_running:
            try:
                await asyncio.sleep(300)  # Every 5 minutes
                
                # Check TRON network status
                network_status = await self.tron_client.get_network_status()
                
                if network_status["status"] != "online":
                    logger.warning(f"TRON network status: {network_status}")
                else:
                    logger.debug(f"TRON network healthy - Block: {network_status['block_height']}")
                
                # Check Vault health
                vault_health = await self.vault_client.get_health()
                if vault_health["status"] != "healthy":
                    logger.warning(f"Vault status: {vault_health}")
                
            except Exception as e:
                logger.error(f"Error in health check: {e}")
    
    async def shutdown(self):
        """Graceful shutdown"""
        logger.info("Shutting down Payment Monitor Service...")
        
        self.is_running = False
        
        if self.vault_client:
            await self.vault_client.close()
        
        logger.info("Payment Monitor Service shutdown complete")

async def main():
    """Main entry point"""
    service = PaymentMonitorService()
    
    try:
        await service.initialize()
        await service.start_monitoring()
        
    except KeyboardInterrupt:
        logger.info("Received shutdown signal")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
    finally:
        await service.shutdown()

if __name__ == "__main__":
    # Handle graceful shutdown
    import signal
    
    def signal_handler(signum, frame):
        logger.info(f"Received signal {signum}")
        raise KeyboardInterrupt()
    
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    asyncio.run(main())