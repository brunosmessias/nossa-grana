import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";

import { db } from "@/server/db/client";
import { sendEmail } from "@/server/email/sender";
import { otpTemplate } from "@/server/email/templates";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  socialProviders: {
    google: {
      overrideUserInfoOnSignIn: true,
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") {
          return;
        }

        console.log(`Sending OTP ${otp} to email ${email}`);

        const template = otpTemplate(otp);
        await sendEmail({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
      },
    }),
  ],
});
