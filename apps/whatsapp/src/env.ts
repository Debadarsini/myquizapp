export type Env = {
  port: number;
  verifyToken: string;
  appSecret: string;
  accessToken: string;
  phoneNumberId: string;
  apiVersion: string;
  allowlist: Set<string>;
  parentPin: string;
};

export function loadEnv(): Env {
  const allowlist = (process.env.ALLOWLIST_PHONES ?? "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  return {
    port: Number(process.env.PORT ?? 3000),
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "dev-verify-token",
    appSecret: process.env.WHATSAPP_APP_SECRET ?? "",
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
    apiVersion: process.env.WHATSAPP_API_VERSION ?? "v21.0",
    allowlist: new Set(allowlist),
    parentPin: process.env.PARENT_PIN ?? "",
  };
}
