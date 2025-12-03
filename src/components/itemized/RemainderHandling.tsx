import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, AlertCircle } from 'lucide-react';

interface RemainderHandlingProps {
  totalAmount: number;
  claimedAmount: number;
  remainderHandling: 'payer' | 'split-all';
  payer: string;
  memberCount: number;
  onHandlingChange: (handling: 'payer' | 'split-all') => void;
  disabled?: boolean;
}

/**
 * 剩餘金額處理元件
 *
 * 顯示剩餘金額並提供處理方式選項：
 * - 付款人承擔
 * - 全員平分
 */
export function RemainderHandling({
  totalAmount,
  claimedAmount,
  remainderHandling,
  payer,
  memberCount,
  onHandlingChange,
  disabled = false,
}: RemainderHandlingProps) {
  const remainderAmount = totalAmount - claimedAmount;
  const hasRemainder = remainderAmount > 0.01; // 允許 0.01 的誤差

  // 計算全員平分時每人應付的剩餘金額
  const perPersonRemainder = memberCount > 0 ? remainderAmount / memberCount : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <DollarSign className="h-5 w-5 flex-shrink-0" />
          <span>剩餘金額處理</span>
        </CardTitle>
        <CardDescription className="text-sm">
          選擇如何處理未認領的品項金額
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 剩餘金額顯示 */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">總金額</span>
            <span className="font-medium text-sm sm:text-base">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs sm:text-sm text-muted-foreground">已認領</span>
            <span className="font-medium text-sm sm:text-base text-green-600 dark:text-green-400">
              ${claimedAmount.toFixed(2)}
            </span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-medium">剩餘金額</span>
            <span className={`font-bold text-base sm:text-lg ${
              hasRemainder ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
            }`}>
              ${remainderAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 無剩餘金額提示 */}
        {!hasRemainder && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              ✓ 所有金額已認領完成，無剩餘金額
            </AlertDescription>
          </Alert>
        )}

        {/* 有剩餘金額時顯示處理選項 */}
        {hasRemainder && (
          <>
            <div className="space-y-3">
              <Label className="text-sm sm:text-base">處理方式</Label>
              <RadioGroup
                value={remainderHandling}
                onValueChange={(value) => onHandlingChange(value as 'payer' | 'split-all')}
                disabled={disabled}
                className="space-y-3"
              >
                {/* 付款人承擔 */}
                <div className="flex items-start space-x-2 sm:space-x-3 space-y-0 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <RadioGroupItem value="payer" id="payer" className="mt-0.5" />
                  <div className="space-y-1 leading-none flex-1 min-w-0">
                    <Label
                      htmlFor="payer"
                      className="font-medium cursor-pointer text-sm sm:text-base"
                    >
                      付款人承擔
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      剩餘的 ${remainderAmount.toFixed(2)} 由付款人 <span className="font-medium">{payer}</span> 承擔
                    </p>
                  </div>
                </div>

                {/* 全員平分 */}
                <div className="flex items-start space-x-2 sm:space-x-3 space-y-0 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <RadioGroupItem value="split-all" id="split-all" className="mt-0.5" />
                  <div className="space-y-1 leading-none flex-1 min-w-0">
                    <Label
                      htmlFor="split-all"
                      className="font-medium cursor-pointer text-sm sm:text-base"
                    >
                      全員平分
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      剩餘金額由全體成員平分，每人加收 ${perPersonRemainder.toFixed(2)}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* 全員平分說明 */}
            {remainderHandling === 'split-all' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="text-sm">
                    共 {memberCount} 位成員，每人需額外分攤 ${perPersonRemainder.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    此金額會自動加到每位成員的認領總額中
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
