import express from 'express'
import Password from '../models/Password.js'
import { getTodayDate } from '../utils/dateHelper.js'

const router = express.Router()

// POST /api/cron/create-password - Vercel Cron Job 端點
router.post('/create-password', async (req, res) => {
  try {
    // 驗證是否為 Vercel Cron Job 請求
    const authHeader = req.headers.authorization

    // Vercel Cron Jobs 會帶入 Authorization header
    // 可以在環境變數設定 CRON_SECRET 來驗證
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    const todayDate = getTodayDate()

    // 檢查今天的密碼是否已存在
    const existingPassword = await Password.findByDate(todayDate)

    if (existingPassword) {
      return res.json({
        success: true,
        message: `密碼已存在: ${todayDate}`,
        date: todayDate
      })
    }

    // 建立新密碼（密碼就是日期）
    await Password.createPassword(todayDate, todayDate)

    console.log(`[Cron] 成功建立密碼: ${todayDate}`)

    res.json({
      success: true,
      message: `成功建立密碼: ${todayDate}`,
      date: todayDate
    })
  } catch (error) {
    console.error('[Cron] 建立密碼失敗:', error)
    res.status(500).json({
      success: false,
      message: '建立密碼失敗',
      error: error.message
    })
  }
})

// GET /api/cron/create-password - 用於手動觸發（開發用）
router.get('/create-password', async (req, res) => {
  try {
    const todayDate = getTodayDate()
    const existingPassword = await Password.findByDate(todayDate)

    if (existingPassword) {
      return res.json({
        success: true,
        message: `密碼已存在: ${todayDate}`,
        date: todayDate
      })
    }

    await Password.createPassword(todayDate, todayDate)

    console.log(`[Manual] 成功建立密碼: ${todayDate}`)

    res.json({
      success: true,
      message: `手動建立密碼成功: ${todayDate}`,
      date: todayDate
    })
  } catch (error) {
    console.error('[Manual] 建立密碼失敗:', error)
    res.status(500).json({
      success: false,
      message: '建立密碼失敗'
    })
  }
})

export default router
