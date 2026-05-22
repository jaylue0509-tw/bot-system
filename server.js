// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import exceljs from "exceljs";
import dotenv from "dotenv";
import fs from "fs";
import { parse } from "csv-parse/sync";
dotenv.config();
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var NODE_ENV = process.env.NODE_ENV || "development";
var PORT = 3e3;
async function setupDatabase() {
  const dbDir = path.join(__dirname, "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const db = await open({
    filename: path.join(dbDir, "database.sqlite"),
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
  const count = await db.get("SELECT COUNT(*) as count FROM categories");
  if (count.count === 0) {
    await db.exec(`
      INSERT INTO categories (id, name, icon, sort_order) VALUES
      ('cat_1', '\u71DF\u904B\u7BA1\u7406\u8207\u6578\u64DA\u5206\u6790', 'BarChart3', 1),
      ('cat_2', '\u7F8E\u5BB9\u696D\u52D9\u76F8\u95DC', 'Scissors', 2),
      ('cat_3', '\u5546\u54C1\u77E5\u8B58\u8207\u92B7\u552E\u8A13\u7DF4', 'ShoppingBag', 3),
      ('cat_4', '\u884C\u92B7\u7D20\u6750\u8207\u8A2D\u8A08\u751F\u6210', 'PenTool', 4),
      ('cat_5', '\u9867\u5BA2\u670D\u52D9\u8207\u5BA2\u8A34\u8655\u7406', 'MessageSquare', 5),
      ('cat_6', '\u9580\u5E02\u5BA2\u670D', 'MessageSquare', 6),
      ('cat_7', '\u5176\u4ED6', 'Bot', 7);
    `);
    const csvData = fs.readFileSync(path.join(__dirname, "data.csv"), "utf8");
    const records = parse(csvData, { columns: true, skip_empty_lines: true, relax_column_count: true });
    let botIdCounter = 1;
    const seenBots = /* @__PURE__ */ new Set();
    for (const record of records) {
      const name = record["AI\u904B\u7528"]?.trim();
      let target_url = record["AI\u5E73\u53F0\u9023\u7D50"]?.trim();
      const summary = record["\u529F\u80FD"]?.trim();
      const creator = record["\u5275\u5EFA\u8005"]?.trim();
      let category_id = "cat_7";
      if (summary?.includes("\u50F9\u683C") || name?.includes("\u7F8E\u5BB9")) category_id = "cat_2";
      else if (summary?.includes("\u92B7\u552E") || summary?.includes("\u8A13\u7DF4") || summary?.includes("\u767E\u79D1")) category_id = "cat_3";
      else if (summary?.includes("\u5BA2\u8A34") || summary?.includes("\u5BA2\u670D") || name?.includes("\u5BA2\u670D")) category_id = "cat_5";
      else if (summary?.includes("\u767C\u6587") || summary?.includes("\u5BA3\u50B3") || summary?.includes("\u5EE3\u544A")) category_id = "cat_4";
      else if (summary?.includes("\u5716\u5361") || summary?.includes("\u6578\u64DA") || summary?.includes("\u5EAB\u5B58")) category_id = "cat_1";
      if (name && target_url && target_url.startsWith("h")) {
        const uniqueKey = `${name}-${summary}-${target_url}`;
        if (!seenBots.has(uniqueKey)) {
          seenBots.add(uniqueKey);
          await db.run(
            "INSERT INTO ai_bots (id, category_id, name, summary, ai_platform, creator, target_url, is_featured, click_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ["bot_" + botIdCounter++, category_id, name, summary, "AI \u5E73\u53F0", creator, target_url, botIdCounter <= 6 ? 1 : 0, Math.floor(Math.random() * 50)]
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
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await db.all("SELECT * FROM categories ORDER BY sort_order ASC");
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });
  app.get("/api/bots", async (req, res) => {
    try {
      const { categoryId, keyword, featured } = req.query;
      let query = `
        SELECT b.*, c.name as category_name
        FROM ai_bots b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE 1=1
      `;
      const params = [];
      if (categoryId) {
        query += " AND b.category_id = ?";
        params.push(categoryId);
      }
      if (keyword) {
        query += " AND (b.name LIKE ? OR b.summary LIKE ? OR b.creator LIKE ?)";
        const likeKw = `%${keyword}%`;
        params.push(likeKw, likeKw, likeKw);
      }
      if (featured === "true") {
        query += " AND b.is_featured = 1";
      }
      query += " ORDER BY b.click_count DESC";
      const bots = await db.all(query, params);
      res.json(bots);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });
  app.post("/api/bots/:id/click", async (req, res) => {
    try {
      const { id } = req.params;
      const bot = await db.get("SELECT target_url FROM ai_bots WHERE id = ?", [id]);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }
      await db.run("UPDATE ai_bots SET click_count = click_count + 1 WHERE id = ?", [id]);
      await db.run("INSERT INTO click_logs (bot_id) VALUES (?)", [id]);
      res.json({ targetUrl: bot.target_url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });
  app.get("/api/admin/dashboard", async (req, res) => {
    try {
      const totalClicks = await db.get("SELECT COUNT(*) as count FROM click_logs");
      const todayClicks = await db.get('SELECT COUNT(*) as count FROM click_logs WHERE date(clicked_at) = date("now")');
      const botsRank = await db.all("SELECT name, click_count FROM ai_bots ORDER BY click_count DESC LIMIT 5");
      const creatorRank = await db.all("SELECT creator, SUM(click_count) as total_clicks FROM ai_bots GROUP BY creator ORDER BY total_clicks DESC LIMIT 5");
      res.json({
        kpi: {
          totalClicks: totalClicks.count,
          todayClicks: todayClicks.count
        },
        botsRank,
        creatorRank
      });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });
  app.get("/api/admin/reports/clicks.xlsx", async (req, res) => {
    try {
      const bots = await db.all(`
        SELECT b.name, c.name as category, b.ai_platform, b.creator, b.click_count, b.target_url
        FROM ai_bots b LEFT JOIN categories c ON b.category_id = c.id
        ORDER BY b.click_count DESC
      `);
      const workbook = new exceljs.Workbook();
      const sheet = workbook.addWorksheet("AI Bot \u9EDE\u64CA\u7D71\u8A08");
      sheet.columns = [
        { header: "\u6A5F\u5668\u4EBA\u540D\u7A31", key: "name", width: 25 },
        { header: "\u5206\u985E", key: "category", width: 20 },
        { header: "\u4F7F\u7528\u5E73\u53F0", key: "ai_platform", width: 15 },
        { header: "\u5275\u4F5C\u8005", key: "creator", width: 15 },
        { header: "\u7E3D\u9EDE\u64CA\u6578", key: "click_count", width: 15 },
        { header: "\u76EE\u6A19\u9023\u7D50", key: "target_url", width: 40 }
      ];
      sheet.addRows(bots);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", 'attachment; filename="bot_clicks_report.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      res.status(500).json({ error: "Generation error" });
    }
  });
  if (NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
startServer();
