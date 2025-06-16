import { openBrowser, closeBrowser, scroll, qs, qsAll, getText, getHtml, waitSelector, loadState, waitNetwork, rest } from './browser.js';
import { setDB } from './db.js';
import { buildUrl, endPoint } from './utilities.js';

let browserInstance = null;

async function getData(url) {
  let ctx = null;
  let page = null;
  
  try {
    if (!browserInstance) {
      browserInstance = await openBrowser();
    }

    ctx = await browserInstance.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await rest(2000, 3000);

    const results = [];
    let processedTitles = new Set();

    // Tunggu dan scroll hasil pencarian
    const feedSelector = 'div[role="feed"]';
    if (!await waitSelector(page, feedSelector, { timeout: 10000 })) {
      throw new Error('Feed element not found');
    }
    
    await scroll(page, feedSelector);
    await rest(1000, 2000);

    // Proses setiap card
    const cards = await qsAll(page, 'div[role="article"]');
    
    for (const card of cards) {
      try {
        const title = await getText(card, 'div[role="heading"]');
        if (!title || processedTitles.has(title)) continue;
        
        processedTitles.add(title);
        
        // Klik card untuk membuka detail
        await card.click();
        await rest(1000, 2000);
        
        // Tunggu detail muncul
        if (!await waitSelector(page, 'div[role="dialog"]', { timeout: 5000 })) {
          console.error('Dialog not found for:', title);
          continue;
        }
        
        // Ambil data
        const data = {
          title,
          address: await getText(page, 'button[data-item-id="address"]'),
          contact: await getText(page, 'button[data-item-id="phone:tel:"]'),
          website: await getText(page, 'a[data-item-id="authority"]'),
          hours: await getText(page, 'div[data-item-id="oh"]'),
          rating: await getText(page, 'div[aria-label*="rating"]'),
          reviews: await getText(page, 'div[aria-label*="reviews"]'),
          category: await getText(page, 'button[jsaction*="category"]'),
          description: await getText(page, 'div[data-item-id*="description"]'),
          url: await page.url()
        };
        
        // Ambil foto
        const photos = await qsAll(page, 'button[data-photo-index]');
        data.photos = [];
        for (const photo of photos) {
          const style = await photo.getAttribute('style');
          const match = style?.match(/url\("([^"]+)"\)/);
          if (match) data.photos.push(match[1]);
        }
        
        results.push(data);
        
        // Tutup dialog
        await page.keyboard.press('Escape');
        await rest(500, 1000);
        
      } catch (error) {
        console.error(`Error processing card: ${error.message}`);
        continue;
      }
    }
    
    if (results.length > 0) {
      await setDB(results);
    }
    
    return results;
    
  } catch (error) {
    console.error('Error in getData:', error);
    throw error;
  } finally {
    // Cleanup
    if (page) await page.close();
    if (ctx) await ctx.close();
  }
}

async function getMultipleData(url) {
  try {
    return await getData(url);
  } catch (error) {
    console.error('Error in getMultipleData:', error);
    throw error;
  }
}

export { getData, getMultipleData };