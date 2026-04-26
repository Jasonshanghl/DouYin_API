import express from "express";
import cors from "cors";
import { chromium } from "playwright";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/douyin/user", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing url" });
  }

  try {
    const browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    const data = await page.evaluate(() => {
      const getText = (selector) =>
        document.querySelector(selector)?.innerText || null;
      const getSrc = (selector) =>
        document.querySelector(selector)?.src || null;

      return {
        nickname: getText(".Nu66P_ba"),
        avatar: getSrc(".avatar"),
        desc: getText(".iU5zY"),
        likes: getText(".CE7Xk"),
        followers: getText(".CE7Xk:nth-child(2)"),
        following: getText(".CE7Xk:nth-child(3)")
      };
    });

    await browser.close();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Douyin API is running");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));
