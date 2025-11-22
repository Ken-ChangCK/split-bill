import express from 'express'
import { body, validationResult } from 'express-validator'
import Password from '../models/Password.js'
import { generateToken } from '../utils/jwt.js'
import { getTodayDate } from '../utils/dateHelper.js'
import { loginLimiter } from '../middleware/security.js'

const router = express.Router()

// POST /api/auth/login - 登入
router.post('/login',
  loginLimiter, // Rate limiting
  // 輸入驗證
  body('password')
    .trim()
    .notEmpty().withMessage('密碼不可為空')
    .isLength({ min: 8, max: 8 }).withMessage('密碼格式錯誤')
    .matches(/^\d{8}$/).withMessage('密碼必須為 8 位數字'),
  async (req, res) => {
  // 驗證結果檢查
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    })
  }
  try {
    const { password } = req.body

    // 獲取當天日期
    const todayDate = getTodayDate()

    // 從資料庫查詢當天的密碼記錄
    const passwordRecord = await Password.findByDate(todayDate)

    if (!passwordRecord) {
      return res.status(401).json({
        success: false,
        message: '今日密碼尚未設定，請聯繫管理員'
      })
    }

    // 比對密碼
    const isMatch = await passwordRecord.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '密碼錯誤'
      })
    }

    // 生成 JWT token
    const token = generateToken(todayDate)

    res.json({
      success: true,
      message: '登入成功',
      token,
      date: todayDate
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

// GET /api/auth/verify - 驗證 token 是否有效
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供 token'
      })
    }

    const { verifyToken } = await import('../utils/jwt.js')
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token 無效或已過期'
      })
    }

    // 檢查 token 中的日期是否為今天
    const todayDate = getTodayDate()
    if (decoded.date !== todayDate) {
      return res.status(401).json({
        success: false,
        message: 'Token 已過期（日期不符）'
      })
    }

    res.json({
      success: true,
      message: 'Token 有效',
      date: decoded.date
    })
  } catch (error) {
    console.error('Verify error:', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

export default router
