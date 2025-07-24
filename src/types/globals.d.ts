export {}

declare global {
  interface CustomJwtSessionClaims {
    userId: string
    email: string
    metadata?: {
      familyId?: string
    }
  }
}
