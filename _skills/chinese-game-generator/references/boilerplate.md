# 共用樣板程式碼

所有遊戲共享以下系統。直接複製並填入 GAME_ID / GAME_SOURCE / GAME_LABELS。

## HTML 頂部標準結構

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<title>【遊戲標題】</title>
<style>
* { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
body { font-family:"標楷體","DFKai-SB",serif; background:#f0f4f8; margin:0; padding:0 0 40px; color:#222; }

/* Header */
header {
  background:linear-gradient(135deg,【主色1】,【主色2】);
  color:#fff; padding:14px 16px 12px;
  display:flex; align-items:center; justify-content:space-between;
}
.hdr-left h1 { margin:0; font-size:20px; letter-spacing:2px; }
.hdr-left p  { margin:3px 0 0; font-size:12px; opacity:.8; }
.hdr-badge {
  background:rgba(255,255,255,.2); border-radius:20px;
  padding:6px 14px; font-size:20px; font-weight:bold; white-space:nowrap;
}
.btn-home {
  background:rgba(255,255,255,.2); border:none; border-radius:8px;
  color:#fff; font-size:20px; padding:7px 9px; cursor:pointer;
  text-decoration:none; flex-shrink:0; line-height:1;
}

/* Lock overlay */
#lock-overlay {
  display:none; position:fixed; inset:0;
  background:rgba(0,0,0,.65); align-items:center; justify-content:center; z-index:999;
}
.lock-box {
  background:#fff; border-radius:20px; padding:28px 22px;
  max-width:320px; width:90%; text-align:center;
  box-shadow:0 8px 30px rgba(0,0,0,.3);
}
.lock-box h2 { color:#e74c3c; margin:0 0 10px; font-size:22px; }
.lock-box p  { color:#555; font-size:15px; line-height:1.7; margin:0 0 8px; }
.lock-box .lock-hint { font-size:13px; color:#aaa; }
</style>
</head>
<body>

<header>
  <a href="index.html" class="btn-home" title="回主頁">🏠</a>
  <div class="hdr-left">
    <h1>【遊戲標題】</h1>
    <p>【副標題，如：共 N 題】</p>
  </div>
  <div class="hdr-badge">⭐ <span id="star-display">0</span></div>
</header>

<!-- 鎖定覆蓋層 -->
<div id="lock-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);align-items:center;justify-content:center;z-index:999">
  <div class="lock-box">
    <h2>🔒 關卡已鎖定</h2>
    <p>你已連續兩次完美通關！<br>需要完成其他 <strong><span id="lock-remain">2</span></strong> 個關卡才能解鎖。</p>
    <p class="lock-hint">可前往：<span id="lock-others"></span></p>
  </div>
</div>
```

## 標準 JavaScript 系統（放在 `<script>` 內最前面）

```javascript
// ── 常數 ──
const GAME_ID     = '【填入GAME_ID】';
const GAME_SOURCE = '【填入來源，如：第七單元　作業練習　改錯字】';
const FB_URL      = 'https://xinru-class-default-rtdb.firebaseio.com';
const GAME_LABELS = {
  unit6:'詞語填空', unit6m:'成語連連看',
  u7ziyin:'字音辨正', u7bianzi:'找錯別字',
  u7gaicuo:'改錯字(作業)', u7bopomo:'字音辨字(作業)',
  u7vocab:'字彙練習(作業)', u7chengyu:'成語填空',
  // 加入新遊戲ID
};

// ── 冷卻系統 ──
function getCDs(){return JSON.parse(localStorage.getItem('xr_cooldowns')||'{}');}
function saveCDs(cd){localStorage.setItem('xr_cooldowns',JSON.stringify(cd));}
function isLocked(){const g=getCDs()[GAME_ID];return !!(g&&g.locked&&(g.unlockBy||[]).length<2);}
function reportComplete(perfect){
  const cds=getCDs();
  if(!cds[GAME_ID])cds[GAME_ID]={streak:0,locked:false,unlockBy:[]};
  const me=cds[GAME_ID];
  if(!me.locked){me.streak=perfect?(me.streak||0)+1:0;if(me.streak>=2){me.locked=true;me.unlockBy=[];}}
  Object.keys(cds).forEach(id=>{
    if(id===GAME_ID||!cds[id].locked)return;
    if(!(cds[id].unlockBy||[]).includes(GAME_ID)){
      cds[id].unlockBy=[...(cds[id].unlockBy||[]),GAME_ID];
      if(cds[id].unlockBy.length>=2){cds[id].locked=false;cds[id].streak=0;cds[id].unlockBy=[];}
    }
  });
  saveCDs(cds); pushToCloud();
}
function showLockOverlay(){
  const cds=getCDs(),me=cds[GAME_ID]||{},done=(me.unlockBy||[]).length;
  document.getElementById('lock-remain').textContent=2-done;
  document.getElementById('lock-others').textContent=Object.keys(GAME_LABELS).filter(k=>k!==GAME_ID).map(k=>GAME_LABELS[k]).join('、');
  document.getElementById('lock-overlay').style.display='flex';
}

// ── 星星系統 ──
let sessionStars = 0;
function getStars(){return parseInt(localStorage.getItem('xr_stars')||'0');}
function addStars(n){
  const s=getStars()+n;
  localStorage.setItem('xr_stars',s);
  document.getElementById('star-display').textContent=s;
  sessionStars+=n;
}

// ── Cloud Sync ──
async function pushToCloud(){
  const name=localStorage.getItem('xr_name'); if(!name)return;
  const d={
    stars:getStars(),
    records:JSON.parse(localStorage.getItem('xr_records')||'[]'),
    mistakes:JSON.parse(localStorage.getItem('xr_mistakes')||'{}'),
    cooldowns:getCDs(), updated:Date.now()
  };
  try{await fetch(`${FB_URL}/accounts/${encodeURIComponent(name)}.json`,
    {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});}catch(e){}
}
function recordPlay(stars, accuracy){
  const records=JSON.parse(localStorage.getItem('xr_records')||'[]');
  records.push({game:GAME_ID, stars, accuracy, ts:Date.now()});
  if(records.length>200)records.splice(0,records.length-200);
  localStorage.setItem('xr_records',JSON.stringify(records));
}

// ── 錯題記錄 ──
// 標準版（fill-in / fix-wrong / find-wrong / bopomo）
function recordMistake(word, meaning, question){
  const all=JSON.parse(localStorage.getItem('xr_mistakes')||'{}');
  if(!all[word])all[word]={word,question:question||word,meaning,source:GAME_SOURCE,wrongCount:0,practiceCount:0,lastWrong:'',mastered:false};
  if(question&&!all[word].question)all[word].question=question;
  if(!all[word].source)all[word].source=GAME_SOURCE;
  all[word].wrongCount++;all[word].lastWrong=new Date().toLocaleDateString('zh-TW');
  localStorage.setItem('xr_mistakes',JSON.stringify(all));
}

// ⚠️ ziyin 專用版：必須傳入第4個參數 correct（注音），
//    mistakes.html 的 formatAnswerB() 會優先顯示此欄位
// recordMistake(item.char, item.meaning, item.phrase, item.correct);
// 存入格式：{ word:char, question:phrase, meaning, correct:'ㄉㄞˋ', source, ... }

// ── TTS ──
function speak(text){
  if(!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='zh-TW'; u.rate=0.8; u.pitch=1.0;
  const go=()=>{
    const v=speechSynthesis.getVoices();
    const vv=v.find(x=>x.lang==='zh-TW')||v.find(x=>x.lang.startsWith('zh'));
    if(vv)u.voice=vv; speechSynthesis.speak(u);
  };
  speechSynthesis.getVoices().length?go():(speechSynthesis.onvoiceschanged=go);
}

// ── 初始化 ──
document.getElementById('star-display').textContent=getStars();
document.addEventListener('DOMContentLoaded',()=>{ if(isLocked())showLockOverlay(); });
```

## index.html 新增卡片格式

index.html 現為**可捲動 Tab 列 + 2欄卡片格**設計（2025年5月更新）。
新增卡片時需在 `#unit-card-list` 中對應的單元 section 加入：

```html
<a class="unit-card" href="【檔名】.html" data-unit="【單元數字，如7】" data-gid="【GAME_ID】">
  <div class="card-left">
    <div class="card-icon">【emoji】</div>
    <div class="card-title">【遊戲名稱】</div>
  </div>
  <div class="card-right">
    <div class="card-info">
      <div class="card-desc">共 【N】 題</div>
      <div class="card-tags">
        <span class="ctag">【標籤1】</span>
        <span class="ctag">【標籤2】</span>
      </div>
      <div class="stat-plays"></div>
    </div>
    <div class="card-score"></div>
  </div>
</a>
```

- `data-unit` 控制 Tab 篩選；`data-gid` 對應 `GID_TO_UNIT` 查分數
- `card-score` 和 `stat-plays` 由 JS `updateCardStats()` 自動填入（emoji 臉 + 百分比）
- 新增遊戲後必須同步更新 `GID_TO_UNIT`（見 SKILL.md）

### GID_TO_UNIT 更新

每個新遊戲需在 index.html 的 `GID_TO_UNIT` 中加一筆：
```javascript
const GID_TO_UNIT = {
  unit6:'unit6', unit6m:'unit6-match', u7match:'u7match',
  u7ziyin:'unit7-ziyin', u7bianzi:'unit7-bianzi',
  u7chengyu:'u7chengyu', u7gaicuo:'u7gaicuo',
  u7bopomo:'u7bopomo', u7vocab:'u7vocab',
  // 新遊戲：GAME_ID → records 中 r.unit 的值（通常是 GAME_ID 本身）
};
```

> ⚠️ records 的 `unit` 欄位可能是 GAME_ID 或別名，不一定一致。確認方式：看該遊戲的 `recordPlay()` 傳入什麼值給 `unit`。
> ⚠️ records 中精確度欄位不一致：有些遊戲存 `acc`，有些存 `accuracy`。index.html 讀取時用 `r.acc ?? r.accuracy ?? 0`。

## 批次更新 GAME_LABELS（Bash）

```bash
cd "C:\Users\Charlie_Chiu\xinru-worksheets"
# 在所有已有 GAME_LABELS 的遊戲檔中加入新ID（用 sed 替換最後一個項目後加新項）
for f in unit6.html unit6-match.html unit7-*.html; do
  sed -i "s/u7chengyu:'成語填空'/u7chengyu:'成語填空',【新ID】:'【新名稱】'/" "$f"
done
```

## 完成後 Git 標準流程

```bash
cd "C:\Users\Charlie_Chiu\xinru-worksheets"
git add 【新檔案】.html index.html unit6.html unit6-match.html unit7-*.html
git commit -m "Add 【遊戲名稱】 game (【題數】 items)"
git push origin main
```
