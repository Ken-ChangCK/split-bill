import express from 'express'
import rateLimit from 'express-rate-limit'
import Channel from '../models/Channel.js'

const router = express.Router()

// Rate limiter: 30 requests per 15 minutes per IP
const expenseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 限制每個 IP 30 次請求
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// POST /api/channels/:accessKey/expenses - 新增支出
router.post('/:accessKey/expenses', expenseLimiter, async (req, res) => {
  try {
    const { accessKey } = req.params
    const { itemName, amount, payer, participants } = req.body

    // 驗證必要欄位
    if (!itemName || typeof itemName !== 'string' || itemName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '項目名稱不能為空'
      })
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '金額必須大於 0'
      })
    }

    if (!payer || typeof payer !== 'string' || payer.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '付款人不能為空'
      })
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: '參與者列表不能為空'
      })
    }

    // 查找頻道
    const channel = await Channel.findByAccessKey(accessKey)
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: '找不到該頻道'
      })
    }

    // 驗證付款人是否為頻道成員
    if (!channel.members.includes(payer.trim())) {
      return res.status(400).json({
        success: false,
        message: '付款人必須是頻道成員'
      })
    }

    // 驗證所有參與者是否為頻道成員
    for (const participant of participants) {
      if (!channel.members.includes(participant)) {
        return res.status(400).json({
          success: false,
          message: `參與者「${participant}」不是頻道成員`
        })
      }
    }

    // 新增支出
    const newExpense = await channel.addExpense({
      itemName: itemName.trim(),
      amount,
      payer: payer.trim(),
      participants
    })

    res.status(201).json({
      success: true,
      message: '支出新增成功',
      data: {
        expense: newExpense
      }
    })
  } catch (error) {
    console.error('新增支出失敗：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

// DELETE /api/channels/:accessKey/expenses/:expenseId - 刪除支出
router.delete('/:accessKey/expenses/:expenseId', expenseLimiter, async (req, res) => {
  try {
    const { accessKey, expenseId } = req.params

    // 驗證 expenseId
    const expenseIdNum = parseInt(expenseId)
    if (isNaN(expenseIdNum)) {
      return res.status(400).json({
        success: false,
        message: '無效的支出 ID'
      })
    }

    // 查找頻道
    const channel = await Channel.findByAccessKey(accessKey)
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: '找不到該頻道'
      })
    }

    // 刪除支出
    const success = await channel.removeExpense(expenseIdNum)
    if (!success) {
      return res.status(404).json({
        success: false,
        message: '找不到該支出'
      })
    }

    res.json({
      success: true,
      message: '支出刪除成功'
    })
  } catch (error) {
    console.error('刪除支出失敗：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

// PUT /api/channels/:accessKey/expenses/:expenseId - 更新支出
router.put('/:accessKey/expenses/:expenseId', expenseLimiter, async (req, res) => {
  try {
    const { accessKey, expenseId } = req.params
    const { itemName, amount, payer, participants } = req.body

    // 驗證 expenseId
    const expenseIdNum = parseInt(expenseId)
    if (isNaN(expenseIdNum)) {
      return res.status(400).json({
        success: false,
        message: '無效的支出 ID'
      })
    }

    // 驗證至少有一個欄位要更新
    if (!itemName && !amount && !payer && !participants) {
      return res.status(400).json({
        success: false,
        message: '至少需要提供一個欄位進行更新'
      })
    }

    // 驗證欄位格式
    if (itemName !== undefined && (typeof itemName !== 'string' || itemName.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: '項目名稱不能為空'
      })
    }

    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return res.status(400).json({
        success: false,
        message: '金額必須大於 0'
      })
    }

    if (payer !== undefined && (typeof payer !== 'string' || payer.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: '付款人不能為空'
      })
    }

    if (participants !== undefined && (!Array.isArray(participants) || participants.length === 0)) {
      return res.status(400).json({
        success: false,
        message: '參與者列表不能為空'
      })
    }

    // 查找頻道
    const channel = await Channel.findByAccessKey(accessKey)
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: '找不到該頻道'
      })
    }

    // 驗證付款人是否為頻道成員
    if (payer !== undefined && !channel.members.includes(payer.trim())) {
      return res.status(400).json({
        success: false,
        message: '付款人必須是頻道成員'
      })
    }

    // 驗證所有參與者是否為頻道成員
    if (participants !== undefined) {
      for (const participant of participants) {
        if (!channel.members.includes(participant)) {
          return res.status(400).json({
            success: false,
            message: `參與者「${participant}」不是頻道成員`
          })
        }
      }
    }

    // 準備更新資料
    const updateData = {}
    if (itemName !== undefined) updateData.itemName = itemName.trim()
    if (amount !== undefined) updateData.amount = amount
    if (payer !== undefined) updateData.payer = payer.trim()
    if (participants !== undefined) updateData.participants = participants

    // 更新支出
    const updatedExpense = await channel.updateExpense(expenseIdNum, updateData)
    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: '找不到該支出'
      })
    }

    res.json({
      success: true,
      message: '支出更新成功',
      data: {
        expense: updatedExpense
      }
    })
  } catch (error) {
    console.error('更新支出失敗：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

export default router
