(() => {
  const R = window.DC20_RULES;
  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
  const app = $('#app');
  const toast = $('#toast');
  const printSheet = $('#printSheet');
  const toTop = $('#toTop');
  const store = {
    get(key,fallback=''){ try { return window.localStorage?.getItem(key) ?? fallback; } catch(e){ return fallback; } },
    set(key,value){ try { window.localStorage?.setItem(key,value); } catch(e){} }
  };

  let lang = store.get('dc20-lang','en') || 'en';
  let theme = store.get('dc20-theme','light') || 'light';
  let gangs = R.fallbackGangcyklopedie;
  let kronika = R.fallbackKronika;
  let postavy = [];
  let selections = {};
  let spellbladeSchools = [];
  try { selections = JSON.parse(store.get('dc20-selections','{}') || '{}'); } catch(e){}
  try { spellbladeSchools = JSON.parse(store.get('dc20-spellblade-schools','[]') || '[]'); } catch(e){}

  document.documentElement.dataset.theme = theme;
  $('#langToggle').textContent = lang.toUpperCase();
  $('#themeToggle').textContent = theme === 'light' ? '☀' : '☾';

  const UI = {
    en:{
      generate:'Generate PDF', selected:'selected', spells:'Spells', maneuvers:'Maneuvers', features:'Class Features', domains:'Divine Domains', disciplines:'Spellblade Disciplines', subclasses:'Subclasses', talents:'Class Talents',
      school:'School', tags:'Tags', cost:'Cost', range:'Range', duration:'Duration', details:'Details', original:'Original English rules text', search:'Search...', all:'All',
      chooseSchools:'Choose exactly 2 Spell Schools. Weapon and Ward tagged Spells are always available.', cms:'This section is prepared for Pages CMS editing.', emptyChronicle:'The Chronicle is empty. Add entries through Pages CMS after the project is on GitHub.',
      noClassSpells:'Commander starts as a Martial class, so this section uses Maneuvers instead of Spells.', characterRules:'Rules for your character', schoolLimit:'Spellblade can have only 2 selected Spell Schools.', clear:'Clear',
      chooseDomains:'Choose the Divine Domains your character actually has. Only checked Domains are exported.', chooseDisciplines:'Choose the Spellblade Disciplines your character actually has. Only checked Disciplines are exported.', chooseSubclass:'Choose your Subclass. Only the checked Subclass is exported.',
      buildPanelTitle:'Build sheet', buildPanelText:'Choose only the options your character really has. The generated PDF stays cleaner and much shorter.', buildPanelSpellText:'Pick your schools, subclass, disciplines, spells, and maneuvers. The export includes only the checked content.',
      artLabel:'Character art', top:'Back to top', levelTraining:'Level 1 training', storedNotice:'Checkbox choices are stored only in this browser.', spellListTitle:'Spell List', printFooter:'Gangsterka'
    },
    cs:{
      generate:'Vygeneruj PDF', selected:'vybráno', spells:'Spelly', maneuvers:'Maneuvers', features:'Schopnosti classy', domains:'Divine Domains', disciplines:'Spellblade Disciplines', subclasses:'Subclassy', talents:'Class Talents',
      school:'School', tags:'Tagy', cost:'Cena', range:'Dosah', duration:'Trvání', details:'Detail', original:'Původní anglický rules text', search:'Hledat...', all:'Vše',
      chooseSchools:'Vyber přesně 2 Spell Schools. Spelly s tagem Weapon nebo Ward jsou dostupné vždy.', cms:'Tato část je připravená pro editaci přes Pages CMS.', emptyChronicle:'Kronika je zatím prázdná. Po nahrání na GitHub sem budeš přidávat záznamy přes Pages CMS.',
      noClassSpells:'Commander začíná jako Martial class, proto zde místo Spellů vybíráš Maneuvers.', characterRules:'Pravidla pro tvoji postavu', schoolLimit:'Spellblade může mít zvolené pouze 2 Spell Schools.', clear:'Vymazat',
      chooseDomains:'Zaškrtni pouze Divine Domains, které tvoje postava skutečně má. Do PDF se vyexportují jen označené.', chooseDisciplines:'Zaškrtni pouze Spellblade Disciplines, které tvoje postava skutečně má. Do PDF se vyexportují jen označené.', chooseSubclass:'Vyber svůj Subclass. Do PDF se vyexportuje pouze označený Subclass.',
      buildPanelTitle:'Přehled buildu', buildPanelText:'Vyber jen možnosti, které tvoje postava opravdu má. Výsledné PDF pak bude čistší a kratší.', buildPanelSpellText:'Vyber školy, subclass, disciplines, spelly a maneuvers. Do exportu se vloží jen zaškrtnutý obsah.',
      artLabel:'Ilustrace postavy', top:'Nahoru', levelTraining:'Level 1 training', storedNotice:'Zaškrtnuté volby se ukládají jen v tomto prohlížeči.', spellListTitle:'Seznam spellů', printFooter:'Gangsterka'
    }
  };
  const t = key => UI[lang][key] || UI.en[key] || key;
  const esc = s => String(s ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const prose = s => esc(s).replace(/\n/g,'<br>');

  // Preserve the rulebook's semantic paragraphs while making its key labels easy to scan.
  const RULE_LABEL_RE = /\b((?:Spell Cast|Check Success|Save Failure|Failure|Success(?:\s*\([^)]+\))?|Critical Success|Critical Failure|Hit|Miss|Trigger|Reaction|Prerequisite|Range|Duration|Damage|Area|Targets?|Distance|Ending [A-Z][A-Za-z’' -]*|[A-Z][A-Za-z0-9’' +/&-]{1,34}(?:\s*\([^)]+\))?):)/g;
  const RULE_START_LABEL_RE = /^(?:Spell Cast|Check Success|Save Failure|Failure|Success(?:\s*\([^)]+\))?|Critical Success|Critical Failure|Hit|Miss|Trigger|Reaction|Prerequisite|Range|Duration|Damage|Area|Targets?|Distance|Ending [A-Z][A-Za-z’' -]*|[A-Z][A-Za-z0-9’' +/&-]{1,34}(?:\s*\([^)]+\))?):/;
  const RULE_SECTION_RE = /^(?:Spell Enhancements?|Maneuver Enhancements?|Attack Enhancements?|Blessings|Curses|Summoned (?:Celestial|Fiend|Undead)|Base Summon Traits|Managing the Summons|Expanded Summon Traits|Unique Traits)$/i;
  function ruleLabelMarkup(text=''){
    return esc(text).replace(RULE_LABEL_RE,'<strong>$1</strong>');
  }
  function formatRuleBody(body='', mode='web'){
    const lines=String(body||'').replace(/\r/g,'').split('\n').map(x=>x.trim()).filter(x=>! /^(?:THE DUNGEON COACH|EON COACH|DUNGEON COACH)$/i.test(x));
    const blocks=[];
    let current='', bullet=false;
    const flush=()=>{
      if(!current) return;
      blocks.push({type:bullet?'bullet':'p',text:current.trim()});
      current='';bullet=false;
    };
    for(const line of lines){
      if(!line){ flush(); continue; }
      if(RULE_SECTION_RE.test(line)){
        flush();blocks.push({type:'heading',text:line});continue;
      }
      if(line.startsWith('•')){
        flush();bullet=true;current=line.replace(/^•\s*/,'');continue;
      }
      if((RULE_START_LABEL_RE.test(line) || /^\(\d+\)\s+[A-Z].*?:/.test(line)) && current){
        flush();current=line;continue;
      }
      current+=(current?' ':'')+line;
    }
    flush();
    const pClass=mode==='print'?'spell-print-paragraph':'rule-paragraph';
    const hClass=mode==='print'?'spell-print-subhead':'rule-subhead';
    return blocks.map(b=>{
      if(b.type==='heading') return `<h4 class="${hClass}">${esc(b.text)}</h4>`;
      if(b.type==='bullet') return `<p class="${pClass} rule-bullet"><span class="rule-bullet-mark">•</span>${ruleLabelMarkup(b.text)}</p>`;
      return `<p class="${pClass}">${ruleLabelMarkup(b.text)}</p>`;
    }).join('');
  }
  const pick = obj => obj?.[lang] ?? obj?.en ?? obj ?? '';
  const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  const CLASS_ART = {
    cleric: {
      img:'assets/media/cleric-art.webp',
      title:{en:'Divine Scholar', cs:'Božský učenec'},
      text:{en:'A calmer divine portrait for the Cleric reference page.', cs:'Klidnější božská ilustrace pro stránku Clerica.'}
    },
    commander: {
      img:'assets/media/commander-art.webp',
      title:{en:'Battle Captain', cs:'Bitevní kapitán'},
      text:{en:'A martial leader with strong battlefield presence.', cs:'Bojový vůdce se silnou přítomností na bojišti.'}
    },
    spellblade: {
      img:'assets/media/spellblade-art.webp',
      title:{en:'Shadow Duelist', cs:'Stínový duelista'},
      text:{en:'A darker silhouette for a mobile spell-and-steel archetype.', cs:'Temnější silueta pro archetyp magie a oceli.'}
    }
  };


  // Short learning tooltips based on the core rules.
  const GLOSSARY = [
    {id:'hp',terms:['Health Points','HP'],title:'Health Points (HP)',en:'Your life total. Starting maximum HP = Class HP + Might + any Ancestry HP. At half HP you are Bloodied; at one quarter you are Well-Bloodied.',cs:'Tvoje životy. Startovní maximum HP = HP z classy + Might + případné HP z Ancestry. Na polovině HP jsi Bloodied, na čtvrtině Well-Bloodied.'},
    {id:'ap',terms:['Action Points','AP'],title:'Action Points (AP)',en:'You normally have a maximum of 4 AP. Spend them on Actions and Reactions; spent AP is not available again until it is regained.',cs:'Běžně máš maximum 4 AP. Utrácíš je za Actions a Reactions; utracené AP nejsou znovu dostupné, dokud se neobnoví.'},
    {id:'mp',terms:['Mana Points','MP'],title:'Mana Points (MP)',en:'The resource used by spells and other MP Effects. A spellcaster regains all spent MP after a Long Rest. MP spent on one effect cannot exceed your Mana Spend Limit.',cs:'Zdroj pro spelly a další MP Effects. Spellcaster obnoví všechna utracená MP po Long Restu. Na jeden efekt nesmíš utratit víc MP než dovoluje Mana Spend Limit.'},
    {id:'sp',terms:['Stamina Points','SP'],title:'Stamina Points (SP)',en:'The martial resource used for Maneuvers and other SP Effects. You regain all spent SP when Combat ends and after a Short Rest; classes can also have their own in-combat Stamina Regen.',cs:'Martial zdroj pro Maneuvers a další SP Effects. Všechna utracená SP obnovíš po skončení Combat a po Short Restu; classy mohou mít navíc vlastní Stamina Regen během boje.'},
    {id:'cm',terms:['Combat Mastery','CM'],title:'Combat Mastery (CM)',en:'Your general combat experience: half your character level, rounded up. It contributes to Attack Checks, Spell Checks, PD, AD, Saves and Save DC.',cs:'Tvoje obecná bojová zkušenost: polovina levelu postavy, zaokrouhlená nahoru. Přidává se k Attack Checks, Spell Checks, PD, AD, Saves a Save DC.'},
    {id:'prime',terms:['Prime Modifier'],title:'Prime Modifier',en:'Equal to your highest Attribute. It is used in many core combat formulas, including Attack, Spell and Martial Checks.',cs:'Je roven tvému nejvyššímu Attribute. Používá se v mnoha základních bojových výpočtech, například Attack, Spell a Martial Checks.'},
    {id:'msl',terms:['Mana Spend Limit','MSL'],title:'Mana Spend Limit (MSL)',en:'Maximum MP you can spend on a single MP Effect, including Spell Enhancements. It equals your Combat Mastery.',cs:'Maximum MP, které můžeš utratit na jeden MP Effect včetně Spell Enhancements. Je rovno Combat Mastery.'},
    {id:'ssl',terms:['Stamina Spend Limit','SSL'],title:'Stamina Spend Limit (SSL)',en:'Maximum SP you can spend on a single SP Effect, including Maneuver and Attack Enhancements. It equals your Combat Mastery.',cs:'Maximum SP, které můžeš utratit na jeden SP Effect včetně Maneuver a Attack Enhancements. Je rovno Combat Mastery.'},
    {id:'restpoints',terms:['Rest Points'],title:'Rest Points',en:'You have Rest Points equal to your maximum HP. During rests, you can spend them to regain 1 HP per Rest Point.',cs:'Máš tolik Rest Points, kolik je tvoje maximum HP. Během odpočinku je můžeš utrácet a za každý obnovit 1 HP.'},
    {id:'quickrest',terms:['Quick Rest'],title:'Quick Rest',en:'At least 10 minutes of No Activity or Light Activity. At the end, you may spend Rest Points to regain HP.',cs:'Alespoň 10 minut No Activity nebo Light Activity. Na konci můžeš utratit Rest Points a obnovit HP.'},
    {id:'shortrest',terms:['Short Rest'],title:'Short Rest',en:'At least 1 hour of No Activity or Light Activity. You can spend Rest Points for HP; some features refresh, and all spent SP is regained.',cs:'Alespoň 1 hodina No Activity nebo Light Activity. Můžeš utratit Rest Points za HP; některé schopnosti se obnoví a obnovíš všechna utracená SP.'},
    {id:'longrest',terms:['Long Rest'],title:'Long Rest',en:'An 8-hour rest: 4 hours of Light Activity and 4 hours of No Activity. A completed Long Rest refreshes features that say so and restores all spent MP.',cs:'Osmihodinový odpočinek: 4 hodiny Light Activity a 4 hodiny No Activity. Dokončený Long Rest obnoví schopnosti, které to uvádějí, a všechna utracená MP.'},
    {id:'training',terms:['Combat Training'],title:'Combat Training',en:'Training lets you use combat equipment effectively. Without the relevant training, armor or shields impose DisADV on Attack and Spell Checks, and untrained Spell Focuses do not grant their properties.',cs:'Training ti umožňuje efektivně používat bojové vybavení. Bez příslušného trainingu dává armor nebo shield DisADV na Attack a Spell Checks a netrénovaný Spell Focus neposkytuje své vlastnosti.'},
    {id:'focus',terms:['Spell Focuses','Spell Focus'],title:'Spell Focus',en:'You must hold it in a hand to gain its properties. Holding one counts as performing Somatic Components. Without Spell Focus training you do not benefit from its properties.',cs:'Musíš ho držet v ruce, abys získal jeho vlastnosti. Držení Spell Focusu se počítá jako provádění Somatic Components. Bez trainingu z jeho vlastností nic nezískáš.'},
    {id:'lightarmor',terms:['Light Armor'],title:'Light Armor',en:'Non-metal armor such as leather, padding or heavy robes. It can be customized for PD, AD or EDR. Donning or doffing it takes 1 minute.',cs:'Nekovové brnění, například kůže, vycpávané oblečení nebo těžké róby. Lze ho upravit pro PD, AD nebo EDR. Obléknutí či sundání trvá 1 minutu.'},
    {id:'heavyarmor',terms:['Heavy Armor'],title:'Heavy Armor',en:'Metal armor built for warfare. It can provide PD/AD and PDR or EDR, with possible drawbacks such as lower Speed or DisADV on Agility Checks. Donning or doffing it takes 10 minutes.',cs:'Kovové brnění určené pro válku. Může poskytovat PD/AD a PDR nebo EDR, případně mít nevýhody jako nižší Speed nebo DisADV na Agility Checks. Obléknutí či sundání trvá 10 minut.'},
    {id:'lightshield',terms:['Light Shields','Light Shield'],title:'Light Shield',en:'A simple shield such as a buckler. A shield occupies one hand and can improve PD and/or AD depending on its properties.',cs:'Jednoduchý štít, například buckler. Shield zabírá jednu ruku a podle vlastností může zvyšovat PD a/nebo AD.'},
    {id:'heavyshield',terms:['Heavy Shields','Heavy Shield'],title:'Heavy Shield',en:'A warfare shield such as a kite or tower shield. It can provide larger defense bonuses but may reduce Speed and impose DisADV on Agility Checks.',cs:'Válečný štít, například kite nebo tower shield. Může dát větší obranné bonusy, ale také snížit Speed a dát DisADV na Agility Checks.'},
    {id:'weapon',terms:['Weapons','Weapon'],title:'Weapon',en:'Martial equipment used for attacks. Combat Training determines whether you can fully use its Weapon Enhancements.',cs:'Martial vybavení používané k útokům. Combat Training určuje, zda můžeš plně používat jeho Weapon Enhancements.'},
    {id:'maneuver',terms:['Maneuvers','Maneuver'],title:'Maneuver',en:'A martial technique. Many Maneuvers cost SP, and the SP spent on one effect is limited by your Stamina Spend Limit.',cs:'Martial technika. Mnoho Maneuvers stojí SP a množství SP na jeden efekt omezuje Stamina Spend Limit.'},
    {id:'spellcheck',terms:['Spell Checks','Spell Check'],title:'Spell Check',en:'Roll d20 + Prime Modifier + Combat Mastery. Spell Checks are commonly used when a spell is not resolved as an Attack.',cs:'Hoď d20 + Prime Modifier + Combat Mastery. Spell Checks se běžně používají, když se spell nevyhodnocuje jako Attack.'},
    {id:'martialcheck',terms:['Martial Checks','Martial Check'],title:'Martial Check',en:'Roll d20 + Prime Modifier + Combat Mastery. Martial Checks are commonly used by Maneuvers that are not Attacks.',cs:'Hoď d20 + Prime Modifier + Combat Mastery. Martial Checks se běžně používají u Maneuvers, které nejsou Attacks.'},
    {id:'attackcheck',terms:['Attack Checks','Attack Check'],title:'Attack Check',en:'Roll d20 + Prime Modifier + Combat Mastery when making an Attack.',cs:'Při Attacku hoď d20 + Prime Modifier + Combat Mastery.'},
    {id:'savedc',terms:['Save DC'],title:'Save DC',en:'The difficulty an opposing Save must meet. Combat Mastery contributes to your Save DC.',cs:'Obtížnost, kterou musí soupeřův Save překonat. Do Save DC se započítává Combat Mastery.'},
    {id:'pd',terms:['Precision Defense','PD'],title:'Precision Defense (PD)',en:'Defense used against precision-style attacks. Character creation formula: 8 + CM + Agility + Intelligence + bonuses.',cs:'Defense používaná proti přesně mířeným útokům. Základní vzorec postavy: 8 + CM + Agility + Intelligence + bonusy.'},
    {id:'ad',terms:['Area Defense','AD'],title:'Area Defense (AD)',en:'Defense used against area-style attacks. Character creation formula: 8 + CM + Might + Charisma + bonuses.',cs:'Defense používaná proti plošným útokům. Základní vzorec postavy: 8 + CM + Might + Charisma + bonusy.'},
    {id:'pdr',terms:['PDR'],title:'Physical Damage Reduction (PDR)',en:'Damage Reduction against Physical damage. It commonly comes from Heavy Armor, Heavy Shields or other features.',cs:'Damage Reduction proti Physical damage. Často pochází z Heavy Armor, Heavy Shields nebo jiných schopností.'},
    {id:'edr',terms:['EDR'],title:'Elemental Damage Reduction (EDR)',en:'Damage Reduction against Elemental damage. Some armor and shields can grant it.',cs:'Damage Reduction proti Elemental damage. Některé armor a shields ho mohou poskytovat.'},
    {id:'mdr',terms:['MDR'],title:'Mystical Damage Reduction (MDR)',en:'Damage Reduction against Mystical damage. It is less common and usually comes from a feature or a special property.',cs:'Damage Reduction proti Mystical damage. Je méně běžná a většinou pochází ze schopnosti nebo speciální vlastnosti.'},
    {id:'adv',terms:['ADV'],title:'ADV',en:'Advantage. A beneficial modifier to a Check or Save.',cs:'Advantage. Výhoda na Check nebo Save.'},
    {id:'disadv',terms:['DisADV'],title:'DisADV',en:'Disadvantage. A harmful modifier to a Check or Save; the opposite of ADV.',cs:'Disadvantage. Nevýhoda na Check nebo Save; opak ADV.'},
    {id:'reaction',terms:['Reactions','Reaction'],title:'Reaction',en:'An Action taken during another creature’s turn when its trigger and prerequisites are met. AP spent on Reactions reduces what you have available on your next turn until it is regained.',cs:'Action provedená během tahu jiné bytosti, pokud splníš trigger a prerequisites. AP utracená za Reactions ti budou chybět v příštím tahu, dokud se neobnoví.'},
    {id:'helpdie',terms:['Help Die'],title:'Help Die',en:'A die granted to help another creature with a declared Check. The normal Help Action grants a d8 Help Die, which is consumed when used.',cs:'Kostka udělená na pomoc jiné bytosti s předem určeným Checkem. Běžná Help Action dává d8 Help Die, která se po použití spotřebuje.'},
    {id:'bloodied',terms:['Bloodied'],title:'Bloodied',en:'You are Bloodied when current HP is at or below half of maximum HP.',cs:'Jsi Bloodied, když máš aktuální HP na polovině maxima nebo níž.'},
    {id:'wellbloodied',terms:['Well-Bloodied'],title:'Well-Bloodied',en:'You are Well-Bloodied when current HP is at or below one quarter of maximum HP.',cs:'Jsi Well-Bloodied, když máš aktuální HP na čtvrtině maxima nebo níž.'},
    {id:'deathdoor',terms:["Death’s Door","Death's Door"],title:"Death's Door",en:'At 0 HP or lower you are on Death’s Door. Your current and maximum AP are reduced by 3 and you make a DC 10 Death Save at the start of each turn until restored above 0 HP.',cs:'Při 0 HP nebo méně jsi na Death’s Door. Tvoje aktuální i maximální AP se sníží o 3 a na začátku každého tahu házíš DC 10 Death Save, dokud se nevrátíš nad 0 HP.'},
    {id:'spellduel',terms:['Spell Duel'],title:'Spell Duel',en:'A Spellcasting reaction used to challenge an MP Effect. The Challenger spends matching base AP and at least 1 MP, then contests the caster with a Spell Check.',cs:'Spellcasting Reaction pro zastavení MP Effectu. Challenger utratí odpovídající základní AP a alespoň 1 MP a poté soupeří s casterem pomocí Spell Checku.'},
    {id:'somatic',terms:['Somatic Components','Somatic Component'],title:'Somatic Components',en:'The physical motions required to cast a spell. Holding a Spell Focus counts as performing Somatic Components.',cs:'Fyzické pohyby potřebné k seslání spellu. Držení Spell Focusu se počítá jako provádění Somatic Components.'},
    {id:'verbal',terms:['Verbal Components','Verbal Component'],title:'Verbal Components',en:'Magical words or sounds used to cast a spell. Creatures that can hear you notice the casting, and if you cannot speak you cannot cast a spell requiring one.',cs:'Magická slova nebo zvuky používané k seslání spellu. Bytosti, které tě slyší, si sesílání všimnou; pokud nemůžeš mluvit, nemůžeš seslat spell, který je vyžaduje.'},
    {id:'resistance1',terms:['Resistance (1)'],title:'Resistance (1)',en:'Reduce incoming damage of the matching type by 1 before any halving or doubling is applied.',cs:'Sniž příchozí damage odpovídajícího typu o 1 ještě před případným půlením nebo zdvojnásobením.'}
  ];
  GLOSSARY.push(
    {id:'minoraction',terms:['Minor Actions','Minor Action'],title:'Minor Action',en:'Once per turn you may perform up to 2 simple tasks without spending AP, such as opening a door, grabbing an item, or drawing a weapon. You cannot take another Action between those 2 tasks.',cs:'Jednou za tah můžeš provést až 2 jednoduché úkony bez utracení AP, například otevřít dveře, vzít předmět nebo tasit zbraň. Mezi těmito dvěma úkony nemůžeš provést jinou Action.'},
    {id:'attackaction',terms:['Attack Action'],title:'Attack Action',en:'Spend 1 AP to make 1 Attack Check.',cs:'Utrať 1 AP a proveď 1 Attack Check.'},
    {id:'moveaction',terms:['Move Action'],title:'Move Action',en:'Spend 1 AP to move up to your Speed. You may split that movement around another Action.',cs:'Utrať 1 AP a pohni se až o svůj Speed. Pohyb můžeš rozdělit před a po jiné Action.'},
    {id:'disengage',terms:['Disengage'],title:'Disengage',en:'Spend 1 AP to impose DisADV on Opportunity Attacks against you until your next turn. Spend +1 AP for Full Disengage and become immune to them for that duration.',cs:'Za 1 AP dostanou Opportunity Attacks proti tobě DisADV do začátku dalšího tahu. Za +1 AP získáš Full Disengage a jsi vůči nim po tuto dobu imunní.'},
    {id:'dodge',terms:['Full Dodge','Dodge Action','Dodge'],title:'Dodge',en:'Spend 1 AP to impose DisADV on the next Attack or Grapple against you before your next turn. Spend +1 AP for Full Dodge against all of them.',cs:'Za 1 AP dostane příští Attack nebo Grapple proti tobě DisADV do začátku tvého dalšího tahu. Za +1 AP platí Full Dodge proti všem.'},
    {id:'grapple',terms:['Grappled','Grapple'],title:'Grapple',en:'With a free hand, spend 1 AP and make Athletics contested by the target’s Acrobatics or Athletics. On success, the target is Grappled.',cs:'S volnou rukou utrať 1 AP a proveď Athletics proti Acrobatics nebo Athletics cíle. Při úspěchu je cíl Grappled.'},
    {id:'help',terms:['Help Action','Help'],title:'Help',en:'Spend 1 AP to give another creature a d8 Help Die for a declared Attack, Skill Check, or Trade Check until the start of your next turn.',cs:'Za 1 AP dej jiné bytosti d8 Help Die pro předem určený Attack, Skill Check nebo Trade Check do začátku tvého dalšího tahu.'},
    {id:'hide',terms:['Hidden','Hide Action','Hide'],title:'Hide',en:'Spend 1 AP and make a Stealth Check against Passive Awareness of creatures that cannot see you. Success makes you Hidden from those you beat.',cs:'Za 1 AP proveď Stealth Check proti Passive Awareness bytostí, které tě nevidí. Při úspěchu jsi před těmi, které překonáš, Hidden.'},
    {id:'objectaction',terms:['Object Action','Object'],title:'Object Action',en:'Spend 1 AP for a meaningful object interaction such as drinking a potion, working a lock, transferring an item, or throwing an item.',cs:'Za 1 AP proveď významnou interakci s předmětem, například vypij potion, pracuj se zámkem, předej předmět nebo hoď předmět.'},
    {id:'sustain',terms:['Sustained Action','Sustain'],title:'Sustain',en:'Spend 1 AP at the start of each turn to keep a Sustained effect active until your next turn. You cannot Sustain while Dazed.',cs:'Na začátku každého tahu utrať 1 AP, abys udržel Sustained efekt do dalšího tahu. Při Dazed nemůžeš Sustain provádět.'},
    {id:'heldaction',terms:['Held Actions','Held Action'],title:'Held Action',en:'Declare an Action and an observable Trigger, pay the AP now, and take that Action as a Reaction if the Trigger happens before your next turn.',cs:'Urči Action a pozorovatelný Trigger, AP zaplať hned a pokud Trigger nastane před dalším tahem, proveď tuto Action jako Reaction.'},
    {id:'opportunity',terms:['Opportunity Attacks','Opportunity Attack'],title:'Opportunity Attack',en:'Martial Path Reaction: spend 1 AP for a Melee Martial Attack when a visible creature in your melee reach provokes by leaving reach or certain object interactions.',cs:'Reaction pro Martial Path: za 1 AP proveď Melee Martial Attack, když viditelná bytost v tvém melee dosahu vyprovokuje odchodem z dosahu nebo některými interakcemi s předměty.'},
    {id:'combo-maneuver',terms:['Combo Maneuvers','Combo Maneuver'],title:'Combo Maneuver',en:'A Martial Path teamwork Reaction. If you know the SP Effect and are close enough, spend matching base AP to give it +2 to its Check and Save DC, and optionally add SP Enhancements using your own Stamina Spend Limit.',cs:'Týmová Reaction pro Martial Path. Pokud znáš daný SP Effect a jsi dost blízko, zaplať stejné základní AP, dej efektu +2 k Checku a Save DC a případně přidej SP Enhancements podle vlastního Stamina Spend Limitu.'},
    {id:'combo-spell',terms:['Combo Spellcasting','Combo Casting'],title:'Combo Spellcasting',en:'A Spellcasting Path teamwork Reaction. If you know the MP Effect and are within range, spend matching base AP to grant +2 to its Check and Save DC, and optionally contribute MP Enhancements without exceeding the Caster’s Mana Spend Limit in total.',cs:'Týmová Reaction pro Spellcasting Path. Pokud znáš daný MP Effect a jsi v dosahu, zaplať stejné základní AP, dej efektu +2 k Checku a Save DC a případně přidej MP Enhancements; celkové MP však nesmí překročit Mana Spend Limit Castera.'},
    {id:'bleeding',terms:['Bleeding'],title:'Bleeding X',en:'Take X True damage at the start of your turns. Healing ends all stacks; Medicine can also remove stacks.',cs:'Na začátku svých tahů dostaneš X True damage. Jakékoli obnovení HP ukončí všechny stacky; stacky může odstranit i Medicine.'},
    {id:'burning',terms:['Burning'],title:'Burning X',en:'Take X Fire damage at the start of your turns. Water or a nearby creature spending 1 AP can remove it.',cs:'Na začátku svých tahů dostaneš X Fire damage. Odstraní ho voda nebo bytost do 1 Space za 1 AP.'},
    {id:'charmed',terms:['Charmed'],title:'Charmed',en:'The Charmer has ADV on Charisma Checks against you, and you cannot target the Charmer with harmful Attacks or effects.',cs:'Charmer má ADV na Charisma Checks proti tobě a ty ho nemůžeš cílit škodlivými Attacks ani efekty.'},
    {id:'dazed',terms:['Dazed'],title:'Dazed X',en:'You have DisADV X on Mental Checks. Dazed also prevents you from Sustaining effects.',cs:'Máš DisADV X na Mental Checks. Dazed ti také brání udržovat Sustained efekty.'},
    {id:'doomed',terms:['Doomed'],title:'Doomed X',en:'Your current and maximum HP are reduced by X and healing restores X less HP. All stacks end after a Long Rest.',cs:'Tvoje aktuální i maximální HP se sníží o X a léčení obnovuje o X HP méně. Všechny stacky končí po Long Restu.'},
    {id:'exhaustion',terms:['Exhaustion'],title:'Exhaustion X',en:'Penalty X to all Checks and Saves; Speed and Save DC are also reduced by X. Reaching 6 stacks causes death.',cs:'Postih X ke všem Checks a Saves; Speed a Save DC se také sníží o X. Při 6 stackách postava zemře.'},
    {id:'exposed',terms:['Exposed'],title:'Exposed X',en:'Attacks against you have ADV X.',cs:'Attacks proti tobě mají ADV X.'},
    {id:'frightened',terms:['Frightened'],title:'Frightened',en:'You cannot willingly move closer to the source and have DisADV on Checks made against it.',cs:'Nemůžeš se dobrovolně přiblížit ke zdroji a máš DisADV na Checks proti němu.'},
    {id:'hindered',terms:['Hindered'],title:'Hindered X',en:'You have DisADV X on Attacks.',cs:'Máš DisADV X na Attacks.'},
    {id:'immobilized',terms:['Immobilized'],title:'Immobilized',en:'You cannot move and have DisADV on Agility Saves.',cs:'Nemůžeš se pohybovat a máš DisADV na Agility Saves.'},
    {id:'impaired',terms:['Impaired'],title:'Impaired X',en:'You have DisADV X on Physical Checks.',cs:'Máš DisADV X na Physical Checks.'},
    {id:'incapacitated',terms:['Incapacitated'],title:'Incapacitated',en:'You cannot move or speak and cannot spend Action Points or use Minor Actions.',cs:'Nemůžeš se pohybovat ani mluvit a nemůžeš utrácet Action Points ani používat Minor Actions.'},
    {id:'restrained',terms:['Restrained'],title:'Restrained',en:'You are Immobilized, your Attacks have DisADV, and Attacks against you have ADV.',cs:'Jsi Immobilized, tvoje Attacks mají DisADV a Attacks proti tobě mají ADV.'},
    {id:'slowed',terms:['Slowed'],title:'Slowed X',en:'Each Space you move costs X additional Spaces of movement.',cs:'Každý 1 Space pohybu stojí navíc X Spaces pohybu.'},
    {id:'stunned',terms:['Stunned'],title:'Stunned X',en:'Your current and maximum AP are reduced by X. At Stunned 4 or higher you become Incapacitated and suffer additional penalties.',cs:'Tvoje aktuální i maximální AP se sníží o X. Při Stunned 4 nebo vyšším jsi Incapacitated a trpíš dalšími postihy.'},
    {id:'surprised',terms:['Surprised'],title:'Surprised',en:'Your current and maximum AP are reduced by 2.',cs:'Tvoje aktuální i maximální AP se sníží o 2.'},
    {id:'taunted',terms:['Taunted'],title:'Taunted',en:'You have DisADV on Attacks against targets other than the source.',cs:'Máš DisADV na Attacks proti cílům jiným než je zdroj.'},
    {id:'terrified',terms:['Terrified'],title:'Terrified',en:'You must try to move as far from the source as possible; normally you may only Move or Dodge.',cs:'Musíš se snažit dostat co nejdál od zdroje; běžně můžeš pouze Move nebo Dodge.'},
    {id:'tethered',terms:['Tethered'],title:'Tethered',en:'You cannot move farther than the specified distance from the creature or Space you are tethered to.',cs:'Nemůžeš se vzdálit dál než o určenou vzdálenost od bytosti nebo Space, ke kterému jsi Tethered.'}
  );

  const CONDITIONS = [
    ['Bleeding X','bleeding','Take X True damage at the start of your turns. Healing ends all stacks; Medicine can remove stacks.','Na začátku tahů dostaneš X True damage. Healing ukončí všechny stacky; Medicine může stacky odstranit.'],
    ['Blinded','blinded','You cannot see; terrain is Difficult Terrain unless someone guides you.','Nevidíš; terén je pro tebe Difficult Terrain, pokud tě někdo nevede.'],
    ['Burning X','burning','Take X Fire damage at the start of your turns. Water or 1 AP from a nearby creature can remove it.','Na začátku tahů dostaneš X Fire damage. Odstraní ho voda nebo 1 AP od bytosti do 1 Space.'],
    ['Charmed','charmed','The Charmer has ADV on Charisma Checks against you and you cannot harm them.','Charmer má ADV na Charisma Checks proti tobě a ty ho nemůžeš škodlivě cílit.'],
    ['Dazed X','dazed','DisADV X on Mental Checks; you cannot Sustain while Dazed.','DisADV X na Mental Checks; při Dazed nemůžeš Sustain.'],
    ['Deafened','deafened','You cannot hear.','Neslyšíš.'],
    ['Disoriented X','disoriented','DisADV X on Mental Saves.','DisADV X na Mental Saves.'],
    ['Doomed X','doomed','Maximum and current HP -X; healing restores X less HP. Ends on Long Rest.','Maximum i aktuální HP -X; healing obnovuje o X HP méně. Končí po Long Restu.'],
    ['Exhaustion X','exhaustion','-X on all Checks and Saves; Speed and Save DC -X. Six stacks means death.','-X ke všem Checks a Saves; Speed a Save DC -X. Šest stacků znamená smrt.'],
    ['Exposed X','exposed','Attacks against you have ADV X.','Attacks proti tobě mají ADV X.'],
    ['Frightened','frightened','Cannot willingly move closer to the source; DisADV on Checks against it.','Nemůžeš se dobrovolně přiblížit ke zdroji; DisADV na Checks proti němu.'],
    ['Hindered X','hindered','DisADV X on Attacks.','DisADV X na Attacks.'],
    ['Immobilized','immobilized','Cannot move; DisADV on Agility Saves.','Nemůžeš se pohybovat; DisADV na Agility Saves.'],
    ['Impaired X','impaired','DisADV X on Physical Checks.','DisADV X na Physical Checks.'],
    ['Incapacitated','incapacitated','Cannot move or speak; cannot spend AP or use Minor Actions.','Nemůžeš se pohybovat ani mluvit; nemůžeš utrácet AP ani použít Minor Actions.'],
    ['Intimidated','intimidated','DisADV on all Checks made against the source.','DisADV na všechny Checks proti zdroji.'],
    ['Invisible','invisible','Creatures cannot see you unless they can see Invisible creatures.','Bytosti tě nevidí, pokud nemají schopnost vidět Invisible bytosti.'],
    ['Paralyzed','paralyzed','Incapacitated, automatically fail most Physical Saves, Attacks against you have ADV; close Attacks are Critical Hits.','Incapacitated, automaticky selháváš většinu Physical Saves, Attacks proti tobě mají ADV a útoky do 1 Space jsou Critical Hits.'],
    ['Petrified','petrified','Turned into an inert substance; Incapacitated, heavier, auto-fail Physical Saves, and gain special damage modifiers.','Proměníš se v neživou látku; jsi Incapacitated, těžší, automaticky selháváš Physical Saves a máš speciální úpravy damage.'],
    ['Restrained','restrained','Immobilized; your Attacks have DisADV and Attacks against you have ADV.','Immobilized; tvoje Attacks mají DisADV a Attacks proti tobě mají ADV.'],
    ['Slowed X','slowed','Each Space moved costs X extra Spaces of movement.','Každý 1 Space pohybu stojí navíc X Spaces.'],
    ['Stunned X','stunned','Current and maximum AP -X; at 4+ you are Incapacitated and suffer more penalties.','Aktuální i maximální AP -X; při 4+ jsi Incapacitated a dostaneš další postihy.'],
    ['Surprised','surprised','Current and maximum AP -2.','Aktuální i maximální AP -2.'],
    ['Taunted','taunted','DisADV on Attacks against targets other than the source.','DisADV na Attacks proti cílům jiným než zdroj.'],
    ['Terrified','terrified','Must try to flee the source; normally only Move or Dodge.','Musíš se snažit utéct od zdroje; běžně jen Move nebo Dodge.'],
    ['Tethered','tethered','Cannot move farther than the specified distance from the tether.','Nemůžeš se vzdálit dál než o určenou vzdálenost od tetheru.'],
    ['Unconscious','unconscious','Drop held items, fall Prone, become Incapacitated, auto-fail most Physical Saves; nearby Attacks are Critical Hits.','Upustíš držené věci, spadneš Prone, jsi Incapacitated, automaticky selháváš většinu Physical Saves a blízké Attacks jsou Critical Hits.'],
    ['Weakened X','weakened','DisADV X on Physical Saves.','DisADV X na Physical Saves.']
  ];

  const ACTION_GROUPS = [
    {key:'offense',en:'Offensive',cs:'Útočné',items:[
      ['Attack','1 AP','Make 1 Attack Check.','Proveď 1 Attack Check.'],['Disarm','1 AP','Contest your Attack Check against the target’s Athletics, Acrobatics, or Trickery to knock an object from their grasp.','Porovnej Attack Check proti Athletics, Acrobatics nebo Trickery cíle a vyraz mu předmět z ruky.'],['Grapple','1 AP','With a free hand, Athletics vs Acrobatics/Athletics; success Grapples the target.','S volnou rukou Athletics proti Acrobatics/Athletics; úspěch cíl Grapplene.'],['Shove','1 AP','Athletics contest; push 1 Space, +1 Space for each 5, or trade 1 Space to knock Prone.','Athletics contest; posuň 1 Space, +1 za každých 5, nebo obětuj 1 Space a shoď cíl Prone.'],['Tackle','1 AP','After moving 2 Spaces straight, contest Athletics to Grapple, move together, and both fall Prone.','Po pohybu 2 Spaces rovně proveď Athletics contest; Grapple, společný posun a oba Prone.']
    ]},
    {key:'defense',en:'Defensive',cs:'Obranné',items:[
      ['Disengage','1 AP','DisADV on Opportunity Attacks against you; +1 AP makes you immune to them until next turn.','Opportunity Attacks proti tobě mají DisADV; za +1 AP jsi vůči nim do dalšího tahu imunní.'],['Dodge','1 AP','DisADV on the next Attack or Grapple against you; +1 AP applies to all until next turn.','Příští Attack nebo Grapple proti tobě má DisADV; za +1 AP platí proti všem do dalšího tahu.'],['Hide','1 AP','Stealth vs Passive Awareness of creatures that cannot see you.','Stealth proti Passive Awareness bytostí, které tě nevidí.']
    ]},
    {key:'utility',en:'Utility',cs:'Užitkové',items:[
      ['Move','1 AP','Move up to Speed; movement can be split around another Action.','Pohni se až o Speed; pohyb můžeš rozdělit kolem jiné Action.'],['Help','1 AP','Grant a d8 Help Die for a declared Attack, Skill or Trade Check.','Dej d8 Help Die pro určený Attack, Skill nebo Trade Check.'],['Object','1 AP','Drink/administer a potion, work a lock or trap, transfer or throw an item.','Vypij/podej potion, pracuj se zámkem či pastí, předej nebo hoď předmět.'],['Spell','1+ AP','Cast a Spell you know and pay any required MP.','Sešli známý Spell a zaplať případná požadovaná MP.'],['Sustain','1 AP / turn','Pay at the start of your turn to keep a Sustained effect active.','Plať na začátku tahu, abys udržel Sustained efekt.']
    ]},
    {key:'skills',en:'Skill Actions',cs:'Skill Actions',items:[
      ['Analyze Creature','1 AP','Knowledge Check to learn lore; better successes reveal statistics.','Knowledge Check pro lore; lepší úspěchy odhalí statistiky.'],['Combat Insight','1 AP','Insight contest to learn what a creature is likely to do next.','Insight contest pro odhad, co bytost pravděpodobně udělá příště.'],['Feint','1 AP','Trickery vs Insight; next Attack against the target gains ADV and +1 damage.','Trickery vs Insight; příští Attack proti cíli získá ADV a +1 damage.'],['Intimidate','1 AP','Intimidation vs Charisma Save; success makes the target Intimidated for 1 Round.','Intimidation vs Charisma Save; úspěch dá cíli Intimidated na 1 Round.'],['Medicine','1 AP','DC 10 Medicine to remove Bleeding stacks.','DC 10 Medicine pro odstranění stacků Bleeding.'],['Search','1 AP','Awareness to locate Hidden creatures or concealed objects in Line of Sight.','Awareness pro nalezení Hidden bytostí nebo skrytých předmětů v Line of Sight.'],['Taunt','1 AP','Influence vs Charisma Save; success makes the target Taunted for 1 Round.','Influence vs Charisma Save; úspěch dá cíli Taunted na 1 Round.']
    ]}
  ];
  GLOSSARY.push(
    {id:'blinded',terms:['Blinded'],title:'Blinded',en:'You cannot see, and terrain counts as Difficult Terrain for you unless another creature guides you.',cs:'Nevidíš a terén se pro tebe počítá jako Difficult Terrain, pokud tě nevede jiná bytost.'},
    {id:'deafened',terms:['Deafened'],title:'Deafened',en:'You cannot hear.',cs:'Neslyšíš.'},
    {id:'disoriented',terms:['Disoriented'],title:'Disoriented X',en:'You have DisADV X on Mental Saves.',cs:'Máš DisADV X na Mental Saves.'},
    {id:'intimidated',terms:['Intimidated'],title:'Intimidated',en:'You have DisADV on all Checks made against the source.',cs:'Máš DisADV na všechny Checks proti zdroji.'},
    {id:'invisible',terms:['Invisible'],title:'Invisible',en:'Creatures cannot see you unless they have a way to see Invisible creatures.',cs:'Bytosti tě nevidí, pokud nemají způsob, jak vidět Invisible bytosti.'},
    {id:'paralyzed',terms:['Paralyzed'],title:'Paralyzed',en:'You are Incapacitated, automatically fail most Physical Saves, Attacks against you have ADV, and nearby Attacks count as Critical Hits.',cs:'Jsi Incapacitated, automaticky selháváš většinu Physical Saves, Attacks proti tobě mají ADV a blízké Attacks se počítají jako Critical Hits.'},
    {id:'petrified',terms:['Petrified'],title:'Petrified',en:'You become an inanimate substance, are Incapacitated, auto-fail Physical Saves, and gain special damage modifiers while other afflictions are suspended.',cs:'Proměníš se v neživou látku, jsi Incapacitated, automaticky selháváš Physical Saves a získáš speciální úpravy damage; ostatní postižení se pozastaví.'},
    {id:'unconscious',terms:['Unconscious'],title:'Unconscious',en:'You drop held items, fall Prone, become Incapacitated, auto-fail most Physical Saves, and nearby Attacks are Critical Hits.',cs:'Upustíš držené věci, spadneš Prone, jsi Incapacitated, automaticky selháváš většinu Physical Saves a blízké Attacks jsou Critical Hits.'},
    {id:'weakened',terms:['Weakened'],title:'Weakened X',en:'You have DisADV X on Physical Saves.',cs:'Máš DisADV X na Physical Saves.'},
    {id:'prone',terms:['Prone'],title:'Prone',en:'A positional state commonly caused by Shove or Tackle. Many effects and attacks interact with it.',cs:'Polohový stav často způsobený Shove nebo Tackle. Mnoho efektů a útoků s ním dále pracuje.'},
    {id:'difficult',terms:['Difficult Terrain'],title:'Difficult Terrain',en:'Terrain that slows movement; many movement rules and conditions can cause terrain to count as difficult.',cs:'Terén, který zpomaluje pohyb; řada pohybových pravidel a Conditions může způsobit, že se terén počítá jako Difficult Terrain.'},
    {id:'speede',terms:['Speed'],title:'Speed',en:'How many Spaces you can normally move with one Move Action.',cs:'Kolik Spaces se běžně můžeš pohnout jednou Move Action.'},
    {id:'physicalsave',terms:['Physical Saves','Physical Save'],title:'Physical Save',en:'A Save tied to physical resilience or mobility. Specific effects may call for Might or Agility Saves instead.',cs:'Save spojený s fyzickou odolností nebo pohybem. Konkrétní efekty mohou místo toho vyžadovat Might nebo Agility Save.'},
    {id:'mentalsave',terms:['Mental Saves','Mental Save'],title:'Mental Save',en:'A Save tied to mental resilience. Specific effects may call for Intelligence or Charisma Saves instead.',cs:'Save spojený s mentální odolností. Konkrétní efekty mohou místo toho vyžadovat Intelligence nebo Charisma Save.'},
    {id:'mpeffect',terms:['MP Effects','MP Effect'],title:'MP Effect',en:'Any ability or effect that costs MP, including Spells, Class Features, and Talents.',cs:'Jakákoli schopnost nebo efekt, který stojí MP, včetně Spellů, Class Features a Talentů.'},
    {id:'speffect',terms:['SP Effects','SP Effect'],title:'SP Effect',en:'Any ability or effect that costs SP, including Maneuvers, Class Features, and Talents.',cs:'Jakákoli schopnost nebo efekt, který stojí SP, včetně Maneuvers, Class Features a Talentů.'},
    {id:'spell-enh',terms:['Spell Enhancements','Spell Enhancement'],title:'Spell Enhancement',en:'An optional increase or modification to a Spell paid for with additional AP and/or MP, subject to the spell and your Mana Spend Limit.',cs:'Volitelné posílení nebo úprava Spellu placená dalšími AP a/nebo MP podle pravidel spellu a Mana Spend Limitu.'},
    {id:'maneuver-enh',terms:['Maneuver Enhancements','Maneuver Enhancement'],title:'Maneuver Enhancement',en:'An optional upgrade specific to a Maneuver, usually paid with additional AP or SP.',cs:'Volitelné vylepšení konkrétního Maneuveru, obvykle placené dalšími AP nebo SP.'},
    {id:'martial-enh',terms:['Martial Enhancements','Martial Enhancement'],title:'Martial Enhancement',en:'A general enhancement available to Martial Attacks, such as extra damage, range, or Daze, paid before the Attack Check.',cs:'Obecné vylepšení Martial Attacku, například více damage, range nebo Daze, placené před Attack Checkem.'},
    {id:'criticalhit',terms:['Critical Hits','Critical Hit'],title:'Critical Hit',en:'A Critical Hit automatically hits, bypasses Damage Reduction, and deals +2 damage before any extra damage from beating Defense by 5s.',cs:'Critical Hit automaticky zasáhne, obejde Damage Reduction a udělí +2 damage ještě před dalším bonusem za překonání Defense po pěti.'},
    {id:'caster',terms:['Caster'],title:'Caster',en:'The creature producing an MP Effect. In Combo Spellcasting, the Caster’s Mana Spend Limit caps total MP on the effect.',cs:'Bytost, která vytváří MP Effect. V Combo Spellcasting omezuje Mana Spend Limit Castera celkové MP efektu.'},
    {id:'performer',terms:['Performer'],title:'Performer',en:'The creature performing an SP Effect during a Combo Maneuver.',cs:'Bytost, která provádí SP Effect během Combo Maneuveru.'},
    {id:'participant',terms:['Participants','Participant'],title:'Participant',en:'An ally assisting the primary Performer or Caster through a combo mechanic.',cs:'Spojenec, který pomáhá hlavnímu Performerovi nebo Casterovi pomocí combo mechaniky.'}
  );
  const GLOSSARY_BY_ID = Object.fromEntries(GLOSSARY.map(x=>[x.id,x]));
  const GLOSSARY_ALIAS = new Map();
  GLOSSARY.forEach(entry=>entry.terms.forEach(term=>GLOSSARY_ALIAS.set(term.toLowerCase(),entry)));
  const GLOSSARY_TERMS = [...GLOSSARY_ALIAS.keys()].sort((a,b)=>b.length-a.length);
  const regexEscape = x => String(x).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const GLOSSARY_RE = new RegExp(`\\b(${GLOSSARY_TERMS.map(regexEscape).join('|')})\\b`,'gi');

  function showToast(msg){
    toast.textContent=msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t=setTimeout(()=>toast.classList.remove('show'),2200);
  }
  function saveSelections(){store.set('dc20-selections',JSON.stringify(selections))}
  function selectedSet(key){selections[key] ||= []; return new Set(selections[key]);}
  function setSelected(key,set){selections[key]=[...set];saveSelections()}
  function classRoute(){
    const h=(location.hash||'#home').slice(1);
    return ['home','character','combo','combat','cleric','commander','spellblade','toolkit','gangcyklopedie','postavy','kronika'].includes(h)?h:'home';
  }
  function groupBy(arr,keyFn){
    return arr.reduce((acc,item)=>{ const key=keyFn(item); (acc[key] ||= []).push(item); return acc; },{});
  }

  async function loadCmsContent(){
    if(location.protocol === 'file:') return;
    try{
      const [g,p,k]=await Promise.all([
        fetch('content/gangcyklopedie.json',{cache:'no-store'}),
        fetch('content/postavy.json',{cache:'no-store'}),
        fetch('content/kronika.json',{cache:'no-store'})
      ]);
      if(g.ok) gangs=await g.json();
      if(p.ok) postavy=await p.json();
      if(k.ok) kronika=await k.json();
      if(['gangcyklopedie','postavy','kronika'].includes(classRoute())) render();
    }catch(e){ console.warn('CMS content fallback active',e); }
  }

  function hero(title,subtitle='',eyebrow='',buttons=''){
    return `<section class="hero">${eyebrow?`<div class="eyebrow">${esc(eyebrow)}</div>`:''}<h1>${esc(title)}</h1>${subtitle?`<p>${esc(subtitle)}</p>`:''}${buttons?`<div class="hero-actions">${buttons}</div>`:''}</section>`;
  }
  function sectionHead(title,note=''){ return `<div class="section-head"><h2>${esc(title)}</h2>${note?`<p>${esc(note)}</p>`:''}</div>`; }


  function schoolIcon(name){
    const icons={
      Astromancy:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><path d="M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/></svg>`,
      Conjuration:`<svg viewBox="0 0 24 24"><path d="M12 2l7 4v8l-7 4-7-4V6l7-4z"/><path d="M8 8h8v8H8z"/></svg>`,
      Divination:`<svg viewBox="0 0 24 24"><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/></svg>`,
      Elemental:`<svg viewBox="0 0 24 24"><path d="M13 2c1 5-4 6-4 10 0 2 1 4 3 4 3 0 5-2 5-5 2 2 3 4 2 7-1 3-4 4-7 4-5 0-8-3-8-7 0-5 4-8 9-13z"/></svg>`,
      Enchantment:`<svg viewBox="0 0 24 24"><path d="M12 20s-8-4-8-10a4 4 0 017-3 4 4 0 017 3c0 6-6 10-6 10z"/><path d="M9 10c2-2 4-2 6 0"/></svg>`,
      Invocation:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 1v5M12 18v5M1 12h5M18 12h5M4 4l4 4M16 16l4 4M20 4l-4 4M8 16l-4 4"/></svg>`,
      Nullification:`<svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3 9-8 11-5-2-8-6-8-11V5l8-3z"/><path d="M7 17L17 7"/></svg>`,
      Transmutation:`<svg viewBox="0 0 24 24"><path d="M5 7h11l-2-2M16 7l-2 2"/><path d="M19 17H8l2 2M8 17l2-2"/><path d="M6 7c-2 2-2 6 0 8M18 17c2-2 2-6 0-8"/></svg>`
    };
    return `<span class="school-icon" aria-hidden="true">${icons[name]||icons.Astromancy}</span>`;
  }

  function renderHome(){
    const coming=lang==='en'?'Content coming later.':'Obsah dodělám později';
    const downloadTitle=lang==='en'?'Download PDF':'Stáhnout PDF';
    const downloadHint=lang==='en'?'Full class references':'Kompletní class reference';
    const pdfs=[
      ['Cleric','assets/references/DC20_Cleric_Class_Reference.pdf'],
      ['Commander','assets/references/DC20_Commander_Class_Reference.pdf'],
      ['Spellblade','assets/references/DC20_Spellblade_Class_Reference.pdf']
    ];
    const pdfIcon=`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 5h23l12 12v38a4 4 0 01-4 4H16a4 4 0 01-4-4V9a4 4 0 014-4z"/><path d="M39 5v14h12"/><path d="M32 28v18m0 0l-8-8m8 8l8-8"/><path d="M22 53h20"/></svg>`;
    app.innerHTML=`<section class="home-landing"><div class="home-content"><img src="assets/media/dc20-logo.webp" alt="DC20"><div class="home-gangsterka">Gangsterka</div><p class="home-coming">${esc(coming)}</p><section class="home-downloads"><div class="home-download-heading"><span>${esc(downloadTitle)}</span><small>${esc(downloadHint)}</small></div><div class="pdf-download-grid">${pdfs.map(([name,path])=>`<a class="pdf-download-card" href="${esc(path)}" download><span class="pdf-download-icon">${pdfIcon}</span><span class="pdf-download-copy"><strong>${esc(name)}</strong><small>PDF</small></span><span class="pdf-download-arrow">↓</span></a>`).join('')}</div></section></div></section>`;
  }

  function renderCharacter(){
    const d=R.core.characterCreation;
    app.innerHTML=`<article class="standard-reference">${hero(pick(d.title),pick(d.intro),'CHARACTER CREATION')}<section class="section"><div class="step-list">${d.steps.map(s=>`<article class="card step"><div class="step-num">${s.n}</div><div><h3>${esc(lang==='en'?s.en:s.cs)}</h3><p>${esc(lang==='en'?s.enText:s.csText)}</p></div></article>`).join('')}</div></section></article>`;
  }

  function renderCombo(){
    const title=lang==='en'?'Combo Mechanics':'Kombinované mechaniky';
    const intro=lang==='en'?'DC20 lets allies join the same SP or MP effect as a Reaction. The important part is that Martial and Spell combos do not share the same resource limit.':'DC20 dovoluje spojencům připojit se ke stejnému SP nebo MP efektu jako Reaction. Důležité je, že Martial a Spell komba nemají stejný limit zdrojů.';
    const martialSteps=lang==='en'?
      [['1','See it','You see an SP Effect you know, and the Performer or a target is within 2 Spaces.'],['2','React','Spend AP equal to the effect’s base AP cost.'],['3','Boost','The SP Effect gains +2 to its Check and Save DC for this turn.'],['4','Add SP','You may spend SP on SP Enhancements up to your own Stamina Spend Limit.']]:
      [['1','Uvidíš efekt','Vidíš SP Effect, který znáš, a Performer nebo cíl je do 2 Spaces.'],['2','Reaction','Utrať AP rovné základní AP ceně efektu.'],['3','Posílení','SP Effect dostane +2 k Checku a Save DC pro tento tah.'],['4','Přidej SP','Můžeš utratit SP na SP Enhancements až do vlastního Stamina Spend Limitu.']];
    const spellSteps=lang==='en'?
      [['1','See it','You see an MP Effect you know or a Spell Duel, and the Caster or a target is within 5 Spaces.'],['2','React','Spend AP equal to the effect’s base AP cost.'],['3','Boost','The MP Effect gains +2 to its Check and Save DC; in a Spell Duel the Challenger you help gains the +2.'],['4','Add MP','You may pay for MP Enhancements, but total MP on the whole effect cannot exceed the Caster’s Mana Spend Limit.']]:
      [['1','Uvidíš efekt','Vidíš MP Effect, který znáš, nebo Spell Duel a Caster nebo cíl je do 5 Spaces.'],['2','Reaction','Utrať AP rovné základní AP ceně efektu.'],['3','Posílení','MP Effect dostane +2 k Checku a Save DC; ve Spell Duelu dostane +2 Challenger, kterému pomáháš.'],['4','Přidej MP','Můžeš zaplatit MP Enhancements, ale celkové MP celého efektu nesmí překročit Mana Spend Limit Castera.']];
    const stepCards=steps=>steps.map(([n,h,b])=>`<div class="combo-step"><span>${n}</span><div><h3>${esc(h)}</h3><p>${esc(b)}</p></div></div>`).join('');
    app.innerHTML=`<article class="standard-reference combo-reference">${hero(title,intro,'TEAMWORK')}
      <section class="combo-compare">
        <article class="combo-panel martial-combo"><div class="combo-kicker">MARTIAL PATH</div><h2>Combo Maneuver</h2><p>${esc(lang==='en'?'Help another Martial push a Maneuver beyond what one character could do alone.':'Pomoz jinému Martialovi posunout Maneuver dál, než by zvládl sám.')}</p><div class="combo-steps">${stepCards(martialSteps)}</div><div class="combo-example"><strong>${esc(lang==='en'?'Example':'Příklad')}</strong><p>${esc(lang==='en'?'Both characters have SSL 3. A performs Bash for 1 AP + 3 SP. B reacts for 1 AP and may add up to 3 SP of enhancements. The combined effect can therefore contain 6 SP, and A also gains +2 to the Martial Check.':'Oba mají SSL 3. A provede Bash za 1 AP + 3 SP. B reaguje za 1 AP a může přidat až 3 SP do enhancementů. Výsledný efekt tak může obsahovat 6 SP a A navíc získá +2 k Martial Checku.')}</p></div></article>
        <article class="combo-panel spell-combo"><div class="combo-kicker">SPELLCASTING PATH</div><h2>Combo Spellcasting</h2><p>${esc(lang==='en'?'Help another caster improve a spell, but the Caster’s MSL remains the cap for total MP.':'Pomoz jinému casterovi posílit spell, ale MSL Castera zůstává limitem celkových MP.')}</p><div class="combo-steps">${stepCards(spellSteps)}</div><div class="combo-example"><strong>${esc(lang==='en'?'Example':'Příklad')}</strong><p>${esc(lang==='en'?'Caster A has MSL 3 and casts Fire Bolt for 1 AP + 1 MP. B reacts for 1 AP and can contribute up to 2 MP of enhancements. Total MP stays at 3, and the spell gains +2 to its Check and Save DC.':'Caster A má MSL 3 a sešle Fire Bolt za 1 AP + 1 MP. B reaguje za 1 AP a může přidat až 2 MP do enhancementů. Celkem zůstanou 3 MP a spell získá +2 k Checku a Save DC.')}</p></div></article>
      </section>
      <section class="combo-rule"><h2>${esc(lang==='en'?'The difference to remember':'Rozdíl, který si zapamatovat')}</h2><div class="combo-memory"><div><b>Martial</b><span>2 Spaces</span><strong>${esc(lang==='en'?'Each participant uses their own SSL':'Každý participant používá vlastní SSL')}</strong></div><div><b>Spell</b><span>5 Spaces</span><strong>${esc(lang==='en'?"Everyone shares the Caster’s MSL cap":'Všichni sdílí limit MSL Castera')}</strong></div></div></section>
      <section class="combo-duel"><h2>Spell Duel</h2><p>${esc(lang==='en'?'Think of this as an active magical counter. A Spellcaster who sees an MP Effect being cast can react, pay the same base AP plus at least 1 MP, and contest the Caster. Other spellcasters may then join either side through Combo Spellcasting.':'Ber to jako aktivní magický protiútok. Spellcaster, který vidí sesílaný MP Effect, může reagovat, zaplatit stejná základní AP plus alespoň 1 MP a vyzvat Castera na contest. Další spellcasteři se pak mohou pomocí Combo Spellcasting přidat na kteroukoli stranu.')}</p></section>
    </article>`;
  }

  function conditionCards(){
    return CONDITIONS.map(([name,id,en,cs])=>`<article class="condition-card" data-condition="${esc(name.toLowerCase())}"><button type="button" class="condition-toggle" aria-expanded="false"><span>${esc(name)}</span><span>+</span></button><div class="condition-body"><p>${esc(lang==='en'?en:cs)}</p></div></article>`).join('');
  }

  function actionExplorer(){
    return ACTION_GROUPS.map(group=>`<section class="action-group"><h3>${esc(lang==='en'?group.en:group.cs)}</h3><div class="action-grid">${group.items.map(([name,cost,en,cs])=>`<article class="action-card"><div class="action-cost">${esc(cost)}</div><h4>${esc(name)}</h4><p>${esc(lang==='en'?en:cs)}</p></article>`).join('')}</div></section>`).join('');
  }

  function restDescription(type){
    const info={
      quick:{name:'Quick Rest',time:lang==='en'?'10+ minutes':'10+ minut',en:'No Activity or Light Activity. At the end you may spend Rest Points to regain 1 HP per point.',cs:'No Activity nebo Light Activity. Na konci můžeš utratit Rest Points a za každý obnovit 1 HP.'},
      short:{name:'Short Rest',time:lang==='en'?'1+ hour':'1+ hodina',en:'No Activity or Light Activity. You may spend Rest Points, regain all spent SP, and refresh any Features that say Short Rest. Normally limited to 2 Short Rests per 24 hours.',cs:'No Activity nebo Light Activity. Můžeš utratit Rest Points, obnovíš všechna utracená SP a schopnosti, které uvádějí Short Rest. Běžně maximálně 2 Short Rests za 24 hodin.'},
      long:{name:'Long Rest',time:'8 hours',en:'4 hours Light Activity + 4 hours No Activity, in either order. After the first 4-hour period you gain Short Rest benefits and regain all spent Rest Points. After the second period you complete the Long Rest: regain all spent MP and Grit Points, refresh Features that say Long Rest, and remove all Doomed stacks. Each 4 hours of No Activity also removes 1 Exhaustion.',cs:'4 hodiny Light Activity + 4 hodiny No Activity v libovolném pořadí. Po prvních 4 hodinách získáš benefity Short Restu a obnovíš všechny utracené Rest Points. Po druhé části dokončíš Long Rest: obnovíš všechna utracená MP a Grit Points, schopnosti obnovované na Long Rest a odstraníš všechny stacky Doomed. Každé 4 hodiny No Activity navíc odstraní 1 Exhaustion.'}
    };
    return info[type]||info.quick;
  }

  function renderRestPanel(type='quick'){
    const d=restDescription(type);
    return `<div class="rest-summary"><div><span class="rest-time">${esc(d.time)}</span><h3>${d.name}</h3></div><p>${esc(lang==='en'?d.en:d.cs)}</p></div>`;
  }

  function bindToolkitTools(){
    $$('.condition-toggle',app).forEach(btn=>btn.addEventListener('click',()=>{
      const card=btn.closest('.condition-card');
      const open=card.classList.toggle('open');
      btn.setAttribute('aria-expanded',open?'true':'false');
      btn.lastElementChild.textContent=open?'−':'+';
    }));
    $('#conditionSearch')?.addEventListener('input',e=>{
      const q=e.target.value.trim().toLowerCase();
      $$('.condition-card',app).forEach(card=>card.hidden=q&&!card.dataset.condition.includes(q));
    });
    $$('.rest-type',app).forEach(btn=>btn.addEventListener('click',()=>{
      $$('.rest-type',app).forEach(x=>x.classList.toggle('active',x===btn));
      $('#restSummary').innerHTML=renderRestPanel(btn.dataset.rest);
      decorateGlossary($('#restSummary'));
    }));
    const recalc=()=>{
      const max=Math.max(1,Number($('#restMaxHp')?.value||1));
      const current=Math.min(max,Math.max(0,Number($('#restCurrentHp')?.value||0)));
      const points=Math.min(max,Math.max(0,Number($('#restPoints')?.value||0)));
      const spend=Math.min(points,Math.max(0,Number($('#restSpend')?.value||0)),max-current);
      const after=current+spend,left=points-spend;
      if($('#restCalcResult')) $('#restCalcResult').innerHTML=`<strong>${after} / ${max} HP</strong><span>${left} Rest Points ${esc(lang==='en'?'remaining':'zbývá')}</span>`;
    };
    ['restMaxHp','restCurrentHp','restPoints','restSpend'].forEach(id=>$('#'+id)?.addEventListener('input',recalc));
    recalc();
    $$('.toolkit-jumps button',app).forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.jump)?.scrollIntoView({behavior:'smooth',block:'start'})));
  }

  function renderCombat(){
    const intro=lang==='en'
      ? 'A fast table reference for your turn: resources, actions, reactions, and the choices that matter most in combat.'
      : 'Rychlá reference pro tah u stolu: zdroje, actions, reactions a nejdůležitější možnosti v boji.';
    app.innerHTML=`<article class="standard-reference combat-reference">${hero('Combat',intro,'COMBAT')}
      <nav class="combat-jumps"><button data-jump="combat-resources">${esc(lang==='en'?'Resources':'Zdroje')}</button><button data-jump="combat-actions">${esc(lang==='en'?'What can I do?':'Co můžu udělat?')}</button></nav>
      <section id="combat-resources" class="combat-section">
        <div class="section-head"><h2>${esc(lang==='en'?'Your turn at a glance':'Tah v kostce')}</h2><p>${esc(lang==='en'?'The four things to check before acting.':'Čtyři věci, které zkontroluj před akcí.')}</p></div>
        <div class="resource-strip">
          <article><b>4 AP</b><span>${esc(lang==='en'?'Actions + Reactions':'Actions + Reactions')}</span></article>
          <article><b>MP</b><span>${esc(lang==='en'?'Spell resource • refreshes on Long Rest':'Zdroj pro spelly • obnovuje Long Rest')}</span></article>
          <article><b>SP</b><span>${esc(lang==='en'?'Martial resource • refreshes after Combat / Short Rest':'Martial zdroj • obnovuje se po Combat / Short Rest')}</span></article>
          <article><b>Grit</b><span>${esc(lang==='en'?'2 + Charisma • reduce damage / boost Saves':'2 + Charisma • snížení damage / posílení Saves')}</span></article>
        </div>
        <div class="combat-reminder"><strong>${esc(lang==='en'?'AP is one shared pool':'AP jsou jeden společný pool')}</strong><p>${esc(lang==='en'?'Actions and Reactions use the same AP. AP spent on somebody else’s turn is AP you will not have on your next turn until your turn ends and the pool refreshes.':'Actions i Reactions používají stejná AP. AP utracené v cizím tahu ti budou v příštím tahu chybět, dokud tah neskončí a pool se neobnoví.')}</p></div>
      </section>
      <section id="combat-actions" class="combat-section">
        <div class="section-head"><h2>${esc(lang==='en'?'What can I do?':'Co můžu udělat?')}</h2><p>${esc(lang==='en'?'Most basic choices cost 1 AP.':'Většina základních možností stojí 1 AP.')}</p></div>
        <div class="minor-action-banner"><strong>Minor Action</strong><span>${esc(lang==='en'?'Up to 2 simple tasks on your turn for free. Another Minor Action later in the same turn costs 1 AP.':'Až 2 jednoduché úkony v tahu zdarma. Další Minor Action v témže tahu stojí 1 AP.')}</span></div>
        ${actionExplorer()}
        <section class="advanced-actions"><h3>${esc(lang==='en'?'Timing that matters':'Načasování, které je dobré znát')}</h3><div class="grid two">
          <article class="card"><h4>Held Action</h4><p>${esc(lang==='en'?'Pay the AP now, name the exact Action and an observable Trigger. If the Trigger happens before your next turn, the held Action happens as a Reaction.':'AP zaplať hned, urč přesnou Action a pozorovatelný Trigger. Pokud Trigger nastane před dalším tahem, držená Action proběhne jako Reaction.')}</p></article>
          <article class="card"><h4>Reactions</h4><p>${esc(lang==='en'?'A Reaction happens on another creature’s turn when its Trigger is met. Different Triggers can allow multiple Reactions, but every Reaction still costs its listed resources.':'Reaction probíhá v tahu jiné bytosti, když nastane její Trigger. Různé Triggery mohou umožnit více Reactions, ale každá pořád stojí uvedené zdroje.')}</p></article>
        </div></section>
      </section>
    </article>`;
    $$('.combat-jumps button',app).forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.jump)?.scrollIntoView({behavior:'smooth',block:'start'})));
  }

  function renderToolkit(){
    const title=lang==='en'?'Toolkit':'Toolkit';
    const intro=lang==='en'
      ? 'Useful table tools that do not belong to one class: Conditions and a quick Rest helper.'
      : 'Užitečné pomůcky ke hře, které nepatří k jedné classe: Conditions a rychlý Rest helper.';
    app.innerHTML=`<article class="standard-reference toolkit-reference">${hero(title,intro,'USEFUL')}
      <nav class="combat-jumps toolkit-jumps"><button data-jump="toolkit-conditions">Conditions</button><button data-jump="toolkit-rest">Rest Helper</button></nav>
      <section id="toolkit-conditions" class="combat-section">
        <div class="section-head"><h2>Conditions</h2><p>${esc(lang==='en'?'Search or click a Condition for a quick table explanation.':'Hledej nebo klikni na Condition pro rychlé vysvětlení.')}</p></div>
        <div class="condition-toolbar"><input id="conditionSearch" type="search" placeholder="${esc(lang==='en'?'Search conditions…':'Hledat Conditions…')}"><span>${CONDITIONS.length}</span></div>
        <div class="condition-grid">${conditionCards()}</div>
        <div class="condition-defense-row"><div><b>Resistance</b><span>${esc(lang==='en'?'ADV on Checks and Saves against that Condition.':'ADV na Checks a Saves proti této Condition.')}</span></div><div><b>Immunity</b><span>${esc(lang==='en'?'You cannot be subjected to that Condition.':'Této Condition nemůžeš být vystaven.')}</span></div><div><b>Vulnerability</b><span>${esc(lang==='en'?'DisADV on Checks and Saves against that Condition.':'DisADV na Checks a Saves proti této Condition.')}</span></div></div>
        <div class="condition-stack-note"><strong>${esc(lang==='en'?'Stacking rule':'Pravidlo stackování')}</strong><p>${esc(lang==='en'?'Conditions with an X value stack by adding their X values. Some Conditions overlap instead of becoming stronger, and several Conditions do not stack at all.':'Conditions s hodnotou X se stackují sčítáním X. Některé Conditions se pouze překrývají místo zesilování a některé se nestackují vůbec.')}</p></div>
      </section>
      <section id="toolkit-rest" class="combat-section">
        <div class="section-head"><h2>Rest Helper</h2><p>${esc(lang==='en'?'Quick / Short / Long Rest reminder and Rest Point calculator.':'Připomínka Quick / Short / Long Rest a kalkulačka Rest Points.')}</p></div>
        <div class="rest-helper"><div class="rest-tabs"><button class="rest-type active" data-rest="quick">Quick Rest</button><button class="rest-type" data-rest="short">Short Rest</button><button class="rest-type" data-rest="long">Long Rest</button></div><div id="restSummary">${renderRestPanel('quick')}</div><div class="rest-calculator"><label><span>Max HP</span><input id="restMaxHp" type="number" min="1" value="8"></label><label><span>${esc(lang==='en'?'Current HP':'Aktuální HP')}</span><input id="restCurrentHp" type="number" min="0" value="4"></label><label><span>Rest Points</span><input id="restPoints" type="number" min="0" value="8"></label><label><span>${esc(lang==='en'?'Spend':'Utratit')}</span><input id="restSpend" type="number" min="0" value="2"></label><div id="restCalcResult" class="rest-result"></div></div></div>
      </section>
    </article>`;
    bindToolkitTools();
  }

  function statsTable(c){
    const l=c.level1;
    const items=[['HP',l.hp],['MP',l.mp],['SP',l.sp],[t('spells'),l.spells],[t('maneuvers'),l.maneuvers],[t('levelTraining'),l.training]];
    return `<table class="reference-stats"><tbody>${items.map(([a,b])=>`<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</tbody></table>`;
  }

  const disciplineNames=['Magus','Warrior','Acolyte','Hex Warrior','Spell Breaker','Spell Warder','Blink Blade'];
  function coreFeatures(cls,c){
    return c.features.filter(f=>{
      if(cls==='cleric' && f.name==='Divine Domains') return false;
      if(cls==='spellblade' && disciplineNames.includes(f.name)) return false;
      return true;
    });
  }
  function optionRows(key,items,help,maxOne=false){
    const set=selectedSet(key);
    return `<div class="choice-note">${esc(help)}</div><div class="rule-options" data-option-group="${esc(key)}" data-max-one="${maxOne?'1':'0'}">${items.map(item=>{
      const name=Array.isArray(item)?item[0]:item.name;
      const body=Array.isArray(item)?(lang==='en'?item[1]:item[2]):(lang==='en'?item.en:item.cs);
      return `<label class="rule-option"><input type="checkbox" class="class-option-check" data-key="${esc(key)}" value="${esc(name)}" ${set.has(name)?'checked':''}><span><strong>${esc(name)}</strong><span class="rule-option-text">${esc(body)}</span></span></label>`;
    }).join('')}</div>`;
  }
  function disciplineItems(c){ return disciplineNames.map(name=>c.features.find(f=>f.name===name)).filter(Boolean); }

  function genericLevelItems(level){
    const en={2:['Talent','Path Progression'],3:['Subclass'],4:['Talent','Path Progression','2 Ancestry Points'],6:['Talent','Path Progression']};
    const cs={2:['Talent','Path Progression'],3:['Subclass'],4:['Talent','Path Progression','2 Ancestry Points'],6:['Talent','Path Progression']};
    return (lang==='en'?en:cs)[level]||[];
  }

  function levelSection(cls,c,level){
    const feats=coreFeatures(cls,c).filter(f=>f.level===level);
    const generic=genericLevelItems(level);
    let inside='';
    feats.forEach(f=>{
      inside += `<section class="rule-block" id="${esc(`${cls}-${slug(f.name)}`)}"><h3>${esc(f.name)}</h3><p>${esc(lang==='en'?f.en:f.cs)}</p>`;
      if(cls==='cleric' && f.name==='Cleric Order') inside += `<div class="nested-choice"><h4>${esc(t('domains'))}</h4>${optionRows('cleric-domains',c.domains,t('chooseDomains'))}</div>`;
      if(cls==='spellblade' && f.name==='Spellblade Disciplines') inside += `<div class="nested-choice"><h4>${esc(t('disciplines'))}</h4>${optionRows('spellblade-disciplines',disciplineItems(c),t('chooseDisciplines'))}</div>`;
      inside += `</section>`;
    });
    if(level===3 && c.subclasses?.length){
      inside += `<section class="rule-block" id="${cls}-subclass"><h3>${esc(t('subclasses'))}</h3>${optionRows(`${cls}-subclass`,c.subclasses,t('chooseSubclass'),true)}</section>`;
    }
    if(generic.length){
      inside += `<ul class="level-extras">${generic.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
    }
    if(!inside) return '';
    return `<section class="level-section" id="${cls}-level-${level}"><div class="level-heading"><span>Level ${level}</span><h2>${esc(t('features'))}</h2></div><div class="rules-columns">${inside}</div></section>`;
  }

  function levelOutline(cls,c){
    const feats=coreFeatures(cls,c);
    const rows=[];
    for(let level=1;level<=6;level++){
      const names=feats.filter(f=>f.level===level).map(f=>f.name);
      if(level===3 && c.subclasses?.length) names.push(t('subclasses'));
      genericLevelItems(level).forEach(x=>{ if(x!=='Subclass') names.push(x); });
      if(names.length){
        rows.push(`<div class="outline-level"><button type="button" class="level-jump" data-target="${cls}-level-${level}"><b>Level ${level}</b></button><span>${names.map(esc).join(' • ')}</span></div>`);
      }
    }
    return `<nav class="level-outline" aria-label="Class feature levels">${rows.join('')}</nav>`;
  }

  function classAside(cls,c){
    const art = CLASS_ART[cls];
    const buildText = cls==='spellblade' ? t('buildPanelSpellText') : t('buildPanelText');
    const cheatPaths={
      cleric:'assets/references/Cleric_Turn_Cheat_Sheet.pdf',
      commander:'assets/references/Commander_Turn_Cheat_Sheet.pdf',
      spellblade:'assets/references/Spellblade_Turn_Cheat_Sheet.pdf'
    };
    const cheatIcon=`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 5h23l12 12v38a4 4 0 01-4 4H16a4 4 0 01-4-4V9a4 4 0 014-4z"/><path d="M39 5v14h12"/><path d="M22 31h20M22 39h14M22 47h18"/><path d="M18 31h.1M18 39h.1M18 47h.1"/></svg>`;
    return `<aside class="class-aside">
      <section class="aside-art">
        <div class="eyebrow">${esc(t('artLabel'))}</div>
        <img src="${esc(art.img)}" alt="${esc(art.title[lang] || art.title.en)}">
        <div class="aside-copy"><h3>${esc(art.title[lang] || art.title.en)}</h3><p>${esc(art.text[lang] || art.text.en)}</p></div>
        <a class="pdf-download-card class-cheat-download" href="${esc(cheatPaths[cls])}" download>
          <span class="pdf-download-icon">${cheatIcon}</span>
          <span class="pdf-download-copy"><strong>Cheat Sheet</strong><small>${esc(c.name)} · PDF</small></span>
          <span class="pdf-download-arrow">↓</span>
        </a>
      </section>
      <section class="side-panel">
        <h4>${esc(t('buildPanelTitle'))}</h4>
        <p>${esc(buildText)}</p>
        <ul>
          <li>${esc(t('storedNotice'))}</li>
          <li>${esc(c.level1.training)}</li>
          <li>${esc(`${t('spells')}: ${c.level1.spells} • ${t('maneuvers')}: ${c.level1.maneuvers}`)}</li>
        </ul>
      </section>
    </aside>`;
  }

  function renderClass(cls){
    const c=R.classes[cls];
    let main =
      `<section class="class-overview"><div><p>${esc(lang==='en'?c.spellRule.en:c.spellRule.cs)}</p><p><strong>${esc(t('levelTraining'))}:</strong> ${esc(c.level1.training)}</p></div>${statsTable(c)}</section>`+
      levelOutline(cls,c);
    for(let level=1;level<=6;level++) main += levelSection(cls,c,level);
    if(c.talents?.length){
      main += `<section class="level-section"><div class="level-heading"><span>Talents</span><h2>${esc(t('talents'))}</h2></div><div class="rules-columns">${c.talents.map(x=>`<section class="rule-block"><h3>${esc(x.name)}</h3><p><em>${esc(x.req)}</em></p><p>${esc(lang==='en'?x.en:x.cs)}</p></section>`).join('')}</div></section>`;
    }

    let html = `<article class="class-reference class-${esc(cls)}"><header class="class-title"><h1>${esc(c.name)}</h1><p>${esc(pick(c.tagline))}</p></header><div class="class-frame"><div class="class-main">${main}</div>${classAside(cls,c)}</div></article>`;

    if(cls==='cleric') html += renderSpellSelector(cls,R.spells.filter(s=>s.source.split(',').map(x=>x.trim()).includes('Divine')));
    if(cls==='commander') html += `<section class="section"><div class="callout">${esc(t('noClassSpells'))}</div></section>` + renderManeuverSelector(cls,R.maneuvers);
    if(cls==='spellblade') html += renderSpellbladePicker() + renderSpellbladeSelectors();
    app.innerHTML=html;
    bindClassEvents(cls);
    decorateGlossary(app);
  }

  function renderSpellbladePicker(){
    return `<section class="section spell-access"><div class="section-head"><h2>${esc(`Spellblade ${t('spellListTitle')}`)}</h2></div><p>${esc(t('chooseSchools'))}</p><div class="school-picker" id="schoolPicker">${R.schools.map(s=>`<label class="school-pill"><input type="checkbox" value="${esc(s)}" ${spellbladeSchools.includes(s)?'checked':''}>${schoolIcon(s)}<span>${esc(s)}</span></label>`).join('')}</div></section>`;
  }
  function spellbladeAllowed(){
    return R.spells.filter(s=>spellbladeSchools.includes(s.school)||s.tags.includes('Weapon')||s.tags.includes('Ward'));
  }
  function renderSpellbladeSelectors(){
    return `<div id="spellbladeSelectors">${renderSpellSelector('spellblade',spellbladeAllowed())}${renderManeuverSelector('spellblade-maneuvers',R.maneuvers)}</div>`;
  }

  function renderSpellSelector(cls,spells){
    const groups=R.schools.map(s=>[s,spells.filter(x=>x.school===s)]).filter(([,xs])=>xs.length);
    const count=selectedSet(cls).size;
    return `<section class="section selector-group" data-selector="${esc(cls)}">${sectionHead(t('spells'),`${spells.length} total`)}<div class="filterbar"><input type="search" class="selector-search" placeholder="${esc(t('search'))}"><select class="selector-school"><option value="">${esc(t('all'))}</option>${groups.map(([g])=>`<option>${esc(g)}</option>`).join('')}</select></div><div class="spell-columns selector-list">${groups.map(([g,xs])=>`<div class="school-block" data-school="${esc(g)}"><h3 class="school-heading">${schoolIcon(g)}<span>${esc(g)}</span></h3>${xs.map(x=>choiceRow(cls,x,'spell',selectedSet(cls).has(x.id))).join('')}</div>`).join('')}</div>${selectionFooter(cls,count)}</section>`;
  }
  function renderManeuverSelector(cls,mans){
    const cats=['Attack','Defense','Grapple','Utility'];
    const count=selectedSet(cls).size;
    return `<section class="section selector-group" data-selector="${esc(cls)}">${sectionHead(t('maneuvers'),`${mans.length} total`)}<div class="filterbar"><input type="search" class="selector-search" placeholder="${esc(t('search'))}"><select class="selector-school"><option value="">${esc(t('all'))}</option>${cats.map(c=>`<option>${esc(c)}</option>`).join('')}</select></div><div class="spell-columns selector-list">${cats.map(g=>`<div class="school-block" data-school="${g}"><h3>${g}</h3>${mans.filter(x=>x.category===g).map(x=>choiceRow(cls,x,'maneuver',selectedSet(cls).has(x.id))).join('')}</div>`).join('')}</div>${selectionFooter(cls,count)}</section>`;
  }
  function choiceRow(cls,x,type,checked){
    const csSummary=type==='spell'?spellSummaryCs(x):maneuverSummaryCs(x);
    const meta=`<span><strong>${esc(t('cost'))}:</strong> ${esc(x.cost)}</span><span><strong>${esc(t('range'))}:</strong> ${esc(x.range)}</span>${type==='spell'?`<span><strong>${esc(t('school'))}:</strong> ${esc(x.school)}</span><span><strong>${esc(t('duration'))}:</strong> ${esc(x.duration)}</span>`:''}`;
    const body=formatRuleBody(x.body_en,'web');
    return `<div class="choice-wrap" data-name="${esc(x.name.toLowerCase())}" data-school="${esc(type==='spell'?x.school:x.category)}"><div class="choice-row"><input type="checkbox" class="choice-check" data-class="${esc(cls)}" data-id="${esc(x.id)}" ${checked?'checked':''}><span class="name detail-toggle">${esc(x.name)}</span><span class="cost">${esc(x.cost)}</span></div><div class="details"><div class="meta">${meta}</div>${lang==='cs'?`<p class="cs-summary"><strong>Česky stručně:</strong> ${esc(csSummary)}</p><details><summary>${esc(t('original'))}</summary><div class="rules-text">${body}</div></details>`:`<div class="rules-text">${body}</div>`}</div></div>`;
  }
  function selectionFooter(cls,count=selectedSet(cls).size){
    return `<div class="selection-footer"><b><span class="selection-count">${count}</span> ${esc(t('selected'))}</b><div><button class="button secondary clear-selection" data-class="${esc(cls)}">${esc(t('clear'))}</button> <button class="button generate-selector" data-class="${esc(cls)}">${esc(t('generate'))}</button></div></div>`;
  }

  function spellSummaryCs(s){
    const src=`${s.cost || 'bez MP'}; ${s.range || 'dosah neurčen'}${s.duration?`; ${s.duration}`:''}.`;
    const first=(s.body_en.split(/\n|\. /)[0]||'').replace(/Spell Enhancements.*/,'').trim();
    return `${src} ${translateMechanic(first)}`.trim();
  }
  function maneuverSummaryCs(m){
    const first=(m.body_en.split(/\n|\. /)[0]||'').trim();
    return `${m.cost}${m.range?`; ${m.range}`:''}. ${translateMechanic(first)}`;
  }
  function translateMechanic(s){
    let out=s;
    const repl=[['You make','Provedeš'],['Make a','Proveď'],['You can','Můžeš'],['You gain','Získáš'],['You deal','Udělíš'],['You restore','Obnovíš'],['You summon','Vyvoláš'],['You create','Vytvoříš'],['You attempt','Pokusíš se'],['a creature','bytost'],['the target','cíl'],['within range','v dosahu'],['for the duration','po dobu trvání'],['takes','dostane'],['regains','obnoví']];
    repl.forEach(([a,b])=>out=out.replaceAll(a,b));
    return out;
  }

  function bindSelector(root){
    $$('.choice-check',root).forEach(cb=>cb.addEventListener('change',()=>{
      const key=cb.dataset.class;
      const set=selectedSet(key);
      cb.checked?set.add(cb.dataset.id):set.delete(cb.dataset.id);
      setSelected(key,set);
      const group=cb.closest('[data-selector]');
      const cnt=$('.selection-count',group);
      if(cnt) cnt.textContent=set.size;
    }));
    $$('.detail-toggle',root).forEach(el=>el.addEventListener('click',()=>{const wrap=el.closest('.choice-wrap');const detail=$('.details',wrap);const open=detail.classList.toggle('open');wrap.classList.toggle('open',open);}));
    $$('.selector-search',root).forEach(inp=>inp.addEventListener('input',()=>applyFilter(inp.closest('[data-selector]'))));
    $$('.selector-school',root).forEach(sel=>sel.addEventListener('change',()=>applyFilter(sel.closest('[data-selector]'))));
    $$('.clear-selection',root).forEach(btn=>btn.addEventListener('click',()=>{
      const key=btn.dataset.class;
      setSelected(key,new Set());
      $$(`.choice-check[data-class="${CSS.escape(key)}"]`,root).forEach(x=>x.checked=false);
      const cnt=$('.selection-count',btn.closest('[data-selector]'));
      if(cnt) cnt.textContent='0';
    }));
    $$('.generate-selector',root).forEach(btn=>btn.addEventListener('click',()=>generatePdfFor(btn.dataset.class)));
  }
  function bindClassOptions(root){
    $$('.class-option-check',root).forEach(cb=>cb.addEventListener('change',()=>{
      const key=cb.dataset.key;
      const group=cb.closest('[data-option-group]');
      const set=selectedSet(key);
      if(group?.dataset.maxOne==='1' && cb.checked){
        set.clear();
        $$('.class-option-check',group).forEach(other=>{ if(other!==cb) other.checked=false; });
      }
      cb.checked?set.add(cb.value):set.delete(cb.value);
      setSelected(key,set);
    }));
  }
  function applyFilter(group){
    const q=($('.selector-search',group)?.value||'').toLowerCase();
    const school=$('.selector-school',group)?.value||'';
    $$('.choice-wrap',group).forEach(w=>{
      const match=(!q||w.dataset.name.includes(q))&&(!school||w.dataset.school===school);
      w.style.display=match?'':'none';
    });
    $$('.school-block',group).forEach(b=>{
      const any=$$('.choice-wrap',b).some(w=>w.style.display!=='none');
      b.style.display=any?'':'none';
    });
  }

  function bindClassEvents(cls){
    bindSelector(app);
    bindClassOptions(app);
    $$('.level-jump',app).forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'})));
    if(cls==='spellblade'){
      $$('#schoolPicker input').forEach(cb=>cb.addEventListener('change',()=>{
        if(cb.checked && spellbladeSchools.length>=2){ cb.checked=false; showToast(t('schoolLimit')); return; }
        if(cb.checked) spellbladeSchools.push(cb.value);
        else {
          const i=spellbladeSchools.indexOf(cb.value);
          if(i>=0) spellbladeSchools.splice(i,1);
        }
        store.set('dc20-spellblade-schools',JSON.stringify(spellbladeSchools));
        $('#spellbladeSelectors').innerHTML = renderSpellSelector('spellblade',spellbladeAllowed()) + renderManeuverSelector('spellblade-maneuvers',R.maneuvers);
        bindSelector($('#spellbladeSelectors'));
        decorateGlossary($('#spellbladeSelectors'));
      }));
    }
  }

  function findItem(id,type){ return type==='maneuver'?R.maneuvers.find(x=>x.id===id):R.spells.find(x=>x.id===id); }
  function selectedClassOptions(baseCls,c){
    const options=[];
    if(baseCls==='cleric'){
      const set=selectedSet('cleric-domains');
      c.domains.filter(d=>set.has(d[0])).forEach(d=>options.push({name:d[0],body:lang==='en'?d[1]:d[2],group:t('domains')}));
    }
    if(baseCls==='spellblade'){
      const set=selectedSet('spellblade-disciplines');
      disciplineItems(c).filter(d=>set.has(d.name)).forEach(d=>options.push({name:d.name,body:lang==='en'?d.en:d.cs,group:t('disciplines')}));
    }
    return options;
  }
  function selectedSubclass(baseCls,c){
    const set=selectedSet(`${baseCls}-subclass`);
    return c.subclasses?.find(s=>set.has(s.name))||null;
  }
  function printableCoreFeatures(baseCls,c){ return coreFeatures(baseCls,c); }
  function printFeatureLevels(baseCls,c){
    let html='';
    for(let level=1;level<=6;level++){
      const feats=printableCoreFeatures(baseCls,c).filter(f=>f.level===level);
      const options=level===1?selectedClassOptions(baseCls,c):[];
      const subclass=level===3?selectedSubclass(baseCls,c):null;
      const extras=genericLevelItems(level).filter(x=>x!=='Subclass');
      if(!feats.length&&!options.length&&!subclass&&!extras.length) continue;
      html += `<section class="print-level"><h2>Level ${level} Class Features</h2><div class="print-columns">`+
        feats.map(f=>`<div class="print-rule"><h3>${esc(f.name)}</h3><p>${esc(lang==='en'?f.en:f.cs)}</p></div>`).join('')+
        (options.length?`<div class="print-rule"><h3>${esc(options[0].group)}</h3>${options.map(o=>`<h4>${esc(o.name)}</h4><p>${esc(o.body)}</p>`).join('')}</div>`:'')+
        (subclass?`<div class="print-rule"><h3>${esc(t('subclasses'))}: ${esc(subclass.name)}</h3><p>${esc(lang==='en'?subclass.en:subclass.cs)}</p></div>`:'')+
        (extras.length?`<div class="print-rule"><h3>${lang==='en'?'Progression':'Postup'}</h3><ul>${extras.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:'')+
        `</div></section>`;
    }
    return html;
  }
  function selectedRules(baseCls){
    let selected=[];
    if(baseCls==='cleric') selected=[...selectedSet('cleric')].map(id=>findItem(id,'spell')).filter(Boolean);
    if(baseCls==='commander') selected=[...selectedSet('commander')].map(id=>findItem(id,'maneuver')).filter(Boolean);
    if(baseCls==='spellblade'){
      selected=[...selectedSet('spellblade')].map(id=>findItem(id,'spell')).filter(Boolean);
      selected=selected.concat([...selectedSet('spellblade-maneuvers')].map(id=>findItem(id,'maneuver')).filter(Boolean));
    }
    return selected;
  }
  function formatPrintRules(body=''){
    return formatRuleBody(body,'print');
  }
  function printRuleCard(x){
    if(x.school){
      return `<article class="spell-print-card"><h2>${esc(x.name)}</h2><div class="spell-print-meta"><div><b><i>Source:</i></b> ${esc(x.source||'')}</div><div><b><i>School:</i></b> ${esc(x.school||'')}</div><div><b><i>Tags:</i></b> ${esc((x.tags||[]).join(', '))}</div><div><b><i>Cost:</i></b> ${esc(x.cost||'')}</div><div><b><i>Range:</i></b> ${esc(x.range||'')}</div><div><b><i>Duration:</i></b> ${esc(x.duration||'')}</div></div><div class="spell-print-body">${formatPrintRules(x.body_en)}</div></article>`;
    }
    return `<article class="spell-print-card maneuver-print-card"><h2>${esc(x.name)}</h2><div class="spell-print-meta"><div><b><i>Type:</i></b> Maneuver</div><div><b><i>Category:</i></b> ${esc(x.category||'')}</div><div><b><i>Cost:</i></b> ${esc(x.cost||'')}</div>${x.range?`<div><b><i>Range:</i></b> ${esc(x.range)}</div>`:''}</div><div class="spell-print-body">${formatPrintRules(x.body_en)}</div></article>`;
  }
  function generatePdfFor(cls){
    const baseCls=cls.startsWith('spellblade') ? 'spellblade' : cls;
    const selected=selectedRules(baseCls);
    if(!selected.length){
      showToast(lang==='en'?'Select at least one spell or maneuver first.':'Nejdřív vyber alespoň jeden spell nebo maneuver.');
      return;
    }
    const ordered=[...selected].sort((a,b)=>{
      const aType=a.school?0:1, bType=b.school?0:1;
      if(aType!==bType) return aType-bType;
      const ag=a.school||a.category||'', bg=b.school||b.category||'';
      return ag.localeCompare(bg)||a.name.localeCompare(b.name);
    });
    printSheet.innerHTML=`<article class="print-spell-sheet">${ordered.map(printRuleCard).join('')}</article>`;
    printSheet.setAttribute('aria-hidden','false');
    setTimeout(()=>window.print(),80);
  }
  window.addEventListener('afterprint',()=>{ printSheet.innerHTML=''; printSheet.setAttribute('aria-hidden','true'); });

  function tooltipEl(){
    let tip=$('#ruleTooltip');
    if(tip) return tip;
    tip=document.createElement('div');
    tip.id='ruleTooltip';
    tip.className='rule-tooltip';
    tip.setAttribute('role','dialog');
    tip.setAttribute('aria-live','polite');
    document.body.appendChild(tip);
    return tip;
  }
  function showGlossary(button,pin=false){
    const entry=GLOSSARY_BY_ID[button?.dataset?.glossary];
    if(!entry) return;
    const tip=tooltipEl();
    tip.innerHTML=`<strong>${esc(entry.title)}</strong><p>${esc(lang==='en'?entry.en:entry.cs)}</p>`;
    tip.classList.add('show');
    tip.dataset.pinned=pin?'1':'0';
    tip.dataset.forId=entry.id;
    const r=button.getBoundingClientRect();
    const pad=12;
    tip.style.left='0px';tip.style.top='0px';
    const tr=tip.getBoundingClientRect();
    let left=Math.min(window.innerWidth-tr.width-pad,Math.max(pad,r.left+(r.width-tr.width)/2));
    let top=r.bottom+10;
    if(top+tr.height>window.innerHeight-pad) top=Math.max(pad,r.top-tr.height-10);
    tip.style.left=`${left}px`;tip.style.top=`${top}px`;
  }
  function hideGlossary(force=false){
    const tip=$('#ruleTooltip');
    if(!tip) return;
    if(!force && tip.dataset.pinned==='1') return;
    tip.classList.remove('show');tip.dataset.pinned='0';tip.dataset.forId='';
  }
  function decorateGlossary(root){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()){
      const node=walker.currentNode;
      const parent=node.parentElement;
      if(!parent || !node.nodeValue.trim()) continue;
      if(parent.closest('.glossary-term,.rule-tooltip,.home-downloads')) continue;
      if(parent.closest('button,a,input,select,textarea,label,option,script,style,h1')) continue;
      GLOSSARY_RE.lastIndex=0;
      if(GLOSSARY_RE.test(node.nodeValue)) nodes.push(node);
    }
    nodes.forEach(node=>{
      const text=node.nodeValue;
      const frag=document.createDocumentFragment();
      let last=0;
      GLOSSARY_RE.lastIndex=0;
      let m;
      while((m=GLOSSARY_RE.exec(text))){
        if(m.index>last) frag.appendChild(document.createTextNode(text.slice(last,m.index)));
        const entry=GLOSSARY_ALIAS.get(m[0].toLowerCase());
        if(!entry){frag.appendChild(document.createTextNode(m[0]));last=m.index+m[0].length;continue;}
        const b=document.createElement('button');
        b.type='button';b.className='glossary-term';b.dataset.glossary=entry.id;b.textContent=m[0];
        b.setAttribute('aria-label',`${m[0]} - explanation`);
        frag.appendChild(b);
        last=m.index+m[0].length;
      }
      if(last<text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.replaceWith(frag);
    });
  }

  function inlineMarkup(text){
    return esc(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>');
  }
  function richText(text=''){
    const lines=String(text||'').replace(/\r/g,'').split('\n');
    let out='', list=false;
    const closeList=()=>{if(list){out+='</ul>';list=false;}};
    for(const raw of lines){
      const line=raw.trim();
      if(!line){closeList();continue;}
      if(line.startsWith('### ')){closeList();out+=`<h4>${inlineMarkup(line.slice(4))}</h4>`;continue;}
      if(line.startsWith('## ')){closeList();out+=`<h3>${inlineMarkup(line.slice(3))}</h3>`;continue;}
      if(line.startsWith('# ')){closeList();out+=`<h2>${inlineMarkup(line.slice(2))}</h2>`;continue;}
      if(/^[-*] /.test(line)){
        if(!list){out+='<ul>';list=true;}
        out+=`<li>${inlineMarkup(line.slice(2))}</li>`;
        continue;
      }
      closeList();out+=`<p>${inlineMarkup(line)}</p>`;
    }
    closeList();return out;
  }
  function legacyGangInfo(g){
    if(g.information) return g.information;
    const lines=[];
    if(g.flatteringNicknames?.length) lines.push(`**Lichotivé přezdívky:** ${g.flatteringNicknames.join(', ')}`);
    if(g.mockingNicknames?.length) lines.push(`**Výsměšné přezdívky:** ${g.mockingNicknames.join(', ')}`);
    if(g.locations?.length) lines.push(`**Lokace:** ${g.locations.join(', ')}`);
    if(g.income?.length){ lines.push('## Jak vydělávají'); g.income.forEach(x=>lines.push(`- ${x}`)); }
    if(g.defense?.length){ lines.push('## Obrana teritoria'); g.defense.forEach(x=>lines.push(`- ${x}`)); }
    if(g.traditions?.length){ lines.push('## Tradice'); g.traditions.forEach(x=>lines.push(`- ${x}`)); }
    if(g.base) lines.push(`## Základna\n${g.base}`);
    if(g.hierarchy?.length){ lines.push('## Hierarchie'); g.hierarchy.forEach(x=>lines.push(`- **${x.title}:** ${x.body}`)); }
    return lines.join('\n');
  }
  function accordionItem({title,meta='',image='',body='',kind='lore'}){
    return `<article class="lore-item"><button class="lore-toggle" type="button" aria-expanded="false"><span><strong>${esc(title)}</strong>${meta?`<small>${esc(meta)}</small>`:''}</span><span class="lore-chevron" aria-hidden="true">⌄</span></button><div class="lore-detail"><div class="lore-detail-inner">${image?`<img class="lore-image" src="${esc(image)}" alt="">`:''}<div class="lore-prose">${richText(body)}</div></div></div></article>`;
  }
  function bindLoreAccordions(){
    $$('.lore-toggle',app).forEach(btn=>btn.addEventListener('click',()=>{
      const item=btn.closest('.lore-item');const open=item.classList.toggle('open');btn.setAttribute('aria-expanded',open?'true':'false');
    }));
  }

  function renderGang(){
    const cards=(gangs||[]).map(g=>accordionItem({title:g.title||g.name||'Bez názvu',image:g.icon||'',body:legacyGangInfo(g)})).join('');
    app.innerHTML=`<article class="standard-reference lore-reference">${hero('Gangcyklopedie','','LORE')}<section class="lore-list">${cards}</section></article>`;
    bindLoreAccordions();
  }
  function renderCharacters(){
    const cards=(postavy||[]).map(p=>accordionItem({title:p.name||p.title||'Bez jména',image:p.image||'',body:p.description||p.body||''})).join('');
    app.innerHTML=`<article class="standard-reference lore-reference">${hero('Postavy')}<section class="lore-list">${cards}</section></article>`;
    bindLoreAccordions();
  }
  function renderChronicle(){
    const cards=(kronika||[]).map(e=>accordionItem({title:e.name||e.title||'Session',meta:e.date||'',body:e.body||e.chronicle||''})).join('');
    app.innerHTML=`<article class="standard-reference lore-reference chronicle-reference">${hero('Kronika')}<section class="lore-list">${cards}</section></article>`;
    bindLoreAccordions();
  }

  function render(){
    const route=classRoute();
    $$('.nav-cluster a, .brand-center').forEach(a=>a.classList.toggle('active',a.dataset.route===route));
    $('#siteHeader')?.classList.remove('mobile-open');
    $('#navToggle').setAttribute('aria-expanded','false');
    if(route==='home') renderHome();
    else if(route==='character') renderCharacter();
    else if(route==='combo') renderCombo();
    else if(route==='combat') renderCombat();
    else if(['cleric','commander','spellblade'].includes(route)) renderClass(route);
    else if(route==='toolkit') renderToolkit();
    else if(route==='gangcyklopedie') renderGang();
    else if(route==='postavy') renderCharacters();
    else renderChronicle();
    decorateGlossary(app);
    app.focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'auto'});
  }

  $('#langToggle').addEventListener('click',()=>{
    lang=lang==='en'?'cs':'en';
    store.set('dc20-lang',lang);
    $('#langToggle').textContent=lang.toUpperCase();
    render();
  });
  $('#themeToggle').addEventListener('click',()=>{
    theme=theme==='light'?'dark':'light';
    store.set('dc20-theme',theme);
    document.documentElement.dataset.theme=theme;
    $('#themeToggle').textContent=theme==='light'?'☀':'☾';
  });
  $('#navToggle').addEventListener('click',()=>{
    const header=$('#siteHeader');
    const open=header.classList.toggle('mobile-open');
    $('#navToggle').setAttribute('aria-expanded',open?'true':'false');
  });
  document.addEventListener('pointerover',e=>{
    const b=e.target.closest?.('.glossary-term');
    if(b && e.pointerType!=='touch') showGlossary(b,false);
  });
  document.addEventListener('pointerout',e=>{
    const b=e.target.closest?.('.glossary-term');
    if(b && e.pointerType!=='touch') hideGlossary(false);
  });
  document.addEventListener('focusin',e=>{const b=e.target.closest?.('.glossary-term');if(b)showGlossary(b,false);});
  document.addEventListener('focusout',e=>{if(e.target.closest?.('.glossary-term'))hideGlossary(false);});
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('.glossary-term');
    if(b){
      e.preventDefault();e.stopPropagation();
      const tip=tooltipEl();
      const same=tip.classList.contains('show')&&tip.dataset.forId===b.dataset.glossary&&tip.dataset.pinned==='1';
      if(same) hideGlossary(true); else showGlossary(b,true);
      return;
    }
    if(!e.target.closest?.('#ruleTooltip')) hideGlossary(true);
  });
  window.addEventListener('resize',()=>hideGlossary(true));
  toTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  window.addEventListener('scroll',()=>toTop?.classList.toggle('show',window.scrollY>450),{passive:true});
  window.addEventListener('hashchange',render);
  const splash=$('#splash');
  const splashDelay=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?120:1150;
  setTimeout(()=>splash?.classList.add('hide'),splashDelay);
  setTimeout(()=>splash?.remove(),splashDelay+650);
  if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(console.warn);
  render();
  loadCmsContent();
})();
