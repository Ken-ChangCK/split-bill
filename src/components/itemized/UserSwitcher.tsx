import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks';

interface UserSwitcherProps {
  channelId: string;
  members: string[];
  claimedTotal?: number;
  onUserChanged?: (userName: string) => void;
  showClaimedTotal?: boolean;
}

/**
 * 使用者切換器元件
 *
 * 顯示當前使用者，並提供切換身份的功能
 * 可選顯示當前使用者的認領總額
 */
export function UserSwitcher({
  channelId,
  members,
  claimedTotal,
  onUserChanged,
  showClaimedTotal = false,
}: UserSwitcherProps) {
  const { currentUser, switchUser } = useCurrentUser(channelId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setSelectedUser(currentUser);
    setIsDialogOpen(true);
  };

  const handleUserClick = (userName: string) => {
    setSelectedUser(userName);
  };

  const handleConfirm = () => {
    if (selectedUser && selectedUser !== currentUser) {
      switchUser(selectedUser);
      setIsDialogOpen(false);

      // 通知父元件
      if (onUserChanged) {
        onUserChanged(selectedUser);
      }
    } else {
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      {/* 當前使用者顯示卡片 */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* 左側：使用者資訊 */}
            <div className="flex items-center gap-3">
              {/* 頭像 */}
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                {currentUser?.charAt(0).toUpperCase() || '?'}
              </div>

              {/* 名稱和總額 */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">當前身份</span>
                </div>
                <div className="font-semibold text-lg">{currentUser || '未選擇'}</div>
                {showClaimedTotal && claimedTotal !== undefined && (
                  <div className="text-sm text-muted-foreground">
                    已認領：<span className="font-medium text-primary">¥{claimedTotal.toFixed(0)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 右側：切換按鈕 */}
            <Button
              onClick={handleOpenDialog}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              切換身份
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 切換身份對話框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              切換身份
            </DialogTitle>
            <DialogDescription>
              選擇新的身份後，你的認領記錄會保持不變
            </DialogDescription>
          </DialogHeader>

          {/* 成員選擇網格 */}
          <div className="grid grid-cols-2 gap-3 py-4">
            {members.map((member) => (
              <button
                key={member}
                onClick={() => handleUserClick(member)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all
                  flex flex-col items-center justify-center gap-2
                  hover:border-primary hover:bg-primary/5
                  ${
                    selectedUser === member
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200'
                  }
                `}
              >
                {/* 選中標記 */}
                {selectedUser === member && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                )}

                {/* 當前使用者標記 */}
                {currentUser === member && (
                  <div className="absolute top-2 left-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                )}

                {/* 使用者圖示 */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                    ${
                      selectedUser === member
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {member.charAt(0).toUpperCase()}
                </div>

                {/* 使用者名稱 */}
                <span className="font-medium text-sm">
                  {member}
                  {currentUser === member && (
                    <span className="text-xs text-muted-foreground ml-1">(目前)</span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* 按鈕 */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setIsDialogOpen(false)}
              variant="outline"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedUser || selectedUser === currentUser}
            >
              {selectedUser === currentUser ? '已是當前身份' : '確認切換'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
