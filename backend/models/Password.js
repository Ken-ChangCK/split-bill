import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const passwordSchema = new mongoose.Schema({
  // 日期（YYYYMMDD）
  date: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{8}$/  // 格式驗證：YYYYMMDD
  },
  // 加密後的密碼
  hashedPassword: {
    type: String,
    required: true
  },
  // 是否已過期
  isExpired: {
    type: Boolean,
    default: false
  },
  // 建立時間
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// 靜態方法：比較密碼
passwordSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.hashedPassword)
}

// 靜態方法：建立新密碼
passwordSchema.statics.createPassword = async function(date, plainPassword) {
  // 加密密碼
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(plainPassword, salt)

  // 建立或更新
  const password = await this.findOneAndUpdate(
    { date },
    { hashedPassword, isExpired: false },
    { upsert: true, new: true }
  )

  return password
}

// 靜態方法：根據日期獲取密碼
passwordSchema.statics.findByDate = async function(date) {
  return await this.findOne({ date, isExpired: false })
}

const Password = mongoose.model('Password', passwordSchema)

export default Password
