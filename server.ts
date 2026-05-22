import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import exceljs from 'exceljs';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = 3000;

import { parse } from 'csv-parse/sync';

async function setupDatabase() {
  const dbDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const db = await open({
    filename: path.join(dbDir, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS ai_bots;
    DROP TABLE IF EXISTS click_logs;

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS ai_bots (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      name TEXT NOT NULL,
      summary TEXT,
      ai_platform TEXT,
      creator TEXT,
      target_url TEXT,
      is_featured BOOLEAN DEFAULT 0,
      click_count INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS click_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bot_id TEXT,
      clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed data
  const count = await db.get('SELECT COUNT(*) as count FROM categories');
  if (count.count === 0) {
    await db.exec(`
      INSERT INTO categories (id, name, icon, sort_order) VALUES
      ('cat_1', '營運管理與數據分析', 'BarChart3', 1),
      ('cat_2', '美容業務相關', 'Scissors', 2),
      ('cat_3', '商品知識與銷售訓練', 'ShoppingBag', 3),
      ('cat_4', '行銷素材與設計生成', 'PenTool', 4),
      ('cat_5', '顧客服務與客訴處理', 'MessageSquare', 5),
      ('cat_6', '門市客服', 'MessageSquare', 6),
      ('cat_7', '其他', 'Bot', 7);
    `);

    // Parse data.csv
    const csvData = fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8');
    const records = parse(csvData, { columns: true, skip_empty_lines: true, relax_column_count: true });

    let botIdCounter = 1;
    const seenBots = new Set<string>();

    for (const record of records) {
      const name = record['AI運用']?.trim();
      let target_url = record['AI平台連結']?.trim();
      const summary = record['功能']?.trim();
      const creator = record['創建者']?.trim();
      
      // Determine category based on keywords
      let category_id = 'cat_7';
      if (summary?.includes('價格') || name?.includes('美容')) category_id = 'cat_2';
      else if (summary?.includes('銷售') || summary?.includes('訓練') || summary?.includes('百科')) category_id = 'cat_3';
      else if (summary?.includes('客訴') || summary?.includes('客服') || name?.includes('客服')) category_id = 'cat_5';
      else if (summary?.includes('發文') || summary?.includes('宣傳') || summary?.includes('廣告')) category_id = 'cat_4';
      else if (summary?.includes('圖卡') || summary?.includes('數據') || summary?.includes('庫存')) category_id = 'cat_1';

      if (name && target_url && target_url.startsWith('h')) {
        const uniqueKey = `${name}-${summary}-${target_url}`;
        if (!seenBots.has(uniqueKey)) {
          seenBots.add(uniqueKey);
          await db.run(
            'INSERT INTO ai_bots (id, category_id, name, summary, ai_platform, creator, target_url, is_featured, click_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ['bot_' + (botIdCounter++), category_id, name, summary, 'AI 平台', creator, target_url, botIdCounter <= 6 ? 1 : 0, Math.floor(Math.random() * 50)]
          );
        }
      }
    }
  }
  return db;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const db = await setupDatabase();

  // --- API Routes ---
  
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await db.all('SELECT * FROM categories ORDER BY sort_order ASC');
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/bots', async (req, res) => {
    try {
      const { categoryId, keyword, featured } = req.query;
      let query = `
        SELECT b.*, c.name as category_name
        FROM ai_bots b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (categoryId) {
        query += ' AND b.category_id = ?';
        params.push(categoryId);
      }
      if (keyword) {
        query += ' AND (b.name LIKE ? OR b.summary LIKE ? OR b.creator LIKE ?)';
        const likeKw = `%${keyword}%`;
        params.push(likeKw, likeKw, likeKw);
      }
      if (featured === 'true') {
        query += ' AND b.is_featured = 1';
      }
      
      query += ' ORDER BY b.click_count DESC';
      
      const bots = await db.all(query, params);
      res.json(bots);
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.post('/api/bots/:id/click', async (req, res) => {
    try {
      const { id } = req.params;
      const bot = await db.get('SELECT target_url FROM ai_bots WHERE id = ?', [id]);
      if (!bot) {
        return res.status(404).json({ error: 'Bot not found' });
      }
      
      await db.run('UPDATE ai_bots SET click_count = click_count + 1 WHERE id = ?', [id]);
      await db.run('INSERT INTO click_logs (bot_id) VALUES (?)', [id]);
      
      res.json({ targetUrl: bot.target_url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/admin/dashboard', async (req, res) => {
    try {
      const totalClicks = await db.get('SELECT COUNT(*) as count FROM click_logs');
      const todayClicks = await db.get('SELECT COUNT(*) as count FROM click_logs WHERE date(clicked_at) = date("now")');
      const botsRank = await db.all('SELECT name, click_count FROM ai_bots ORDER BY click_count DESC LIMIT 5');
      const creatorRank = await db.all('SELECT creator, SUM(click_count) as total_clicks FROM ai_bots GROUP BY creator ORDER BY total_clicks DESC LIMIT 5');
      
      res.json({
        kpi: {
          totalClicks: totalClicks.count,
          todayClicks: todayClicks.count,
        },
        botsRank,
        creatorRank
      });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/admin/reports/clicks.xlsx', async (req, res) => {
    try {
      const bots = await db.all(`
        SELECT b.name, c.name as category, b.ai_platform, b.creator, b.click_count, b.target_url
        FROM ai_bots b LEFT JOIN categories c ON b.category_id = c.id
        ORDER BY b.click_count DESC
      `);

      const workbook = new exceljs.Workbook();
      const sheet = workbook.addWorksheet('AI Bot 點擊統計');
      
      sheet.columns = [
        { header: '機器人名稱', key: 'name', width: 25 },
        { header: '分類', key: 'category', width: 20 },
        { header: '使用平台', key: 'ai_platform', width: 15 },
        { header: '創作者', key: 'creator', width: 15 },
        { header: '總點擊數', key: 'click_count', width: 15 },
        { header: '目標連結', key: 'target_url', width: 40 },
      ];

      sheet.addRows(bots);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="bot_clicks_report.xlsx"');
      
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      res.status(500).json({ error: 'Generation error' });
    }
  });

  // --- Serve Frontend ---
  
  if (NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
