<template>
  <div class="reset-container">
    <div class="reset-box">
      <h2>重置密码</h2>
      <el-steps :active="currentStep" finish-status="success" class="steps">
        <el-step title="验证身份" />
        <el-step title="重置密码" />
        <el-step title="完成" />
      </el-steps>

      <!-- 步骤1：验证身份 -->
      <el-form v-if="currentStep === 0" ref="verifyFormRef" :model="verifyForm" :rules="verifyRules">
        <el-form-item prop="username">
          <el-input 
            v-model="verifyForm.username"
            placeholder="请输入账号/手机号"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="code">
          <div class="code-input">
            <el-input 
              v-model="verifyForm.code"
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
        <el-button type="primary" class="next-button" @click="verifyIdentity">
          下一步
        </el-button>
      </el-form>

      <!-- 步骤2：重置密码 -->
      <el-form v-if="currentStep === 1" ref="resetFormRef" :model="resetForm" :rules="resetRules">
        <el-form-item prop="password">
          <el-input 
            v-model="resetForm.password"
            type="password"
            placeholder="请输入新密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-button type="primary" class="next-button" @click="handleResetPassword">
          确认重置
        </el-button>
      </el-form>

      <!-- 步骤3：完成 -->
      <div v-if="currentStep === 2" class="success-step">
        <el-icon class="success-icon" color="var(--el-color-success)"><CircleCheckFilled /></el-icon>
        <h3>密码重置成功</h3>
        <p>请使用新密码登录</p>
        <el-button type="primary" class="login-button" @click="goToLogin">
          去登录
        </el-button>
      </div>

      <div class="back-link">
        <router-link to="/login">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { sendCode, resetPassword } from '@/api/user'
import type { ResetPasswordParams } from '@/api/user'

const router = useRouter()
const currentStep = ref(0)
const countdown = ref(0)

const verifyForm = reactive({
  username: '',
  code: ''
})

const resetForm = reactive({
  password: '',
  confirmPassword: ''
})

const verifyFormRef = ref()
const resetFormRef = ref()

const verifyRules = {
  username: [{ required: true, message: '请输入账号/手机号', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

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
  } else if (value !== resetForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  password: [{ validator: validatePass, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPass, trigger: 'blur' }]
}

const handleSendCode = async () => {
  try {
    await sendCode(verifyForm.username)
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

const verifyIdentity = async () => {
  try {
    await verifyFormRef.value.validate()
    // 这里应该调用验证身份的API
    currentStep.value = 1
  } catch (error) {
    ElMessage.error('验证失败')
  }
}

const handleResetPassword = async () => {
  try {
    await resetFormRef.value.validate()
    const params: ResetPasswordParams = {
      username: verifyForm.username,
      code: verifyForm.code,
      newPassword: resetForm.password
    }
    await resetPassword(params)
    currentStep.value = 2
  } catch (error) {
    ElMessage.error('重置密码失败')
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.reset-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color-page);
  
  .reset-box {
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

    .steps {
      margin-bottom: 40px;
    }
  }

  .code-input {
    display: flex;
    gap: 10px;
    
    .el-button {
      flex-shrink: 0;
    }
  }

  .next-button {
    width: 100%;
    height: 40px;
    font-size: 16px;
    margin-top: 20px;
  }

  .success-step {
    text-align: center;
    padding: 40px 0;

    .success-icon {
      font-size: 72px;
      margin-bottom: 20px;
    }

    h3 {
      color: var(--text-primary);
      margin-bottom: 10px;
    }

    p {
      color: var(--text-regular);
      margin-bottom: 30px;
    }

    .login-button {
      width: 200px;
    }
  }

  .back-link {
    margin-top: 20px;
    text-align: center;
    
    a {
      color: var(--text-regular);
      text-decoration: none;
      
      &:hover {
        color: var(--primary-color);
      }
    }
  }
}
</style> 