import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 5000
})

export interface LoginParams {
  username: string
  password: string
  code?: string
}

export interface CodeLoginParams {
  username: string
  code: string
}

export interface RegisterParams {
  username: string
  password: string
  email: string
  phone: string
}

export interface ResetPasswordParams {
  username: string
  code: string
  newPassword: string
}

export const login = (data: LoginParams | CodeLoginParams) => {
  return api.post<{
    token: string
    userInfo: {
      username: string
      email: string
      phone: string
    }
  }>('/login', data)
}

export const register = (data: RegisterParams) => {
  return api.post('/register', data)
}

export const sendCode = (phone: string) => {
  return api.post('/sendCode', { phone })
}

export const resetPassword = (data: ResetPasswordParams) => {
  return api.post('/resetPassword', data)
} 