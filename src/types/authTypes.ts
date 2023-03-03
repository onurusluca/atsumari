export interface Session {
  access_token: string
  expires_at: number
  expires_in: number
  refresh_token: string
  token_type: string
  user: User
}

export interface User {
  id: string
  aud: string
  role: string
  email: string
  email_confirmed_at: Date
  phone: string
  confirmation_sent_at: Date
  confirmed_at: Date
  last_sign_in_at: Date
  app_metadata: AppMetadata
  user_metadata: UserMetadata
  identities: Identity[]
  created_at: Date
  updated_at: Date
}

export interface AppMetadata {
  provider: string
  providers: string[]
}

export interface Identity {
  id: string
  user_id: string
  identity_data: IdentityData
  provider: string
  last_sign_in_at: Date
  created_at: Date
  updated_at: Date
}

export interface IdentityData {
  email: string
  sub: string
}

export interface UserMetadata {}
