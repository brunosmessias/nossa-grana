# Spec - Auth + Family Bootstrap

## Requisitos
- REQ-101: Autenticação sem senha com OTP por e-mail.
- REQ-102: Login social com Google.
- REQ-103: Auto-registro de novos usuários.
- REQ-104: Onboarding com criação de família.
- REQ-105: Convite por e-mail e aceite por token.
- REQ-106: Auditoria explícita dos eventos de auth e família.

## Aceite
- Usuário consegue entrar por OTP ou Google.
- Usuário sem família consegue criar família no onboarding.
- Owner/Admin consegue convidar por e-mail.
- Convidado autenticado aceita convite pelo token.
- Eventos de auditoria registrados no banco.
