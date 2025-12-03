import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ItemList } from './ItemList';
import { RemainderHandling } from './RemainderHandling';
import { UserSwitcher } from './UserSwitcher';
import { UserSelector } from './UserSelector';
import { useCurrentUser, useItemActions, useAutoRefresh } from '@/hooks';
import { ExpenseItem } from '@/types/channel';
import { createItem, updateRemainderHandling } from '@/api/items';
import { Receipt, User as UserIcon, DollarSign, Calendar, CheckCircle2, RefreshCw, Pause, Play } from 'lucide-react';

interface ItemizedExpenseManagerProps {
  accessKey: string;
  expenseId: number;
  expenseName: string;
  totalAmount: number;
  payer: string;
  members: string[];
  items: ExpenseItem[];
  remainderHandling: 'payer' | 'split-all';
  createdAt?: string;
  onRefresh: () => void;
  onComplete?: () => void;
}

/**
 * 明細模式管理頁面
 *
 * 整合所有品項管理功能的主頁面：
 * - 支出資訊顯示
 * - 使用者身份選擇/切換
 * - 品項列表管理
 * - 認領進度
 * - 剩餘金額處理
 * - 完成並查看結算按鈕
 */
export function ItemizedExpenseManager({
  accessKey,
  expenseId,
  expenseName,
  totalAmount,
  payer,
  members,
  items,
  remainderHandling,
  createdAt,
  onRefresh,
  onComplete,
}: ItemizedExpenseManagerProps) {
  const channelId = accessKey;
  const { currentUser, isUserSelected } = useCurrentUser(channelId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUpdatingRemainder, setIsUpdatingRemainder] = useState(false);
  const [refreshError, setRefreshError] = useState<string>('');

  // 自動刷新機制（每 10 秒刷新一次）
  const {
    isRefreshing,
    lastRefreshTime,
    isPaused,
    pauseRefresh,
    resumeRefresh,
    manualRefresh
  } = useAutoRefresh({
    enabled: true,
    interval: 10000, // 10 秒
    onRefresh: async () => {
      await onRefresh();
    },
    onError: (err) => {
      console.error('Auto refresh error:', err);
      setRefreshError('自動刷新失敗，請檢查網路連線');
      // 3秒後清除錯誤訊息
      setTimeout(() => setRefreshError(''), 3000);
    }
  });

  // 使用 useItemActions Hook
  const {
    isLoading,
    handleClaim,
    handleUnclaim,
    handleDelete,
  } = useItemActions({
    accessKey,
    expenseId,
    currentUser,
    onSuccess: () => {
      setSuccess('操作成功');
      setError('');
      onRefresh();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (errorMsg) => {
      setError(errorMsg);
      setSuccess('');
    },
  });

  // 處理新增品項
  const handleAddItem = async (item: { name: string; price: number }) => {
    try {
      const response = await createItem(accessKey, expenseId, {
        ...item,
        createdBy: currentUser || undefined,
      });

      if (response.success) {
        setSuccess('品項新增成功');
        setError('');
        onRefresh();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || '新增品項失敗');
      }
    } catch (error) {
      setError('新增品項時發生錯誤');
    }
  };

  // 處理剩餘金額處理方式變更
  const handleRemainderHandlingChange = async (handling: 'payer' | 'split-all') => {
    setIsUpdatingRemainder(true);
    try {
      const response = await updateRemainderHandling(accessKey, expenseId, handling);

      if (response.success) {
        setSuccess('剩餘金額處理方式已更新');
        setError('');
        onRefresh();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || '更新失敗');
      }
    } catch (error) {
      setError('更新時發生錯誤');
    } finally {
      setIsUpdatingRemainder(false);
    }
  };

  // 計算統計資訊
  const claimedAmount = items.reduce((total, item) => {
    if (item.claimedBy.length > 0) {
      return total + item.price;
    }
    return total;
  }, 0);

  const allItemsClaimed = items.length > 0 && items.every(item => item.claimedBy.length > 0);
  const hasItems = items.length > 0;

  // 清除訊息
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="space-y-6">
      {/* 自動刷新狀態指示器 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm text-slate-300">
              {isRefreshing ? '同步中...' : '自動同步已啟用'}
            </span>
          </div>
          {lastRefreshTime && !isRefreshing && (
            <Badge variant="secondary" className="text-xs">
              最後更新：{lastRefreshTime.toLocaleTimeString()}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={manualRefresh}
            variant="ghost"
            size="sm"
            disabled={isRefreshing}
            className="gap-1 h-8 flex-1 sm:flex-none"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="sm:inline">立即刷新</span>
          </Button>
          <Button
            onClick={isPaused ? resumeRefresh : pauseRefresh}
            variant="ghost"
            size="sm"
            className="gap-1 h-8 flex-1 sm:flex-none"
          >
            {isPaused ? (
              <>
                <Play className="h-3 w-3" />
                <span className="sm:inline">恢復</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3" />
                <span className="sm:inline">暫停</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 刷新錯誤訊息 */}
      {refreshError && (
        <Alert variant="destructive">
          <AlertDescription>{refreshError}</AlertDescription>
        </Alert>
      )}

      {/* 頂端：支出資訊 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 break-words">
                <Receipt className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                <span className="truncate">{expenseName}</span>
              </CardTitle>
              <CardDescription className="space-y-1 mt-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">總金額：${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">付款人：{payer}</span>
                </div>
                {createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base">建立時間：{new Date(createdAt).toLocaleString()}</span>
                  </div>
                )}
              </CardDescription>
            </div>

            {/* 完成並查看結算按鈕 */}
            {hasItems && (
              <Button
                onClick={onComplete}
                variant={allItemsClaimed ? "default" : "outline"}
                size="lg"
                className="gap-2 w-full lg:w-auto"
              >
                {allItemsClaimed && <CheckCircle2 className="h-5 w-5" />}
                完成並查看結算
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* 錯誤/成功訊息 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <AlertDescription className="text-green-700 dark:text-green-400">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* 使用者身份選擇/切換 */}
      {!isUserSelected ? (
        <UserSelector
          channelId={channelId}
          members={members}
          title="選擇你的身份"
          description="選擇後即可認領你消費的品項"
        />
      ) : (
        <UserSwitcher
          channelId={channelId}
          members={members}
          showClaimedTotal={true}
          claimedTotal={items.reduce((total, item) => {
            if (currentUser && item.claimedBy.includes(currentUser)) {
              return total + (item.price / item.claimedBy.length);
            }
            return total;
          }, 0)}
        />
      )}

      <Separator />

      {/* 品項列表 */}
      {isUserSelected && (
        <ItemList
          items={items}
          totalAmount={totalAmount}
          currentUser={currentUser}
          onAddItem={handleAddItem}
          onClaimItem={handleClaim}
          onUnclaimItem={handleUnclaim}
          onEditItem={(itemId) => {
            // TODO: 實作編輯對話框
            console.log('Edit item:', itemId);
          }}
          onDeleteItem={handleDelete}
          isLoading={isLoading}
        />
      )}

      {/* 剩餘金額處理 */}
      {hasItems && (
        <>
          <Separator />
          <RemainderHandling
            totalAmount={totalAmount}
            claimedAmount={claimedAmount}
            remainderHandling={remainderHandling}
            payer={payer}
            memberCount={members.length}
            onHandlingChange={handleRemainderHandlingChange}
            disabled={isUpdatingRemainder}
          />
        </>
      )}

      {/* 未選擇使用者時的提示 */}
      {!isUserSelected && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                💡 請先選擇你的身份
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                選擇後才能新增品項、認領品項，並查看你的認領總額
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 無品項時的提示 */}
      {isUserSelected && !hasItems && (
        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-yellow-900 dark:text-yellow-100 font-medium">
                📋 開始建立品項
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                點擊上方「新增品項」按鈕，建立第一個品項
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
