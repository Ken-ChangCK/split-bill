 // API 測試腳本 - 明細模式功能                                                                                                                  
 // 使用 Node.js 內建 fetch API (Node 18+)                                                                                                       
                                                                                                                                               
 const BASE_URL = 'http://localhost:3001/api'                                                                                                    
 const ACCESS_KEY = 'H6U68DIV' // 使用現有的測試頻道                                                                                             
                                                                                                                                               
 // 顏色輸出                                                                                                                                     
 const colors = {                                                                                                                                
   green: '\x1b[32m',                                                                                                                            
   blue: '\x1b[34m',                                                                                                                             
   red: '\x1b[31m',                                                                                                                              
   reset: '\x1b[0m'                                                                                                                              
 }                                                                                                                                               
                                                                                                                                               
 let expenseId = null                                                                                                                            
 let item1Id = null                                                                                                                              
 let item2Id = null                                                                                                                              
 let item3Id = null                                                                                                                              
                                                                                                                                               
 // 延遲函數                                                                                                                                     
 const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))                                                                           
                                                                                                                                               
 // API 請求函數                                                                                                                                 
 async function apiRequest(method, endpoint, body = null) {                                                                                      
   const options = {                                                                                                                             
     method,                                                                                                                                     
     headers: {                                                                                                                                  
       'Content-Type': 'application/json'                                                                                                        
     }                                                                                                                                           
   }                                                                                                                                             
                                                                                                                                               
   if (body) {                                                                                                                                   
     options.body = JSON.stringify(body)                                                                                                         
   }                                                                                                                                             
                                                                                                                                               
   const response = await fetch(`${BASE_URL}${endpoint}`, options)                                                                               
   return response.json()                                                                                                                        
 }                                                                                                                                               
                                                                                                                                               
 // 測試函數                                                                                                                                     
 async function runTests() {                                                                                                                     
   console.log('================================')                                                                                               
   console.log('明細模式 API 測試腳本')                                                                                                          
   console.log('================================')                                                                                               
   console.log('')                                                                                                                               
                                                                                                                                               
   try {                                                                                                                                         
     // 測試 1: 建立明細模式支出                                                                                                                 
     console.log(`${colors.blue}測試 1: 建立明細模式支出${colors.reset}`)                                                                        
     const createExpenseRes = await apiRequest('POST', `/channels/${ACCESS_KEY}/expenses`, {                                                     
       itemName: '居酒屋晚餐',                                                                                                                   
       amount: 5000,                                                                                                                             
       payer: '2',                                                                                                                               
       mode: 'itemized',                                                                                                                         
       remainderHandling: 'split-all'                                                                                                            
     })                                                                                                                                          
     console.log(JSON.stringify(createExpenseRes, null, 2))                                                                                      
                                                                                                                                               
     if (createExpenseRes.success) {                                                                                                             
       expenseId = createExpenseRes.data.expense.id                                                                                              
       console.log(`${colors.green}✓ 建立的支出 ID: ${expenseId}${colors.reset}`)                                                                
     } else {                                                                                                                                    
       console.log(`${colors.red}✗ 建立支出失敗${colors.reset}`)                                                                                 
       return                                                                                                                                    
     }                                                                                                                                           
     console.log('')                                                                                                                             
     await delay(500)                                                                                                                            
                                                                                                                                               
     // 測試 2: 新增品項 - 生啤酒                                                                                                                
     console.log(`${colors.blue}測試 2: 新增品項 - 生啤酒${colors.reset}`)                                                                       
     const item1Res = await apiRequest('POST', `/channels/${ACCESS_KEY}/expenses/${expenseId}/items`, {                                          
       name: '生啤酒',                                                                                                                           
       price: 500,                                                                                                                               
       createdBy: '2'                                                                                                                            
     })                                                                                                                                          
     console.log(JSON.stringify(item1Res, null, 2))                                                                                              
                                                                                                                                               
     if (item1Res.success) {                                                                                                                     
       item1Id = item1Res.data.item.id                                                                                                           
       console.log(`${colors.green}✓ 建立的品項 ID: ${item1Id}${colors.reset}`)                                                                  
     }                                                                                                                                           
     console.log('')                                                                                                                             
     await delay(500)                                                                                                                            
                                                                                                                                               
     // 測試 3: 新增品項 - 生魚片拼盤                                                                                                            
     console.log(`${colors.blue}測試 3: 新增品項 - 生魚片拼盤${colors.reset}`)                                                                   
     const item2Res = await apiRequest('POST', `/channels/${ACCESS_KEY}/expenses/${expenseId}/items`, {                                          
       name: '生魚片拼盤',                                                                                                                       
       price: 2000,                                                                                                                              
       createdBy: '2'                                                                                                                            
     })                                                                                                                                          
     console.log(JSON.stringify(item2Res, null, 2))                                                                                              
                                                                                                                                               
     if (item2Res.success) {                                                                                                                     
       item2Id = item2Res.data.item.id                                                                                                           
       console.log(`${colors.green}✓ 建立的品項 ID: ${item2Id}${colors.reset}`)                                                                  
     }                                                                                                                                           
     console.log('')                                                                                                                             
     await delay(500)                                                                                                                            
                                                                                                                                               
     // 測試 4: 新增品項 - 炸雞                                                                                                                  
     console.log(`${colors.blue}測試 4: 新增品項 - 炸雞${colors.reset}`)                                                                         
     const item3Res = await apiRequest('POST', `/channels/${ACCESS_KEY}/expenses/${expenseId}/items`, {                                          
       name: '炸雞',                                                                                                                             
       price: 800,                                                                                                                               
       createdBy: '24'                                                                                                                           
     })                                                                                                                                          
     console.log(JSON.stringify(item3Res, null, 2))                                                                                              
                                                                                                                                               
     if (item3Res.success) {                                                                                                                     
       item3Id = item3Res.data.item.id                                                                                                           
       console.log(`${colors.green}✓ 建立的品項 ID: ${item3Id}${colors.reset}`)                                                                  
     }                                                                                                                                           
     console.log('')                                                                                                                             
     await delay(500)                                                                                                                            
                                                                                                                                               
     // 測試 5: 成員 2 認領生啤酒                                                                                                                
     console.log(`${colors.blue}測試 5: 成員 2 認領生啤酒${colors.reset}`)                                                                       
     const claim1Res = await apiRequest('POST', `/channels/${ACCESS_KEY}/expenses/${expenseId}/items/${item1Id}/claim`, {                        
       userName: '2'                                                                                                                             
     })                                                                                                                                          
     console.log(JSON.stringify(claim1Res, null, 2))                                                                                             
     console.log(`${colors.green}✓ 認領成功${colors.reset}`)                                                                                     
     console.log('')                                                                                                                             
     await delay(500)                                                                                                                            
                                                                                                                                               
     // 測試 6: 成員 24 認領生魚片拼盤                                                                                                           
     console.log(`${colors.blue}測試 6: 成員 24 認領生魚片拼盤${colors.reset}`)                                                                  
     const claim2Res = await apiRequest('POST', `/channels/${ACCESS_KEY}/expenses/${expenseId}/items/${item2Id}/claim`, {                        
       userName: '24'                                                                                                                            
     })                                                                                                                                          
     console.log(JSON.stringify(claim2Res, null, 2))                                                                                             
     console.log(`${colors.green}✓ 認領成功${colors.reset}`)                                                                                     
     console.log('')                                                                                                                             
     await delay(500)                                                                                                                            
                                                                                                                                               
     // 測試 7: 成員 2 也認領生魚片拼盤（多人分攤）                                                                                              
     console.log(`${colors.blue}測試 7: 成員 2 也認領生魚片拼盤（多人分攤）${colors.reset}`)                                                     
     const claim3Res = await apiRequest('POST', `/channels/${ACCESS_KEY}/expenses/${expenseId}/items/${item2Id}/claim`, {                        
       userName: '2'                                                                                                                             
     })                                                                                                                                          
     console.log(JSON.stringify(claim3Res, null, 2))                                                                                             
     console.log(`${colors.green}✓ 多人分攤設定成功${colors.reset}`)                                                                             
     console.log('')                                                                                                                             
     await delay(500)                                                                                                                            
                                                                                                                                               
     // 測試 8: 編輯品項 - 修改生啤酒價格                                                                                                        
     console.log(`${colors.blue}測試 8: 編輯品項 - 修改生啤酒價格${colors.reset}`)                                                               
     const updateItemRes = await apiRequest('PUT', `/channels/${ACCESS_KEY}/expenses/${expenseId}/items/${item1Id}`, {                           
       price: 550                                                                                                                                
     })                                                                                                                                          
     console.log(JSON.stringify(updateItemRes, null, 2))                                                                                         
     console.log(`${colors.green}✓ 品項更新成功${colors.reset}`)                                                                                 
     console.log('')                                                                                                                             
     await delay(500)                                                                                                                            
                                                                                                                                               
     // 測試 9: 更新剩餘金額處理方式                                                                                                             
     console.log(`${colors.blue}測試 9: 更新剩餘金額處理方式為付款人承擔${colors.reset}`)                                                        
     const updateRemainderRes = await apiRequest('PUT', `/channels/${ACCESS_KEY}/expenses/${expenseId}/remainder`, {                             
       remainderHandling: 'payer'                                                                                                                
     })                                                                                                                                          
     console.log(JSON.stringify(updateRemainderRes, null, 2))                                                                                    
     console.log(`${colors.green}✓ 剩餘處理方式更新成功${colors.reset}`)                                                                         
     console.log('')                                                                                                                             
     await delay(500)                                                                                                                            
                                                                                                                                               
     // 測試 10: 查看完整頻道資料                                                                                                                
     console.log(`${colors.blue}測試 10: 查看完整頻道資料（包含新建立的明細模式支出）${colors.reset}`)                                           
     const channelRes = await apiRequest('GET', `/channels/${ACCESS_KEY}`)                                                                       
     const itemizedExpense = channelRes.channel.expenses.find(e => e.mode === 'itemized' && e.id === expenseId)                                  
     console.log('明細模式支出：')                                                                                                               
     console.log(JSON.stringify(itemizedExpense, null, 2))                                                                                       
     console.log('')                                                                                                                             
     await delay(500)                                                                                                                            
                                                                                                                                               
     // 測試 11: 取消認領                                                                                                                        
     console.log(`${colors.blue}測試 11: 成員 2 取消認領生啤酒${colors.reset}`)                                                                  
     const unclaimRes = await apiRequest('DELETE', `/channels/${ACCESS_KEY}/expenses/${expenseId}/items/${item1Id}/claim`, {                     
       userName: '2'                                                                                                                             
     })                                                                                                                                          
     console.log(JSON.stringify(unclaimRes, null, 2))                                                                                            
     console.log(`${colors.green}✓ 取消認領成功${colors.reset}`)                                                                                 
     console.log('')                                                                                                                             
     await delay(500)                                                                                                                            
                                                                                                                                               
     // 測試 12: 刪除品項                                                                                                                        
     console.log(`${colors.blue}測試 12: 刪除炸雞品項${colors.reset}`)                                                                           
     const deleteItemRes = await apiRequest('DELETE', `/channels/${ACCESS_KEY}/expenses/${expenseId}/items/${item3Id}`)                          
     console.log(JSON.stringify(deleteItemRes, null, 2))                                                                                         
     console.log(`${colors.green}✓ 品項刪除成功${colors.reset}`)                                                                                 
     console.log('')                                                                                                                             
     await delay(500)                                                                                                                            
                                                                                                                                               
     // 最終狀態                                                                                                                                 
     console.log(`${colors.green}================================${colors.reset}`)                                                               
     console.log(`${colors.green}所有測試完成！${colors.reset}`)                                                                                 
     console.log(`${colors.green}================================${colors.reset}`)                                                               
     console.log('')                                                                                                                             
     console.log('檢查最終狀態：')                                                                                                               
     const finalRes = await apiRequest('GET', `/channels/${ACCESS_KEY}`)                                                                         
     const finalExpense = finalRes.channel.expenses.find(e => e.mode === 'itemized' && e.id === expenseId)                                       
     console.log(JSON.stringify({                                                                                                                
       id: finalExpense.id,                                                                                                                      
       itemName: finalExpense.itemName,                                                                                                          
       amount: finalExpense.amount,                                                                                                              
       mode: finalExpense.mode,                                                                                                                  
       items: finalExpense.items,                                                                                                                
       remainderHandling: finalExpense.remainderHandling                                                                                         
     }, null, 2))                                                                                                                                
                                                                                                                                               
     console.log('')                                                                                                                             
     console.log(`${colors.green}✓ 所有測試通過！${colors.reset}`)                                                                               
                                                                                                                                               
   } catch (error) {                                                                                                                             
     console.error(`${colors.red}測試失敗：${colors.reset}`, error.message)                                                                      
     console.error(error)                                                                                                                        
   }                                                                                                                                             
 }                                                                                                                                               
                                                                                                                                               
 // 執行測試                                                                                                                                     
 runTests()                                                                                                                                      
                   