import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ItemCard } from './ItemCard';
import { AddItemDialog } from './AddItemDialog';
import { Plus, Package, AlertCircle, Sparkles, Info } from 'lucide-react';
import { ExpenseItem } from '@/types/channel';

interface ItemListProps {
  items: ExpenseItem[];
  totalAmount: number;
  currentUser: string | null;
  onAddItem?: (item: { name: string; price: number }) => void;
  onClaimItem?: (itemId: string) => void;
  onUnclaimItem?: (itemId: string) => void;
  onEditItem?: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
  isLoading?: boolean;
}

/**
 * 品項列表元件
 *
 * 顯示所有品項，提供新增品項功能
 * 顯示認領進度（已認領金額/總金額）
 */
export function ItemList({
  items,
  totalAmount,
  currentUser,
  onAddItem,
  onClaimItem,
  onUnclaimItem,
  onEditItem,
  onDeleteItem,
  isLoading = false,
}: ItemListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // 計算已認領總額
  const calculateClaimedAmount = (): number => {
    return items.reduce((total, item) => {
      if (item.claimedBy.length > 0) {
        return total + item.price;
      }
      return total;
    }, 0);
  };

  // 計算當前使用者認領總額
  const calculateUserClaimedAmount = (): number => {
    if (!currentUser) return 0;

    return items.reduce((total, item) => {
      if (item.claimedBy.includes(currentUser)) {
        // 多人分攤時，只計算該使用者應付的部分
        const pricePerPerson = item.price / item.claimedBy.length;
        return total + pricePerPerson;
      }
      return total;
    }, 0);
  };

  // 計算認領進度百分比
  const calculateProgress = (): number => {
    if (totalAmount === 0) return 0;
    return (calculateClaimedAmount() / totalAmount) * 100;
  };

  // 統計資訊
  const claimedAmount = calculateClaimedAmount();
  const userClaimedAmount = calculateUserClaimedAmount();
  const remainingAmount = totalAmount - claimedAmount;
  const progress = calculateProgress();
  const claimedItemsCount = items.filter(item => item.claimedBy.length > 0).length;

  // 處理新增品項
  const handleAddItem = async (item: { name: string; price: number }) => {
    setIsAddingItem(true);
    try {
      await onAddItem?.(item);
      setIsAddDialogOpen(false);
    } finally {
      setIsAddingItem(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 標題和新增按鈕 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                品項清單
              </CardTitle>
              <CardDescription>
                {items.length === 0 ? '尚無品項' : `共 ${items.length} 個品項`}
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              disabled={isLoading}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              新增品項
            </Button>
          </div>
        </CardHeader>

        {/* 認領進度 */}
        {items.length > 0 && (
          <CardContent className="space-y-4">
            {/* 進度條 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">認領進度</span>
                <span className="font-medium">
                  {claimedItemsCount}/{items.length} 品項
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  已認領 ${claimedAmount.toFixed(2)}
                </span>
                <span className="text-muted-foreground">
                  剩餘 ${remainingAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 當前使用者認領總額 */}
            {currentUser && userClaimedAmount > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">{currentUser}</span> 已認領：
                  <span className="font-bold text-primary ml-1">
                    ${userClaimedAmount.toFixed(2)}
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* 完成提示 */}
            {progress === 100 && (
              <Alert className="border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-lg">
                <Sparkles className="h-5 w-5 text-green-600 animate-pulse" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎉</span>
                      <span className="font-semibold">太棒了！所有品項已認領完成！</span>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700">
                      100%
                    </Badge>
                  </div>
                  <p className="text-sm mt-2 text-green-600 dark:text-green-500">
                    點擊下方「完成並查看結算」按鈕查看誰應該付給誰多少錢
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}
      </Card>

      {/* 品項列表 */}
      {items.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Package className="h-16 w-16 mx-auto text-gray-400 animate-bounce" />
                <Sparkles className="h-6 w-6 absolute -top-2 -right-2 text-yellow-500 animate-pulse" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  開始新增品項吧！
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                  在明細模式中，你可以新增每個消費品項，然後由各自認領。這樣就能清楚知道每個人要付多少錢！
                </p>
              </div>

              {/* 操作引導 */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto text-left">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm space-y-2">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      如何使用：
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                      <li>新增消費品項（例如：生啤酒 $500）</li>
                      <li>點擊「認領」按鈕認領你的品項</li>
                      <li>多人可以一起分攤同一品項</li>
                      <li>完成後查看結算結果</li>
                    </ol>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsAddDialogOpen(true)}
                size="lg"
                className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Plus className="h-5 w-5" />
                新增第一個品項
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              currentUser={currentUser}
              onClaim={onClaimItem}
              onUnclaim={onUnclaimItem}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}

      {/* 新增品項對話框 */}
      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onItemAdded={handleAddItem}
        isLoading={isAddingItem}
      />
    </div>
  );
}
