import { apiLogin, apiRegister, apiUserExists, apiVerifyAdmin, apiDeleteUser } from './api'

export async function userExists(username: string): Promise<boolean> {
  return apiUserExists(username)
}

export async function registerUser(username: string, loginId: string, password: string): Promise<{ ok: boolean; error?: string }> {
  return apiRegister(username, loginId, password)
}

export async function verifyUser(pageUsername: string, loginId: string, password: string): Promise<boolean> {
  return apiVerifyAdmin(pageUsername, loginId, password)
}

export async function findPageByCredentials(loginId: string, password: string): Promise<string | null> {
  return apiLogin(loginId, password)
}

export async function deleteUser(pageUsername: string, password: string): Promise<boolean> {
  return apiDeleteUser(pageUsername, password)
}

// 하위 호환 - 더 이상 localStorage 사용 안 함
export function initDefaultUsers(): void {}
export function loginIdTaken(_loginId: string): boolean { return false }
