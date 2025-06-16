import { openBrowser, closeBrowser, scroll, qs, qsAll, getText, getHtml, waitSelector, loadState, waitNetwork, rest } from './browser.js';
import { setDB } from './db.js';
import { buildUrl, endPoint } from './utilities.js';

let browserInstance = null;

async function getData(url) {
  let ctx = null;
  let page = null;
  
  try {
    // Gunakan browser instance yang ada atau buat yang baru
    if (!browserInstance) {
      browserInstance = await openBrowser({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1280,720'
        ]
      });
    }

    ctx = await browserInstance.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await rest(2000, 3000);

    const results = [];
    let processedTitles = new Set();

    // Tunggu dan scroll hasil pencarian
    await waitSelector(page, 'div[role="feed"]', { timeout: 10000 });
    await scroll(page, 'div[role="feed"]');
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
        await waitSelector(page, 'div[role="dialog"]', { timeout: 5000 });
        
        // Ambil alamat
        const address = await getText(page, 'button[data-item-id="address"]');
        
        // Ambil kontak
        const contact = await getText(page, 'button[data-item-id="phone:tel:"]');
        
        // Ambil website jika ada
        const website = await getText(page, 'a[data-item-id="authority"]');
        
        // Ambil jam operasional
        const hours = await getText(page, 'div[data-item-id="oh"]');
        
        // Ambil rating
        const rating = await getText(page, 'div[aria-label*="rating"]');
        
        // Ambil jumlah review
        const reviews = await getText(page, 'div[aria-label*="reviews"]');
        
        // Ambil kategori
        const category = await getText(page, 'button[jsaction*="category"]');
        
        // Ambil deskripsi
        const description = await getText(page, 'div[data-item-id*="description"]');
        
        // Ambil foto
        const photos = await qsAll(page, 'button[data-photo-index]');
        const photoUrls = [];
        for (const photo of photos) {
          const style = await photo.getAttribute('style');
          const match = style.match(/url\("([^"]+)"\)/);
          if (match) photoUrls.push(match[1]);
        }
        
        results.push({
          title,
          address,
          contact,
          website,
          hours,
          rating,
          reviews,
          category,
          description,
          photos: photoUrls,
          url: await page.url()
        });
        
        // Tutup dialog
        await page.keyboard.press('Escape');
        await rest(500, 1000);
        
      } catch (error) {
        console.error(`Error processing card: ${error.message}`);
        continue;
      }
    }
    
    await setDB(results);
    
    // Cleanup
    if (page) await page.close();
    if (ctx) await ctx.close();
    
    return results;
    
  } catch (error) {
    // Cleanup on error
    if (page) await page.close();
    if (ctx) await ctx.close();
    if (browserInstance) {
      await closeBrowser(browserInstance);
      browserInstance = null;
    }
    throw error;
  }
}

async function getMultipleData(url) {
  try {
    const results = await getData(url);
    return results;
  } catch (error) {
    throw error;
  }
}

export { getData, getMultipleData };