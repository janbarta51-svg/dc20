from pathlib import Path
import re


def one(text, old, new, label):
    if text.count(old) != 1:
        raise SystemExit(f'{label}: expected 1 match, got {text.count(old)}')
    return text.replace(old, new, 1)

# index.html
p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = one(s,
    '<a href="#commander" data-route="commander">Commander</a>',
    '<a href="#champion" data-route="champion">Champion</a>',
    'Champion nav')
s = one(s,
    '<nav class="nav-cluster nav-right" aria-label="Primary navigation right">\n      <a href="#spellblade" data-route="spellblade">Spellblade</a>',
    '<nav class="nav-cluster nav-right" aria-label="Primary navigation right">\n      <a href="#sorcerer" data-route="sorcerer">Sorcerer</a>\n      <a href="#spellblade" data-route="spellblade">Spellblade</a>',
    'Sorcerer nav')
s = one(s,
    '<script src="assets/js/rules-data.js"></script>\n  <script src="assets/js/cms-fix.js"></script>',
    '<script src="assets/js/rules-data.js"></script>\n  <script src="assets/js/classes-extra.js"></script>\n  <script src="assets/js/cms-fix.js"></script>',
    'classes-extra script')
p.write_text(s, encoding='utf-8')

# app.js
p = Path('assets/js/app.js')
s = p.read_text(encoding='utf-8')
s = one(s,
    "  let spellbladeSchools = [];\n  try { selections = JSON.parse(store.get('dc20-selections','{}') || '{}'); } catch(e){}",
    "  let spellbladeSchools = [];\n  let sorcererSource = store.get('dc20-sorcerer-source','Arcane') || 'Arcane';\n  if(!['Arcane','Divine','Primal'].includes(sorcererSource)) sorcererSource='Arcane';\n  try { selections = JSON.parse(store.get('dc20-selections','{}') || '{}'); } catch(e){}",
    'Sorcerer source state')
s = one(s,
    "return ['home','character','combo','combat','cleric','commander','spellblade','toolkit','gangcyklopedie','postavy','kronika'].includes(h)?h:'home';",
    "return ['home','character','combo','combat','cleric','champion','sorcerer','spellblade','toolkit','gangcyklopedie','postavy','kronika'].includes(h)?h:'home';",
    'route whitelist')
s = one(s,
    "const pdfs=[\n      ['Cleric','assets/references/DC20_Cleric_Class_Reference.pdf'],\n      ['Commander','assets/references/DC20_Commander_Class_Reference.pdf'],\n      ['Spellblade','assets/references/DC20_Spellblade_Class_Reference.pdf']\n    ];",
    "const pdfs=[\n      ['Cleric','assets/references/DC20_Cleric_Class_Reference.pdf'],\n      ['Champion','assets/references/DC20_Champion_Class_Reference.pdf'],\n      ['Sorcerer','assets/references/DC20_Sorcerer_Class_Reference.pdf'],\n      ['Spellblade','assets/references/DC20_Spellblade_Class_Reference.pdf']\n    ];",
    'home PDFs')

start = s.find('  function classAside(cls,c){')
end = s.find('\n  function renderClass(cls){', start)
if start < 0 or end < 0:
    raise SystemExit('classAside block not found')
