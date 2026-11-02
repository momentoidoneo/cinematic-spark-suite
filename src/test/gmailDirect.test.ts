import { describe, expect, it, vi } from "vitest";
import {
  buildOwnerMime, escapeEmailHtml, gmailConfigFromEnv, GMAIL_SEND_SCOPE,
  OWNER_EMAIL, sendOwnerGmail,
} from "../../supabase/functions/_shared/gmailDirect";

const config = { clientId: "test-client", clientSecret: "not-a-real-secret", refreshToken: "not-a-real-token" };
const notice = { subject: "📩 Prueba técnica", html: "<p>Fotografía y vídeo — Madrid</p>", replyTo: "cliente@example.com", reference: "contact.1234" };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
const successFetch = () => vi.fn<typeof fetch>()
  .mockResolvedValueOnce(json({ access_token: "fixture-access-token", scope: GMAIL_SEND_SCOPE }))
  .mockResolvedValueOnce(json({ id: "fixture-message-id" }));
const decode = (raw: string) => Buffer.from(raw, "base64url").toString("utf8");

describe("Gmail direct owner notifications", () => {
  it("requires all server-only OAuth secrets instead of silently skipping", () => {
    expect(() => gmailConfigFromEnv(() => undefined)).toThrow("gmail_configuration_not_attempted");
    const env = { GMAIL_CLIENT_ID: config.clientId, GMAIL_CLIENT_SECRET: config.clientSecret, GMAIL_REFRESH_TOKEN: config.refreshToken };
    expect(gmailConfigFromEnv(key => env[key as keyof typeof env])).toEqual(config);
  });

  it("uses only Google OAuth refresh and Gmail send, with no mailbox reads", async () => {
    const fetcher = successFetch();
    await expect(sendOwnerGmail(config, notice, fetcher)).resolves.toEqual({ provider: "gmail", messageId: "fixture-message-id" });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual([
      "https://oauth2.googleapis.com/token",
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    ]);
    const oauth = fetcher.mock.calls[0][1]!;
    expect(oauth.redirect).toBe("error");
    expect(new URLSearchParams(oauth.body as URLSearchParams).get("grant_type")).toBe("refresh_token");
    const send = fetcher.mock.calls[1][1]!;
    expect(send.redirect).toBe("error");
    expect(send.headers).toEqual({ "Content-Type": "application/json", Authorization: "Bearer fixture-access-token" });
    const mime = decode(JSON.parse(send.body as string).raw);
    expect(mime).toContain(`From: Silvio Costa <${OWNER_EMAIL}>`);
    expect(mime).toContain(`To: ${OWNER_EMAIL}\r\n`);
    expect(mime).toContain("Reply-To: cliente@example.com");
    expect(mime).not.toContain(config.refreshToken);
    expect(mime).not.toContain(config.clientSecret);
  });

  it("preserves Unicode and a stable message reference", () => {
    const mime = decode(buildOwnerMime(notice));
    expect(mime).toContain("Message-ID: <contact.1234@silviocosta.net>");
    expect(mime).toContain("Content-Transfer-Encoding: base64");
    const html = Buffer.from(mime.split("\r\n\r\n")[1].replace(/\r\n/g, ""), "base64").toString("utf8");
    expect(html).toBe(notice.html);
  });

  it("folds long encoded subjects without splitting Unicode characters", () => {
    const subject = "📩 Fotografía en Madrid ".repeat(20);
    const mime = decode(buildOwnerMime({ ...notice, subject }));
    const encoded = [...mime.matchAll(/=\?UTF-8\?B\?([^?]+)\?=/g)];
    expect(encoded.map(m => Buffer.from(m[1], "base64").toString("utf8")).join("")).toBe(subject);
    expect(encoded.every(m => m[0].length <= 75)).toBe(true);
  });

  it.each([
    { subject: "hello\r\nBcc: attacker@example.com" },
    { replyTo: "cliente@example.com\r\nBcc: attacker@example.com" },
    { reference: "unsafe\r\nheader" },
    { replyTo: "Name <cliente@example.com>" },
  ])("blocks header injection before network access", async patch => {
    const fetcher = successFetch();
    await expect(sendOwnerGmail(config, { ...notice, ...patch }, fetcher)).rejects.toMatchObject({ stage: "configuration", delivery: "not_attempted" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("escapes every user-controlled HTML attribute/text delimiter", () => {
    expect(escapeEmailHtml('<a title="x&y">\'')).toBe("&lt;a title=&quot;x&amp;y&quot;&gt;&#039;");
  });

  it("does not send if Google rejects refresh authorization, and does not leak response details", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({ error: "invalid_grant", detail: config.refreshToken }, 400));
    await expect(sendOwnerGmail(config, notice, fetcher)).rejects.toThrow("gmail_oauth_not_attempted_400");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("rejects a returned token scope without send permission", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({ access_token: "fixture", scope: "openid email" }));
    await expect(sendOwnerGmail(config, notice, fetcher)).rejects.toMatchObject({ stage: "oauth", delivery: "not_attempted" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([403, 429])("records explicit send rejection without duplicate attempts", async status => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(json({ access_token: "fixture" })).mockResolvedValueOnce(json({ error: "provider refused" }, status));
    await expect(sendOwnerGmail(config, notice, fetcher)).rejects.toMatchObject({ stage: "send", delivery: "rejected", status });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not retry ambiguous sends, including network loss after acceptance", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(json({ access_token: "fixture" })).mockRejectedValueOnce(new Error("network failure"));
    await expect(sendOwnerGmail(config, notice, fetcher)).rejects.toMatchObject({ stage: "send", delivery: "unknown" });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it.each([json({}, 200), json({ error: "upstream" }, 503)])("does not claim acceptance without a valid Gmail message ID", async response => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(json({ access_token: "fixture" })).mockResolvedValueOnce(response);
    await expect(sendOwnerGmail(config, notice, fetcher)).rejects.toMatchObject({ stage: "send", delivery: "unknown" });
  });
});
