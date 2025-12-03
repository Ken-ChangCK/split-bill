/**
 * 測試明細模式結算功能
 *
 * 測試場景：
 * 1. 建立測試頻道和成員
 * 2. 建立明細模式支出
 * 3. 新增品項並認領
 * 4. 測試不同的剩餘金額處理方式
 * 5. 驗證結算計算邏輯
 */

import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

// 測試資料
const testData = {
  channelName: '結算測試頻道',
  members: ['小明', '小華', '小美', '小強']
}

let channelAccessKey = ''
let expenseId = 0

// 工具函數：美化輸出
function log(title, data) {
  console.log('\n' + '='.repeat(60))
  console.log(`📋 ${title}`)
  console.log('='.repeat(60))
  if (data) {
    console.log(JSON.stringify(data, null, 2))
  }
}

function logSuccess(message) {
  console.log(`✅ ${message}`)
}

function logError(message, error) {
  console.error(`❌ ${message}`)
  if (error.response) {
    console.error('Status:', error.response.status)
    console.error('Data:', error.response.data)
  } else {
    console.error(error.message)
  }
}

// 主測試流程
async function testSettlement() {
  try {
    // 1. 建立測試頻道
    log('Step 1: 建立測試頻道')
    const createChannelRes = await axios.post(`${API_URL}/channels/create`, {
      name: testData.channelName
    })
    channelAccessKey = createChannelRes.data.channel.accessKey
    logSuccess(`頻道建立成功！Access Key: ${channelAccessKey}`)

    // 新增成員
    for (const member of testData.members) {
      await axios.post(`${API_URL}/channels/${channelAccessKey}/members`, {
        name: member
      })
    }
    logSuccess(`成員新增成功：${testData.members.join(', ')}`)

    // 2. 建立明細模式支出（居酒屋聚餐）
    log('Step 2: 建立明細模式支出')
    const createExpenseRes = await axios.post(
      `${API_URL}/channels/${channelAccessKey}/expenses`,
      {
        itemName: '居酒屋聚餐',
        amount: 5000,
        payer: '小明',
        mode: 'itemized',
        items: [],
        remainderHandling: 'split-all' // 剩餘金額全員平分
      }
    )
    expenseId = createExpenseRes.data.data.expense.id
    logSuccess(`支出建立成功！ID: ${expenseId}`)

    // 3. 新增品項
    log('Step 3: 新增品項')

    // 生啤酒 - 小華獨享
    await axios.post(
      `${API_URL}/channels/${channelAccessKey}/expenses/${expenseId}/items`,
      {
        name: '生啤酒',
        price: 500,
        createdBy: '小明'
      }
    )
    logSuccess('品項「生啤酒」新增成功 ($500)')

    // 生魚片拼盤 - 三人分享
    await axios.post(
      `${API_URL}/channels/${channelAccessKey}/expenses/${expenseId}/items`,
      {
        name: '生魚片拼盤',
        price: 2000,
        createdBy: '小明'
      }
    )
    logSuccess('品項「生魚片拼盤」新增成功 ($2000)')

    // 炸雞 - 兩人分享
    await axios.post(
      `${API_URL}/channels/${channelAccessKey}/expenses/${expenseId}/items`,
      {
        name: '炸雞',
        price: 800,
        createdBy: '小華'
      }
    )
    logSuccess('品項「炸雞」新增成功 ($800)')

    // 拉麵 - 小美獨享
    await axios.post(
      `${API_URL}/channels/${channelAccessKey}/expenses/${expenseId}/items`,
      {
        name: '拉麵',
        price: 900,
        createdBy: '小美'
      }
    )
    logSuccess('品項「拉麵」新增成功 ($900)')

    // 4. 認領品項
    log('Step 4: 認領品項')
    const channelRes = await axios.get(`${API_URL}/channels/${channelAccessKey}`)
    const items = channelRes.data.channel.expenses.find(e => e.id === expenseId).items

    // 生啤酒 - 小華認領
    await axios.post(
      `${API_URL}/channels/${channelAccessKey}/expenses/${expenseId}/items/${items[0].id}/claim`,
      { userName: '小華' }
    )
    logSuccess('小華認領「生啤酒」')

    // 生魚片拼盤 - 小明、小華、小強認領（三人平分）
    await axios.post(
      `${API_URL}/channels/${channelAccessKey}/expenses/${expenseId}/items/${items[1].id}/claim`,
      { userName: '小明' }
    )
    await axios.post(
      `${API_URL}/channels/${channelAccessKey}/expenses/${expenseId}/items/${items[1].id}/claim`,
      { userName: '小華' }
    )
    await axios.post(
      `${API_URL}/channels/${channelAccessKey}/expenses/${expenseId}/items/${items[1].id}/claim`,
      { userName: '小強' }
    )
    logSuccess('小明、小華、小強認領「生魚片拼盤」（三人平分）')

    // 炸雞 - 小美、小強認領（兩人平分）
    await axios.post(
      `${API_URL}/channels/${channelAccessKey}/expenses/${expenseId}/items/${items[2].id}/claim`,
      { userName: '小美' }
    )
    await axios.post(
      `${API_URL}/channels/${channelAccessKey}/expenses/${expenseId}/items/${items[2].id}/claim`,
      { userName: '小強' }
    )
    logSuccess('小美、小強認領「炸雞」（兩人平分）')

    // 拉麵 - 小美認領
    await axios.post(
      `${API_URL}/channels/${channelAccessKey}/expenses/${expenseId}/items/${items[3].id}/claim`,
      { userName: '小美' }
    )
    logSuccess('小美認領「拉麵」')

    // 5. 查看最終結果
    log('Step 5: 查看最終頻道資料')
    const finalRes = await axios.get(`${API_URL}/channels/${channelAccessKey}`)
    const finalExpense = finalRes.data.channel.expenses.find(e => e.id === expenseId)

    console.log('\n📊 支出資訊：')
    console.log(`  支出名稱：${finalExpense.itemName}`)
    console.log(`  總金額：$${finalExpense.amount}`)
    console.log(`  付款人：${finalExpense.payer}`)
    console.log(`  剩餘處理：${finalExpense.remainderHandling === 'split-all' ? '全員平分' : '付款人承擔'}`)

    console.log('\n📋 品項認領明細：')
    finalExpense.items.forEach(item => {
      const claimers = item.claimedBy.length > 0 ? item.claimedBy.join(', ') : '未認領'
      const perPerson = item.claimedBy.length > 0 ? ` (每人 $${Math.round(item.price / item.claimedBy.length)})` : ''
      console.log(`  • ${item.name} ($${item.price}) - ${claimers}${perPerson}`)
    })

    // 計算結算
    const claimedTotal = finalExpense.items.reduce((sum, item) => sum + item.price, 0)
    const remainder = finalExpense.amount - claimedTotal

    console.log('\n💰 結算計算：')
    console.log(`  已認領總額：$${claimedTotal}`)
    console.log(`  剩餘金額：$${remainder}`)

    if (remainder > 0) {
      if (finalExpense.remainderHandling === 'split-all') {
        const remainderPerPerson = remainder / testData.members.length
        console.log(`  剩餘分攤：每人 $${Math.round(remainderPerPerson)}`)
      } else {
        console.log(`  剩餘分攤：由付款人 ${finalExpense.payer} 承擔`)
      }
    }

    console.log('\n👤 各人應付金額：')
    testData.members.forEach(member => {
      let total = 0

      // 計算認領品項的金額
      finalExpense.items.forEach(item => {
        if (item.claimedBy.includes(member)) {
          total += item.price / item.claimedBy.length
        }
      })

      // 加上剩餘金額分攤
      if (remainder > 0) {
        if (finalExpense.remainderHandling === 'split-all') {
          total += remainder / testData.members.length
        } else if (member === finalExpense.payer) {
          total += remainder
        }
      }

      console.log(`  ${member}: $${Math.round(total)}`)
    })

    // 計算淨額（考慮付款人）
    console.log('\n💳 收支狀況：')
    testData.members.forEach(member => {
      let total = 0

      // 計算認領品項的金額
      finalExpense.items.forEach(item => {
        if (item.claimedBy.includes(member)) {
          total += item.price / item.claimedBy.length
        }
      })

      // 加上剩餘金額分攤
      if (remainder > 0) {
        if (finalExpense.remainderHandling === 'split-all') {
          total += remainder / testData.members.length
        } else if (member === finalExpense.payer) {
          total += remainder
        }
      }

      // 計算淨額（付款人先付了總額）
      let balance = 0
      if (member === finalExpense.payer) {
        balance = finalExpense.amount - total
      } else {
        balance = -total
      }

      const status = balance > 0 ? `應收 $${Math.round(balance)}` :
                     balance < 0 ? `應付 $${Math.round(Math.abs(balance))}` : '已結清'
      console.log(`  ${member}: ${status}`)
    })

    logSuccess('✨ 測試完成！')

    // 清理：刪除測試頻道（可選）
    // console.log('\n🧹 清理測試資料...')
    // await axios.delete(`${API_URL}/channels/${channelAccessKey}`)
    // logSuccess('測試頻道已刪除')

  } catch (error) {
    logError('測試過程發生錯誤', error)
    process.exit(1)
  }
}

// 執行測試
console.log('🚀 開始測試明細模式結算功能...\n')
testSettlement()
  .then(() => {
    console.log('\n' + '='.repeat(60))
    console.log('✅ 所有測試完成！')
    console.log('='.repeat(60))
    console.log(`\n💡 提示：您可以在前端使用 Access Key「${channelAccessKey}」查看結算結果`)
    console.log(`   前端網址：http://localhost:5173/split-bill/`)
    console.log('')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ 測試失敗:', error.message)
    process.exit(1)
  })
