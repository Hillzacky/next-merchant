import * as browser from './browser.js';
import { getDB, setDB } from './db.js';
const { openBrowser, closeBrowser, waitForScrollFeed, scroll, qs, qsAll, getClassName, getText, getHtml, waitSelector, waitNetwork, loadState, rest } = browser;
import { getPosition, saveAsCsv, save, load, webpath } from './utilities.js';

function buildUrl(find, area, myLongLat) {
        const url = 'https://www.google.com/maps/search'
        return url + '/' + encodeURI(find + area) + '/' + myLongLat
}

function endPoint(find, myLongLat) {
        const url = 'https://www.google.com/maps/search'
        return url + '/' + encodeURI(find) + '/' + myLongLat
}

async function getData(url) {
  const ob = await openBrowser();
  const ctx = ob.newContext();
  const page = await ob.newPage();
  await page.goto(url, { timeout: 10000 });
  // await loadState(page, 'networkidle');
  let feed = await page.$('[role="feed"]', { timeout: 3500 })
  // await waitNetwork(page, { idleTime: 1800 });
  // await waitForScrollFeed(page, process.env.SET_SCROLL ?? 3);
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
  // await save(results);
  // await saveAsCsv(results);
  await closeBrowser(ob);
}

function viewResult(results) {
  console.log('\nHasil Akhir:');
  results.forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.name}`);
    console.log(`   Alamat: ${item.address}`);
    console.log(`   Telepon: ${item.phone}`);
  }); 
}

async function getMultipleData(find) {
  const file = webpath('kecamatan_sukabumi.csv');
  const dataList = getPosition(file);
  for(let i=0;i < dataList.length; i++){
    const uri = endPoint(find, dataList[i].myLongLat);
    console.info('Processing: ' + uri)
    await getData(uri)
  }
  console.info("working complete.")
}

export { endPoint, buildUrl, getData, getMultipleData }