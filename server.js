const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const app = express();

app.use(express.json({
  limit: '20mb'
}));

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'Aghaz Pakistan Screenshot Service',
    node: process.version
  });
});

// Debug Route
app.get('/debug', async (req, res) => {
  try {

    const executablePath = await chromium.executablePath();

    res.json({
      chromiumPath: executablePath,
      node: process.version,
      chromiumVersion: chromium.version || 'unknown'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

// Browser Test Endpoint
app.get('/test-browser', async (req, res) => {

  let browser;

  try {

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();

    await page.goto('https://example.com', {
      waitUntil: 'networkidle0'
    });

    const title = await page.title();

    await browser.close();

    res.json({
      success: true,
      title,
      message: 'Puppeteer is working'
    });

  } catch (error) {

    if (browser) {
      try {
        await browser.close();
      } catch (e) {}
    }

    res.status(500).json({
      success: false,
      error: error.message
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
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
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
      type: 'png'
    });

    await browser.close();

    res.setHeader('Content-Type', 'image/png');
    return res.send(screenshot);

  } catch (error) {

    console.error('SCREENSHOT ERROR:', error);

    if (browser) {
      try {
        await browser.close();
      } catch (e) {}
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
