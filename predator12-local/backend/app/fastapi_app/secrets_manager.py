import os

import hvac


class SecretsManager:
    def __init__(self):
        self.client = hvac.Client(
            url=os.getenv("VAULT_URL", "http://localhost:8200"), token=os.getenv("VAULT_TOKEN")
        )

    def get_secret(self, path: str, key: str):
        """Get secret from Vault"""
        try:
            read_response = self.client.secrets.kv.read_secret_version(path=path)
            return read_response["data"]["data"][key]
        except Exception as e:
            return f"Error retrieving secret: {str(e)}"

    def set_secret(self, path: str, secret: dict):
        """Set secret in Vault"""
        try:
            self.client.secrets.kv.v2.create_or_update_secret(path=path, secret=secret)
            return "Secret set successfully"
        except Exception as e:
            return f"Error setting secret: {str(e)}"

    def generate_db_credentials(self, role_name: str):
        """Generate dynamic DB credentials"""
        try:
            response = self.client.secrets.database.generate_credentials(name=role_name)
            return response["data"]
        except Exception as e:
            return {"error": str(e)}


# Global instance
secrets_manager = SecretsManager()
