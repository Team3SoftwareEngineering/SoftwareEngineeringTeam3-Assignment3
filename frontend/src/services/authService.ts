import type { AuthResult, DemoAccount, LoginPayload, SignupPayload } from '../models/auth'

const ACCOUNTS_STORAGE_KEY = 'pnw_demo_accounts'
const SESSION_STORAGE_KEY = 'pnw_current_session'

/**
 * Frontend-only demo auth service.
 * This is NOT secure production authentication.
 * Replace this later with backend API calls when the backend team is ready.
 */

function canUseStorage() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
  } catch {
    return false
  }
}

function createUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function demoHashPassword(password: string) {
  return `demo_hash_${btoa(password)}`
}

const seedAccounts: DemoAccount[] = [
  {
    accountUuid: 'seed-student-account',
    username: 'student@pnw.edu',
    passwordHash: demoHashPassword('Password123'),
    role: 'student',
    firstName: 'Demo',
    lastName: 'Student',
    idNumber: '156777',
    city: 'Hammond',
    state: 'IN',
    createdAt: new Date().toISOString(),
  },
]

function getStoredAccounts(): DemoAccount[] {
  if (!canUseStorage()) return []

  try {
    const rawAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    if (!rawAccounts) return []

    const parsedAccounts = JSON.parse(rawAccounts)
    return Array.isArray(parsedAccounts) ? parsedAccounts : []
  } catch {
    return []
  }
}

function saveStoredAccounts(accounts: DemoAccount[]) {
  if (!canUseStorage()) return
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
}

export function getAllAccounts() {
  return [...seedAccounts, ...getStoredAccounts()]
}

export function saveCurrentSession(account: DemoAccount) {
  if (!canUseStorage()) return
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(account))
}

export function getCurrentSession(): DemoAccount | null {
  if (!canUseStorage()) return null

  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY)
    return rawSession ? JSON.parse(rawSession) : null
  } catch {
    return null
  }
}

export function clearCurrentSession() {
  if (!canUseStorage()) return
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function loginUser(payload: LoginPayload): AuthResult {
  const username = payload.username.trim().toLowerCase()
  const password = payload.password.trim()

  if (!username || !password) {
    return {
      ok: false,
      message: 'Please enter both username and password.',
    }
  }

  const matchingAccount = getAllAccounts().find(
    (account) =>
      account.username.toLowerCase() === username &&
      account.passwordHash === demoHashPassword(password),
  )

  if (!matchingAccount) {
    return {
      ok: false,
      message: 'Invalid username or password. Try the demo login or create an account.',
    }
  }

  saveCurrentSession(matchingAccount)

  return {
    ok: true,
    message: `Welcome back, ${matchingAccount.firstName}.`,
    account: matchingAccount,
  }
}

export function signupUser(payload: SignupPayload): AuthResult {
  const username = payload.username.trim().toLowerCase()
  const password = payload.password.trim()
  const confirmPassword = payload.confirmPassword.trim()
  const firstName = payload.firstName.trim()
  const middleName = payload.middleName.trim()
  const lastName = payload.lastName.trim()
  const city = payload.city.trim()
  const state = payload.state.trim().toUpperCase()
  const idNumber = payload.role === 'student' ? payload.studentId.trim() : payload.staffId.trim()

  if (!username || !password || !confirmPassword) {
    return {
      ok: false,
      message: 'Username, password, and password confirmation are required.',
    }
  }

  if (password.length < 8) {
    return {
      ok: false,
      message: 'Password must be at least 8 characters long.',
    }
  }

  if (password !== confirmPassword) {
    return {
      ok: false,
      message: 'Passwords do not match.',
    }
  }

  if (!firstName || !lastName) {
    return {
      ok: false,
      message: 'First name and last name are required.',
    }
  }

  if (!idNumber) {
    return {
      ok: false,
      message: payload.role === 'student' ? 'Student ID is required.' : 'Staff ID is required.',
    }
  }

  if (!Number.isInteger(Number(idNumber))) {
    return {
      ok: false,
      message: payload.role === 'student' ? 'Student ID must be a number.' : 'Staff ID must be a number.',
    }
  }

  if (!city || !state) {
    return {
      ok: false,
      message: 'City and state are required for the address record.',
    }
  }

  const existingAccount = getAllAccounts().find((account) => account.username.toLowerCase() === username)

  if (existingAccount) {
    return {
      ok: false,
      message: 'An account with that username already exists.',
    }
  }

  const existingId = getAllAccounts().find(
    (account) => account.role === payload.role && account.idNumber === idNumber,
  )

  if (existingId) {
    return {
      ok: false,
      message: payload.role === 'student' ? 'That student ID is already registered.' : 'That staff ID is already registered.',
    }
  }

  const newAccount: DemoAccount = {
    accountUuid: createUuid(),
    username,
    passwordHash: demoHashPassword(password),
    role: payload.role,
    firstName,
    middleName: middleName || undefined,
    lastName,
    idNumber,
    city,
    state,
    createdAt: new Date().toISOString(),
  }

  const storedAccounts = getStoredAccounts()
  saveStoredAccounts([...storedAccounts, newAccount])
  saveCurrentSession(newAccount)

  return {
    ok: true,
    message: `Account created for ${firstName} ${lastName}.`,
    account: newAccount,
  }
}
