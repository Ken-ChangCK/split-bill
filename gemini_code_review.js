#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { config } from 'dotenv';


config();
console.log('✓ 已載入 .env 檔案');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});
const conventionsPath = process.env.CODING_CONVENTIONS_PATH;
const model = 'gemini-2.0-flash';

function getGitDiff() {
  try {
    const targetBranch = process.env.CI_MERGE_REQUEST_TARGET_BRANCH_NAME || 'main';
    
    // 先檢查是否有未 commit 的變更
    let filesOutput = '';
    try {
      filesOutput = execSync('git diff --name-only', { encoding: 'utf-8' });
    } catch (error) {
      console.error('取得未 commit 變更時發生錯誤');
    }
    
    if (filesOutput.trim()) {
      // 有未 commit 的變更
      console.log('  檢測到未 commit 的變更');
      const changedFiles = filesOutput.trim().split('\n').filter(f => f);
      const diffOutput = execSync('git diff', { encoding: 'utf-8' });
      return { diff: diffOutput, changedFiles };
    } else {
      // 沒有未 commit 的變更，比較分支
      console.log(`  比較當前分支與 origin/${targetBranch}`);
      const filesOutput = execSync(
        `git diff --name-only origin/${targetBranch}...HEAD`,
        { encoding: 'utf-8' }
      );
      const changedFiles = filesOutput.trim().split('\n').filter(f => f);
      
      const diffOutput = execSync(
        `git diff origin/${targetBranch}...HEAD`,
        { encoding: 'utf-8' }
      );
      return { diff: diffOutput, changedFiles };
    }
  } catch (error) {
    console.error('取得 git diff 時發生錯誤:', error.message);
    return null;
  }
}

function analyzeFileTypes(files) {
  const fileTypes = {
    components: [],
    hooks: [],
    utils: [],
    styles: [],
    configs: [],
    tests: [],
    types: [],
    other: []
  };
  
  for (const file of files) {
    if (!file) continue;
    
    if (file.toLowerCase().includes('component') || file.includes('/components/')) {
      fileTypes.components.push(file);
    } else if (file.toLowerCase().includes('hook') || file.includes('/hooks/')) {
      fileTypes.hooks.push(file);
    } else if (file.toLowerCase().includes('util') || file.includes('/utils/')) {
      fileTypes.utils.push(file);
    } else if (file.match(/\.(css|scss|less|styled\.(ts|js))$/)) {
      fileTypes.styles.push(file);
    } else if (file.toLowerCase().includes('config') || file.match(/\.config\.(js|ts)$/)) {
      fileTypes.configs.push(file);
    } else if (file.includes('test') || file.includes('spec')) {
      fileTypes.tests.push(file);
    } else if (file.endsWith('.d.ts') || file.includes('/types/')) {
      fileTypes.types.push(file);
    } else {
      fileTypes.other.push(file);
    }
  }
  
  return fileTypes;
}

