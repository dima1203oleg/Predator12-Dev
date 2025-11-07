import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || "predator-frontend",
      clientSecret: process.env.KEYCLOAK_SECRET || "predator-frontend-secret",
      issuer: process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/predator",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at;
      }

      // Add roles and groups from Keycloak profile
      if (profile) {
        token.roles = (profile as any).realm_roles || [];
        token.groups = (profile as any).groups || [];
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;
      session.roles = token.roles as string[];
      session.groups = token.groups as string[];
      session.error = token.error as string | undefined;

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Call Keycloak logout endpoint
      if (token.idToken) {
        const issuerUrl = process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/predator";
        const logoutUrl = `${issuerUrl}/protocol/openid-connect/logout?id_token_hint=${token.idToken}&post_logout_redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL || "http://localhost:3000")}`;
        
        try {
          await fetch(logoutUrl, { method: "GET" });
        } catch (error) {
          console.error("Error during Keycloak logout:", error);
        }
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
