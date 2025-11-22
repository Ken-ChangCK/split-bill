import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { login } from '@/api/auth'

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
    setError('')

    try {
      // 調用後端 API 驗證密碼
      const response = await login(password)

      if (response.success && response.token) {
        // 儲存 JWT token 到 localStorage
        localStorage.setItem('splitBillAuthToken', response.token)
        onLogin()
      } else {
        setError(response.message || '登入失敗，請重試')
        setPassword('')
      }
    } catch (error) {
      setError('登入失敗，請檢查網路連線')
      setPassword('')
    } finally {
      setIsLoading(false)
    }
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
