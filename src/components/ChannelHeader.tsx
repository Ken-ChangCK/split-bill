import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Channel } from '@/types/channel'
import { deleteChannel } from '@/api/channel'
import { Check, Copy, Eye, EyeOff, LogOut, Trash2 } from 'lucide-react'

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

  // 格式化金鑰：每 4 個字元加一個空格
  const formattedKey = channel.accessKey.match(/.{1,4}/g)?.join(' ') || channel.accessKey

  // 複製金鑰
  const handleCopyKey = async () => {
    await navigator.clipboard.writeText(channel.accessKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
    </>
  )
}

export default ChannelHeader