new_aside = '''  function classAside(cls,c){
    const art = CLASS_ART[cls];
    const buildText = (cls==='spellblade' || cls==='sorcerer') ? t('buildPanelSpellText') : t('buildPanelText');
    const cheatPaths={
      cleric:'assets/references/Cleric_Turn_Cheat_Sheet.pdf',
      spellblade:'assets/references/Spellblade_Turn_Cheat_Sheet.pdf'
    };
    const referencePaths={
      champion:'assets/references/DC20_Champion_Class_Reference.pdf',
      sorcerer:'assets/references/DC20_Sorcerer_Class_Reference.pdf'
    };
    const cheatIcon=`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 5h23l12 12v38a4 4 0 01-4 4H16a4 4 0 01-4-4V9a4 4 0 014-4z"/><path d="M39 5v14h12"/><path d="M22 31h20M22 39h14M22 47h18"/><path d="M18 31h.1M18 39h.1M18 47h.1"/></svg>`;
    const artBlock = art ? `<section class="aside-art">
        <div class="eyebrow">${esc(t('artLabel'))}</div>
        <img src="${esc(art.img)}" alt="${esc(art.title[lang] || art.title.en)}">
        <div class="aside-copy"><h3>${esc(art.title[lang] || art.title.en)}</h3><p>${esc(art.text[lang] || art.text.en)}</p></div>
        ${cheatPaths[cls]?`<a class="pdf-download-card class-cheat-download" href="${esc(cheatPaths[cls])}" download><span class="pdf-download-icon">${cheatIcon}</span><span class="pdf-download-copy"><strong>Cheat Sheet</strong><small>${esc(c.name)} · PDF</small></span><span class="pdf-download-arrow">↓</span></a>`:''}
      </section>` : `<section class="aside-art class-reference-aside">
        <div class="eyebrow">CLASS REFERENCE</div>
        <div class="aside-copy"><h3>${esc(c.name)}</h3><p>${esc(pick(c.tagline))}</p></div>
        ${referencePaths[cls]?`<a class="pdf-download-card class-cheat-download" href="${esc(referencePaths[cls])}" download><span class="pdf-download-icon">${cheatIcon}</span><span class="pdf-download-copy"><strong>Class Reference</strong><small>${esc(c.name)} · PDF</small></span><span class="pdf-download-arrow">↓</span></a>`:''}
      </section>`;
    return `<aside class="class-aside">${artBlock}<section class="side-panel"><h4>${esc(t('buildPanelTitle'))}</h4><p>${esc(buildText)}</p><ul><li>${esc(t('storedNotice'))}</li><li>${esc(c.level1.training)}</li><li>${esc(`${t('spells')}: ${c.level1.spells} • ${t('maneuvers')}: ${c.level1.maneuvers}`)}</li></ul></section></aside>`;
  }
'''
s = s[:start] + new_aside + s[end:]

s = one(s,
    "if(cls==='cleric') html += renderSpellSelector(cls,R.spells.filter(s=>s.source.split(',').map(x=>x.trim()).includes('Divine')));\n    if(cls==='commander') html += `<section class=\"section\"><div class=\"callout\">${esc(t('noClassSpells'))}</div></section>` + renderManeuverSelector(cls,R.maneuvers);\n    if(cls==='spellblade') html += renderSpellbladePicker() + renderSpellbladeSelectors();",
    "if(cls==='cleric') html += renderSpellSelector(cls,R.spells.filter(s=>s.source.split(',').map(x=>x.trim()).includes('Divine')));\n    if(cls==='champion') html += renderManeuverSelector(cls,R.maneuvers);\n    if(cls==='sorcerer') html += renderSorcererPicker() + renderSorcererSelectors();\n    if(cls==='spellblade') html += renderSpellbladePicker() + renderSpellbladeSelectors();",
    'class selectors')

marker = '  function renderSpellbladePicker(){\n'
if marker not in s:
    raise SystemExit('renderSpellbladePicker marker missing')
helpers = '''  function renderSorcererPicker(){
    const sources=['Arcane','Divine','Primal'];
    const note=lang==='en'?'Choose the single Spell Source granted by your Sorcerer Spellcasting Path.':'Vyber jeden Spell Source, který ti dává Sorcerer Spellcasting Path.';
    return `<section class="section spell-access"><div class="section-head"><h2>${esc(`Sorcerer ${t('spellListTitle')}`)}</h2></div><p>${esc(note)}</p><div class="school-picker" id="sorcererSourcePicker">${sources.map(source=>`<label class="school-pill"><input type="radio" name="sorcerer-source" value="${source}" ${sorcererSource===source?'checked':''}><span>${source}</span></label>`).join('')}</div></section>`;
  }
  function sorcererAllowed(){
    return R.spells.filter(s=>String(s.source||'').split(',').map(x=>x.trim()).includes(sorcererSource));
  }
  function renderSorcererSelectors(){
    return `<div id="sorcererSelectors">${renderSpellSelector('sorcerer',sorcererAllowed())}</div>`;
  }

'''
s = s.replace(marker, helpers + marker, 1)

