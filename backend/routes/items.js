import express from 'express'
import rateLimit from 'express-rate-limit'
import Channel from '../models/Channel.js'

const router = express.Router()

// Rate limiter: 50 requests per 15 minutes per IP
const itemLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 限制每個 IP 50 次請求（品項操作較頻繁）
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// POST /api/channels/:accessKey/expenses/:expenseId/items - 新增品項
router.post('/:accessKey/expenses/:expenseId/items', itemLimiter, async (req, res) => {
  try {
    const { accessKey, expenseId } = req.params
    const { name, price, createdBy } = req.body

    // 驗證必要欄位
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '品項名稱不能為空'
      })
    }

    if (price === undefined || typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        message: '品項金額必須為非負數'
      })
    }

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

    // 新增品項
    const newItem = await channel.addItem(expenseIdNum, {
      name: name.trim(),
      price,
      createdBy: createdBy ? createdBy.trim() : undefined
    })

    res.status(201).json({
      success: true,
      message: '品項新增成功',
      data: {
        item: newItem
      }
    })
  } catch (error) {
    console.error('新增品項失敗：', error)

    if (error.message === 'Expense not found or not in itemized mode') {
      return res.status(400).json({
        success: false,
        message: '找不到該支出或該支出不是明細模式'
      })
    }

    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

// PUT /api/channels/:accessKey/expenses/:expenseId/items/:itemId - 編輯品項
router.put('/:accessKey/expenses/:expenseId/items/:itemId', itemLimiter, async (req, res) => {
  try {
    const { accessKey, expenseId, itemId } = req.params
    const { name, price } = req.body

    // 驗證至少有一個欄位要更新
    if (name === undefined && price === undefined) {
      return res.status(400).json({
        success: false,
        message: '至少需要提供一個欄位進行更新'
      })
    }

    // 驗證欄位格式
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: '品項名稱不能為空'
      })
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({
        success: false,
        message: '品項金額必須為非負數'
      })
    }

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

    // 準備更新資料
    const updateData = {}
    if (name !== undefined) updateData.name = name.trim()
    if (price !== undefined) updateData.price = price

    // 更新品項
    const updatedItem = await channel.updateItem(expenseIdNum, itemId, updateData)

    res.json({
      success: true,
      message: '品項更新成功',
      data: {
        item: updatedItem
      }
    })
  } catch (error) {
    console.error('更新品項失敗：', error)

    if (error.message === 'Expense not found or not in itemized mode') {
      return res.status(400).json({
        success: false,
        message: '找不到該支出或該支出不是明細模式'
      })
    }

    if (error.message === 'Item not found') {
      return res.status(404).json({
        success: false,
        message: '找不到該品項'
      })
    }

    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

// DELETE /api/channels/:accessKey/expenses/:expenseId/items/:itemId - 刪除品項
router.delete('/:accessKey/expenses/:expenseId/items/:itemId', itemLimiter, async (req, res) => {
  try {
    const { accessKey, expenseId, itemId } = req.params

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

    // 刪除品項
    const success = await channel.removeItem(expenseIdNum, itemId)
    if (!success) {
      return res.status(404).json({
        success: false,
        message: '找不到該品項'
      })
    }

    res.json({
      success: true,
      message: '品項刪除成功'
    })
  } catch (error) {
    console.error('刪除品項失敗：', error)

    if (error.message === 'Expense not found or not in itemized mode') {
      return res.status(400).json({
        success: false,
        message: '找不到該支出或該支出不是明細模式'
      })
    }

    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

// POST /api/channels/:accessKey/expenses/:expenseId/items/:itemId/claim - 認領品項
router.post('/:accessKey/expenses/:expenseId/items/:itemId/claim', itemLimiter, async (req, res) => {
  try {
    const { accessKey, expenseId, itemId } = req.params
    const { userName } = req.body

    // 驗證必要欄位
    if (!userName || typeof userName !== 'string' || userName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '使用者名稱不能為空'
      })
    }

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

    // 驗證使用者是否為頻道成員
    if (!channel.members.includes(userName.trim())) {
      return res.status(400).json({
        success: false,
        message: '使用者必須是頻道成員'
      })
    }

    // 認領品項
    const claimedItem = await channel.claimItem(expenseIdNum, itemId, userName.trim())

    res.json({
      success: true,
      message: '品項認領成功',
      data: {
        item: claimedItem
      }
    })
  } catch (error) {
    console.error('認領品項失敗：', error)

    if (error.message === 'Expense not found or not in itemized mode') {
      return res.status(400).json({
        success: false,
        message: '找不到該支出或該支出不是明細模式'
      })
    }

    if (error.message === 'Item not found') {
      return res.status(404).json({
        success: false,
        message: '找不到該品項'
      })
    }

    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

// DELETE /api/channels/:accessKey/expenses/:expenseId/items/:itemId/claim - 取消認領品項
router.delete('/:accessKey/expenses/:expenseId/items/:itemId/claim', itemLimiter, async (req, res) => {
  try {
    const { accessKey, expenseId, itemId } = req.params
    const { userName } = req.body

    // 驗證必要欄位
    if (!userName || typeof userName !== 'string' || userName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '使用者名稱不能為空'
      })
    }

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

    // 取消認領品項
    const unclaimedItem = await channel.unclaimItem(expenseIdNum, itemId, userName.trim())

    res.json({
      success: true,
      message: '取消認領成功',
      data: {
        item: unclaimedItem
      }
    })
  } catch (error) {
    console.error('取消認領失敗：', error)

    if (error.message === 'Expense not found or not in itemized mode') {
      return res.status(400).json({
        success: false,
        message: '找不到該支出或該支出不是明細模式'
      })
    }

    if (error.message === 'Item not found') {
      return res.status(404).json({
        success: false,
        message: '找不到該品項'
      })
    }

    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

// PUT /api/channels/:accessKey/expenses/:expenseId/remainder - 更新剩餘金額處理方式
router.put('/:accessKey/expenses/:expenseId/remainder', itemLimiter, async (req, res) => {
  try {
    const { accessKey, expenseId } = req.params
    const { remainderHandling } = req.body

    // 驗證必要欄位
    if (!remainderHandling || !['payer', 'split-all'].includes(remainderHandling)) {
      return res.status(400).json({
        success: false,
        message: '剩餘處理方式必須是 payer 或 split-all'
      })
    }

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

    // 更新剩餘金額處理方式
    const updatedExpense = await channel.updateRemainderHandling(expenseIdNum, remainderHandling)

    res.json({
      success: true,
      message: '剩餘處理方式更新成功',
      data: {
        expense: updatedExpense
      }
    })
  } catch (error) {
    console.error('更新剩餘處理方式失敗：', error)

    if (error.message === 'Expense not found or not in itemized mode') {
      return res.status(400).json({
        success: false,
        message: '找不到該支出或該支出不是明細模式'
      })
    }

    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

export default router
