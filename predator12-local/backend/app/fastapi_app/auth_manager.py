import os

from keycloak import KeycloakOpenID


class AuthManager:
    def __init__(self):
        self.keycloak_openid = KeycloakOpenID(
            server_url=os.getenv("KEYCLOAK_URL", "http://localhost:8080"),
            client_id=os.getenv("KEYCLOAK_CLIENT_ID", "predator-frontend"),
            realm_name=os.getenv("KEYCLOAK_REALM", "predator"),
            client_secret_key=os.getenv("KEYCLOAK_CLIENT_SECRET"),
        )

    def get_token(self, username: str, password: str):
        """Get access token"""
        try:
            token = self.keycloak_openid.token(username, password)
            return token
        except Exception as e:
            return {"error": str(e)}

    def refresh_token(self, refresh_token: str):
        """Refresh access token"""
        try:
            token = self.keycloak_openid.refresh_token(refresh_token)
            return token
        except Exception as e:
            return {"error": str(e)}

    def introspect_token(self, token: str):
        """Introspect token for validation"""
        try:
            token_info = self.keycloak_openid.introspect(token)
            return token_info
        except Exception as e:
            return {"error": str(e)}

    def get_user_info(self, token: str):
        """Get user info from token"""
        try:
            userinfo = self.keycloak_openid.userinfo(token)
            return userinfo
        except Exception as e:
            return {"error": str(e)}


# Global instance
auth_manager = AuthManager()
