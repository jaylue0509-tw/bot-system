import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function migrate() {
  console.log('開始讀取 data.csv...');
  const csvData = fs.readFileSync('data.csv', 'utf8');
  const records = parse(csvData, { columns: true, skip_empty_lines: true, relax_column_count: true });

  const botsToInsert = [];
  let botIdCounter = 1;

  for (const record of records) {
    const name = record['AI運用']?.trim();
    let target_url = record['AI平台連結']?.trim();
    const summary = record['功能']?.trim();
    const creator = record['創建者']?.trim();
    
    let category_id = 'cat_7';
    if (summary?.includes('價格') || name?.includes('美容')) category_id = 'cat_2';
    else if (summary?.includes('銷售') || summary?.includes('訓練') || summary?.includes('百科')) category_id = 'cat_3';
    else if (summary?.includes('客訴') || summary?.includes('客服') || name?.includes('客服')) category_id = 'cat_5';
    else if (summary?.includes('發文') || summary?.includes('宣傳') || summary?.includes('廣告')) category_id = 'cat_4';
    else if (summary?.includes('圖卡') || summary?.includes('數據') || summary?.includes('庫存')) category_id = 'cat_1';

    if (name && target_url && target_url.startsWith('h')) {
      botsToInsert.push({
        id: 'bot_' + (botIdCounter++),
        category_id,
        name,
        summary,
        ai_platform: 'AI 平台',
        creator,
        target_url,
        is_featured: botIdCounter <= 7 ? true : false,
        click_count: Math.floor(Math.random() * 50)
      });
    }
  }

  console.log(`準備匯入 ${botsToInsert.length} 筆機器人資料...`);
  const { error } = await supabase.from('ai_bots').insert(botsToInsert);
  
  if (error) {
    console.error('匯入失敗:', error);
  } else {
    console.log('匯入成功！');
  }
}

migrate();
