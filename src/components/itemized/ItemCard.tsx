import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Square,
  CheckSquare,
  User,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { ExpenseItem } from '@/types/channel';

interface ItemCardProps {
  item: ExpenseItem;
  currentUser: string | null;
  onClaim?: (itemId: string) => void;
  onUnclaim?: (itemId: string) => void;
  onEdit?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  isLoading?: boolean;
}

/**
 * 品項卡片元件
 *
 * 顯示品項資訊和認領狀態
 * - 待認領：灰色邊框，顯示「認領」按鈕
 * - 已認領（當前使用者）：綠色邊框，高亮顯示
 * - 已認領（其他人）：藍色邊框
 * - 多人認領：紫色邊框，顯示分攤金額
 */
export function ItemCard({
  item,
  currentUser,
  onClaim,
  onUnclaim,
  onEdit,
  onDelete,
  isLoading = false,
}: ItemCardProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);

  // 判斷當前使用者是否已認領
  const isClaimedByCurrentUser = currentUser ? item.claimedBy.includes(currentUser) : false;

  // 判斷是否有人認領
  const isClaimed = item.claimedBy.length > 0;

  // 判斷是否多人認領
  const isMultipleClaimed = item.claimedBy.length > 1;

  // 計算每人應付金額
  const pricePerPerson = isClaimed ? item.price / item.claimedBy.length : 0;

  // 處理認領
  const handleClaim = async () => {
    if (!currentUser) return;
    setIsActionLoading(true);
    try {
      await onClaim?.(item.id);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 處理取消認領
  const handleUnclaim = async () => {
    if (!currentUser) return;
    setIsActionLoading(true);
    try {
      await onUnclaim?.(item.id);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 卡片邊框樣式
  const getCardBorderClass = () => {
    if (!isClaimed) {
      return 'border-dashed border-gray-300 dark:border-gray-600'; // 待認領：虛線灰色
    }
    if (isMultipleClaimed) {
      return 'border-purple-500 dark:border-purple-400 shadow-lg shadow-purple-200 dark:shadow-purple-900/30'; // 多人認領：紫色 + 陰影
    }
    if (isClaimedByCurrentUser) {
      return 'border-green-500 dark:border-green-400 shadow-lg shadow-green-200 dark:shadow-green-900/30'; // 已認領（自己）：綠色 + 陰影
    }
    return 'border-blue-500 dark:border-blue-400'; // 已認領（他人）：藍色
  };

  // 卡片背景樣式
  const getCardBgClass = () => {
    if (!isClaimed) {
      return 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-750';
    }
    if (isMultipleClaimed) {
      return 'bg-purple-50 dark:bg-purple-950/20';
    }
    if (isClaimedByCurrentUser) {
      return 'bg-green-50 dark:bg-green-950/20 ring-2 ring-green-200 dark:ring-green-900/50';
    }
    return 'bg-blue-50 dark:bg-blue-950/20';
  };

  return (
    <Card className={`${getCardBorderClass()} ${getCardBgClass()} border-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* 左側：認領圖示 + 品項資訊 */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* 認領圖示 */}
            <div className="mt-1">
              {isClaimed ? (
                <CheckSquare className={`h-5 w-5 ${
                  isMultipleClaimed
                    ? 'text-purple-500'
                    : isClaimedByCurrentUser
                    ? 'text-green-500'
                    : 'text-blue-500'
                }`} />
              ) : (
                <Square className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {/* 品項資訊 */}
            <div className="flex-1 min-w-0">
              {/* 品項名稱 */}
              <h3 className="font-semibold text-base truncate">
                {item.name}
              </h3>

              {/* 金額 */}
              <p className="text-lg font-bold text-primary mt-1">
                ${item.price.toFixed(2)}
              </p>

              {/* 認領狀態 */}
              <div className="mt-2 space-y-1">
                {!isClaimed && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    尚未認領
                  </p>
                )}

                {isClaimed && (
                  <>
                    {/* 認領人清單 */}
                    <div className="flex items-center gap-1.5 text-sm">
                      {isMultipleClaimed ? (
                        <Users className="h-4 w-4 text-purple-500" />
                      ) : (
                        <User className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300">
                        {item.claimedBy.join('、')}
                      </span>
                    </div>

                    {/* 多人分攤金額 */}
                    {isMultipleClaimed && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        每人應付 ${pricePerPerson.toFixed(2)}
                      </p>
                    )}

                    {/* 當前使用者已認領提示 */}
                    {isClaimedByCurrentUser && (
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ 你已認領此品項
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 右側：操作按鈕 */}
          <div className="flex flex-col sm:flex-row items-end sm:items-start gap-2">
            {/* 認領/取消認領按鈕 */}
            {currentUser && (
              <>
                {isClaimedByCurrentUser ? (
                  <Button
                    onClick={handleUnclaim}
                    variant="outline"
                    size="sm"
                    disabled={isLoading || isActionLoading}
                    className="whitespace-nowrap min-w-[80px] h-9"
                  >
                    {isActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      '取消認領'
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleClaim}
                    variant={isClaimed ? "outline" : "default"}
                    size="sm"
                    disabled={isLoading || isActionLoading}
                    className="whitespace-nowrap min-w-[80px] h-9"
                  >
                    {isActionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      isClaimed ? '加入認領' : '認領'
                    )}
                  </Button>
                )}
              </>
            )}

            {/* 編輯/刪除選單 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  disabled={isLoading || isActionLoading}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit?.(item.id)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  編輯品項
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(item.id)}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  刪除品項
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 建立者資訊（選用） */}
        {item.createdBy && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              由 {item.createdBy} 建立
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
