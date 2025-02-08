<template>
  <div class="register-container">
    <div class="register-box">
      <h2>账号注册</h2>
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <div class="phone-input">
            <el-input 
              v-model="form.phone"
              placeholder="请输入手机号"
              prefix-icon="Iphone"
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

        <el-form-item label="验证码" prop="code">
          <el-input 
            v-model="form.code"
            placeholder="请输入验证码"
            prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="form.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
          />
        </el-form-item>

        <el-button type="primary" class="register-button" @click="handleRegister">
          注册
        </el-button>

        <div class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { RegisterParams } from '@/api/user'
import { register, sendCode } from '@/api/user'

const router = useRouter()
const countdown = ref(0)
const formRef = ref()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  code: '',
  email: ''
})

const validatePass = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能小于6位'))
  } else {
    callback()
  }
}

const validateConfirmPass = (_: unknown, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' }
  ],
  password: [{ validator: validatePass, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPass, trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleSendCode = async () => {
  try {
    await sendCode(form.phone)
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

const handleRegister = async () => {
  try {
    await formRef.value.validate()
    const params: RegisterParams = {
      username: form.username,
      password: form.password,
      phone: form.phone,
      email: form.email
    }
    await register(params)
    ElMessage.success('注册成功')
    router.push('/login')
  } catch (error) {
    ElMessage.error('注册失败')
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color-page);
  
  .register-box {
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

  .phone-input {
    display: flex;
    gap: 10px;
    
    .el-button {
      flex-shrink: 0;
    }
  }

  .register-button {
    width: 100%;
    height: 40px;
    font-size: 16px;
    margin-top: 20px;
  }

  .login-link {
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