export function otpTemplate(otp: string): { subject: string; html: string; text: string } {
  return {
    subject: "Seu código de acesso - Nossa Grana",
    html: `<div style="font-family: Arial, sans-serif;"><h2>Seu código</h2><p>Use este código para entrar no Nossa Grana:</p><p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${otp}</p><p>O código expira em alguns minutos.</p></div>`,
    text: `Use este código para entrar no Nossa Grana: ${otp}`,
  }
}

export function familyInviteTemplate(params: {
  familyName: string
  inviterName: string
  inviteUrl: string
}): { subject: string; html: string; text: string } {
  const { familyName, inviterName, inviteUrl } = params

  return {
    subject: `Convite para família ${familyName} no Nossa Grana`,
    html: `<div style="font-family: Arial, sans-serif;"><h2>Você foi convidado</h2><p>${inviterName} convidou você para participar da família <strong>${familyName}</strong>.</p><p><a href="${inviteUrl}">Aceitar convite</a></p></div>`,
    text: `${inviterName} convidou você para a família ${familyName}. Aceite em: ${inviteUrl}`,
  }
}
