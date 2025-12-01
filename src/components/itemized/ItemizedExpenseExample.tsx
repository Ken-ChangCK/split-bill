import { useState, useEffect } from 'react';
import { ItemList } from './ItemList';
import { UserSwitcher } from './UserSwitcher';
import { UserSelector } from './UserSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrentUser, useItemActions } from '@/hooks';
import { ExpenseItem } from '@/types/channel';
import { createItem } from '@/api/items';
import { DollarSign, User as UserIcon } from 'lucide-react';

interface ItemizedExpenseExampleProps {
  accessKey: string;
  expenseId: number;
  expenseName: string;
  totalAmount: number;
  payer: string;
  members: string[];
  items: ExpenseItem[];
  onRefresh: () => void;
}

/**
 * 明細模式支出範例組件
 *
 * 展示如何整合：
 * - UserSelector / UserSwitcher（身份選擇）
 * - ItemList（品項列表）
 * - useItemActions（認領核心邏輯）
 */
export function ItemizedExpenseExample({
  accessKey,
  expenseId,
  expenseName,
  totalAmount,
  payer,
  members,
  items,
  onRefresh,
}: ItemizedExpenseExampleProps) {
  const channelId = accessKey; // 使用 accessKey 作為 channelId
  const { currentUser, isUserSelected } = useCurrentUser(channelId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 使用 useItemActions Hook
  const {
    isLoading,
    handleClaim,
    handleUnclaim,
    // handleEdit,
    handleDelete,
  } = useItemActions({
    accessKey,
    expenseId,
    currentUser,
    onSuccess: () => {
      setSuccess('操作成功');
      setError('');
      onRefresh();
      // 3 秒後清除成功訊息
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
      {/* 支出標題資訊 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{expenseName}</CardTitle>
          <CardDescription className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>總金額：¥{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>付款人：{payer}</span>
            </div>
          </CardDescription>
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
          title="選擇你的身份以開始認領"
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
            // 這裡可以開啟編輯對話框
            console.log('Edit item:', itemId);
          }}
          onDeleteItem={handleDelete}
          isLoading={isLoading}
        />
      )}

      {/* 說明文字 */}
      {!isUserSelected && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 請先選擇你的身份，才能開始認領品項
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
