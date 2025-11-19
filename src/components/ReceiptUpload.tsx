import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, Loader2, Camera } from 'lucide-react'
import { analyzeReceipt, ReceiptData } from '@/services/geminiService'

interface ReceiptUploadProps {
  onReceiptAnalyzed: (data: ReceiptData) => void
}

export default function ReceiptUpload({ onReceiptAnalyzed }: ReceiptUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 驗證檔案類型
    if (!file.type.startsWith('image/')) {
      setError('請上傳圖片檔案')
      return
    }

    // 驗證檔案大小 (限制 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('圖片檔案大小不能超過 10MB')
      return
    }

    // 顯示預覽
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 開始分析
    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await analyzeReceipt(file)

      if (result.success) {
        onReceiptAnalyzed(result)
        setError(null)
      } else {
        setError(result.error || '發票識別失敗')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '發票識別過程發生錯誤')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = ''
    }
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Camera className="h-5 w-5 text-gray-500" />
        <label className="text-sm font-medium">上傳發票圖片（自動識別）</label>
      </div>

      {!previewUrl ? (
        <div className="space-y-3">
          {/* 拍照 input - 在手機上會直接開啟相機 */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isAnalyzing}
          />
          {/* 相簿選擇 input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isAnalyzing}
          />

          {/* 拍照按鈕 */}
          <Button
            type="button"
            variant="default"
            onClick={handleCameraClick}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-2 h-16"
          >
            <Camera className="h-5 w-5" />
            拍照上傳發票
          </Button>

          {/* 從相簿選擇按鈕 */}
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-2 h-16"
          >
            <Upload className="h-5 w-5" />
            從相簿選擇
          </Button>
        </div>
      ) : (
        <div className="relative border rounded-lg p-2">
          <img
            src={previewUrl}
            alt="發票預覽"
            className="w-full h-48 object-contain rounded"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveImage}
            disabled={isAnalyzing}
            className="absolute top-4 right-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isAnalyzing && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription className="ml-2">
            正在識別發票資訊，請稍候...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-muted-foreground">
        可直接拍照或從相簿選擇發票圖片，支援 JPG、PNG 格式，檔案大小限制 10MB。上傳後會自動識別店家名稱、金額和日期。
      </p>
    </div>
  )
}
