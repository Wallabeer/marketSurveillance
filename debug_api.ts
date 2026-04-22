import axios from 'axios';

async function check() {
  try {
    const res = await axios.get("https://www.twse.com.tw/rwd/zh/announcement/punish?response=json", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    console.log("Status:", res.status);
    console.log("Keys:", Object.keys(res.data));
    if (res.data.data && res.data.data.length > 0) {
      console.log("First row:", res.data.data[0]);
      console.log("Fields (user requested 1-6):", res.data.data[0].slice(0, 7));
    } else {
      console.log("No data field or empty array in Punish");
    }

    const noteRes = await axios.get("https://www.twse.com.tw/rwd/zh/announcement/notetrans?response=json", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    console.log("Note Status:", noteRes.status);
    if (noteRes.data.data && noteRes.data.data.length > 0) {
      console.log("First Note row:", noteRes.data.data[0]);
    }

    const tpexUrl = "https://www.tpex.org.tw/www/zh-tw/bulletin/warning/data?response=json";
    const tpexRes = await axios.get(tpexUrl, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.tpex.org.tw/www/zh-tw/bulletin/warning"
      }
    });
    console.log("TPEx Status:", tpexRes.status);
    console.log("TPEx Keys:", Object.keys(tpexRes.data));
    if (tpexRes.data.tables) {
       console.log("TPEx Tables[0] Keys:", Object.keys(tpexRes.data.tables[0]));
       if (tpexRes.data.tables[0].data && tpexRes.data.tables[0].data.length > 0) {
          console.log("First TPEx row:", tpexRes.data.tables[0].data[0]);
       }
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

check();
