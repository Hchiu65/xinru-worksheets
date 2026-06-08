# 各遊戲類型完整模板

每個模板分為三部分：**CSS 差異**、**HTML 結構**、**JS 資料與邏輯**。
共用部分（冷卻系統、星星、Firebase、TTS）一律從 `boilerplate.md` 複製，不在此重複。

---

## 目錄

1. [fill-in — 詞語填空](#1-fill-in)
2. [fix-wrong — 改錯字](#2-fix-wrong)
3. [find-wrong — 找錯別字](#3-find-wrong)
4. [bopomo — 字音辨字](#4-bopomo)
5. [ziyin — 字音辨正](#5-ziyin)
6. [matching — 成語連連看](#6-matching)

---

## 1. fill-in

**特色**：詞語庫晶片 + 題目空格，可多組（多個 word-bank + ol），靜態按鈕一次對答案。

### 主題色

```css
/* 第六單元藍 */
header { background:#2c5f8a; }
.section-title { color:#2c5f8a; border-left:4px solid #2c5f8a; }
.chip { border:2px solid #2c5f8a; }
.chip.selected { background:#2c5f8a; color:#fff; }
.blank.correct { background:#d4edda; border-color:#28a745; color:#155724; }
.blank.wrong   { background:#f8d7da; border-color:#dc3545; color:#721c24; }
.btn-check { background:#2c5f8a; color:#fff; }

/* 第七單元成語填空綠 */
/* 將 #2c5f8a 換成 #27ae60 */
```

### CSS（完整）

```css
* { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
body { font-family:"標楷體","DFKai-SB",serif; font-size:18px; line-height:1.8; background:#f4f6f9; margin:0; padding:0 0 80px; color:#222; }
header { background:【主色】; color:#fff; padding:14px 16px 12px; font-size:22px; letter-spacing:3px; display:flex; align-items:flex-start; gap:12px; }
header .hdr-body { flex:1; text-align:center; }
header small { display:block; font-size:14px; opacity:.75; margin-top:4px; letter-spacing:1px; }
.btn-home { background:rgba(255,255,255,.2); border:none; border-radius:8px; color:#fff; font-size:20px; padding:7px 9px; cursor:pointer; text-decoration:none; flex-shrink:0; line-height:1; margin-top:2px; }
.section { background:#fff; border-radius:12px; margin:16px 12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,.08); }
.section-title { font-size:16px; font-weight:bold; color:【主色】; border-left:4px solid 【主色】; padding-left:10px; margin-bottom:12px; }
.word-bank { display:flex; flex-wrap:wrap; gap:8px; background:#eef2f7; border-radius:8px; padding:10px 12px; margin-bottom:16px; }
.chip { background:#fff; border:2px solid 【主色】; border-radius:20px; padding:6px 14px; font-size:16px; cursor:pointer; transition:background .15s,opacity .15s; user-select:none; -webkit-user-select:none; }
.chip.selected { background:【主色】; color:#fff; }
.chip.used { opacity:.28; pointer-events:none; }
ol { margin:0; padding-left:26px; }
ol li { margin-bottom:10px; font-size:17px; line-height:2; }
.blank { display:inline-block; min-width:96px; height:36px; border-bottom:2.5px solid #555; vertical-align:bottom; margin:0 4px; cursor:pointer; text-align:center; font-size:16px; padding:0 4px; border-radius:4px 4px 0 0; transition:background .15s; }
.blank:empty::after { content:"　　"; opacity:0; }
.blank.correct { background:#d4edda; border-color:#28a745; color:#155724; }
.blank.wrong   { background:#f8d7da; border-color:#dc3545; color:#721c24; }
.toolbar { position:fixed; bottom:0; left:0; right:0; display:flex; gap:12px; padding:12px 16px; background:#fff; border-top:1px solid #ddd; box-shadow:0 -2px 8px rgba(0,0,0,.1); }
.btn { flex:1; padding:14px; border:none; border-radius:10px; font-size:17px; font-family:inherit; cursor:pointer; font-weight:bold; letter-spacing:1px; }
.btn-check { background:【主色】; color:#fff; }
.btn-reset { background:#eee; color:#555; }
#score-display { flex:0 0 auto; display:flex; align-items:center; font-size:18px; font-weight:bold; color:【主色】; min-width:60px; justify-content:center; }
```

### HTML 結構

```html
<header>
  <a href="index.html" class="btn-home">🏠</a>
  <div class="hdr-body">
    【遊戲標題】
    <small>點選詞語 → 點空格填入 ｜ 再點空格可清除 ｜ 🔊 點詞語可聽讀音</small>
  </div>
</header>

<!-- 每組詞語填空 -->
<div class="section">
  <div class="section-title">（一）詞語填空 1　請將下列答案填入正確空格。</div>
  <div class="word-bank" id="bank-1">
    <span class="chip" id="c1-1" data-word="【詞語】" onclick="selectChip(this)">【詞語】</span>
    <!-- 更多詞語... -->
  </div>
  <ol>
    <li>句子（<span class="blank" data-answer="【答案】" onclick="tapBlank(this)"></span>）。</li>
    <!-- 更多題目... -->
  </ol>
</div>
<!-- 若有第二組，複製上方並改 bank-2、c2-x -->

<div class="toolbar">
  <button class="btn btn-check" onclick="checkAll()">對答案</button>
  <div id="score-display"></div>
  <button class="btn btn-reset" onclick="resetAll()">重設</button>
</div>
```

### JS 邏輯

```javascript
// ── 資料 ──
// MEANINGS 對照表（詞語 → 解釋），供 recordMistake 使用
const MEANINGS = {
  '詞語一': '解釋一',
  '詞語二': '解釋二',
};

// ── 互動 ──
let selected = null;
let hadMistake = false;

function getSentence(b) {
  const li = b.closest('li');
  if (!li) return b.dataset.answer;
  const clone = li.cloneNode(true);
  const blk = clone.querySelector('.blank');
  if (blk) blk.textContent = '（＿）';
  const text = clone.textContent.trim();
  const bi = text.indexOf('（＿）');
  if (bi < 0 || text.length <= 18) return text;
  const s = Math.max(0, bi - 6);
  const e = Math.min(text.length, bi + 9);
  return (s > 0 ? '…' : '') + text.slice(s, e) + (e < text.length ? '…' : '');
}

function recordMistake(word, question) {
  const all = JSON.parse(localStorage.getItem('xr_mistakes') || '{}');
  if (!all[word]) all[word] = { word, question: question||word, meaning: MEANINGS[word]||'', source: GAME_SOURCE, wrongCount:0, practiceCount:0, lastWrong:'', mastered:false };
  if (question && !all[word].question) all[word].question = question;
  if (!all[word].source) all[word].source = GAME_SOURCE;
  all[word].wrongCount++;
  all[word].lastWrong = new Date().toLocaleDateString('zh-TW');
  if (MEANINGS[word]) all[word].meaning = MEANINGS[word];
  localStorage.setItem('xr_mistakes', JSON.stringify(all));
}

function selectChip(el) {
  if (el.classList.contains('used')) return;
  speak(el.dataset.word);
  if (selected === el) { el.classList.remove('selected'); selected = null; return; }
  if (selected) selected.classList.remove('selected');
  selected = el;
  el.classList.add('selected');
}

function tapBlank(el) {
  if (selected) {
    if (el.dataset.chipId) returnChip(el.dataset.chipId);
    el.textContent = selected.dataset.word;
    el.dataset.chipId = selected.id;
    selected.classList.add('used');
    selected.classList.remove('selected');
    selected = null;
    el.classList.remove('correct', 'wrong', 'highlight');
  } else if (el.dataset.chipId) {
    returnChip(el.dataset.chipId);
    el.textContent = '';
    delete el.dataset.chipId;
    el.classList.remove('correct', 'wrong');
  }
}

function returnChip(chipId) {
  const chip = document.getElementById(chipId);
  if (chip) chip.classList.remove('used', 'selected');
}

function checkAll() {
  const blanks = document.querySelectorAll('.blank');
  let correct = 0;
  blanks.forEach(b => {
    b.classList.remove('correct', 'wrong');
    const filled = b.dataset.chipId ? document.getElementById(b.dataset.chipId)?.dataset.word : '';
    if (filled && filled === b.dataset.answer) {
      b.classList.add('correct'); correct++;
    } else {
      b.classList.add('wrong');
      hadMistake = true;
      recordMistake(b.dataset.answer, getSentence(b));
    }
  });
  document.getElementById('score-display').textContent = correct + '/' + blanks.length;
  if (correct === blanks.length) reportComplete(!hadMistake);
}

function resetAll() {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('used','selected'));
  document.querySelectorAll('.blank').forEach(b => {
    b.textContent = ''; delete b.dataset.chipId;
    b.classList.remove('correct','wrong','highlight');
  });
  selected = null; hadMistake = false;
  document.getElementById('score-display').textContent = '';
}

document.getElementById('star-display').textContent = getStars();
document.addEventListener('DOMContentLoaded', () => { if (isLocked()) showLockOverlay(); });
```

---

## 2. fix-wrong

**特色**：每題顯示含錯字的詞語（錯字紅色脈衝），四個漢字選項，答錯可重試，答對後進入 feedback 層再繼續。

與 find-wrong 幾乎相同，差別在資料陣列名稱（GAICUO vs BIANZI）和標題文字。

### 主題色

```css
/* 橙紅 */
header { background:linear-gradient(135deg,#e67e22,#c0392b); }
.q-label { color:#e67e22; background:#fff3e0; }
.q-idiom .wrong-char { background:#c0392b; }
.opt-btn.correct { background:#e8f5e9; border-color:#4caf50; }
.correct-reveal { background:#e8f5e9; color:#2e7d32; }
.fb-next { background:linear-gradient(135deg,#e67e22,#c0392b); }
.done-btn { background:linear-gradient(135deg,#e67e22,#c0392b); }
.done-btn.secondary { background:#fff3e0; color:#e67e22; }
```

### HTML 結構

```html
<header>
  <div class="hdr-left">
    <a class="btn-home" href="index.html">🏠</a>
    <div class="hdr-title">【遊戲標題】・第X單元</div>
  </div>
  <div class="hdr-right">
    <div class="progress-text" id="prog-text">1 / 【N】</div>
    <div class="star-pill">⭐ <span id="star-display">0</span></div>
  </div>
</header>
<div class="prog-bar-wrap"><div class="prog-bar" id="prog-bar" style="width:0%"></div></div>

<div class="main">
  <div class="q-card">
    <div class="q-num" id="q-num">第 1 題 / 共 【N】 題</div>
    <div class="q-label">🔍 紅色的字寫錯了，選出正確的字！</div>
    <div class="q-idiom" id="q-idiom"></div>
    <div class="q-instruction">（點選下方正確的字來替換紅色的錯別字）</div>
    <div class="correct-reveal" id="correct-reveal"></div>
  </div>
  <div class="opts-grid" id="opts-grid"></div>
</div>

<!-- Feedback 層 -->
<div id="feedback">
  <div class="fb-box">
    <div class="fb-icon" id="fb-icon"></div>
    <div class="fb-title" id="fb-title"></div>
    <div class="fb-stars" id="fb-stars"></div>
    <div class="fb-idiom" id="fb-idiom"></div>
    <div class="fb-detail" id="fb-detail"></div>
    <button class="fb-next" onclick="nextQ()">繼續 →</button>
    <button onclick="showReport()" style="margin-top:10px;background:none;border:none;color:#999;font-size:13px;font-family:inherit;text-decoration:underline;cursor:pointer;">⚠️ 這題有問題？回報</button>
  </div>
</div>

<!-- 完成畫面 -->
<div id="done-screen">
  <div class="done-box">
    <div class="done-icon">🏆</div>
    <div class="done-title">改錯字完成！</div>
    <div class="done-score" id="done-score"></div>
    <div class="done-stars" id="done-stars"></div>
    <button class="done-btn" onclick="replay()">🔁 再玩一次</button>
    <a class="done-btn secondary" href="index.html">🏠 回主頁</a>
  </div>
</div>
```

### JS 資料格式

```javascript
const GAICUO = [
  { wrong:'長袍馬掛', wrongChar:'掛', correct:'褂', full:'長袍馬褂',
    meaning:'舊時中國男子傳統服裝', opts:['褂','卦','括','刮'] },
  // opts[0] 必須是正確答案，其餘是形近字干擾
];
```

### JS 邏輯

```javascript
let order=[], idx=0, sessionStars=0, mistakeThis=false, totalCorrect=0, anyMistake=false;

function getStars(){return parseInt(localStorage.getItem('xr_stars')||'0');}
function addStars(n){const s=getStars()+n;localStorage.setItem('xr_stars',s);document.getElementById('star-display').textContent=s;sessionStars+=n;}
function recordMistake(word,meaning,question){
  const all=JSON.parse(localStorage.getItem('xr_mistakes')||'{}');
  if(!all[word])all[word]={word,question:question||word,meaning,source:GAME_SOURCE,wrongCount:0,practiceCount:0,lastWrong:'',mastered:false};
  if(question&&!all[word].question)all[word].question=question;
  if(!all[word].source)all[word].source=GAME_SOURCE;
  all[word].wrongCount++;all[word].lastWrong=new Date().toLocaleDateString('zh-TW');
  localStorage.setItem('xr_mistakes',JSON.stringify(all));
}
function shuffle(arr){return [...arr].sort(()=>Math.random()-.5);}

function startGame(){
  if(isLocked()){showLockOverlay();return;}
  order=shuffle([...Array(GAICUO.length).keys()]);
  idx=0;sessionStars=0;totalCorrect=0;anyMistake=false;
  document.getElementById('star-display').textContent=getStars();
  document.getElementById('done-screen').classList.remove('show');
  showQ();
}

function showQ(){
  const item=GAICUO[order[idx]]; mistakeThis=false;
  document.getElementById('prog-text').textContent=`${idx+1} / ${GAICUO.length}`;
  document.getElementById('q-num').textContent=`第 ${idx+1} 題 / 共 ${GAICUO.length} 題`;
  document.getElementById('prog-bar').style.width=`${(idx/GAICUO.length)*100}%`;
  document.getElementById('correct-reveal').classList.remove('show');
  // 錯字用紅色 pulse 標示
  const idiomHtml=item.wrong.split('').map(ch=>ch===item.wrongChar?`<span class="wrong-char">${ch}</span>`:ch).join('');
  document.getElementById('q-idiom').innerHTML=idiomHtml;
  const grid=document.getElementById('opts-grid'); grid.innerHTML='';
  shuffle(item.opts).forEach(opt=>{
    const btn=document.createElement('button');
    btn.className='opt-btn'; btn.textContent=opt;
    btn.onclick=()=>onPick(btn,opt,item); grid.appendChild(btn);
  });
}

function onPick(btn,picked,item){
  const btns=document.querySelectorAll('.opt-btn'); btns.forEach(b=>b.disabled=true);
  if(picked===item.correct){
    btn.classList.add('correct');
    const earned=mistakeThis?3:5; addStars(earned); totalCorrect++; showStarPop(`+${earned}⭐`);
    const cr=document.getElementById('correct-reveal'); cr.textContent=`✅ 正確寫法：${item.full}`; cr.classList.add('show');
    speak(item.full); showFeedback(true,earned,item);
  } else {
    btn.classList.add('wrong');
    if(!mistakeThis){mistakeThis=true;anyMistake=true;recordMistake(item.full,item.meaning,item.wrong);}
    setTimeout(()=>{btn.classList.remove('wrong');btn.disabled=false;btns.forEach(b=>{if(b!==btn)b.disabled=false;});},500);
  }
}

function showFeedback(correct,earned,item){
  document.getElementById('fb-icon').textContent=correct?'🎯':'💪';
  document.getElementById('fb-title').textContent=correct?'答對了！':'繼續加油！';
  document.getElementById('fb-stars').textContent=earned?`+${earned} ⭐`:'';
  document.getElementById('fb-idiom').textContent=item.full;
  document.getElementById('fb-detail').innerHTML=`<b>「${item.wrongChar}」</b> → <b>「${item.correct}」</b><br>${item.meaning}`;
  document.getElementById('feedback').classList.add('show');
}

function nextQ(){
  document.getElementById('feedback').classList.remove('show'); idx++;
  if(idx>=GAICUO.length)showDone(); else showQ();
}

function showDone(){
  document.getElementById('prog-bar').style.width='100%';
  document.getElementById('done-score').textContent=`答對 ${totalCorrect} / ${GAICUO.length} 題`;
  document.getElementById('done-stars').textContent=`本次獲得 ⭐ ${sessionStars}`;
  const recs=JSON.parse(localStorage.getItem('xr_records')||'[]');
  recs.push({game:GAME_ID,stars:sessionStars,accuracy:Math.round(totalCorrect/GAICUO.length*100),ts:Date.now()});
  if(recs.length>200)recs.splice(0,recs.length-200);
  localStorage.setItem('xr_records',JSON.stringify(recs));
  reportComplete(totalCorrect===GAICUO.length&&!anyMistake);
  document.getElementById('done-screen').classList.add('show');
}

function showStarPop(text){const el=document.createElement('div');el.className='star-pop';el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),800);}
function replay(){startGame();}
document.getElementById('star-display').textContent=getStars();
document.addEventListener('DOMContentLoaded',()=>{if(isLocked())showLockOverlay();});
startGame();
```

---

## 3. find-wrong

**find-wrong 與 fix-wrong 幾乎相同**，只有：

| 差異點 | fix-wrong | find-wrong |
|--------|-----------|------------|
| 資料陣列名 | `GAICUO` | `BIANZI` |
| 完成標題 | 改錯字完成！ | 找錯字完成！ |
| 錯題 question | `item.wrong`（題目顯示的詞語） | `item.wrong` |

直接複製 fix-wrong 模板，將所有 `GAICUO` 換成 `BIANZI`，標題改為「找錯別字」即可。

### JS 資料格式

```javascript
const BIANZI = [
  { wrong:'跨下之辱', wrongChar:'跨', correct:'胯', full:'胯下之辱',
    meaning:'忍受極大屈辱（韓信典故）', opts:['胯','誇','垮','夸'] },
];
```

---

## 4. bopomo

**特色**：題目顯示含注音的短語（注音用藍底標示），學生選出對應漢字。

### 主題色

```css
/* 藍 */
header { background:linear-gradient(135deg,#2980b9,#1a5276); }
.q-label { color:#2980b9; background:#ebf5fb; }
.focus-bopomo { background:#2980b9; color:#fff; }
.fb-phrase { color:#2980b9; }
.fb-next { background:linear-gradient(135deg,#2980b9,#1a5276); }
.done-title { color:#2980b9; }
.done-btn { background:linear-gradient(135deg,#2980b9,#1a5276); }
.done-btn.secondary { background:#ebf5fb; color:#2980b9; }
```

### HTML 結構

```html
<header>
  <div class="hdr-left">
    <a class="btn-home" href="index.html">🏠</a>
    <div class="hdr-title">【標題】・第X單元</div>
  </div>
  <div class="hdr-right">
    <div class="progress-text" id="prog-text">1 / 【N】</div>
    <div class="star-pill">⭐ <span id="star-display">0</span></div>
  </div>
</header>
<div class="prog-bar-wrap"><div class="prog-bar" id="prog-bar" style="width:0%"></div></div>

<div class="main">
  <div class="q-card">
    <div class="q-num" id="q-num">第 1 題 / 共 【N】 題</div>
    <div class="q-label">🔤 選出注音對應的正確國字！</div>
    <div class="q-phrase" id="q-phrase"></div>
    <div class="q-meaning" id="q-meaning"></div>
    <div class="correct-reveal" id="correct-reveal"></div>
  </div>
  <div class="opts-grid" id="opts-grid"></div>
</div>

<div id="feedback">
  <div class="fb-box">
    <div class="fb-icon" id="fb-icon"></div>
    <div class="fb-title" id="fb-title"></div>
    <div class="fb-stars" id="fb-stars"></div>
    <div class="fb-phrase" id="fb-phrase"></div>
    <div class="fb-detail" id="fb-detail"></div>
    <button class="fb-next" onclick="nextQ()">繼續 →</button>
    <button onclick="showReport()" style="margin-top:10px;background:none;border:none;color:#999;font-size:13px;font-family:inherit;text-decoration:underline;cursor:pointer;">⚠️ 這題有問題？回報</button>
  </div>
</div>

<div id="done-screen">
  <div class="done-box">
    <div class="done-icon">🎉</div>
    <div class="done-title">字音辨字完成！</div>
    <div class="done-score" id="done-score"></div>
    <div class="done-stars" id="done-stars"></div>
    <button class="done-btn" onclick="replay()">🔁 再玩一次</button>
    <a class="done-btn secondary" href="index.html">🏠 回主頁</a>
  </div>
</div>
```

### JS 資料格式

```javascript
// phrase: 含「ㄅㄆㄇ注音」的短語；correct: 對應漢字；full: 完整詞語
const BOPOMO = [
  { phrase:'時間「ㄘㄨㄥ」促', correct:'倉', full:'時間倉促',
    meaning:'形容時間非常倉促', opts:['倉','槍','蒼','滄'] },
];
// ⚠ opts 包含 correct，共4個；正確答案位置會被 shuffle 打亂
```

### JS 邏輯（bopomo 特有部分）

```javascript
const BOPOMO = [ /* 資料 */ ];
let order=[], idx=0, sessionStars=0, mistakeThis=false, totalCorrect=0, anyMistake=false;
/* getStars / addStars / recordMistake / shuffle 同 fix-wrong */

function startGame(){
  if(isLocked()){showLockOverlay();return;}
  order=shuffle([...Array(BOPOMO.length).keys()]);
  idx=0;sessionStars=0;totalCorrect=0;anyMistake=false;
  document.getElementById('star-display').textContent=getStars();
  document.getElementById('done-screen').classList.remove('show');
  showQ();
}

function showQ(){
  const item=BOPOMO[order[idx]]; mistakeThis=false;
  document.getElementById('prog-text').textContent=`${idx+1} / ${BOPOMO.length}`;
  document.getElementById('q-num').textContent=`第 ${idx+1} 題 / 共 ${BOPOMO.length} 題`;
  document.getElementById('prog-bar').style.width=`${(idx/BOPOMO.length)*100}%`;
  document.getElementById('correct-reveal').classList.remove('show');
  // 「ㄅㄆㄇ」用藍底標示
  const phraseHtml=item.phrase.replace(/「([^」]+)」/,'<span class="focus-bopomo">$1</span>');
  document.getElementById('q-phrase').innerHTML=phraseHtml;
  document.getElementById('q-meaning').textContent=item.meaning;
  const grid=document.getElementById('opts-grid'); grid.innerHTML='';
  shuffle(item.opts).forEach(opt=>{
    const btn=document.createElement('button');
    btn.className='opt-btn'; btn.textContent=opt;
    btn.onclick=()=>onPick(btn,opt,item); grid.appendChild(btn);
  });
}

function onPick(btn,picked,item){
  const btns=document.querySelectorAll('.opt-btn'); btns.forEach(b=>b.disabled=true);
  if(picked===item.correct){
    btn.classList.add('correct');
    const earned=mistakeThis?3:5; addStars(earned); totalCorrect++; showStarPop(`+${earned}⭐`);
    const cr=document.getElementById('correct-reveal'); cr.textContent=`✅ 正確：${item.full}`; cr.classList.add('show');
    speak(item.full); showFeedback(true,earned,item);
  } else {
    btn.classList.add('wrong');
    if(!mistakeThis){mistakeThis=true;anyMistake=true;recordMistake(item.full,item.meaning,item.phrase);}
    setTimeout(()=>{btn.classList.remove('wrong');btn.disabled=false;btns.forEach(b=>{if(b!==btn)b.disabled=false;});},500);
  }
}

function showFeedback(correct,earned,item){
  document.getElementById('fb-icon').textContent=correct?'🎯':'💪';
  document.getElementById('fb-title').textContent=correct?'答對了！':'繼續加油！';
  document.getElementById('fb-stars').textContent=earned?`+${earned} ⭐`:'';
  document.getElementById('fb-phrase').textContent=item.full;
  document.getElementById('fb-detail').innerHTML=`注音：${item.phrase.match(/「([^」]+)」/)[1]}　答案：<b>${item.correct}</b><br>${item.meaning}`;
  document.getElementById('feedback').classList.add('show');
}

function nextQ(){
  document.getElementById('feedback').classList.remove('show'); idx++;
  if(idx>=BOPOMO.length)showDone(); else showQ();
}

function showDone(){
  document.getElementById('prog-bar').style.width='100%';
  document.getElementById('done-score').textContent=`答對 ${totalCorrect} / ${BOPOMO.length} 題`;
  document.getElementById('done-stars').textContent=`本次獲得 ⭐ ${sessionStars}`;
  const recs=JSON.parse(localStorage.getItem('xr_records')||'[]');
  recs.push({game:GAME_ID,stars:sessionStars,accuracy:Math.round(totalCorrect/BOPOMO.length*100),ts:Date.now()});
  if(recs.length>200)recs.splice(0,recs.length-200);
  localStorage.setItem('xr_records',JSON.stringify(recs));
  reportComplete(totalCorrect===BOPOMO.length&&!anyMistake);
  document.getElementById('done-screen').classList.add('show');
}

function showStarPop(text){const el=document.createElement('div');el.className='star-pop';el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),800);}
function replay(){startGame();}
document.getElementById('star-display').textContent=getStars();
document.addEventListener('DOMContentLoaded',()=>{if(isLocked())showLockOverlay();});
startGame();
```

---

## 5. ziyin

**特色**：題目顯示含目標字（橙色標示）的詞語，學生從4個注音中選正確的。選項是注音符號字串，不是漢字。

### 主題色

```css
/* 藍紫 */
header { background:linear-gradient(135deg,#5b6de6,#9b59b6); }
.focus-char { background:#f5a623; color:#fff; }  /* 橙色，不同於 bopomo */
.opt-btn { border:2px solid #dde3ff; font-size:22px; }  /* 選項較小字，因注音較長 */
.opt-btn.correct { background:#e8f5e9; border-color:#4caf50; color:#2e7d32; }
.opt-btn.wrong   { background:#fce4ec; border-color:#ef9a9a; color:#c62828; }
.fb-next { background:linear-gradient(135deg,#5b6de6,#9b59b6); }
.done-title { color:#5b6de6; }
.done-btn { background:linear-gradient(135deg,#5b6de6,#9b59b6); }
.done-btn.secondary { background:#e8eaff; color:#5b6de6; }
```

### HTML 結構（與 bopomo 幾乎相同，差在 q-ask 文字和 fb 內部元素名）

```html
<div class="q-card">
  <div class="q-num" id="q-num"></div>
  <div class="q-phrase" id="q-phrase"></div>  <!-- 含橙色高亮字 -->
  <div class="q-ask">上面「　」內的字，注音是？</div>
  <div class="meaning-box" id="meaning-box"></div>  <!-- 答對後顯示 -->
</div>
<div class="opts-grid" id="opts-grid"></div>  <!-- 4個注音選項 -->

<!-- feedback -->
<div class="fb-box">
  <div class="fb-icon" id="fb-icon"></div>
  <div class="fb-title" id="fb-title"></div>
  <div class="fb-stars" id="fb-stars"></div>
  <div class="fb-meaning" id="fb-meaning"></div>  <!-- ziyin 用 fb-meaning，不是 fb-detail -->
  <button class="fb-next" onclick="nextQ()">繼續 →</button>
  <button onclick="showReport()" style="margin-top:10px;background:none;border:none;color:#999;font-size:13px;font-family:inherit;text-decoration:underline;cursor:pointer;">⚠️ 這題有問題？回報</button>
</div>
```

### JS 資料格式

```javascript
// opts 只含3個錯誤選項；正確答案 correct 會動態加入後 shuffle
const ZIYIN = [
  { phrase:'靜「悄悄」', char:'悄', correct:'ㄑ一ㄠˇ',
    opts:['ㄑ一ㄠˋ','ㄔㄠˇ','ㄑ一ㄠˊ'], meaning:'寂靜無聲' },
];
// ⚠ 注意：ZIYIN 的 opts 只有3個（不含正確），showQ 時用 shuffle([item.correct,...item.opts])
```

### JS 邏輯（ziyin 特有部分）

```javascript
const ZIYIN = [ /* 資料 */ ];
/* state / helpers 同 fix-wrong */

function showQ(){
  const item=ZIYIN[order[idx]]; mistakeThis=false;
  document.getElementById('prog-text').textContent=`${idx+1} / ${ZIYIN.length}`;
  document.getElementById('q-num').textContent=`第 ${idx+1} 題 / 共 ${ZIYIN.length} 題`;
  document.getElementById('prog-bar').style.width=`${(idx/ZIYIN.length)*100}%`;
  // 目標字用橙色標示
  const html=item.phrase.replace(/「([^」]+)」/,'<span class="focus-char">$1</span>');
  document.getElementById('q-phrase').innerHTML=html;
  document.getElementById('meaning-box').classList.remove('show');
  // 4個注音選項（correct + 3 opts，shuffle）
  const allOpts=shuffle([item.correct,...item.opts]);
  const grid=document.getElementById('opts-grid'); grid.innerHTML='';
  allOpts.forEach(opt=>{
    const btn=document.createElement('button');
    btn.className='opt-btn'; btn.textContent=opt;
    btn.onclick=()=>onPick(btn,opt,item); grid.appendChild(btn);
  });
}

function onPick(btn,picked,item){
  const btns=document.querySelectorAll('.opt-btn'); btns.forEach(b=>b.disabled=true);
  if(picked===item.correct){
    btn.classList.add('correct');
    const earned=mistakeThis?3:5; addStars(earned); totalCorrect++; showStarPop(`+${earned}⭐`);
    const mb=document.getElementById('meaning-box');
    mb.textContent=`💡 ${item.char}：${item.meaning}`; mb.classList.add('show');
    showFeedback(true,earned,item);
  } else {
    btn.classList.add('wrong');
    if(!mistakeThis){mistakeThis=true;anyMistake=true;recordMistake(item.char,item.meaning,item.phrase);}
    setTimeout(()=>{btn.classList.remove('wrong');btn.disabled=false;btns.forEach(b=>{if(b!==btn)b.disabled=false;});},500);
  }
}

function showFeedback(correct,earned,item){
  document.getElementById('fb-icon').textContent=correct?'🎯':'💪';
  document.getElementById('fb-title').textContent=correct?'答對了！':'繼續加油！';
  document.getElementById('fb-stars').textContent=earned?`+${earned} ⭐`:'';
  document.getElementById('fb-meaning').innerHTML=`<b>「${item.char}」</b> ${item.correct}<br>意思：${item.meaning}`;
  document.getElementById('feedback').classList.add('show');
}

/* nextQ / showDone / showStarPop / replay 同 fix-wrong，將 GAICUO 換成 ZIYIN */
```

---

## 6. matching

**特色**：兩欄配對（詞語↔意思），支援分輪（每輪 N 對），答對出現 confetti，有 Challenge 計時模式。這是最複雜的遊戲。

### 主題色

```css
/* 藍（同 unit6 色系） */
header { background:#2c5f8a; }
.col-header { color:#2c5f8a; border-bottom:2px solid #2c5f8a; }
.card { border:2.5px solid #b0c8e0; }
.card.selected { background:#dceeff; border-color:#2c5f8a; }
.card.matched { background:#d4edda; border-color:#28a745; }
.btn-primary { background:#2c5f8a; }
```

### HTML 結構

```html
<header>
  <a href="index.html" class="btn-home">🏠</a>
  <div class="hdr-title">
    【遊戲標題】
    <small>共 【N】 組詞語</small>
  </div>
  <div class="hdr-stars">⭐ <span id="star-display">0</span></div>
</header>

<!-- 分輪 Tab（若分多輪） -->
<div class="round-tabs" id="round-tabs"></div>
<div class="progress-bar"><div class="progress-fill" id="prog-fill" style="width:0%"></div></div>

<!-- 配對區 -->
<div class="match-grid">
  <div class="col-header">詞語</div>
  <div class="col-header">意思</div>
  <div id="left-col"></div>
  <div id="right-col"></div>
</div>

<!-- 完成結果 -->
<div class="overlay-screen" id="result-screen">
  <div class="result-box">
    <h2>🎉 完成！</h2>
    <div class="big" id="result-stars"></div>
    <div class="sub" id="result-detail"></div>
    <div class="btn-row">
      <button class="btn-primary" onclick="replayRound()">🔁 再玩</button>
      <a class="btn-secondary" href="index.html">🏠 回主頁</a>
    </div>
  </div>
</div>
```

### JS 資料格式

```javascript
const PAIRS = [
  { word:'囂張跋扈', meaning:'形容人態度傲慢、蠻橫無理，到處橫行霸道' },
  { word:'顛沛流離', meaning:'形容生活困苦，居無定所，到處流浪' },
  // ...
];
const ROUND_SIZE = 6;  // 每輪幾對（建議 5~8，太多螢幕放不下）
```

### JS 邏輯（matching 核心）

```javascript
const PAIRS = [ /* 資料 */ ];
const ROUND_SIZE = 6;

let rounds=[], curRound=0, selCard=null, matchedPairs=0, totalWrong=0;
let sessionStars=0;

function getStars(){return parseInt(localStorage.getItem('xr_stars')||'0');}
function addStars(n){const s=getStars()+n;localStorage.setItem('xr_stars',s);document.getElementById('star-display').textContent=s;sessionStars+=n;}
function recordMistake(word,meaning){
  const all=JSON.parse(localStorage.getItem('xr_mistakes')||'{}');
  if(!all[word])all[word]={word,question:word,meaning,source:GAME_SOURCE,wrongCount:0,practiceCount:0,lastWrong:'',mastered:false};
  if(!all[word].source)all[word].source=GAME_SOURCE;
  all[word].wrongCount++;all[word].lastWrong=new Date().toLocaleDateString('zh-TW');
  localStorage.setItem('xr_mistakes',JSON.stringify(all));
}
function shuffle(arr){return [...arr].sort(()=>Math.random()-.5);}

function startGame(){
  if(isLocked()){showLockOverlay();return;}
  document.getElementById('star-display').textContent=getStars();
  // 分輪
  const shuffled=shuffle([...PAIRS]);
  rounds=[];
  for(let i=0;i<shuffled.length;i+=ROUND_SIZE)
    rounds.push(shuffled.slice(i,i+ROUND_SIZE));
  curRound=0; sessionStars=0; totalWrong=0;
  buildRoundTabs();
  loadRound(0);
}

function buildRoundTabs(){
  const tabs=document.getElementById('round-tabs'); tabs.innerHTML='';
  rounds.forEach((r,i)=>{
    const t=document.createElement('div');
    t.className='round-tab'+(i===0?' active':'');
    t.textContent=`第${i+1}輪`;
    t.onclick=()=>loadRound(i);
    tabs.appendChild(t);
  });
}

function loadRound(ri){
  curRound=ri; matchedPairs=0; selCard=null;
  document.querySelectorAll('.round-tab').forEach((t,i)=>t.classList.toggle('active',i===ri));
  const pairs=rounds[ri];
  const leftCol=document.getElementById('left-col');
  const rightCol=document.getElementById('right-col');
  leftCol.innerHTML=''; rightCol.innerHTML='';
  document.getElementById('prog-fill').style.width='0%';
  // 左欄：詞語（保持原序）
  pairs.forEach((p,i)=>{
    const c=document.createElement('div');
    c.className='card word-card'; c.dataset.idx=i; c.dataset.side='word';
    c.textContent=p.word; c.onclick=()=>onCardClick(c); leftCol.appendChild(c);
  });
  // 右欄：意思（shuffle）
  shuffle([...pairs.keys()]).forEach(i=>{
    const c=document.createElement('div');
    c.className='card mean-card'; c.dataset.idx=i; c.dataset.side='mean';
    c.textContent=pairs[i].meaning; c.onclick=()=>onCardClick(c); rightCol.appendChild(c);
  });
}

function onCardClick(card){
  if(card.classList.contains('matched')||card.classList.contains('disabled'))return;
  if(selCard&&selCard===card){card.classList.remove('selected');selCard=null;return;}
  if(selCard&&selCard.dataset.side===card.dataset.side){
    selCard.classList.remove('selected'); selCard=card; card.classList.add('selected'); return;
  }
  if(selCard){
    const a=selCard,b=card;
    a.classList.remove('selected');
    if(a.dataset.idx===b.dataset.idx){
      // 配對成功
      a.classList.add('matched'); b.classList.add('matched');
      const earned=2; addStars(earned); showStarPop(`+${earned}⭐`,a);
      matchedPairs++;
      document.getElementById('prog-fill').style.width=`${matchedPairs/rounds[curRound].length*100}%`;
      selCard=null;
      if(matchedPairs===rounds[curRound].length)setTimeout(onRoundComplete,500);
    } else {
      // 配對失敗
      a.classList.add('wrong'); b.classList.add('wrong');
      totalWrong++;
      recordMistake(rounds[curRound][parseInt(a.dataset.side==='word'?a.dataset.idx:b.dataset.idx)].word,
        rounds[curRound][parseInt(a.dataset.side==='word'?a.dataset.idx:b.dataset.idx)].meaning);
      setTimeout(()=>{a.classList.remove('wrong');b.classList.remove('wrong');},600);
      selCard=null;
    }
  } else {
    selCard=card; card.classList.add('selected');
    speak(card.dataset.side==='word'?card.textContent:'');
  }
}

function onRoundComplete(){
  const isLast=(curRound===rounds.length-1);
  if(isLast){
    document.getElementById('result-stars').textContent=`⭐ ${sessionStars}`;
    document.getElementById('result-detail').textContent=`總答錯 ${totalWrong} 次`;
    document.getElementById('result-screen').classList.add('show');
    reportComplete(totalWrong===0);
  } else {
    loadRound(curRound+1);
  }
}

function replayRound(){
  document.getElementById('result-screen').classList.remove('show');
  startGame();
}

function showStarPop(text,nearEl){
  const r=nearEl.getBoundingClientRect();
  const el=document.createElement('div');
  el.className='star-pop'; el.textContent=text;
  el.style.left=r.left+r.width/2+'px'; el.style.top=r.top+'px';
  document.body.appendChild(el); setTimeout(()=>el.remove(),900);
}

document.getElementById('star-display').textContent=getStars();
document.addEventListener('DOMContentLoaded',()=>{if(isLocked())showLockOverlay();});
startGame();
```

---

## 快速對照表

| 遊戲類型 | 資料陣列 | 題目顯示 | 選項 | 答案key | recordMistake 參數 |
|---------|---------|---------|------|---------|-------------------|
| fill-in | SENTENCES/WORD_BANK | 填空句 | 晶片 | `data-answer` | `(word, getSentence(b))` |
| fix-wrong | GAICUO | 錯字詞（紅底） | 4漢字 | `item.correct` | `(item.full, item.meaning, item.wrong)` |
| find-wrong | BIANZI | 錯字詞（紅底） | 4漢字 | `item.correct` | `(item.full, item.meaning, item.wrong)` |
| bopomo | BOPOMO | 含注音短語（藍底） | 4漢字 | `item.correct` | `(item.full, item.meaning, item.phrase)` |
| ziyin | ZIYIN | 含目標字詞語（橙底） | 4注音 | `item.correct` | `(item.char, item.meaning, item.phrase)` |
| matching | PAIRS | 兩欄卡片 | 配對 | `idx` 相同 | `(pair.word, pair.meaning)` |
