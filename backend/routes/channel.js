import express from 'express'
import { body, param, validationResult } from 'express-validator'
import Channel from '../models/Channel.js'
import { createChannelLimiter } from '../middleware/security.js'

const router = express.Router()

// POST /api/channels/create - 建立新頻道
router.post('/create',
  // Rate Limiter - 每小時最多 3 次創建請求
  createChannelLimiter,
  // 輸入驗證
  body('name')
    .trim()
    .notEmpty().withMessage('頻道名稱不可為空')
    .isLength({ max: 50 }).withMessage('頻道名稱最多 50 字'),
  async (req, res) => {
    // 驗證結果檢查
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      })
    }

    try {
      const { name } = req.body

      // 檢查系統中的頻道總數（最多 10 個）
      const totalChannels = await Channel.countDocuments()
      if (totalChannels >= 10) {
        return res.status(403).json({
          success: false,
          message: '系統頻道數量已達上限（最多 10 個），請稍後再試或聯繫管理員'
        })
      }

      // 生成唯一的 accessKey
      const accessKey = await Channel.generateAccessKey()

      // 建立新頻道
      const channel = new Channel({
        name,
        accessKey
      })

      await channel.save()

      res.status(201).json({
        success: true,
        message: '頻道建立成功',
        channel: {
          id: channel._id,
          name: channel.name,
          accessKey: channel.accessKey
        }
      })
    } catch (error) {
      console.error('Create channel error:', error)
      res.status(500).json({
        success: false,
        message: '伺服器錯誤'
      })
    }
  }
)

// POST /api/channels/join - 驗證金鑰並加入頻道
router.post('/join',
  // 輸入驗證
  body('accessKey')
    .trim()
    .notEmpty().withMessage('金鑰不可為空')
    .isLength({ min: 8, max: 8 }).withMessage('金鑰格式錯誤')
    .matches(/^[A-Z0-9]{8}$/i).withMessage('金鑰必須為 8 位英數字'),
  async (req, res) => {
    // 驗證結果檢查
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      })
    }

    try {
      const { accessKey } = req.body

      // 查找頻道
      const channel = await Channel.findByAccessKey(accessKey)

      if (!channel) {
        return res.status(404).json({
          success: false,
          message: '頻道不存在或金鑰錯誤'
        })
      }

      // 更新最後活動時間
      await channel.updateActivity()

      res.json({
        success: true,
        message: '成功加入頻道',
        channel: {
          id: channel._id,
          name: channel.name,
          accessKey: channel.accessKey,
          members: channel.members,
          expenses: channel.expenses
        }
      })
    } catch (error) {
      console.error('Join channel error:', error)
      res.status(500).json({
        success: false,
        message: '伺服器錯誤'
      })
    }
  }
)

// GET /api/channels/:accessKey - 取得頻道完整資料
router.get('/:accessKey',
  // 參數驗證
  param('accessKey')
    .trim()
    .isLength({ min: 8, max: 8 }).withMessage('金鑰格式錯誤')
    .matches(/^[A-Z0-9]{8}$/i).withMessage('金鑰必須為 8 位英數字'),
  async (req, res) => {
    // 驗證結果檢查
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      })
    }

    try {
      const { accessKey } = req.params

      // 查找頻道
      const channel = await Channel.findByAccessKey(accessKey)

      if (!channel) {
        return res.status(404).json({
          success: false,
          message: '頻道不存在'
        })
      }

      res.json({
        success: true,
        channel: {
          id: channel._id,
          name: channel.name,
          accessKey: channel.accessKey,
          members: channel.members,
          expenses: channel.expenses,
          createdAt: channel.createdAt,
          lastActivityAt: channel.lastActivityAt
        }
      })
    } catch (error) {
      console.error('Get channel error:', error)
      res.status(500).json({
        success: false,
        message: '伺服器錯誤'
      })
    }
  }
)

// DELETE /api/channels/:accessKey - 刪除頻道
router.delete('/:accessKey',
  // 參數驗證
  param('accessKey')
    .trim()
    .isLength({ min: 8, max: 8 }).withMessage('金鑰格式錯誤')
    .matches(/^[A-Z0-9]{8}$/i).withMessage('金鑰必須為 8 位英數字'),
  async (req, res) => {
    // 驗證結果檢查
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      })
    }

    try {
      const { accessKey } = req.params

      // 查找並刪除頻道
      const channel = await Channel.findByAccessKey(accessKey)

      if (!channel) {
        return res.status(404).json({
          success: false,
          message: '頻道不存在'
        })
      }

      await Channel.deleteOne({ _id: channel._id })

      res.json({
        success: true,
        message: '頻道已刪除'
      })
    } catch (error) {
      console.error('Delete channel error:', error)
      res.status(500).json({
        success: false,
        message: '伺服器錯誤'
      })
    }
  }
)

export default router
