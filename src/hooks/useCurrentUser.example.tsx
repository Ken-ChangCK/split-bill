/**
 * useCurrentUser Hook 使用範例
 *
 * 這個檔案展示如何在元件中使用 useCurrentUser Hook
 */

import { useCurrentUser } from './useCurrentUser';

/**
 * 範例 1: 基本使用
 */
export function BasicUsageExample({ channelId }: { channelId: string }) {
  const { currentUser, setCurrentUser, clearCurrentUser } = useCurrentUser(channelId);

  return (
    <div>
      <h2>當前使用者: {currentUser || '未選擇'}</h2>

      <button onClick={() => setCurrentUser('小明')}>
        選擇小明
      </button>

      <button onClick={() => setCurrentUser('小華')}>
        選擇小華
      </button>

      <button onClick={clearCurrentUser}>
        清除使用者
      </button>
    </div>
  );
}

/**
 * 範例 2: 使用者選擇器
 */
export function UserSelectorExample({
  channelId,
  members
}: {
  channelId: string;
  members: string[];
}) {
  const { currentUser, setCurrentUser, isUserSelected } = useCurrentUser(channelId);

  if (!isUserSelected) {
    return (
      <div>
        <h2>請選擇你的身份</h2>
        <div>
          {members.map((member) => (
            <button
              key={member}
              onClick={() => setCurrentUser(member)}
            >
              {member}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p>你的身份: {currentUser}</p>
    </div>
  );
}

/**
 * 範例 3: 使用者切換器
 */
export function UserSwitcherExample({
  channelId,
  members
}: {
  channelId: string;
  members: string[];
}) {
  const { currentUser, switchUser } = useCurrentUser(channelId);

  return (
    <div>
      <div>
        <strong>當前身份:</strong> {currentUser || '未選擇'}
      </div>

      <select
        value={currentUser || ''}
        onChange={(e) => switchUser(e.target.value)}
      >
        <option value="">選擇使用者...</option>
        {members.map((member) => (
          <option key={member} value={member}>
            {member}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * 範例 4: 品項認領（使用當前使用者）
 */
export function ItemClaimExample({
  channelId,
  itemName,
  onClaim
}: {
  channelId: string;
  itemName: string;
  onClaim: (userName: string) => void;
}) {
  const { currentUser, isUserSelected } = useCurrentUser(channelId);

  const handleClaim = () => {
    if (!currentUser) {
      alert('請先選擇使用者身份');
      return;
    }
    onClaim(currentUser);
  };

  return (
    <div>
      <h3>{itemName}</h3>
      <button
        onClick={handleClaim}
        disabled={!isUserSelected}
      >
        {isUserSelected ? `以 ${currentUser} 身份認領` : '請先選擇身份'}
      </button>
    </div>
  );
}
