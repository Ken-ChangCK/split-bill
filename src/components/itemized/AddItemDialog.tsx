import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Loader2 } from 'lucide-react';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemAdded: (item: { name: string; price: number }) => void;
  isLoading?: boolean;
}

/**
 * 新增品項對話框元件
 *
 * 用於在明細模式支出中新增品項
 * 包含品項名稱和金額輸入，並進行表單驗證
 */
export function AddItemDialog({
  open,
  onOpenChange,
  onItemAdded,
  isLoading = false,
}: AddItemDialogProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  // 當對話框開啟時，重置表單
  useEffect(() => {
    if (open) {
      setName('');
      setPrice('');
      setError('');
    }
  }, [open]);

  // 驗證表單
  const validate = (): boolean => {
    // 驗證品項名稱
    if (!name.trim()) {
      setError('請輸入品項名稱');
      return false;
    }

    if (name.trim().length > 50) {
      setError('品項名稱不可超過 50 個字元');
      return false;
    }

    // 驗證金額
    if (!price.trim()) {
      setError('請輸入金額');
      return false;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      setError('金額必須是有效的數字');
      return false;
    }

    if (priceNum <= 0) {
      setError('金額必須大於 0');
      return false;
    }

    if (priceNum > 999999) {
      setError('金額不可超過 999,999');
      return false;
    }

    // 檢查小數位數（最多 2 位）
    if (price.includes('.')) {
      const decimalPart = price.split('.')[1];
      if (decimalPart && decimalPart.length > 2) {
        setError('金額最多只能有兩位小數');
        return false;
      }
    }

    return true;
  };

  // 處理提交
  const handleSubmit = () => {
    setError('');

    if (!validate()) {
      return;
    }

    // 呼叫父元件的回調
    onItemAdded({
      name: name.trim(),
      price: parseFloat(price),
    });
  };

  // 處理 Enter 鍵提交
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 處理取消
  const handleCancel = () => {
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            新增品項
          </DialogTitle>
          <DialogDescription>
            輸入品項名稱和金額，稍後可以認領此品項
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 品項名稱輸入 */}
          <div className="space-y-2">
            <Label htmlFor="item-name">
              品項名稱 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="item-name"
              placeholder="例如：生啤酒、生魚片拼盤"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={50}
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/50 字元
            </p>
          </div>

          {/* 金額輸入 */}
          <div className="space-y-2">
            <Label htmlFor="item-price">
              金額 <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="item-price"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-8"
                step="0.01"
                min="0"
                max="999999"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              請輸入正數金額（最多兩位小數）
            </p>
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || !price.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                新增中...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                新增品項
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
