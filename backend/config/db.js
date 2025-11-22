import mongoose from 'mongoose'

// Serverless 環境的連線快取
let cachedConnection = null

const connectDB = async () => {
  // 如果已經有快取的連線且狀態正常，直接返回
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection')
    return cachedConnection
  }

  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI?.substring(0, 20) + '...')

    // Mongoose 連線選項，針對 Vercel serverless 優化
    const options = {
      bufferCommands: false, // 禁用緩衝，立即失敗而不是等待
      serverSelectionTimeoutMS: 5000, // 伺服器選擇超時 5 秒
      socketTimeoutMS: 45000, // Socket 超時 45 秒
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, options)

    console.log(`MongoDB Connected: ${conn.connection.host}`)
    cachedConnection = conn
    return conn
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    cachedConnection = null
    throw error // 在 serverless 環境中拋出錯誤而不是 exit
  }
}

export default connectDB
