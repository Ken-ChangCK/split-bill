import express from 'express'
import rateLimit from 'express-rate-limit'
import Channel from '../models/Channel.js'

const router = express.Router()

// Rate limiter: 20 requests per 15 minutes per IP
const memberLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 限制每個 IP 20 次請求
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// POST /api/channels/:accessKey/members - 新增成員
router.post('/:accessKey/members', memberLimiter, async (req, res) => {
  try {
    const { accessKey } = req.params
    const { name } = req.body

    // 驗證必要欄位
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '成員名稱不能為空'
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

    // 檢查成員數量限制
    if (channel.members.length >= 10) {
      return res.status(400).json({
        success: false,
        message: '頻道成員已達上限（最多 10 位成員）'
      })
    }

    // 檢查成員是否已存在
    if (channel.members.includes(name.trim())) {
      return res.status(400).json({
        success: false,
        message: '成員已存在'
      })
    }

    // 新增成員
    await channel.addMember(name.trim())

    res.json({
      success: true,
      message: '成員新增成功',
      data: {
        members: channel.members
      }
    })
  } catch (error) {
    console.error('新增成員失敗：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

// DELETE /api/channels/:accessKey/members/:memberName - 刪除成員
router.delete('/:accessKey/members/:memberName', memberLimiter, async (req, res) => {
  try {
    const { accessKey, memberName } = req.params

    // 驗證成員名稱
    if (!memberName || memberName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '成員名稱不能為空'
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

    // 檢查成員是否存在
    const decodedMemberName = decodeURIComponent(memberName)
    if (!channel.members.includes(decodedMemberName)) {
      return res.status(404).json({
        success: false,
        message: '找不到該成員'
      })
    }

    // 刪除成員
    await channel.removeMember(decodedMemberName)

    res.json({
      success: true,
      message: '成員刪除成功',
      data: {
        members: channel.members
      }
    })
  } catch (error) {
    console.error('刪除成員失敗：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

// PUT /api/channels/:accessKey/members - 批次更新成員列表
router.put('/:accessKey/members', memberLimiter, async (req, res) => {
  try {
    const { accessKey } = req.params
    const { members } = req.body

    // 驗證必要欄位
    if (!Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        message: '成員列表必須是陣列'
      })
    }

    // 驗證成員名稱
    for (const member of members) {
      if (typeof member !== 'string' || member.trim() === '') {
        return res.status(400).json({
          success: false,
          message: '成員名稱不能為空'
        })
      }
    }

    // 去除重複和空白
    const uniqueMembers = [...new Set(members.map(m => m.trim()))]

    // 檢查成員數量限制
    if (uniqueMembers.length > 10) {
      return res.status(400).json({
        success: false,
        message: '頻道成員已達上限（最多 10 位成員）'
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

    // 批次更新成員
    channel.members = uniqueMembers
    await channel.updateActivity()

    res.json({
      success: true,
      message: '成員列表更新成功',
      data: {
        members: channel.members
      }
    })
  } catch (error) {
    console.error('更新成員列表失敗：', error)
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    })
  }
})

export default router
