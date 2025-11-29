import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function migrateExpenses() {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // 使用 MongoDB 原生操作，繞過 Mongoose Schema 的 default 值
    const db = mongoose.connection.db
    const channelsCollection = db.collection('channels')

    const channels = await channelsCollection.find({}).toArray()
    console.log(`📊 Found ${channels.length} channels`)

    let updatedCount = 0
    let expenseCount = 0

    for (const channel of channels) {
      let needsUpdate = false

      if (channel.expenses && channel.expenses.length > 0) {
        channel.expenses.forEach(expense => {
          expenseCount++

          // 檢查是否缺少 mode 欄位（使用 hasOwnProperty 確保檢查實際欄位）
          if (!expense.hasOwnProperty('mode')) {
            expense.mode = 'split'
            needsUpdate = true
            console.log(`  ↳ Expense #${expense.id}: "${expense.itemName}" → mode: "split"`)
          }

          // 確保明細模式支出有 items 陣列
          if (expense.mode === 'itemized' && !expense.hasOwnProperty('items')) {
            expense.items = []
            needsUpdate = true
            console.log(`  ↳ Expense #${expense.id}: Added empty items array`)
          }

          // 確保有 remainderHandling（所有模式都需要）
          if (!expense.hasOwnProperty('remainderHandling')) {
            expense.remainderHandling = 'payer'
            needsUpdate = true
            console.log(`  ↳ Expense #${expense.id}: Added remainderHandling: "payer"`)
          }
        })

        if (needsUpdate) {
          // 直接更新整個頻道文檔
          await channelsCollection.updateOne(
            { _id: channel._id },
            { $set: { expenses: channel.expenses } }
          )
          updatedCount++
          console.log(`✅ Updated channel: ${channel.name} (${channel.accessKey})`)
        }
      }
    }

    console.log('\n📊 Migration Summary:')
    console.log(`  • Total channels: ${channels.length}`)
    console.log(`  • Updated channels: ${updatedCount}`)
    console.log(`  • Total expenses: ${expenseCount}`)

    if (updatedCount > 0) {
      console.log('\n✨ Migration completed successfully!')
      console.log('   舊資料已更新，所有支出現在都有 mode 欄位')
    } else {
      console.log('\n✨ No migration needed!')
      console.log('   所有支出已經包含必要的欄位')
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await mongoose.connection.close()
    console.log('👋 Database connection closed')
  }
}

// 執行遷移
migrateExpenses()
