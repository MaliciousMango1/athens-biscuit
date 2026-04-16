import { env } from "~/env";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function verifyTurnstileToken(
  token: string,
  ip?: string,
): Promise<boolean> {
  // If no secret key configured, skip verification (dev mode)
  if (!env.TURNSTILE_SECRET_KEY) {
    return true;
  }

  const formData = new URLSearchParams();
  formData.append("secret", env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  if (ip) {
    formData.append("remoteip", ip);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as TurnstileVerifyResponse;
  return data.success;
}
