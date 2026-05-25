export function otpTemplate(otp: string): {
  subject: string;
  html: string;
  text: string;
} {
  const html = `Put your HTML text here<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Seu código de acesso - Nossa Grana</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:fit-content;height:56px;border-radius:16px;background-color:#e8f5ee; padding: 0 15px">
                <img src="http://nossagrana.com.br/logo.png"  height="32" alt="Nossa Grana" style="display:block;" />
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                <tr>
                  <td style="padding:48px 40px;">
                    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px;">Seu código de acesso</h1>
                    <p style="margin:0 0 32px;font-size:16px;line-height:1.5;color:#666666;">Use este código para entrar no Nossa Grana:</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding:24px;background-color:#f8faf9;border-radius:12px;">
                          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#2d8a56;font-family:'SF Mono',SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;">${otp}</span>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#999999;">Este código expira em alguns minutos. Se você não solicitou, ignore este e-mail.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:#999999;">Nossa Grana — Finanças da família, simplificadas.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject: "Seu código de acesso — Nossa Grana",
    html,
    text: `Use este código para entrar no Nossa Grana: ${otp}`,
  };
}

export function familyInviteTemplate(params: {
  familyName: string;
  inviterName: string;
  inviteUrl: string;
}): { subject: string; html: string; text: string } {
  const { familyName, inviterName, inviteUrl } = params;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Convite para família ${familyName} — Nossa Grana</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;background-color:#e8f5ee;">
                <img src="data:image/png;base64,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" width="32" height="32" alt="Nossa Grana" style="display:block;" />
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                <tr>
                  <td style="padding:48px 40px;">
                    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1a1a1a;letter-spacing:-0.3px;">Você foi convidado(a)</h1>
                    <p style="margin:0 0 8px;font-size:16px;line-height:1.5;color:#666666;">
                      <strong style="color:#1a1a1a;">${inviterName}</strong> convidou você para participar da família
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                      <tr>
                        <td style="padding:8px 20px;background-color:#f8faf9;border-radius:8px;border:1px solid #e8f5ee;">
                          <span style="font-size:18px;font-weight:600;color:#2d8a56;">${familyName}</span>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${inviteUrl}" style="display:inline-block;padding:14px 40px;background-color:#2d8a56;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:12px;letter-spacing:-0.1px;">Aceitar convite</a>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                      <tr>
                        <td style="padding:16px;background-color:#f8faf9;border-radius:10px;">
                          <p style="margin:0;font-size:13px;line-height:1.5;color:#999999;text-align:center;">
                            Ou copie e cole no navegador:<br>
                            <a href="${inviteUrl}" style="color:#2d8a56;word-break:break-all;font-size:12px;">${inviteUrl}</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#999999;">Este convite expira em 7 dias. Se você não esperava este e-mail, pode ignorá-lo.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:#999999;">Nossa Grana — Finanças da família, simplificadas.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject: `${inviterName} convidou você para a família ${familyName}`,
    html,
    text: `${inviterName} convidou você para a família ${familyName} no Nossa Grana. Aceite em: ${inviteUrl}`,
  };
}
