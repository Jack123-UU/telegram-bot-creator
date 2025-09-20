"""
Vault client for bot service (simplified version)
"""

import aiohttp
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class VaultClient:
    """Simplified Vault client for bot service"""
    
    def __init__(self, vault_addr: str, vault_token: str):
        self.vault_addr = vault_addr.rstrip("/")
        self.vault_token = vault_token
        self.session = None
        
    async def _get_session(self):
        """Get or create aiohttp session"""
        if self.session is None:
            self.session = aiohttp.ClientSession(
                headers={
                    "X-Vault-Token": self.vault_token,
                    "Content-Type": "application/json"
                }
            )
        return self.session
    
    async def close(self):
        """Close the session"""
        if self.session:
            await self.session.close()
            self.session = None
    
    async def initialize_secrets(self):
        """Initialize for bot service"""
        try:
            # Test connection to Vault
            await self.get_secret("bot/token")
            logger.info("Bot Vault client initialized")
        except Exception as e:
            logger.warning(f"Vault not available, using fallback: {e}")
    
    async def get_secret(self, path: str) -> Optional[str]:
        """Get a secret from Vault"""
        try:
            session = await self._get_session()
            
            url = f"{self.vault_addr}/v1/secret/data/{path}"
            
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    return data["data"]["data"]["value"]
                else:
                    return self._get_dev_fallback(path)
                    
        except Exception as e:
            logger.error(f"Error getting secret {path}: {e}")
            return self._get_dev_fallback(path)
    
    def _get_dev_fallback(self, path: str) -> Optional[str]:
        """Get development fallback values - USE ENVIRONMENT VARIABLES IN PRODUCTION"""
        # In production, ensure all secrets come from Vault or secure environment variables
        # These fallbacks should only be used in development with proper .env files
        fallbacks = {
            "bot/token": os.getenv("DEV_BOT_TOKEN"),
            "api/internal-token": os.getenv("DEV_INTERNAL_TOKEN")
        }
        fallback_value = fallbacks.get(path)
        if not fallback_value:
            logger.error(f"No fallback or environment variable found for {path}")
            return None
        return fallback_value