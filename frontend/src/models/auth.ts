export type AccountRole = 'student' | 'staff'

export interface DemoAccount {
  accountUuid: string
  username: string
  passwordHash: string
  role: AccountRole
  firstName: string
  middleName?: string
  lastName: string
  idNumber: string
  city: string
  state: string
  createdAt: string
}

export type PublicDemoAccount = Omit<DemoAccount, 'passwordHash'>

export interface LoginPayload {
  username: string
  password: string
}

export interface SignupPayload {
  role: AccountRole
  username: string
  password: string
  confirmPassword: string
  firstName: string
  middleName: string
  lastName: string
  studentId: string
  staffId: string
  city: string
  state: string
}

export interface AuthResult {
  ok: boolean
  message: string
  account?: PublicDemoAccount
}
