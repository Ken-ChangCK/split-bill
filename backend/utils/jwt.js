import jwt from 'jsonwebtoken'

// 生成 JWT token
export const generateToken = (date) => {
  return jwt.sign(
    { date },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }  // token 24小時後過期
  )
}

// 驗證 JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}
