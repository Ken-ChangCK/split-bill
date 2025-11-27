import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createChannel, joinChannel } from '@/api/channel'
import { Channel } from '@/types/channel'
import { Check, Copy } from 'lucide-react'
import InteractiveBackground from './InteractiveBackground'

interface ChannelGateProps {
  onChannelJoined: (channel: Channel) => void
}

function ChannelGate({ onChannelJoined }: ChannelGateProps) {
  // Tab 狀態
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create')

  // 建立頻道狀態
  const [channelName, setChannelName] = useState('')
  const [createdChannel, setCreatedChannel] = useState<Channel | null>(null)
  const [createError, setCreateError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [copied, setCopied] = useState(false)

  // 加入頻道狀態
  const [accessKey, setAccessKey] = useState('')
  const [joinError, setJoinError] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  // 建立頻道處理
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!channelName.trim()) {
      setCreateError('請輸入頻道名稱')
      return
    }

    setIsCreating(true)
    setCreateError('')

    try {
      const response = await createChannel(channelName.trim())

      if (response.success && response.channel) {
        setCreatedChannel(response.channel)
        // 不立即進入頻道，讓用戶看到金鑰
      } else {
        setCreateError(response.message || '建立頻道失敗，請重試')
      }
    } catch (error) {
      setCreateError('建立頻道失敗，請檢查網路連線')
    } finally {
      setIsCreating(false)
    }
  }

  // 複製金鑰
  const handleCopyKey = async () => {
    if (createdChannel) {
      const formattedKey = createdChannel.accessKey.match(/.{1,4}/g)?.join(' ') || createdChannel.accessKey
      await navigator.clipboard.writeText(formattedKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 進入已建立的頻道
  const handleEnterChannel = () => {
    if (createdChannel) {
      // 儲存金鑰到 localStorage
      localStorage.setItem('currentChannelKey', createdChannel.accessKey)
      onChannelJoined(createdChannel)
    }
  }

  // 加入頻道處理
  const handleJoinChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessKey.trim()) {
      setJoinError('請輸入頻道金鑰')
      return
    }

    setIsJoining(true)
    setJoinError('')

    try {
      const response = await joinChannel(accessKey.trim().replace(/\s/g, ''))

      if (response.success && response.channel) {
        // 儲存金鑰到 localStorage
        localStorage.setItem('currentChannelKey', response.channel.accessKey)
        onChannelJoined(response.channel)
      } else {
        setJoinError(response.message || '加入頻道失敗，請檢查金鑰是否正確')
        setAccessKey('')
      }
    } catch (error) {
      setJoinError('加入頻道失敗，請檢查網路連線')
      setAccessKey('')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center px-4 relative">
      <InteractiveBackground />
      <Card className="w-full max-w-md relative z-10 bg-slate-800/90 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            簡易分帳系統
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            建立新頻道或加入現有頻道
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value as 'create' | 'join')
            setCreatedChannel(null)
            setCreateError('')
            setJoinError('')
            setChannelName('')
            setAccessKey('')
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">建立頻道</TabsTrigger>
              <TabsTrigger value="join">加入頻道</TabsTrigger>
            </TabsList>

            {/* 建立頻道 Tab */}
            <TabsContent value="create" className="space-y-4">
              {!createdChannel ? (
                <form onSubmit={handleCreateChannel} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="channelName" className="text-sm font-medium text-gray-300">
                      頻道名稱
                    </label>
                    <Input
                      id="channelName"
                      type="text"
                      placeholder="例如：公司聚餐、週末旅遊"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      className="w-full"
                      autoFocus
                    />
                  </div>

                  {createError && (
                    <Alert variant="destructive">
                      <AlertDescription>{createError}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? '建立中...' : '建立頻道'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      頻道建立成功！請記下以下金鑰，其他人可以使用此金鑰加入頻道。
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">頻道名稱</label>
                    <div className="p-3 bg-muted rounded-md">
                      {createdChannel.name}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">頻道金鑰</label>
                    <div className="flex gap-2">
                      <div className="flex-1 p-3 bg-muted rounded-md font-mono text-lg tracking-wider">
                        {createdChannel.accessKey.match(/.{1,4}/g)?.join(' ')}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleCopyKey}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      請妥善保存此金鑰，遺失後將無法找回
                    </p>
                  </div>

                  <Button onClick={handleEnterChannel} className="w-full">
                    進入頻道
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* 加入頻道 Tab */}
            <TabsContent value="join" className="space-y-4">
              <form onSubmit={handleJoinChannel} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="accessKey" className="text-sm font-medium text-gray-300">
                    頻道金鑰
                  </label>
                  <Input
                    id="accessKey"
                    type="text"
                    placeholder="請輸入 8 位金鑰"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    className="w-full font-mono tracking-wider"
                    maxLength={11} // 8 個字元 + 3 個空格
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    金鑰由頻道建立者提供
                  </p>
                </div>

                {joinError && (
                  <Alert variant="destructive">
                    <AlertDescription>{joinError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isJoining}>
                  {isJoining ? '加入中...' : '加入頻道'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChannelGate
