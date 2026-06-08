---
name: chinese-game-generator
description: >
  專為興儒六私國語班設計的互動遊戲生成器。當使用者提供國語課題目資料（成語、字音、改錯字、填空句等），
  並指定遊戲類型，即自動產生完整可部署的 HTML 遊戲檔。
  支援六種遊戲類型：填空、多選一（改錯字/字音辨字/字彙練習）、找錯別字、字音辨正、成語填空、成語連連看。
  所有遊戲皆包含冷卻系統、星星獎勵、錯題記錄、Firebase cloud sync、iPad 觸控優化。
  使用者說「幫我做一個XXX遊戲」、「把這些題目做成互動遊戲」、「新增一個單元的練習」時必須觸發此 skill。
  也適用於：「第X單元要出新的練習」、「這些成語要做成遊戲」、「把Word檔的題目做成選擇題」等情境。
  除了「從題目資料產生全新遊戲」，也適用於要在多個現有遊戲檔案中新增、修改、或修復共用功能時
  （例如：錯誤回報系統、計分機制、UI 元件、統一某個樣式或行為）。這類情境下，skill 內建的範本是
  已驗證過的標準版本——使用它比直接照抄某個「看起來很像」的現成檔案更可靠，能避免把該檔案裡尚未發現的
  bug 一併複製過去。觸發語句例如：「幫所有遊戲加上/改成 XX 功能」、「統一一下所有遊戲的回報機制」、
  「修一下 XX 機制的 bug，順便檢查其他檔案有沒有一樣的問題」。
---

# 國語互動遊戲生成器

## 專案背景

- **平台**：GitHub Pages 靜態網站，`https://hchiu65.github.io/xinru-worksheets/`
- **Firebase**：`https://xinru-class-default-rtdb.firebaseio.com`，路徑 `/accounts/{username}`
- **工作目錄**：`C:\Users\Charlie_Chiu\xinru-worksheets\`
- **字型**：全站使用 `"標楷體","DFKai-SB",serif`
- **目標裝置**：iPad（需要大觸控目標，min 44px）

## 管理後台

- **統一入口**：`error-reports.html`（標題「管理中心 — 興儒國文班」）
- 分兩個 Tab：`⚠️ 錯誤回報`（學生回報管理）、`🛠 管理後台`（帳號管理）
- 管理後台登入密碼 = 查理布朗在 Firebase 的 `bday` 欄位（動態讀取，非硬編碼）
- 管理後台功能：查看學生、批量刪除非活躍帳號（0 次或 ≤1 次遊玩）、匯出 CSV/JSON
- sessionStorage `xr_admin_unlocked` 儲存登入狀態（關閉頁籤後需重新驗證）

### Firebase 帳號改名流程（curl）
```bash
# 1. 取出舊帳號資料
curl -s "https://xinru-class-default-rtdb.firebaseio.com/accounts/{舊名URL編碼}.json" > /tmp/data.json
# 2. PUT 到新名稱（覆蓋若已存在）
curl -s -X PUT -H "Content-Type: application/json" -d @/tmp/data.json \
  "https://xinru-class-default-rtdb.firebaseio.com/accounts/{新名URL編碼}.json"
# 3. 刪除舊帳號
curl -s -X DELETE "https://xinru-class-default-rtdb.firebaseio.com/accounts/{舊名URL編碼}.json"
```

## 遊戲類型判斷

| 使用者描述 | 遊戲類型 | 參考檔案 |
|-----------|---------|---------|
| 成語/詞語填空、填入空格 | `fill-in` | unit6.html, unit7-chengyu.html |
| 改錯字、找出寫錯的字並改正 | `fix-wrong` | unit7-gaicuo.html |
| 找錯別字、哪個字寫錯了 | `find-wrong` | unit7-bianzi.html |
| 字音辨字、注音選字 | `bopomo` | unit7-bopomo.html |
| 字音辨正、選正確注音 | `ziyin` | unit7-ziyin.html |
| 成語連連看、配對 | `matching` | unit6-match.html, u7match.html |

## 必要資訊（開始前確認）

1. **遊戲類型**：依上表判斷，不確定時詢問
2. **單元名稱**：如「第七單元 作業練習 改錯字」（用於 GAME_SOURCE 和 index.html 卡片）
3. **GAME_ID**：簡短英文ID，如 `u8gaicuo`（現有：unit6, unit6m, u7ziyin, u7bianzi, u7gaicuo, u7bopomo, u7vocab, u7chengyu, u7match）
4. **題目資料**：從 Word/圖片/使用者直接提供的文字中提取
5. **主題色**：若未指定，依單元選預設色（第六單元藍、第七單元橙紅、第八單元綠）

> 📌 **`hdr-title` 命名慣例**：ziyin / find-wrong / fix-wrong / bopomo / vocab 這類「單元作業練習」頁面，頁面內顯示的標題要在遊戲名稱後加上「・第X單元」，例如「字音辨正（四）・第四單元」、「找錯別字・第九單元」。日後學生回報某題有誤時，老師或 Claude 只看截圖就能立刻判斷是哪個單元的檔案，不必再去猜測或逐一翻檔名比對。（fill-in、matching 類型維持原本標題格式即可，因為它們通常已經用 `<small>` 顯示其他資訊。）

## 各遊戲資料格式

### fill-in（填空）
```javascript
const SENTENCES = [
  { sentence: '他的行為真是（　　）。', answer: '囂張跋扈', meaning: '形容...' },
];
const WORD_BANK = ['囂張跋扈', '顛沛流離', ...];
```

### fix-wrong（改錯字）
```javascript
const ITEMS = [
  { wrong:'長袍馬掛', wrongChar:'掛', correct:'褂', full:'長袍馬褂',
    meaning:'...', opts:['褂','卦','括','刮'] },
];
```

### find-wrong（找錯別字）
```javascript
const BIANZI = [
  { wrong:'跨下之辱', wrongChar:'跨', correct:'胯', full:'胯下之辱',
    meaning:'...', opts:['胯','垮','誇','夸'] },
];
```

### bopomo（字音辨字）
```javascript
const BOPOMO = [
  { phrase:'時間「ㄘㄨㄥ」促', correct:'倉', full:'時間倉促',
    meaning:'...', opts:['倉','槍','蒼','滄'] },
];
```

### ziyin（字音辨正）
```javascript
const ZIYIN = [
  { phrase:'靜「悄悄」', char:'悄', correct:'ㄑ一ㄠˇ',
    opts:['ㄑ一ㄠˋ','ㄔㄠˇ','ㄑ一ㄠˊ'], meaning:'寂靜無聲' },
];
```

### matching（連連看）
```javascript
const PAIRS = [
  { word:'囂張跋扈', meaning:'形容人態度傲慢、蠻橫無理，到處橫行霸道' },
];
```
> 連連看的 meaning 欄位要完整說明詞語含義，不只解釋單一難字。

## 標準常數（每個遊戲都必須包含）

```javascript
const GAME_ID     = 'u8xxx';
const GAME_SOURCE = '第X單元　YYY';
const FB_URL      = 'https://xinru-class-default-rtdb.firebaseio.com';
const GAME_LABELS = {
  unit6:'詞語填空', unit6m:'成語連連看',
  u7ziyin:'字音辨正', u7bianzi:'找錯別字',
  u7gaicuo:'改錯字(作業)', u7bopomo:'字音辨字(作業)',
  u7vocab:'字彙練習(作業)', u7chengyu:'成語填空',
  u7match:'連連看(七)',
  'y3c-match':'連連看(3C)', 'y3c-chengyu':'填空(3C)',
  'y3c-gaicuo':'改錯字(3C)', 'y3c-vocab':'字義選詞(3C)',
  // 新遊戲加在這裡
};
```

> ⚠️ **每次新增遊戲**，必須同步更新 index.html 和所有現有遊戲檔案中的 `GAME_LABELS`。

## 錯誤回報系統（每個遊戲必須包含）

每個遊戲右上角都有 `⚠️ 回報` 按鈕，讓學生回報題目錯誤。管理員（查理布朗、艾美女）在 `error-reports.html` 查看並處理。

> 📌 **直接複製這裡（或 `boilerplate.md`）目前的程式碼，不要挑一個「長得像」的現成檔案重新組裝**：這套系統的 CSS／HTML／JS 彼此綁定——例如下面 `id="report-cats"` 必須跟 JS 裡的 `querySelectorAll('#report-cats...')` 完全對上，任何一處 id／class 寫岔了，整個分類功能就會悄悄失效：checkbox 照樣能勾、畫面完全正常，只有資料真正送進 Firebase 時才會發現是空的（這正是某次升級時實際發生過的事）。從這裡複製，永遠拿到當下已驗證過的版本；改抄別的檔案，等於在賭那個檔案當初有沒有寫對。

### CSS（加在現有樣式後）
```css
.btn-report{background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.3);border-radius:16px;padding:6px 14px;font-size:16px;color:rgba(255,255,255,.8);cursor:pointer;font-family:inherit;flex-shrink:0;}
.btn-report:active{background:rgba(255,255,255,.28);}
#report-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:950;align-items:center;justify-content:center;}
#report-overlay.show{display:flex;}
.report-box{background:#fff;border-radius:22px;padding:28px 22px 22px;width:88%;max-width:380px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.25);}
.report-title{font-size:18px;font-weight:bold;color:#e74c3c;margin-bottom:6px;}
.report-sub{font-size:13px;color:#aaa;margin-bottom:12px;}
.report-q{font-size:14px;color:#555;background:#f8f8f8;border-radius:10px;padding:10px 12px;margin-bottom:14px;line-height:1.7;text-align:left;word-break:break-all;}
.report-cats{text-align:left;font-size:14px;line-height:2.1;margin:4px 0 12px;color:#555;}
.report-cats label{display:block;cursor:pointer;}
.report-cats input{margin-right:6px;vertical-align:middle;}
.report-note{width:100%;padding:10px;font-size:14px;font-family:inherit;border:1.5px solid #eee;border-radius:10px;margin-bottom:14px;resize:none;height:60px;outline:none;box-sizing:border-box;}
.report-note:focus{border-color:#e74c3c;}
.report-btns{display:flex;gap:10px;}
.report-btn-cancel{flex:1;padding:12px;border-radius:12px;border:1.5px solid #eee;background:#fff;font-size:15px;font-family:inherit;cursor:pointer;color:#888;}
.report-btn-send{flex:1;padding:12px;border-radius:12px;border:none;background:#e74c3c;color:#fff;font-size:15px;font-family:inherit;cursor:pointer;font-weight:bold;}
```

### 1000px 媒體查詢中加入（13吋 iPad 放大）
```css
@media (min-width: 1000px) {
  /* ... 其他放大規則 ... */
  .btn-report     { font-size:20px; padding:9px 22px; }
  .report-box     { max-width:520px; }
  .report-title   { font-size:24px; }
}
```

### Header HTML（`.hdr-right` 或標題列右側）
```html
<button class="btn-report" onclick="showReport()">⚠️ 回報</button>
```

### MCQ / fill-in 類遊戲的 JS
```javascript
function getQText() {
  // 傳回當前題目文字，例如：
  const el = document.getElementById('question-text');
  return el ? el.textContent : GAME_SOURCE;
}
function showReport(){document.getElementById('report-q').textContent=getQText();document.getElementById('report-note').value='';document.querySelectorAll('#report-cats input').forEach(c=>c.checked=false);document.getElementById('report-overlay').classList.add('show');}
function closeReport(){document.getElementById('report-overlay').classList.remove('show');}
async function submitReport(){const data={game:GAME_ID,source:GAME_SOURCE,qText:document.getElementById('report-q').textContent,categories:Array.from(document.querySelectorAll('#report-cats input:checked')).map(c=>c.value),note:document.getElementById('report-note').value.trim(),player:localStorage.getItem('xr_name')||'匿名',date:new Date().toLocaleDateString('zh-TW'),ts:Date.now(),resolved:false};try{await fetch(`${FB_URL}/error_reports.json`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});}catch(e){}closeReport();const t=document.createElement('div');t.style.cssText='position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 22px;border-radius:20px;font-size:14px;z-index:999;pointer-events:none;';t.textContent='✓ 已通知老師，謝謝！';document.body.appendChild(t);setTimeout(()=>t.remove(),2500);}
```

### MCQ 類遊戲（fix-wrong / find-wrong / bopomo / ziyin）：feedback 層內加回報入口

這四種遊戲答題後會跳出全螢幕的「揭曉答案」層（`#feedback` / `.fb-box`，`z-index:500`），疊在 header 上方，導致 header 的 `⚠️ 回報` 按鈕被蓋住按不到。但這正是學生最需要回報的時刻——他們剛看到（可能有誤的）正確答案、注音或解釋說明。

解法：在 `.fb-box` 內「繼續 →」按鈕之後，加一個低調的文字連結直接呼叫已存在的 `showReport()`：

```html
<button class="fb-next" onclick="nextQ()">繼續 →</button>
<button onclick="showReport()" style="margin-top:10px;background:none;border:none;color:#999;font-size:13px;font-family:inherit;text-decoration:underline;cursor:pointer;">⚠️ 這題有問題？回報</button>
```

不需要額外處理：`#report-overlay` 的 `z-index`（950）高於 `#feedback`（500），從 feedback 層觸發時會自動疊在最上層；`getQText()` 讀取的 DOM（如 `#q-phrase`）在 `nextQ()` 執行前不會變動，所以即使在揭曉答案當下觸發回報，仍會正確帶出剛剛那一題的內容。

> fill-in 和 matching 沒有這種全螢幕揭曉層（fill-in 用內嵌標示對錯，matching 用配對選擇器回報），所以不需要加這個連結。

### matching（連連看）類遊戲的 JS — 使用配對選擇器
連連看不用靜態 `report-q` 文字，改用 pair picker 讓學生點選哪一對有問題：
```javascript
// CSS 額外加入：
// .pair-picker{max-height:200px;overflow-y:auto;margin-bottom:12px;display:flex;flex-direction:column;gap:5px;text-align:left;}
// .pair-item{display:flex;align-items:baseline;gap:8px;padding:8px 10px;background:#f8f8f8;border-radius:8px;border:1.5px solid transparent;cursor:pointer;font-family:inherit;width:100%;text-align:left;}
// .pair-item:active,.pair-item.selected{background:#fff0f0;border-color:#e74c3c;}
// .pair-word{font-size:15px;font-weight:bold;color:#333;white-space:nowrap;flex-shrink:0;}
// .pair-meaning{font-size:12px;color:#888;}

let reportSelectedPair=null;
function showReport(){reportSelectedPair=null;const pk=document.getElementById('pair-picker');pk.innerHTML=pairs.map((p,i)=>`<button class="pair-item" onclick="selectPair(${i})" id="pi-${i}"><span class="pair-word">${p.word}</span><span class="pair-meaning">${p.meaning}</span></button>`).join('');document.getElementById('report-note').value='';document.querySelectorAll('#report-cats input').forEach(c=>c.checked=false);document.getElementById('report-overlay').classList.add('show');}
function selectPair(idx){reportSelectedPair=pairs[idx];document.querySelectorAll('.pair-item').forEach((el,i)=>el.classList.toggle('selected',i===idx));}
function closeReport(){document.getElementById('report-overlay').classList.remove('show');}
async function submitReport(){const qt=reportSelectedPair?reportSelectedPair.word+' → '+reportSelectedPair.meaning:GAME_SOURCE;const data={game:GAME_ID,source:GAME_SOURCE,qText:qt,categories:Array.from(document.querySelectorAll('#report-cats input:checked')).map(c=>c.value),note:document.getElementById('report-note').value.trim(),player:localStorage.getItem('xr_name')||'匿名',date:new Date().toLocaleDateString('zh-TW'),ts:Date.now(),resolved:false};try{await fetch(`${FB_URL}/error_reports.json`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});}catch(e){}closeReport();const t=document.createElement('div');t.style.cssText='position:fixed;bottom:70px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 22px;border-radius:20px;font-size:14px;z-index:999;pointer-events:none;';t.textContent='✓ 已通知老師，謝謝！';document.body.appendChild(t);setTimeout(()=>t.remove(),2500);}
```

### Overlay HTML（連連看用 pair-picker，其他用 report-q）
```html
<!-- MCQ/fill-in 類 -->
<div id="report-overlay">
  <div class="report-box">
    <div class="report-title">⚠️ 回報題目錯誤</div>
    <div class="report-sub">這題有問題嗎？說明後老師會來確認</div>
    <div class="report-q" id="report-q"></div>
    <div class="report-cats" id="report-cats">
      <label><input type="checkbox" value="讀音／注音錯誤">讀音／注音錯誤</label>
      <label><input type="checkbox" value="文字／錯字">文字／錯字（題目或選項打錯字）</label>
      <label><input type="checkbox" value="答案標示錯誤">答案標示錯誤</label>
      <label><input type="checkbox" value="解釋說明錯誤">解釋說明錯誤</label>
      <label><input type="checkbox" value="其他">其他（請說明）</label>
    </div>
    <textarea class="report-note" id="report-note" placeholder="說明錯誤（可不填）"></textarea>
    <div class="report-btns">
      <button class="report-btn-cancel" onclick="closeReport()">取消</button>
      <button class="report-btn-send" onclick="submitReport()">確認回報</button>
    </div>
  </div>
</div>

<!-- matching 類：把 report-q 換成 pair-picker，report-cats 不變 -->
<div id="report-overlay">
  <div class="report-box">
    <div class="report-title">⚠️ 回報題目錯誤</div>
    <div class="report-sub">點選哪個詞語有問題</div>
    <div class="pair-picker" id="pair-picker"></div>
    <div class="report-cats" id="report-cats">
      <label><input type="checkbox" value="讀音／注音錯誤">讀音／注音錯誤</label>
      <label><input type="checkbox" value="文字／錯字">文字／錯字（題目或選項打錯字）</label>
      <label><input type="checkbox" value="答案標示錯誤">答案標示錯誤</label>
      <label><input type="checkbox" value="解釋說明錯誤">解釋說明錯誤</label>
      <label><input type="checkbox" value="其他">其他（請說明）</label>
    </div>
    <textarea class="report-note" id="report-note" placeholder="說明錯誤（可不填）"></textarea>
    <div class="report-btns">
      <button class="report-btn-cancel" onclick="closeReport()">取消</button>
      <button class="report-btn-send" onclick="submitReport()">確認回報</button>
    </div>
  </div>
</div>
```

> 5 個分類值必須與 `error-reports.html` 顯示用的紅色標籤完全一致（含全形／符號），否則管理後台無法正確歸類。`categories` 是陣列且可能為空（學生不勾選也能送出），收到後存入 Firebase `/error_reports/{key}/categories`。

## 響應式設計（13吋 iPad，≥1000px）

每個遊戲都必須加入以下 media query，讓 13 吋 iPad 顯示正常（主要是 `max-width` 從 480px 擴大至 720px）：

```css
@media (min-width: 1000px) {
  .main         { max-width:720px; padding:22px 20px 60px; }
  header        { padding:18px 28px 16px; }
  .btn-home     { font-size:30px; }
  .hdr-title    { font-size:26px; letter-spacing:4px; }
  .star-pill    { font-size:22px; padding:8px 18px; }
  .progress-text{ font-size:18px; }
  /* 題目區、選項、按鈕等各遊戲類型自行依比例放大約 40-50% */
  .btn-report   { font-size:20px; padding:9px 22px; }
  .report-box   { max-width:520px; }
  .report-title { font-size:24px; }
}
```

## 排行榜正確率計算

> 正確率顯示「近20場平均」，不是歷史最高。

- **leaderboard.html** `recentAccuracy()`：`records.slice(-20)` 的 `acc` 平均值
- **index.html** 統計卡片「近20場正確率」：同樣取最後 20 筆
- 每次開啟排行榜時自動同步到 Firebase `acc` 欄位

## 錯題本（mistakes.html）架構

mistakes.html 是獨立的錯題複習系統，**不需要每次新增遊戲時修改**，自動讀取 localStorage `xr_mistakes`。

### 色彩主調（柔和暖灰系）
- Header / Tab bar：`#7a6060` / `#6b5252`
- Body background：`#f5f2f0`
- 強調色：`#7a6060`
- 錯誤回饋：`#c0392b`、`#e74c3c`

### 5 種複習模式
| 模式 | 特色 |
|------|------|
| A 闖關 | 分組（每6題），MCQ，答錯重考 |
| B 翻翻看 | 翻牌自評，知道/不知道 |
| C 四選一砲轟 | MCQ 快速連發，答錯放回末端 |
| D 限時全掃 | 倒數計時 MCQ，時間到結算 |
| E 看義默寫 | Canvas 手寫，自我評分 |

### ziyin 錯題特殊欄位
```javascript
recordMistake(item.char, item.meaning, item.phrase, item.correct);
// 存入: { word:'殆', question:'消耗「殆」盡', correct:'ㄉㄞˋ', ... }
```
新增 ziyin 類型遊戲時必須同樣傳入 `correct`，否則答案欄顯示字而非注音。

## 實作指南

詳細的樣板程式碼請參考 `references/boilerplate.md`（共用系統）和 `references/game-types.md`（各類型模板）。

### 工作流程

1. **提取題目資料** → 整理成對應格式的 JS 陣列
2. **從 `references/game-types.md` 取得對應模板**
3. **填入**：題目資料、GAME_ID、GAME_SOURCE、主題色、單元標題
4. **插入**共用系統程式碼（從 `references/boilerplate.md`）
5. **加入錯誤回報系統**（CSS + HTML overlay + JS 函式）
6. **加入 1000px media query**
7. **輸出**完整 HTML 檔案，命名為 `unit{X}-{type}.html`
8. **更新 index.html**：
   - 加入新遊戲卡片（2欄格式，含 `data-unit` + `data-gid`）
   - 更新 `GAME_LABELS`
   - 更新 `GID_TO_UNIT`
9. **更新所有現有遊戲**的 `GAME_LABELS`
10. **Git commit & push**

### 題目資料品質確認

- 干擾選項（opts）必須是形近字或同音字，不能隨機
- 4個選項中正確答案只有1個
- 填空題的詞語庫要確保題數 ≤ 詞語數
- 字音題的錯誤選項要是容易混淆的注音
- 連連看 meaning 欄位要完整，不只解釋單一難字
- **find-wrong（找錯別字）**：`wrong` 欄位必須與 `full` 只差一個字（即 `wrongChar` 那個位置），其餘字元完全相同。例如 `full:'晶瑩剔透'`、`wrongChar:'晶'`，則 `wrong` 應為 `'精瑩剔透'`，不能是 `'精瑩別透'`（兩個字都不同）。
- **bopomo（字音辨字）**：`correct` 欄位依課本用字，不一定是最常見寫法（如「擣藥」而非「搗藥」）。

### fill-in（填空）遊戲必加：詞庫隨機洗牌

每個填空遊戲的詞庫（word-bank）**必須在頁面載入時隨機打亂**，防止學生依序抄答案。在 `DOMContentLoaded` 中加入：

```javascript
// 單一詞庫（id="bank1"）
document.addEventListener('DOMContentLoaded',()=>{
  if(isLocked()) showLockOverlay();
  const b=document.getElementById('bank1');
  const c=[...b.children];
  for(let i=c.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));b.appendChild(c[j]);c.splice(j,1);}
});

// 多個詞庫（id="bank1","bank2"...）
document.addEventListener('DOMContentLoaded',()=>{
  if(isLocked()) showLockOverlay();
  ['bank1','bank2'].forEach(id=>{const b=document.getElementById(id);if(!b)return;const c=[...b.children];for(let i=c.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));b.appendChild(c[j]);c.splice(j,1);}});
});
```

### 測試前必做

- [ ] 點選選項有回饋（正確/錯誤動畫）
- [ ] TTS 發音正常
- [ ] 星星計算正確（完美 +20，有錯 +10）
- [ ] 完成後出現結果畫面
- [ ] 鎖定覆蓋層正常顯示
- [ ] ⚠️ 回報按鈕可以開啟 overlay，5 個分類 checkbox 正常勾選／重置
- [ ] MCQ 類型（fix-wrong/find-wrong/bopomo/ziyin）：答案揭曉層內的「這題有問題？回報」連結可正常開啟 overlay 並帶出當題內容
- [ ] 13吋 iPad（≥1000px）版面正常放大
- [ ] 填空遊戲：每次重新整理詞庫順序不同（洗牌有效）

## 色彩主題參考

| 單元 | 主色 | 漸層 |
|------|------|------|
| 第六單元 | 藍紫 | `#667eea → #764ba2` |
| 第七單元填空 | 翠綠 | `#27ae60 → #2ecc71` |
| 第七單元作業改錯字 | 橙紅 | `#e67e22 → #e74c3c` |
| 第七單元作業字音 | 藍 | `#2980b9 → #3498db` |
| 第七單元作業字彙 | 紫 | `#8e44ad → #9b59b6` |
| 第八單元（預設） | 青綠 | `#16a085 → #1abc9c` |
