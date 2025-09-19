"""
HashiCorp Vault client for secure secrets management
"""

import asyncio
import logging
import aiohttp
import json
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class VaultClient:
    """HashiCorp Vault client for secrets management"""
    
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
        """Initialize development secrets in Vault"""
        try:
            # Enable KV secrets engine if not already enabled
            await self._enable_kv_engine()
            
            # Create development secrets
            dev_secrets = {
                "bot/token": "dev-bot-token-123456789",
                "tron/private-key": "dev-private-key-0123456789abcdef",
                "payment/tron-address": "TDevAddress123456789012345678901234",
                "api/internal-token": "dev-internal-token-secure-123",
                "encryption/aes-key": "dev-aes-key-32-bytes-0123456789ab",
                "minio/access-key": "minioadmin",
                "minio/secret-key": "minioadmin123"
            }
            
            for path, value in dev_secrets.items():
                await self.set_secret(path, value)
                
            logger.info("Development secrets initialized in Vault")
            
        except Exception as e:
            logger.error(f"Failed to initialize secrets: {e}")
            # In development, continue without Vault
            if "development" in str(e).lower():
                logger.warning("Running in development mode without Vault")
    
    async def _enable_kv_engine(self):
        """Enable KV secrets engine"""
        try:
            session = await self._get_session()
            
            url = f"{self.vault_addr}/v1/sys/mounts/secret"
            payload = {
                "type": "kv",
                "options": {
                    "version": "2"
                }
            }
            
            async with session.post(url, json=payload) as response:
                if response.status in [200, 204]:
                    logger.info("KV secrets engine enabled")
                elif response.status == 400:
                    # Already enabled
                    logger.info("KV secrets engine already enabled")
                else:
                    logger.warning(f"Failed to enable KV engine: {response.status}")
                    
        except Exception as e:
            logger.error(f"Error enabling KV engine: {e}")
    
    async def get_secret(self, path: str) -> Optional[str]:
        """Get a secret from Vault"""
        try:
            session = await self._get_session()
            
            # Use KV v2 API format
            url = f"{self.vault_addr}/v1/secret/data/{path}"
            
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    return data["data"]["data"]["value"]
                elif response.status == 404:
                    logger.warning(f"Secret not found: {path}")
                    return None
                else:
                    logger.error(f"Failed to get secret {path}: {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting secret {path}: {e}")
            # Return development fallback values
            return self._get_dev_fallback(path)
    
    async def set_secret(self, path: str, value: str) -> bool:
        """Set a secret in Vault"""
        try:
            session = await self._get_session()
            
            # Use KV v2 API format
            url = f"{self.vault_addr}/v1/secret/data/{path}"
            payload = {
                "data": {
                    "value": value
                }
            }
            
            async with session.post(url, json=payload) as response:
                if response.status in [200, 204]:
                    logger.debug(f"Secret set successfully: {path}")
                    return True
                else:
                    logger.error(f"Failed to set secret {path}: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error setting secret {path}: {e}")
            return False
    
    async def delete_secret(self, path: str) -> bool:
        """Delete a secret from Vault"""
        try:
            session = await self._get_session()
            
            url = f"{self.vault_addr}/v1/secret/data/{path}"
            
            async with session.delete(url) as response:
                if response.status in [200, 204]:
                    logger.info(f"Secret deleted: {path}")
                    return True
                else:
                    logger.error(f"Failed to delete secret {path}: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error deleting secret {path}: {e}")
            return False
    
    async def list_secrets(self, path: str = "") -> list:
        """List secrets at a given path"""
        try:
            session = await self._get_session()
            
            url = f"{self.vault_addr}/v1/secret/metadata/{path}"
            params = {"list": "true"}
            
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("data", {}).get("keys", [])
                else:
                    logger.error(f"Failed to list secrets at {path}: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error listing secrets at {path}: {e}")
            return []
    
    async def create_policy(self, policy_name: str, policy_rules: str) -> bool:
        """Create a Vault policy"""
        try:
            session = await self._get_session()
            
            url = f"{self.vault_addr}/v1/sys/policies/acl/{policy_name}"
            payload = {
                "policy": policy_rules
            }
            
            async with session.put(url, json=payload) as response:
                if response.status in [200, 204]:
                    logger.info(f"Policy created: {policy_name}")
                    return True
                else:
                    logger.error(f"Failed to create policy {policy_name}: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error creating policy {policy_name}: {e}")
            return False
    
    async def get_health(self) -> Dict[str, Any]:
        """Get Vault health status"""
        try:
            session = await self._get_session()
            
            url = f"{self.vault_addr}/v1/sys/health"
            
            async with session.get(url) as response:
                data = await response.json()
                return {
                    "status": "healthy" if response.status == 200 else "unhealthy",
                    "initialized": data.get("initialized", False),
                    "sealed": data.get("sealed", True),
                    "version": data.get("version", "unknown")
                }
                
        except Exception as e:
            logger.error(f"Error getting Vault health: {e}")
            return {
                "status": "unreachable",
                "error": str(e)
            }
    
    def _get_dev_fallback(self, path: str) -> Optional[str]:
        """Get development fallback values for secrets"""
        dev_secrets = {
            "bot/token": "dev-bot-token-123456789",
            "tron/private-key": "dev-private-key-0123456789abcdef",
            "payment/tron-address": "TDevAddress123456789012345678901234",
            "api/internal-token": "dev-internal-token-secure-123",
            "encryption/aes-key": "dev-aes-key-32-bytes-0123456789ab",
            "minio/access-key": "minioadmin",
            "minio/secret-key": "minioadmin123"
        }
        
        return dev_secrets.get(path)

class ExternalSecretsManager:
    """Manager for external secrets injection in Kubernetes"""
    
    @staticmethod
    def generate_external_secret_yaml(name: str, vault_path: str, secret_key: str) -> str:
        """Generate ExternalSecret YAML for Kubernetes"""
        return f"""
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: {name}
  namespace: telebot-sales
spec:
  refreshInterval: 5m
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: {name}
    creationPolicy: Owner
  data:
  - secretKey: {secret_key}
    remoteRef:
      key: {vault_path}
      property: value
"""
    
    @staticmethod
    def generate_secret_store_yaml() -> str:
        """Generate SecretStore YAML for Vault integration"""
        return """
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: telebot-sales
spec:
  provider:
    vault:
      server: "http://vault:8200"
      path: "secret"
      version: "v2"
      auth:
        tokenSecretRef:
          name: vault-token
          key: token
"""

# Utility functions for secrets management

async def setup_vault_policies():
    """Setup Vault policies for different service roles"""
    policies = {
        "bot-policy": """
path "secret/data/bot/*" {
  capabilities = ["read"]
}
path "secret/data/api/internal-token" {
  capabilities = ["read"]
}
""",
        "backend-policy": """
path "secret/data/*" {
  capabilities = ["read", "list"]
}
path "secret/data/tron/private-key" {
  capabilities = ["read"]
}
path "secret/data/payment/*" {
  capabilities = ["read"]
}
""",
        "admin-policy": """
path "secret/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
path "sys/policies/acl/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
"""
    }
    
    return policies