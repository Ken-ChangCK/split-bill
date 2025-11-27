import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Channel } from '@/types/channel'
import { deleteChannel } from '@/api/channel'
import { Check, Copy, Eye, EyeOff, LogOut, Trash2, Share2, MessageCircle, Mail, Send } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface ChannelHeaderProps {
  channel: Channel
  onLogout: () => void
  onChannelDeleted: () => void
}

function ChannelHeader({ channel, onLogout, onChannelDeleted }: ChannelHeaderProps) {
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [messageCopied, setMessageCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // 格式化金鑰：每 4 個字元加一個空格
  const formattedKey = channel.accessKey.match(/.{1,4}/g)?.join(' ') || channel.accessKey

  // 生成分享訊息
  const shareMessage = `【分帳頻道邀請】

頻道名稱：${channel.name}
加入金鑰：${formattedKey}

加入方式：
1. 前往分帳系統
2. 點選「加入頻道」
3. 輸入金鑰
4. 開始使用

系統連結：${window.location.origin}/split-bill`

  // 生成各平台分享 URL
  const getShareUrl = (platform: string) => {
    const encodedMessage = encodeURIComponent(shareMessage)
    const urls: Record<string, string> = {
      line: `https://line.me/R/msg/text/?${encodedMessage}`,
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      telegram: `https://t.me/share/url?text=${encodedMessage}`,
      email: `mailto:?subject=${encodeURIComponent(`加入分帳頻道：${channel.name}`)}&body=${encodedMessage}`
    }
    return urls[platform]
  }

  // 複製金鑰
  const handleCopyKey = async () => {
    await navigator.clipboard.writeText(channel.accessKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 複製分享訊息
  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(shareMessage)
    setMessageCopied(true)
    setTimeout(() => setMessageCopied(false), 2000)
  }

  // 分享到平台
  const handleShare = (platform: string) => {
    const url = getShareUrl(platform)
    window.open(url, '_blank')
  }

  // 刪除頻道
  const handleDeleteChannel = async () => {
    setIsDeleting(true)
    setDeleteError('')

    try {
      const response = await deleteChannel(channel.accessKey)

      if (response.success) {
        // 清除 localStorage
        localStorage.removeItem('currentChannelKey')
        // 關閉對話框
        setShowDeleteDialog(false)
        // 通知父組件
        onChannelDeleted()
      } else {
        setDeleteError(response.message || '刪除頻道失敗，請重試')
      }
    } catch (error) {
      setDeleteError('刪除頻道失敗，請檢查網路連線')
    } finally {
      setIsDeleting(false)
    }
  }

  // 登出
  const handleLogout = () => {
    // 清除 localStorage
    localStorage.removeItem('currentChannelKey')
    // 通知父組件
    onLogout()
  }

  return (
    <>
      <Card className="mb-6">
        <div className="p-4 space-y-4">
          {/* 頻道名稱 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {channel.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                頻道金鑰（分享給其他人以加入頻道）
              </p>
            </div>
          </div>

          {/* 金鑰顯示和操作 */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 p-3 bg-muted rounded-md">
              <span className="font-mono text-lg tracking-wider">
                {showKey ? formattedKey : '••••••••'}
              </span>
            </div>

            {/* 顯示/隱藏切換 */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowKey(!showKey)}
              title={showKey ? '隱藏金鑰' : '顯示金鑰'}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>

            {/* 複製按鈕 */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyKey}
              title="複製金鑰"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>

            {/* 分享按鈕 */}
            <Button
              type="button"
              variant="default"
              size="icon"
              onClick={() => setShowShareDialog(true)}
              title="分享頻道"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              登出
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              刪除頻道
            </Button>
          </div>
        </div>
      </Card>

      {/* 刪除確認對話框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確定要刪除頻道嗎？</DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>
                您即將刪除頻道「<strong>{channel.name}</strong>」
              </p>
              <p className="text-yellow-600 dark:text-yellow-500 font-medium">
                ⚠️ 此操作無法復原，所有成員和支出記錄將永久刪除。
              </p>
              <p className="text-sm">
                建議：刪除前先「匯出 CSV」備份資料。
              </p>
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="text-sm text-red-600 dark:text-red-500">
              {deleteError}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChannel}
              disabled={isDeleting}
            >
              {isDeleting ? '刪除中...' : '確定刪除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 分享對話框 - 視覺化卡片 */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Share2 className="h-6 w-6 text-blue-500" />
              <span className="bg-gradient-to-r from-slate-700 via-blue-600 to-slate-700 bg-clip-text text-transparent">
                分享頻道
              </span>
            </DialogTitle>
            <DialogDescription>
              複製訊息或透過社群軟體分享
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 視覺化分享卡片 - 深色專業版 */}
            <div
              ref={cardRef}
              className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
              style={{
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.2)',
              }}
            >
              {/* 動態粒子背景 - 深色專業版 */}
              <div className="absolute inset-0 opacity-25">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-2/3 right-1/4 w-40 h-40 bg-indigo-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              </div>

              {/* 卡片內容 */}
              <div className="relative z-10 text-white text-center space-y-6">
                {/* 標題 */}
                <div className="space-y-2">
                  <div className="inline-block px-4 py-1 bg-blue-500/20 backdrop-blur-sm rounded-full text-sm font-medium border border-blue-400/30">
                    頻道邀請
                  </div>
                  <h2 className="text-4xl font-bold tracking-tight">
                    {channel.name}
                  </h2>
                  <p className="text-gray-300 text-sm">分帳頻道</p>
                </div>

                {/* 金鑰區域 */}
                <div className="bg-blue-500/10 backdrop-blur-md rounded-xl p-6 border border-blue-400/30">
                  <p className="text-blue-300 text-sm mb-2">加入金鑰</p>
                  <div className="text-5xl font-bold tracking-widest font-mono text-blue-100">
                    {formattedKey}
                  </div>
                </div>

                {/* 加入步驟 */}
                <div className="bg-slate-700/30 backdrop-blur-md rounded-xl p-6 border border-slate-600/30 text-left">
                  <p className="text-gray-300 text-sm mb-3 text-center">加入方式</p>
                  <ol className="space-y-2 text-sm text-gray-200">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500/30 border border-blue-400/30 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>前往分帳系統</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500/30 border border-blue-400/30 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>點選「加入頻道」</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500/30 border border-blue-400/30 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span>輸入金鑰</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500/30 border border-blue-400/30 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <span>開始使用</span>
                    </li>
                  </ol>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG
                      value={JSON.stringify({
                        name: channel.name,
                        key: channel.accessKey,
                        url: window.location.origin
                      })}
                      size={140}  
                      level="H"
                    />
                  </div>
                </div>

                {/* 網址 */}
                <a className="text-gray-400 text-xs underline hover:text-blue-300 transition-colors" href={window.location.origin} target="_blank" rel="noopener noreferrer">
                  {window.location.origin}
                </a>
              </div>
            </div>

            {/* 操作按鈕區域 */}
            <div className="space-y-4">
              {/* 主要操作 */}
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCopyMessage}
                  className="h-14"
                >
                  {messageCopied ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      已複製訊息
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 mr-2" />
                      複製文字訊息
                    </>
                  )}
                </Button>
              </div>

              {/* 快速分享 */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-center text-muted-foreground">或快速分享到</h3>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleShare('line')}
                    className="h-12 flex-col gap-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-xs">LINE</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare('whatsapp')}
                    className="h-12 flex-col gap-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-600"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-xs">WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare('telegram')}
                    className="h-12 flex-col gap-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600"
                  >
                    <Send className="h-5 w-5" />
                    <span className="text-xs">Telegram</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare('email')}
                    className="h-12 flex-col gap-1 bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                  >
                    <Mail className="h-5 w-5" />
                    <span className="text-xs">Email</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowShareDialog(false)}
            >
              關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ChannelHeader