old_bind = "    $$('.level-jump',app).forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'})));\n    if(cls==='spellblade'){"
new_bind = "    $$('.level-jump',app).forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'})));\n    if(cls==='sorcerer'){\n      $$('#sorcererSourcePicker input',app).forEach(rb=>rb.addEventListener('change',()=>{\n        if(!rb.checked) return;\n        sorcererSource=rb.value;\n        store.set('dc20-sorcerer-source',sorcererSource);\n        const holder=$('#sorcererSelectors');\n        if(holder){ holder.innerHTML=renderSpellSelector('sorcerer',sorcererAllowed()); bindSelector(holder); decorateGlossary(holder); }\n      }));\n    }\n    if(cls==='spellblade'){"
s = one(s, old_bind, new_bind, 'Sorcerer events')

s = one(s,
    "if(baseCls==='cleric') selected=[...selectedSet('cleric')].map(id=>findItem(id,'spell')).filter(Boolean);\n    if(baseCls==='commander') selected=[...selectedSet('commander')].map(id=>findItem(id,'maneuver')).filter(Boolean);",
    "if(baseCls==='cleric') selected=[...selectedSet('cleric')].map(id=>findItem(id,'spell')).filter(Boolean);\n    if(baseCls==='champion') selected=[...selectedSet('champion')].map(id=>findItem(id,'maneuver')).filter(Boolean);\n    if(baseCls==='sorcerer') selected=[...selectedSet('sorcerer')].map(id=>findItem(id,'spell')).filter(Boolean);",
    'selected rules')
s = one(s,
    "else if(['cleric','commander','spellblade'].includes(route)) renderClass(route);",
    "else if(['cleric','champion','sorcerer','spellblade'].includes(route)) renderClass(route);",
    'render class routes')
p.write_text(s, encoding='utf-8')

# styles.css
p = Path('assets/css/styles.css')
s = p.read_text(encoding='utf-8')
s = one(s,
    '.pdf-download-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:17px}',
    '.pdf-download-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:17px}',
    'home PDF grid')
if 'Champion + Sorcerer class reference aside' not in s:
    s += '\n\n/* Champion + Sorcerer class reference aside */\n.class-reference-aside{padding:18px 14px}\n.class-reference-aside .aside-copy{padding-top:0;border-top:0}\n.class-reference-aside .aside-copy h3{font-size:28px;margin-top:4px}\n@media(max-width:1100px){.pdf-download-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}\n@media(max-width:600px){.pdf-download-grid{grid-template-columns:1fr}}\n'
p.write_text(s, encoding='utf-8')

# sw.js
p = Path('sw.js')
s = p.read_text(encoding='utf-8')
s = re.sub(r"const CACHE='[^']+';", "const CACHE='gangsterka-dc20-stable-v3-classes';", s, count=1)
s = one(s,
    "  './assets/js/rules-data.js',\n  './assets/js/cms-fix.js',",
    "  './assets/js/rules-data.js',\n  './assets/js/classes-extra.js',\n  './assets/js/cms-fix.js',",
    'SW extra class data')
s = s.replace("  './assets/references/DC20_Commander_Class_Reference.pdf',\n", '')
s = s.replace("  './assets/references/Commander_Turn_Cheat_Sheet.pdf',\n", '')
s = one(s,
    "  './assets/references/DC20_Cleric_Class_Reference.pdf',\n  './assets/references/DC20_Spellblade_Class_Reference.pdf',",
    "  './assets/references/DC20_Cleric_Class_Reference.pdf',\n  './assets/references/DC20_Champion_Class_Reference.pdf',\n  './assets/references/DC20_Sorcerer_Class_Reference.pdf',\n  './assets/references/DC20_Spellblade_Class_Reference.pdf',",
    'SW class PDFs')
p.write_text(s, encoding='utf-8')

# browser audit routes
p = Path('.github/workflows/site-audit.yml')
s = p.read_text(encoding='utf-8')
s = one(s,
    "'home','character','combo','combat','cleric','commander',\n              'spellblade','toolkit','gangcyklopedie','postavy','kronika'",
    "'home','character','combo','combat','cleric','champion','sorcerer',\n              'spellblade','toolkit','gangcyklopedie','postavy','kronika'",
    'audit routes')
p.write_text(s, encoding='utf-8')

print('Champion/Sorcerer class update applied.')
