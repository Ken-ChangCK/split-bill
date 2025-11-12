import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, UserPlus } from 'lucide-react'

interface MemberManagementProps {
  members: string[]
  setMembers: (members: string[]) => void
}

export default function MemberManagement({ members, setMembers }: MemberManagementProps) {
  const [newMember, setNewMember] = useState('')
  const [error, setError] = useState('')

  const handleAddMember = () => {
    if (!newMember.trim()) {
      setError('請輸入成員名稱')
      return
    }

    if (members.includes(newMember.trim())) {
      setError('成員名稱已存在')
      return
    }

    setMembers([...members, newMember.trim()])
    setNewMember('')
    setError('')
  }

  const handleRemoveMember = (memberToRemove: string) => {
    if (window.confirm(`確定要刪除成員「${memberToRemove}」嗎?`)) {
      setMembers(members.filter(member => member !== memberToRemove))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddMember()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>成員管理</CardTitle>
        <CardDescription>新增或刪除分帳成員</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="輸入成員名稱"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleAddMember} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            新增
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {members.length === 0 ? (
          <Alert>
            <AlertDescription>尚未新增任何成員</AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-wrap gap-2">
            {members.map((member) => (
              <Badge
                key={member}
                variant="secondary"
                className="text-base py-2 px-3 flex items-center gap-2"
              >
                {member}
                <button
                  onClick={() => handleRemoveMember(member)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          目前共 {members.length} 位成員
        </div>
      </CardContent>
    </Card>
  )
}
