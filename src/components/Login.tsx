import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getTodayPassword, generateAuthToken } from '@/utils/auth'

interface LoginProps {
  onLogin: () => void
}

function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const correctPassword = getTodayPassword()

    if (password === correctPassword) {
      // 生成加密的 token（而不是直接存密碼或 'true'）
      const authToken = await generateAuthToken(correctPassword)

      // 儲存加密的 token 到 localStorage
      localStorage.setItem('splitBillAuthToken', authToken)
      onLogin()
    } else {
      setError('密碼錯誤，請輸入今天的日期（YYYYMMDD）')
      setPassword('')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            簡易分帳系統
          </CardTitle>
          <CardDescription className="text-center">
            請輸入密碼以訪問系統
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密碼
              </label>
              <Input
                id="password"
                type="password"
                // placeholder="請輸入今天的日期（YYYYMMDD）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '驗證中...' : '登入'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
