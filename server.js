const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.use(express.json({
  limit: '20mb'
}));

// Health Check
app.get('/', async (req, res) => {
  try {
    res.json({
      status: 'running',
      service: 'Aghaz Pakistan Screenshot Service',
      node: process.version
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Screenshot Endpoint
app.post('/screenshot', async (req, res) => {
  const {
    html,
    width = 1080,
    height = 1350
  } = req.body;

  if (!html) {
    return res.status(400).json({
      error: 'html field is required'
    });
  }

  let browser;

  try {

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: Number(width),
      height: Number(height),
      deviceScaleFactor: 1
    });

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false
    });

    await browser.close();

    res.setHeader('Content-Type', 'image/png');
    return res.send(screenshot);

  } catch (error) {

    console.error(error);

    if (browser) {
      try {
        await browser.close();
      } catch (e) {}
    }

    return res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development'
        ? error.stack
        : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
