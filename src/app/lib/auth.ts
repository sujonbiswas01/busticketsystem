import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { bearer, emailOTP, oAuthProxy } from "better-auth/plugins";

import { Stats } from "node:fs";
import { envVars } from "../config/env";
export const auth = betterAuth({
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: `${envVars.FRONTEND_URL}`,
  trustedOrigins: [envVars.FRONTEND_URL],
  appName: "Planora",
  user: {
    additionalFields: {
            role: {
        type: "string",
        required: true,
        defaultValue: "USER",
      },
      emailVerified: {
        type: "boolean",
        returned: true,
        defaultValue: true,
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    oAuthProxy(),
    bearer(),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24, 
    strategy: "jwt",
},
  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
    },
  },

  redirectURLs: {
    signin: `${envVars.BETTER_AUTH_URL}`,
  },
});