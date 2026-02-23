import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";

const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_DEFAULT_FROM = "Zekher <onboarding@resend.dev>";
const VERIFICATION_CODE_MAX_AGE_SECONDS = 60 * 15;

function normalizeEnvValue(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function containsInvalidHeaderChars(value: string): boolean {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code < 32 || code > 126 || code === 127) {
      return true;
    }
  }
  return false;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendResendOtpEmail(args: {
  to: string;
  subject: string;
  intro: string;
  code: string;
  expiresAt: Date;
}) {
  const apiKey = normalizeEnvValue(process.env.AUTH_RESEND_KEY);
  if (!apiKey) {
    throw new Error("Missing AUTH_RESEND_KEY environment variable.");
  }
  if (containsInvalidHeaderChars(apiKey)) {
    throw new Error(
      "Invalid AUTH_RESEND_KEY value. Remove non-ASCII characters from the key."
    );
  }

  const from = normalizeEnvValue(process.env.AUTH_EMAIL_FROM) || RESEND_DEFAULT_FROM;
  const expiresAt = args.expiresAt.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const escapedCode = escapeHtml(args.code);
  const escapedIntro = escapeHtml(args.intro);

  let response: Response;
  try {
    response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: args.to,
        subject: args.subject,
        text: `${args.intro}\n\nCode: ${args.code}\nExpires: ${expiresAt}`,
        html: `
          <div style="font-family: ui-sans-serif,system-ui,sans-serif;line-height:1.5;color:#111827;">
            <p>${escapedIntro}</p>
            <p style="margin:20px 0 10px;">Your code:</p>
            <p style="font-size:28px;letter-spacing:0.2em;font-weight:700;margin:0 0 12px;">
              ${escapedCode}
            </p>
            <p style="color:#6b7280;font-size:14px;">This code expires at ${escapeHtml(expiresAt)}.</p>
          </div>
        `,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("invalid char for header")) {
      throw new Error(
        "Invalid AUTH_RESEND_KEY value in deployment env. Re-set AUTH_RESEND_KEY with a plain ASCII key from Resend."
      );
    }
    throw error;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Failed to send email via Resend (${response.status}). ${body}`.trim()
    );
  }
}

function resendCodeProvider(config: {
  id: string;
  subject: string;
  intro: string;
}) {
  return Email({
    id: config.id,
    maxAge: VERIFICATION_CODE_MAX_AGE_SECONDS,
    async sendVerificationRequest({ identifier, token, expires }) {
      await sendResendOtpEmail({
        to: identifier,
        subject: config.subject,
        intro: config.intro,
        code: token,
        expiresAt: expires,
      });
    },
  });
}

const verifyProvider = resendCodeProvider({
  id: "password-verify",
  subject: "Verify your Zekher email",
  intro: "Enter this code to verify your email for Zekher.",
});

const resetProvider = resendCodeProvider({
  id: "password-reset",
  subject: "Reset your Zekher password",
  intro: "Enter this code to reset your Zekher password.",
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      verify: verifyProvider,
      reset: resetProvider,
    }),
  ],
});
