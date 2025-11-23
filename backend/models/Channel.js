import mongoose from 'mongoose'

const channelSchema = new mongoose.Schema({
  // 頻道名稱
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  // 8位隨機英數字金鑰（大寫，唯一）
  accessKey: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 8,
    match: /^[A-Z0-9]{8}$/
  },
  // 成員名稱陣列
  members: {
    type: [String],
    default: []
  },
  // 支出記錄陣列
  expenses: {
    type: [{
      id: {
        type: Number,
        required: true
      },
      itemName: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      payer: {
        type: String,
        required: true
      },
      participants: {
        type: [String],
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  // 建立時間
  createdAt: {
    type: Date,
    default: Date.now
  },
  // 最後活動時間（供未來自動歸檔使用）
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
})

// 靜態方法：生成 8 位隨機金鑰
channelSchema.statics.generateAccessKey = async function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let accessKey
  let isUnique = false

  // 確保金鑰唯一
  while (!isUnique) {
    accessKey = ''
    for (let i = 0; i < 8; i++) {
      accessKey += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    // 檢查是否已存在
    const existing = await this.findOne({ accessKey })
    if (!existing) {
      isUnique = true
    }
  }

  return accessKey
}

// 靜態方法：根據金鑰查找頻道
channelSchema.statics.findByAccessKey = async function(key) {
  return await this.findOne({ accessKey: key.toUpperCase() })
}

// 實例方法：更新最後活動時間
channelSchema.methods.updateActivity = async function() {
  this.lastActivityAt = new Date()
  return await this.save()
}

// 實例方法：新增成員
channelSchema.methods.addMember = async function(name) {
  if (!this.members.includes(name)) {
    this.members.push(name)
    await this.updateActivity()
  }
  return this
}

// 實例方法：移除成員
channelSchema.methods.removeMember = async function(name) {
  const index = this.members.indexOf(name)
  if (index > -1) {
    this.members.splice(index, 1)
    await this.updateActivity()
  }
  return this
}

// 實例方法：新增支出
channelSchema.methods.addExpense = async function(expense) {
  // 生成新的支出 ID（取當前最大 ID + 1）
  const maxId = this.expenses.length > 0
    ? Math.max(...this.expenses.map(e => e.id))
    : 0

  const newExpense = {
    ...expense,
    id: maxId + 1,
    createdAt: new Date()
  }

  this.expenses.push(newExpense)
  await this.updateActivity()
  return newExpense
}

// 實例方法：刪除支出
channelSchema.methods.removeExpense = async function(id) {
  const index = this.expenses.findIndex(e => e.id === parseInt(id))
  if (index > -1) {
    this.expenses.splice(index, 1)
    await this.updateActivity()
    return true
  }
  return false
}

// 實例方法：更新支出
channelSchema.methods.updateExpense = async function(id, data) {
  const expense = this.expenses.find(e => e.id === parseInt(id))
  if (expense) {
    // 更新支出欄位
    if (data.itemName !== undefined) expense.itemName = data.itemName
    if (data.amount !== undefined) expense.amount = data.amount
    if (data.payer !== undefined) expense.payer = data.payer
    if (data.participants !== undefined) expense.participants = data.participants

    await this.updateActivity()
    return expense
  }
  return null
}

const Channel = mongoose.model('Channel', channelSchema)

export default Channel
