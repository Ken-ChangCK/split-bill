import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

// Rate Limiter - 防止暴力破解登入
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 最多 5 次嘗試
  message: {
    success: false,
    message: '嘗試次數過多，請 15 分鐘後再試'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// General API Rate Limiter
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 分鐘
  max: 60, // 最多 60 次請求
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Channel Creation Rate Limiter - 防止濫用創建頻道
export const createChannelLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小時
  max: 3, // 最多 3 次創建請求
  message: {
    success: false,
    message: '創建頻道過於頻繁，請 1 小時後再試'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Helmet - HTTP headers 安全
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
})
