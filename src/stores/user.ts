import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref({
    username: '',
    email: '',
    phone: '',
  })

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  const setUserInfo = (info: typeof userInfo.value) => {
    userInfo.value = info
  }

  const logout = () => {
    token.value = ''
    userInfo.value = {
      username: '',
      email: '',
      phone: '',
    }
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout
  }
}, {
  persist: true
}) 