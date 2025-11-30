import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, CheckCircle2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks';

interface UserSelectorProps {
  channelId: string;
  members: string[];
  onUserSelected?: (userName: string) => void;
  title?: string;
  description?: string;
}

/**
 * 使用者選擇器元件
 *
 * 用於首次選擇使用者身份，或當使用者未選擇時顯示
 * 選擇後會自動儲存到 localStorage
 */
export function UserSelector({
  channelId,
  members,
  onUserSelected,
  title = '選擇你的身份',
  description = '請選擇你在這個頻道中的身份，以便認領你的消費品項',
}: UserSelectorProps) {
  const { setCurrentUser } = useCurrentUser(channelId);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleUserClick = (userName: string) => {
    setSelectedUser(userName);
    setError('');
  };

  const handleConfirm = () => {
    if (!selectedUser) {
      setError('請選擇一個使用者');
      return;
    }

    // 儲存到 localStorage
    setCurrentUser(selectedUser);

    // 通知父元件
    if (onUserSelected) {
      onUserSelected(selectedUser);
    }
  };

  if (members?.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              這個頻道還沒有成員。請先在成員管理中新增成員。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 成員選擇網格 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {members?.map((member) => (
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
              <span className="font-medium text-sm">{member}</span>
            </button>
          ))}
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 確認按鈕 */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleConfirm}
            disabled={!selectedUser}
            size="lg"
            className="w-full sm:w-auto"
          >
            確認身份
          </Button>
        </div>

        {/* 說明文字 */}
        <div className="text-sm text-muted-foreground text-center pt-2">
          選擇後，系統會記住你的身份，之後可以隨時切換
        </div>
      </CardContent>
    </Card>
  );
}
