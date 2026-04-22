import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { subDays, format, parse } from "date-fns";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Helper to get ROC date string
  const getROCDate = (date: Date) => {
    const year = date.getFullYear() - 1911;
    return `${year}/${format(date, "MM/dd")}`;
  };

  const parseROCDate = (rocStr: any) => {
    if (typeof rocStr !== 'string') return new Date(0);
    const parts = rocStr.split('/');
    if (parts.length !== 3) return new Date(0);
    const year = parseInt(parts[0]) + 1911;
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    return new Date(year, month, day);
  };

  app.get("/api/stock-info", async (req, res) => {
    try {
      const results = [];

      // 1. 公布處置有價證券資訊 (TWSE Punish)
      try {
        const punishRes = await axios.get("https://www.twse.com.tw/rwd/zh/announcement/punish?response=json", {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        const punishData = punishRes.data;
        if (punishData && punishData.data) {
          // Filter last 2 days
          const today = new Date();
          const yesterday = subDays(today, 1);
          const dayBeforeYesterday = subDays(today, 2); // To be safe, "近兩天" might mean including today
          
          // Logic: Get the 2 most recent unique dates from the dataset
          const allDates = punishData.data
            .map((row: any[]) => row[1]) // Date is at index 1
            .filter((d: any) => typeof d === 'string' && d.includes('/'))
            .sort((a: string, b: string) => {
              const dateA = parseROCDate(a).getTime();
              const dateB = parseROCDate(b).getTime();
              return dateB - dateA;
            });
          
          const uniqueDates = Array.from(new Set(allDates)).slice(0, 2);
          
          console.log(`Filtering Punish data for dates: ${uniqueDates.join(", ")}`);

          const filteredPunish = punishData.data.filter((row: any[]) => {
            return uniqueDates.includes(row[1]);
          }).map((row: any[]) => ({
            date: row[1],
            code: row[2],
            name: row[3],
            period: row[6],
            details: row[8],
            description: row[5],
          }));

          results.push({
            name: "公布處置有價證券資訊",
            data: filteredPunish,
            fields: ["日期", "代號", "名稱", "處置起訖日", "處置內容", "處置說明"]
          });
        }
      } catch (e) {
        console.error("TWSE Punish failed", e);
        results.push({ name: "公布處置有價證券資訊", error: true, data: [] });
      }

      // 2. 公布注意交易資訊 (TWSE Note Trans)
      try {
        const noteRes = await axios.get("https://www.twse.com.tw/rwd/zh/announcement/notetrans?response=json", {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        const noteData = noteRes.data;
        if (noteData && noteData.data) {
          const mappedNote = noteData.data.map((row: any[]) => ({
            code: row[1],
            name: row[2],
            reason: row[3]
          }));
          results.push({
            name: "公布注意交易資訊",
            data: mappedNote,
            fields: ["代號", "名稱", "注意原因"]
          });
        }
      } catch (e) {
        console.error("TWSE Note failed", e);
        results.push({ name: "公布注意交易資訊", error: true, data: [] });
      }

      // 3. 上櫃公布注意累計次數異常資訊 (TPEx Warning)
      try {
        const tpexUrl = "https://www.tpex.org.tw/www/zh-tw/bulletin/warning/data?response=json";
        const tpexRes = await axios.get(tpexUrl, {
          headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.tpex.org.tw/www/zh-tw/bulletin/warning"
          }
        });
        
        const tpexData = tpexRes.data;
        if (tpexData && tpexData.tables && tpexData.tables[0] && tpexData.tables[0].data) {
            const mappedTpex = tpexData.tables[0].data.map((row: any[]) => ({
                code: row[1],
                name: row[2],
                count: row[3]?.replace(/<br>/g, " ")
            }));
            results.push({
                name: "上櫃公布注意累計次數異常資訊",
                data: mappedTpex,
                fields: ["代號", "名稱", "異動說明"]
            });
        }
      } catch (e) {
        console.error("TPEx Warning failed", e);
        results.push({ name: "上櫃公布注意累計次數異常資訊", error: true, data: [] });
      }

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch data" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
