<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-form">
        <h2>欢迎登录</h2>
        <el-tabs v-model="loginType" class="login-tabs">
          <el-tab-pane label="账号密码登录" name="account">
            <el-form ref="formRef" :model="loginForm" :rules="rules">
              <el-form-item prop="username">
                <el-input 
                  v-model="loginForm.username"
                  placeholder="请输入账号/手机号"
                  prefix-icon="User"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input 
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="验证码登录" name="code">
            <el-form ref="codeFormRef" :model="codeForm" :rules="codeRules">
              <el-form-item prop="phone">
                <el-input 
                  v-model="codeForm.phone"
                  placeholder="请输入手机号"
                  prefix-icon="Iphone"
                />
              </el-form-item>
              <el-form-item prop="code">
                <div class="code-input">
                  <el-input 
                    v-model="codeForm.code"
                    placeholder="请输入验证码"
                    prefix-icon="Message"
                  />
                  <el-button 
                    type="primary" 
                    :disabled="!!countdown"
                    @click="handleSendCode"
                  >
                    {{ countdown ? `${countdown}s后重试` : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <div class="login-actions">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <router-link to="/reset-password">忘记密码？</router-link>
        </div>

        <el-button type="primary" class="login-button" @click="handleLogin">
          登录
        </el-button>

        <div class="register-link">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { CodeLoginParams, login, sendCode } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const loginType = ref('account')
const rememberMe = ref(false)
const countdown = ref(0)

const loginForm = reactive({
  username: '',
  password: ''
})

const codeForm = reactive({
  phone: '',
  code: ''
})

const formRef = ref()
const codeFormRef = ref()

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const codeRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const handleSendCode = async () => {
  try {
    await sendCode(codeForm.phone)
    ElMessage.success('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    ElMessage.error('验证码发送失败')
  }
}

const handleLogin = async () => {
  const formToValidate = loginType.value === 'account' ? formRef.value : codeFormRef.value
  
  try {
    await formToValidate.validate()
    const { data } = loginType.value === 'account' 
      ? await login(loginForm)
      : await login({ 
          username: codeForm.phone, 
          code: codeForm.code 
        } as CodeLoginParams)
    
    userStore.setToken(data.token)
    userStore.setUserInfo(data.userInfo)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    ElMessage.error('登录失败')
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color-page);
  
  .login-box {
    width: 420px;
    padding: 40px;
    background: var(--bg-color);
    border-radius: 8px;
    box-shadow: var(--box-shadow);
    
    h2 {
      text-align: center;
      color: var(--text-primary);
      margin-bottom: 30px;
    }
  }

  .login-tabs {
    margin-bottom: 20px;
  }

  .code-input {
    display: flex;
    gap: 10px;
    
    .el-button {
      flex-shrink: 0;
    }
  }

  .login-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 0;
  }

  .login-button {
    width: 100%;
    height: 40px;
    font-size: 16px;
  }

  .register-link {
    margin-top: 20px;
    text-align: center;
    color: var(--text-regular);
    
    a {
      color: var(--primary-color);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style> 