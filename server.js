const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'running', service: 'Aghaz Pakistan Screenshot Service' });
});

// Screenshot endpoint
app.post('/screenshot', async (req, res) => {
  const { html, width = 1080, height = 1350 } = req.body;

  if (!html) {
    return res.status(400).json({ error: 'html field is required' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    await page.setViewport({ 
      width: parseInt(width), 
      height: parseInt(height),
      deviceScaleFactor: 1
    });

    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait extra time for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    const screenshot = await page.screenshot({
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: parseInt(width),
        height: parseInt(height)
      }
    });

    await browser.close();

    res.set('Content-Type', 'image/png');
    res.send(screenshot);

  } catch (error) {
    if (browser) await browser.close();
    console.error('Screenshot error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Screenshot service running on port ${PORT}`);
});