async function analyzeWithGemini(codeDiff, fileTypes) {
    // 讀取公司開發規範
    let codingConventions = '';
    
    if (conventionsPath && fs.existsSync(conventionsPath)) {
      try {
        codingConventions = fs.readFileSync(conventionsPath, 'utf-8');
        console.log(`  ✓ 已載入公司開發規範: ${path.basename(conventionsPath)}`);
      } catch (error) {
        console.log(`  ⚠️ 無法讀取開發規範: ${error.message}`);
      }
    } else {
      console.log('  ℹ️ 未設定開發規範路徑');
    }
    
    const fileSummary = [];
    for (const [category, files] of Object.entries(fileTypes)) {
      if (files.length > 0) {
        fileSummary.push(`- ${category}: ${files.length} 個檔案`);
      }
    }
    
    const fileSummaryText = fileSummary.join('\n');
    
    // 組合 prompt
    const prompt = `你是一個專業的前端程式碼審查專家，專精於 React、TypeScript、Vite 專案。
  
  ${codingConventions ? `
  ## 📋 公司開發規範
  
  請**嚴格遵守**以下開發規範來審查程式碼：
  
  ${codingConventions.substring(0, 20000)}
  
  ---
  ` : ''}
  
  本次 MR 變更摘要：
  ${fileSummaryText}
  
  請仔細審查以下的 Git diff，針對前端專案提供專業的分析報告。
  
  **重點檢查項目：**
  
  ${codingConventions ? '🔴 **首要任務：檢查是否符合公司開發規範**\n\n' : ''}
  
  Git Diff（前 30000 字元）:
  \`\`\`
  ${codeDiff.substring(0, 30000)}
  \`\`\`
  
  **請用繁體中文回覆，使用 Markdown 格式，包含：**
  
  ${codingConventions ? '## 🔴 開發規範檢查\n\n' : ''}
  ## 📊 總體評分
  ## ✅ 優點
  ## ⚠️ 需要改進
  ## 🐛 潛在問題
  ## 💡 具體建議
  ## 🎯 行動項目
  `;
  
    try {
    //   const result = await model.generateContent(prompt);
    //   const response = await result.response;
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });
      const text = response.text;
      return text;
    } catch (error) {
      console.error('❌ 呼叫 Gemini API 時發生錯誤:', error.message);

      if (error.message.includes('429') || error.message.includes('quota')) {
        console.error('⏱️ 達到 Rate Limit，請稍後再試');
        console.error('💡 提示：Rate Limit 每分鐘/每天會重置');
      }

      throw error;
    }
  }

function saveReviewReport(reviewText, fileTypes) {
  const fileSummary = [];
  let totalFiles = 0;
  
  for (const [category, files] of Object.entries(fileTypes)) {
    if (files.length > 0) {
      totalFiles += files.length;
      fileSummary.push(`- **${category}**: ${files.length} 個檔案`);
      
      for (let i = 0; i < Math.min(5, files.length); i++) {
        fileSummary.push(`  - \`${files[i]}\``);
      }
      
      if (files.length > 5) {
        fileSummary.push(`  - ... 還有 ${files.length - 5} 個檔案`);
      }
    }
  }
  
  const fileSummaryText = fileSummary.join('\n');
  
  const report = `# 🤖 Gemini AI Code Review Report

**專案**: Ironman3 (React + Vite + TypeScript)

**變更摘要**: 共 ${totalFiles} 個檔案

${fileSummaryText}

---

${reviewText}`;

  fs.writeFileSync('code_review1report1.md', report, 'utf-8');
  console.log('✅ 審查報告已儲存至 code_review_report1.md');
}

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 Gemini AI Code Review for Frontend (React/Vite/TypeScript)');
  console.log('='.repeat(70));

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ 錯誤: 未設定 GEMINI_API_KEY 環境變數');
    process.exit(1);
  }

  console.log('✓ GEMINI_API_KEY 已設定');

  console.log('\n📝 正在取得程式碼變更...');
  const result = getGitDiff();

  if (!result || !result.diff || result.diff.trim().length === 0) {
    console.log('ℹ️ 沒有偵測到程式碼變更，跳過審查');
    process.exit(0);
  }

  const fileTypes = analyzeFileTypes(result.changedFiles);
  const totalFiles = result.changedFiles.length;

  console.log(`✓ 偵測到 ${totalFiles} 個檔案變更`);
  console.log(`✓ 程式碼變更大小: ${result.diff.length.toLocaleString()} 字元`);

  console.log('\n🔍 正在使用 Gemini 分析程式碼...');
  
  try {
    const review = await analyzeWithGemini(result.diff, fileTypes);
    console.log('✓ 審查完成\n');

    console.log('='.repeat(70));
    console.log('📋 審查結果');
    console.log('='.repeat(70));
    console.log(review);
    console.log('='.repeat(70));

    saveReviewReport(review, fileTypes);

    // if (CI_MERGE_REQUEST_IID && GITLAB_TOKEN) {
    //   console.log('\n💬 正在發布評論到 Merge Request...');
      // await postMRComment(review);
    // }


    console.log('\n✅ 程式碼審查完成！');
  } catch (error) {
    console.error('❌ 審查過程發生錯誤:', error.message);
    process.exit(1);
  }
}

main();