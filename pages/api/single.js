import express from 'express';
const router = express.Router();
import * as browser from '../browser.js';
import { getDB, setDB } from '../db.js';
const { openBrowser, closeBrowser, waitForScrollFeed, scroll, qs, qsAll, getClassName, getText, getHtml, waitSelector, waitNetwork, loadState, rest } = browser;
import { getPosition, saveAsCsv, save, load, webpath } from '../utilities.js';

function endPoint(find, myLongLat) {
    const url = 'https://www.google.com/maps/search'
    return url + '/' + encodeURI(find) + '/' + myLongLat
}

router.get('/:search', async (req, res) => {
    const { search } = req.params;
    res.json({"status": "waiting..."});
    const url = endPoint(search, "@-6.9351394,106.9323303,13z");
    try {
        const ob = await openBrowser();
        const ctx = ob.newContext();
        const page = await ob.newPage();
        await page.goto(url);
        // await loadState(page, 'networkidle');
        let feed = await page.$("[role='feed']")
        // await waitNetwork(page, { idleTime: 1800 });
        await waitForScrollFeed(page, process.env.SET_SCROLL ?? 3);
        let card = await feed.$$('.hfpxzc');
        const processedTitles = new Set();
        const results = [];
        
        for (const c of card) {
          try {
            await c.click(); await rest(6000,9000);
            const ov = 'div.bJzME.Hu9e2e.tTVLSc > div > div.e07Vkf.kA9KIf > div > div';
            await waitSelector(page, ov, {timeout: 5000});
            const overview = await page.$(ov);
            
            if (overview) {
              const titleElement = await overview.$("h1");
              const title = titleElement ? await titleElement.textContent() : "No title";
              
              if (processedTitles.has(title)) continue;
              processedTitles.add(title);
        
                const ie = await overview.$$("button[data-item-id]");
              const alamat = await ie[0].getAttribute('aria-label')
                const kontak = async (ar)=>{
                let kontak = "";
                for (let btn of ar) {
                  const itemId = await btn.getAttribute("data-item-id");
                  if (itemId && itemId.includes(":")) {
                    const parts = itemId.split(":");
                    if (parts.length > 2) {
                      kontak = parts[2];
                      break;
                    }
                  }
                }
                return kontak.replace("-", "");
                }
              const addr = alamat && alamat.length > 0 ? alamat.split(":")[1].trim() : "No address";
              const phone = await kontak(ie);
              results.push({ name: title, address: addr, phone });
              console.log(`Processed: ${title}`);
            }
          } catch (error) {
            console.error("Error processing card:", error);
          }
        }
        await setDB(results);
        res.json(JSON.stringify(results));
    } catch (error) {
        console.error('Error fetching single data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

export default router;

