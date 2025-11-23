import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import cronRoutes from './routes/cron.js'
import channelRoutes from './routes/channel.js'
import membersRoutes from './routes/members.js'
import expensesRoutes from './routes/expenses.js'
import { startPasswordCron } from './jobs/passwordCron.js'
import { helmetConfig, apiLimiter } from './middleware/security.js'

// 載入環境變數
dotenv.config()

// 建立 Express 應用
const app = express()

// 安全性中介軟體
app.use(helmetConfig)

// CORS 設定
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173']

app.use(cors({
  origin: function (origin, callback) {
    // 允許沒有 origin 的請求（例如 curl、Postman）
    if (!origin) return callback(null, true)

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))

// 確保資料庫連線的中介軟體（Vercel serverless 環境）
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error('Database connection middleware error:', error)
    res.status(503).json({
      success: false,
      message: '資料庫連線失敗，請稍後再試'
    })
  }
})

// API Rate Limiting（所有 API 路由）
app.use('/api', apiLimiter)

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/cron', cronRoutes)
app.use('/api/channels', channelRoutes)
app.use('/api/channels', membersRoutes)
app.use('/api/channels', expensesRoutes)

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Split Bill Backend is running' })
})

// 錯誤處理中介軟體
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: '伺服器錯誤'
  })
})

// 啟動伺服器
const PORT = process.env.PORT || 3001

const startServer = async () => {
  try {
    // 連接資料庫
    await connectDB()

    // 只在非 Vercel 環境啟動定時任務
    // Vercel 使用 Vercel Cron Jobs 替代
    if (process.env.VERCEL !== '1') {
      console.log('本地環境：啟動 node-cron 定時任務')
      startPasswordCron()
    } else {
      console.log('Vercel 環境：使用 Vercel Cron Jobs')
    }

    // 啟動伺服器
    app.listen(PORT, () => {
      console.log(`伺服器運行在 port ${PORT}`)
      console.log(`環境: ${process.env.VERCEL === '1' ? 'Vercel' : 'Local'}`)
      console.log(`CORS 允許來源: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
    })
  } catch (error) {
    console.error('伺服器啟動失敗:', error)
    process.exit(1)
  }
}

// Vercel Serverless Functions 需要導出 app
export default app

// 只在非 Vercel 環境啟動伺服器
if (process.env.VERCEL !== '1') {
  startServer()
}
