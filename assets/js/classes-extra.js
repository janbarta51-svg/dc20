(() => {
  const R = window.DC20_RULES;
  if (!R?.classes) return;

  const paragon = {
    name: 'Paragon',
    en: 'Novice Paragon\nYou gain a Class Talent of your choice from your Class.\n\nJack of one Trade (Flavor Feature)\nYou gain 1 Trade Point.',
    cs: 'Novice Paragon\nZískej 1 Class Talent dle svého výběru ze své Class.\n\nJack of one Trade (Flavor Feature)\nZískej 1 Trade Point.'
  };

  R.classes.champion = {
    name: 'Champion',
    tagline: {
      en: 'Champions are weapon and armor specialists that push themselves to the limit in combat. They are able to master a wide variety of weapon types and learn their enemies as they fight them.',
      cs: 'Champion je specialista na zbraně a brnění, který se v boji žene až na hranici svých možností. Dokáže ovládnout širokou škálu zbraní a během boje se učí číst své protivníky.'
    },
    sourceOfPower: {
      en: 'Champions train intensely to master all types of weapons and armor. They could be outfitted in heavy armor and a shield, swing a greatsword with ease, or become a highly trained archer.',
      cs: 'Championi intenzivně trénují, aby zvládli všechny druhy zbraní a brnění. Mohou bojovat v těžkém brnění se štítem, snadno ovládat greatsword nebo se stát vysoce trénovanými lučištníky.'
    },
    sourcePage: '217-220',
    level1: { hp: '+8', mp: 0, sp: 2, spells: 0, maneuvers: 2, training: 'Weapons, All Armor, All Shields' },
    progression: [
      {level:1,hp:'+8',attribute:'',skill:'',trade:'',resource:'+2 SP',known:'+2 Maneuvers',features:'Class Features'},
      {level:2,hp:'+2',attribute:'',skill:'',trade:'',resource:'',known:'',features:'Class Feature, Talent, Path Progression'},
      {level:3,hp:'+2',attribute:'+1',skill:'+1',trade:'+1',resource:'+1 SP',known:'+1 Maneuver',features:'Subclass Feature'},
      {level:4,hp:'+2',attribute:'',skill:'',trade:'',resource:'',known:'',features:'Talent, 2 Ancestry Points, Path Progression'},
      {level:5,hp:'+2',attribute:'+1',skill:'+2',trade:'+1',resource:'+1 SP',known:'+1 Maneuver',features:'Class Feature'},
      {level:6,hp:'+2',attribute:'',skill:'',trade:'',resource:'',known:'+1 Maneuver',features:'Talent, Path Progression'},
      {level:7,hp:'+2',attribute:'',skill:'',trade:'',resource:'+1 SP',known:'+1 Maneuver',features:'Subclass Expert Feature'},
      {level:8,hp:'+2',attribute:'+1',skill:'+1',trade:'+1',resource:'',known:'',features:'Talent, 2 Ancestry Points, Path Progression'},
      {level:9,hp:'+2',attribute:'',skill:'',trade:'',resource:'+1 SP',known:'+1 Maneuver',features:'Class Capstone Feature'},
      {level:10,hp:'+2',attribute:'+1',skill:'+2',trade:'+1',resource:'+1 SP',known:'+1 Maneuver',features:'Subclass Capstone Feature'}
    ],
    startingEquipment: [
      {name:'Arsenal', en:'Choose 3 of any of the following items: Weapon or Shield.', cs:'Vyber 3 položky z možností Weapon nebo Shield.'},
      {name:'Armor', en:'1 set of Armor.', cs:'1 sada Armor.'},
      {name:'Trade Tools', en:"Choose 1 of any of the following items: Carpenter's Tools, Cartographer's Tools, Gaming Kit, or Mason's Tools.", cs:"Vyber 1: Carpenter's Tools, Cartographer's Tools, Gaming Kit nebo Mason's Tools."},
      {name:'Adventuring Pack', en:'Choose 1 Adventuring Pack (packs are marked as coming soon in this beta).', cs:'Vyber 1 Adventuring Pack (v této beta verzi jsou balíčky označené jako coming soon).'}
    ],
    pathName: 'Champion Martial Path',
    pathDetails: [
      {name:'Combat Training', en:'Weapons, All Armor, All Shields', cs:'Weapons, All Armor, All Shields'},
      {name:'Maneuvers', en:'The number of Maneuvers you know increases as shown in the Maneuvers Known column of the Champion Class Table.', cs:'Počet známých Maneuvers se zvyšuje podle sloupce Maneuvers Known v Champion Class Table.'},
      {name:'Stamina Points', en:'Your maximum number of Stamina Points increases as shown in the Stamina Points column of the Champion Class Table.', cs:'Tvoje maximum Stamina Points se zvyšuje podle sloupce Stamina Points v Champion Class Table.'},
      {name:'Stamina Regen', en:'Once per Round, you can regain up to half your maximum SP when you perform a Maneuver.', cs:'Jednou za Round můžeš obnovit až polovinu svého maxima SP, když provedeš Maneuver.'}
    ],
    spellRule: {
      en: 'Martial Path. Combat Training: Weapons, All Armor, All Shields. Maneuvers and maximum Stamina increase according to the Champion Class Table. Once per Round, performing a Maneuver can restore up to half your maximum SP.',
      cs: 'Martial Path. Combat Training: Weapons, All Armor, All Shields. Počet Maneuvers a maximum Stamina se zvyšují podle Champion Class Table. Jednou za Round může provedení Maneuveru obnovit až polovinu maxima SP.'
    },
    features: [
      {
        level:1,
        name:'Master-at-Arms',
        en:"Your training in warfare has granted you the following benefits:\n\n• Weapon Master: At the start of each of your turns, you can freely swap any Weapon you're currently wielding in each hand for any other Weapon without provoking Opportunity Attacks.\n\n• Maneuver Master: You learn 1 Maneuver of your choice. Once per Round when you perform a Maneuver, you can reduce its SP cost by 1.",
        cs:'Tvůj výcvik ve válečném umění ti dává následující benefity:\n\n• Weapon Master: Na začátku každého svého tahu můžeš zdarma vyměnit Weapon, kterou právě držíš v každé ruce, za jinou Weapon bez vyvolání Opportunity Attacks.\n\n• Maneuver Master: Naučíš se 1 Maneuver dle svého výběru. Jednou za Round, když provedeš Maneuver, můžeš snížit jeho cenu o 1 SP.'
      },
      {
        level:1,
        name:'Fighting Spirit',
        en:'You stand ready for Combat at any moment, granting you the following benefits:\n\n• Combat Readiness: At the start of your first turn in Combat, you gain one of the following benefits:\n\n• Fortify: You gain the benefits of the Dodge Action and ADV on the next Save you make until the end of Combat.\n\n• Advance: You gain the benefits of the Move Action and ADV on the next Martial Attack or Physical Check you make until the end of Combat.\n\n• Second Wind: Once per Combat when you start your turn Bloodied, you can regain 2 HP and 2 SP.',
        cs:'Jsi kdykoli připraven na Combat a získáváš následující benefity:\n\n• Combat Readiness: Na začátku svého prvního tahu v Combat získáš jeden z následujících benefitů:\n\n• Fortify: Získáš benefity Dodge Action a ADV na příští Save, který provedeš do konce Combat.\n\n• Advance: Získáš benefity Move Action a ADV na příští Martial Attack nebo Physical Check, který provedeš do konce Combat.\n\n• Second Wind: Jednou za Combat, když začneš svůj tah Bloodied, můžeš obnovit 2 HP a 2 SP.'
      },
      {
        level:1,
        name:'Know Your Enemy (Flavor Feature)',
        en:"You can spend 1 minute observing or interacting with a creature out of Combat (or spend 1 AP in Combat) to learn information about its physical capabilities compared to your own. Choose one of the following stats of the creature to assess: Might, Agility, PD, AD, and HP. Make a DC 10 Knowledge or Insight Check (your choice).\n\nSuccess: You learn if the chosen stat is higher, lower, or the same as yours.\n\nDC Tip: If a creature is better than most at disguising or concealing their true power, the GM can increase the DC for this Feature. The GM won't tell you if the DC is higher, and if you roll higher than a 10 and still fail, they can lie about what information you gather.",
        cs:'Mimo Combat můžeš 1 minutu pozorovat nebo komunikovat s bytostí (nebo v Combat utratit 1 AP), abys porovnal její fyzické schopnosti se svými. Vyber Might, Agility, PD, AD nebo HP a proveď DC 10 Knowledge nebo Insight Check.\n\nSuccess: Zjistíš, zda je zvolená hodnota vyšší, nižší nebo stejná jako tvoje.\n\nDC Tip: Pokud bytost mimořádně dobře skrývá svou skutečnou sílu, GM může DC zvýšit. GM ti neřekne, že je DC vyšší, a pokud hodíš více než 10 a přesto neuspěješ, může ti dát nepravdivou informaci.'
      },
      {
        level:2,
        name:'Adaptive Tactics',
        en:"When you roll for Initiative, and at the end of each of your turns, you gain a d8 Tactical Die if you don't already have one. You can spend a Tactical Die to gain one of the following Tactics:\n\n• Assault: When you make a Martial Attack, you can add the die to the Attack's result.\n\n• Deflect: When you are Attacked, you can subtract the die from the Attack's result.",
        cs:'Když hodíš Initiative a na konci každého svého tahu získáš d8 Tactical Die, pokud už žádný nemáš. Tactical Die můžeš utratit na jednu z následujících Tactics:\n\n• Assault: Když provedeš Martial Attack, přičti kostku k výsledku Attacku.\n\n• Deflect: Když jsi Attacked, odečti kostku od výsledku Attacku.'
      },
      {
        level:5,
        name:'Expert Champion',
        en:'You gain the following benefits for your Champion Class Features:\n\n• Master-at-Arms: You learn 2 additional Maneuvers of your choice.\n\n• Fighting Spirit: When you gain the benefits of Second Wind, you regain an additional 2 HP and 2 SP.\n\n• Adaptive Tactics: Your Tactical Die is now a d10.',
        cs:'Pro své Champion Class Features získáš následující benefity:\n\n• Master-at-Arms: Naučíš se 2 další Maneuvers dle svého výběru.\n\n• Fighting Spirit: Když získáš benefity Second Wind, obnovíš navíc další 2 HP a 2 SP.\n\n• Adaptive Tactics: Tvůj Tactical Die je nyní d10.'
      }
    ],
    subclasses: [
      {
        name:'Hero',
        en:"Hero's Resolve\nYour warrior spirit refuses to yield in battle. You gain the following benefits:\n\n• Adrenaline Boost: When you use your Second Wind, you gain a +5 bonus to Martial Attacks and Martial Checks you make until the end of your turn.\n\n• Cut Through: Your Martial Attacks that score Heavy Hits ignore the target's Physical Resistances.\n\n• Unyielding Spirit: While Bloodied, you gain 1 Temp HP at the start of each of your turns.\n\nAdventuring Hero (Flavor Feature)\nYou ignore the penalties of Forced March and being Encumbered (but not Heavily Encumbered).",
        cs:"Hero's Resolve\nTvůj válečnický duch odmítá v boji ustoupit.\n\n• Adrenaline Boost: Když použiješ Second Wind, získáš do konce svého tahu +5 k Martial Attacks a Martial Checks.\n\n• Cut Through: Tvé Martial Attacks, které dosáhnou Heavy Hit, ignorují Physical Resistances cíle.\n\n• Unyielding Spirit: Když jsi Bloodied, na začátku každého svého tahu získáš 1 Temp HP.\n\nAdventuring Hero (Flavor Feature)\nIgnoruješ postihy Forced March a Encumbered, nikoli Heavily Encumbered."
      },
      {
        name:'Sentinel',
        en:"Stalwart Protector\nYou gain the following benefits:\n\n• Steadfast Defender: You can use your Deflect Tactic against any Attack that targets a creature within your Melee Range.\n\n• Defensive Bash: When you use a Defensive Maneuver as a Reaction to an Attack from a creature within 1 Space of you, the attacker must make a Physical Save against your Attack Check. Save Failure: The target is pushed 1 Space away or Taunted by you until the end of its next turn (your choice).\n\n• Not on my Watch: Creatures Taunted by you deal 1 less damage to targets within 1 Space of you.\n\nVigilant Watcher (Flavor Feature)\nDuring a Long Rest, if you spend both 4 hour periods doing Light Activity, you have ADV on the Might Save you make to avoid gaining Exhaustion. Additionally, the Save DC doesn't increase on a Failure.",
        cs:'Stalwart Protector\nZískáš následující benefity:\n\n• Steadfast Defender: Můžeš použít Deflect Tactic proti jakémukoli Attacku, který cílí bytost v tvém Melee Range.\n\n• Defensive Bash: Když použiješ Defensive Maneuver jako Reaction na Attack od bytosti do 1 Space, útočník provede Physical Save proti tvému Attack Checku. Save Failure: Cíl je odsunut o 1 Space nebo Taunted tebou do konce svého příštího tahu.\n\n• Not on my Watch: Bytosti Taunted tebou dávají o 1 damage méně cílům do 1 Space od tebe.\n\nVigilant Watcher (Flavor Feature)\nBěhem Long Restu, pokud oba čtyřhodinové úseky trávíš Light Activity, máš ADV na Might Save proti Exhaustion a Save DC se při Failure nezvyšuje.'
      },
      paragon
    ],
    talents: [
      {
        name:"Champion's Resolve",
        req:'Requirement: Adaptive Tactics, Level 3',
        en:"When you use a Tactical Die, you gain the following benefit:\n\n• Assault: The Attack deals +1 damage.\n\n• Deflect: If the Attack Misses, the Attacker takes 1 damage of a Physical damage type of your choice.",
        cs:'Když použiješ Tactical Die, získáš následující benefit:\n\n• Assault: Attack udělí +1 damage.\n\n• Deflect: Pokud Attack Misses, Attacker dostane 1 damage Physical typu dle tvého výběru.'
      },
      {
        name:'Disciplined Combatant',
        req:'Requirement: Fighting Spirit, Level 3',
        en:'Once on each of your turns, you can spend 2 SP to gain the benefit of Combat Readiness. Additionally, you can use Second Wind without being Bloodied.',
        cs:'Jednou v každém svém tahu můžeš utratit 2 SP a získat benefit Combat Readiness. Navíc můžeš použít Second Wind i bez toho, abys byl Bloodied.'
      }
    ]
  };

  R.classes.sorcerer = {
    name:'Sorcerer',
    tagline:{
      en:'Sorcerers tap into the raw magic in their own bodies as a conduit to harness, manipulate, and sculpt magic with wild resolve. They can overload themselves and even cast Spells without Mana, pushing the limits of magic and their own bodies.',
      cs:'Sorcerer čerpá surovou magii ze svého vlastního těla a používá ho jako vodič k ovládání a tvarování magie. Dokáže se magicky přetížit a tlačit své tělo i magii za běžné hranice.'
    },
    sourceOfPower:{
      en:"A Sorcerer's magic is in their blood, allowing them to tap into it naturally and use it in ways others can't. This could come from a lineage of angels, dragons, demons, or something else. Some Sorcerers' power could come from an incident that caused their body to be suffused with magic (such as a magical explosion, a blessing, or curse).",
      cs:'Sorcererova magie je v jeho krvi a dovoluje mu ji přirozeně používat způsoby, které ostatní nedokážou. Může pocházet z linie andělů, draků, démonů či něčeho jiného, nebo z události, která jeho tělo naplnila magií, například magickou explozí, požehnáním nebo kletbou.'
    },
    sourcePage:'249-252',
    level1:{hp:'+7',mp:6,sp:0,spells:4,maneuvers:0,training:'Spell Focuses, Light Armor'},
    startingEquipment:[
      {name:'Arsenal',en:'2 Spell Focuses.',cs:'2 Spell Focuses.'},
      {name:'Armor',en:'1 set of Light Armor.',cs:'1 sada Light Armor.'},
      {name:'Trade Tools',en:"Choose 2 of any of the following items: Alchemist's Supplies, Calligrapher's Supplies, Jeweler's Tools, or Weaver's Tools.",cs:"Vyber 2: Alchemist's Supplies, Calligrapher's Supplies, Jeweler's Tools nebo Weaver's Tools."},
      {name:'Adventuring Pack',en:'Choose 1 Adventuring Pack (packs are marked as coming soon in this beta).',cs:'Vyber 1 Adventuring Pack (v této beta verzi jsou balíčky označené jako coming soon).'}
    ],
    pathName:'Sorcerer Spellcasting Path',
    pathDetails:[
      {name:'Combat Training',en:'Spell Focuses, Light Armor',cs:'Spell Focuses, Light Armor'},
      {name:'Spell List',en:'You choose 1 Spell Source (Arcane, Divine, or Primal). When you learn a new Spell, you can choose any Spell from the chosen Spell Source.',cs:'Vyber 1 Spell Source: Arcane, Divine nebo Primal. Když se učíš nový Spell, můžeš vybrat libovolný Spell z vybraného Source.'},
      {name:'Spells Known',en:'The number of Spells you know increases as shown in the Spells Known column of the Sorcerer Class Table.',cs:'Počet známých Spellů se zvyšuje podle sloupce Spells Known v Sorcerer Class Table.'},
      {name:'Mana Points',en:'Your maximum number of Mana Points increases as shown in the Mana Points column of the Sorcerer Class Table.',cs:'Tvoje maximum Mana Points se zvyšuje podle sloupce Mana Points v Sorcerer Class Table.'}
    ],
    spellRule:{
      en:'Spellcasting Path. Choose 1 Spell Source: Arcane, Divine, or Primal. When you learn a new Spell, choose any Spell from that Source. Spells Known and maximum Mana increase according to the Sorcerer Class Table.',
      cs:'Spellcasting Path. Vyber 1 Spell Source: Arcane, Divine nebo Primal. Když se učíš nový Spell, vybíráš z tohoto Source. Spells Known a maximum Mana se zvyšují podle Sorcerer Class Table.'
    },
    origins:[
      {name:'Intuitive Magic',en:'You learn 2 Spells of your choice from your Spell List.',cs:'Naučíš se 2 Spelly dle svého výběru ze svého Spell Listu.'},
      {name:'Resilient Magic',en:'You gain Dazed Resistance.',cs:'Získáš Dazed Resistance.'},
      {name:'Unstable Magic',en:"When you Critically Succeed or Fail on a Spell Attack or Spell Check, roll on the Wild Magic Table. If it's a Critical Success you roll with ADV, if it's a Critical Failure you roll with DisADV. The effect lasts until the end of your next turn, unless stated otherwise. When you roll on the Wild Magic Table in this way, you gain ADV on the next Spell Attack or Spell Check you make before the end of your next turn.",cs:'Když Critically Succeed nebo Fail na Spell Attacku či Spell Checku, hoď na Wild Magic Table. Při Critical Success házíš s ADV, při Critical Failure s DisADV. Efekt trvá do konce tvého příštího tahu, pokud není uvedeno jinak. Po tomto hodu získáš ADV na příští Spell Attack nebo Spell Check do konce svého příštího tahu.'}
    ],
    metaMagic:[
      {name:'Careful Spell',en:'(1 MP) When you Cast a Spell that targets an area (such as a Line, Cone, or Sphere), you can choose to exclude creatures of your choice from the Spell’s damage and effects.',cs:'(1 MP) Když Cast a Spell, který cílí oblast (např. Line, Cone nebo Sphere), můžeš vybrané bytosti vynechat z damage a efektů Spellu.'},
      {name:'Distant Spell',en:'(1 MP) When you cast a Spell, you can increase its range by 2 Spaces if it has a range of 1 Space or by 10 Spaces if its range is greater than 1 Space.',cs:'(1 MP) Když castíš Spell, zvyš jeho range o 2 Spaces, pokud má range 1 Space, nebo o 10 Spaces, pokud je range větší než 1 Space.'},
      {name:'Quickened Spell',en:'(1 MP) You can reduce the AP cost of a Spell by 1 (minimum of 1 AP).',cs:'(1 MP) Můžeš snížit AP cost Spellu o 1, minimálně na 1 AP.'},
      {name:'Subtle Spell',en:'(1 MP) You can cast the Spell without requiring any Somatic and Verbal Components.',cs:'(1 MP) Můžeš castit Spell bez Somatic a Verbal Components.'},
      {name:'Transmuted Spell',en:'(1 MP) When you cast a Spell that deals damage, you can change its damage type to any other damage type of your choice (except True damage).',cs:'(1 MP) Když castíš Spell, který dává damage, můžeš změnit jeho damage type na jiný dle svého výběru kromě True damage.'},
      {name:'Vicious Spell',en:'(1 MP) When you cast a Spell that forces a creature to make a Save to resist its effects, 1 target of your choice has DisADV on its first Save against the Spell.',cs:'(1 MP) Když Spell nutí bytost provést Save, 1 cíl dle tvého výběru má DisADV na svůj první Save proti Spellu.'}
    ],
    wildMagic:[
      'You turn into a small creature with the stats of a Sheep (HP 2, PD & AD 5, Melee Attack +2, Damage 1).',
      'A wave of magic explodes out from you. You take True damage equal to your Prime Modifier and creatures within 5 Spaces must succeed a Physical Save against your Save DC or take the same amount of damage.',
      'You are Stunned 3.',
      'You are overcome by a wave of lethargy. You have DisADV on all Checks and Saves.',
      'You are Stunned 1.',
      'You are Blinded and Deafened.',
      'All living creatures become Invisible to you.',
      'You gain a d4 penalty on all Checks and Saves.',
      'You grow by 1 Size, become 2 times heavier, and your Speed is reduced by 2.',
      'A strong gravitational pull originates from you. All creatures within 5 Spaces must make a Might Save or be pulled 4 Spaces toward you.',
      'Forceful winds shoot out from you in all directions. All creatures within 5 Spaces (except you) must make a Might Save or be pushed 4 Spaces away from you.',
      'You grow by 1 Size, become one and a half times heavier, and your Speed is increased by 2.',
      'You gain a d4 bonus to all Checks and Saves.',
      'You gain a Truesight of 10 Spaces.',
      'You become Invisible.',
      'Your maximum AP increases by 1 and you gain 1 AP.',
      'You become energized. You have ADV on all Checks and Saves.',
      'You gain a surge of power, granting you +5 to all Spell Checks you make.',
      'You overflow with life energy. You and creatures within 5 Spaces regain HP equal to your Prime Modifier.',
      'You turn into a large creature with the stats of a Young Purple Dragon, but without a Breath Weapon (HP 30, PD & AD 16, Attack +10, Damage 4, Fly Speed 6).'
    ],
    wildMagicCs:[
      'Proměníš se v malou bytost se statistikami Sheep (HP 2, PD & AD 5, Melee Attack +2, Damage 1).',
      'Vlna magie z tebe exploduje. Dostaneš True damage rovný Prime Modifier a bytosti do 5 Spaces musí uspět na Physical Save proti tvému Save DC, jinak dostanou stejný damage.',
      'Jsi Stunned 3.','Zaplaví tě letargie. Máš DisADV na všechny Checks a Saves.','Jsi Stunned 1.','Jsi Blinded a Deafened.','Všechny živé bytosti jsou pro tebe Invisible.','Máš d4 penalty na všechny Checks a Saves.','Vyrosteš o 1 Size, vážíš dvojnásobek a Speed se sníží o 2.','Z tebe vychází silná gravitační síla. Všechny bytosti do 5 Spaces provedou Might Save nebo jsou přitaženy o 4 Spaces k tobě.','Silný vítr vystřelí všemi směry. Všechny bytosti do 5 Spaces kromě tebe provedou Might Save nebo jsou odtlačeny o 4 Spaces.','Vyrosteš o 1 Size, vážíš 1,5× více a Speed se zvýší o 2.','Máš d4 bonus na všechny Checks a Saves.','Získáš Truesight 10 Spaces.','Staneš se Invisible.','Tvoje maximum AP se zvýší o 1 a získáš 1 AP.','Jsi nabitý energií. Máš ADV na všechny Checks a Saves.','Získáš +5 ke všem Spell Checks.','Ty i bytosti do 5 Spaces obnovíte HP rovné tvému Prime Modifier.','Proměníš se ve velkou bytost se statistikami Young Purple Dragon bez Breath Weapon (HP 30, PD & AD 16, Attack +10, Damage 4, Fly Speed 6).'
    ],
    features:[
      {
        level:1,
        name:'Innate Power',
        en:'Choose a Sorcerous Origin that grants you a benefit: Intuitive Magic, Resilient Magic, or Unstable Magic. Additionally, you gain the following benefits:\n\n• Your Maximum MP increases by 1.\n\n• You gain the benefit of a 1 point Focus Property of your choice. You can change the Property when you complete a Long Rest.',
        cs:'Vyber Sorcerous Origin, který ti dá benefit: Intuitive Magic, Resilient Magic nebo Unstable Magic. Navíc získáš:\n\n• Tvoje Maximum MP se zvýší o 1.\n\n• Získáš benefit jedné 1 point Focus Property dle svého výběru. Property můžeš změnit po dokončení Long Restu.'
      },
      {
        level:1,
        name:'Overload Magic',
        en:'You can spend 1 AP + 1 MP in Combat to channel raw magical energy for 1 minute, or until you become Incapacitated, die, or choose to end it early at any time for free. For the duration, your magic is overloaded and you are subjected to the following effects:\n\n• You gain +5 to all Spell Attacks and Spell Checks you make.\n\n• You must immediately make an Attribute Save (your choice) against your Save DC upon using this Feature, and again at the start of each of your turns. Failure: You gain Exhaustion. You lose any Exhaustion gained in this way when you complete a Short Rest.',
        cs:'V Combat můžeš utratit 1 AP + 1 MP a na 1 minutu channelovat surovou magickou energii, dokud nejsi Incapacitated, nezemřeš nebo efekt zdarma dříve neukončíš. Po dobu trvání:\n\n• Máš +5 ke všem Spell Attacks a Spell Checks.\n\n• Při použití Feature okamžitě proveď Attribute Save dle svého výběru proti svému Save DC a znovu na začátku každého svého tahu. Failure: Získáš Exhaustion. Exhaustion získané tímto způsobem ztratíš po Short Restu.'
      },
      {level:1,name:'Sorcery (Flavor Feature)',en:'You learn the Sorcery Spell.',cs:'Naučíš se Sorcery Spell.'},
      {
        level:2,
        name:'Meta Magic',
        en:'You gain 2 unique Spell Enhancements from the list below. You can only use 1 of these Spell Enhancements per Spell you cast. MP spent on these Spell Enhancements do not count against your Mana Spend Limit.\n\nOnce per Long Rest, you can use 1 of these unique Spell Enhancements without spending MP. You regain the ability to do so again when you roll for Initiative.',
        cs:'Získáš 2 unikátní Spell Enhancements ze seznamu níže. Na jeden castěný Spell můžeš použít jen 1 z těchto Spell Enhancements. MP utracené za ně se nepočítají do Mana Spend Limit.\n\nJednou za Long Rest můžeš 1 z těchto unikátních Spell Enhancements použít bez utracení MP. Tuto možnost znovu získáš, když hodíš Initiative.'
      },
      {
        level:5,
        name:'Expert Sorcerer',
        en:'You gain the following benefits for your Sorcerer Class Features:\n\n• Innate Power: Your Maximum MP increases by 1. You gain the benefit of an additional 1 point Focus Property of your choice. You can change either or both Properties whenever you finish a Long Rest.\n\n• Overload Magic: You no longer need to make an Attribute Save upon using Overload, but you still need to make a Save at the start of each of your turns while Overloaded.\n\n• Meta Magic: You learn 1 additional Meta Magic option of your choice. You can now use 2 Meta Magic Spell Enhancements at a time, provided you do not use the same option more than once.',
        cs:'Pro své Sorcerer Class Features získáš následující benefity:\n\n• Innate Power: Maximum MP se zvýší o 1 a získáš benefit další 1 point Focus Property. Jednu nebo obě můžeš změnit po Long Restu.\n\n• Overload Magic: Při použití Overload už nemusíš provést okamžitý Attribute Save, ale stále ho provádíš na začátku každého svého tahu během Overload.\n\n• Meta Magic: Naučíš se 1 další Meta Magic možnost. Na stejný Spell nyní můžeš použít 2 různé Meta Magic Spell Enhancements, pokud nepoužiješ stejnou možnost dvakrát.'
      }
    ],
    subclasses:[
      {
        name:'Angelic',
        en:'Celestial Spark\nYou can use a Minor Action to emit Bright Light within a 5 Space Radius and can end the effect at any time. You also gain the following abilities:\n\n• Celestial Origin: You gain access to the Angelborn Ancestry and you gain 2 Ancestry Points that can only be spent on Angelborn Traits.\n\n• Celestial Protection: You learn the Careful Spell Meta Magic option (choose another Meta Magic option if you already know it) and Careful Spell now costs 0 MP to use.\n\n• Celestial Overload: Once per Combat while you are Overloaded, you can spend 1 AP to release a burst of radiant light in a 5 Space Aura. Creatures of your choice within range are either healed or seared by the light (your choice for each creature).\n• Healed: The creature regains 1 HP.\n• Seared: Make a Spell Attack against the AD of each target. Hit: The target takes 1 Radiant damage.\n\nCelestial Appearance (Flavor Feature)\nYou gain additional angelic features such as sparkling skin, feathers, a faint halo, or other changes of your choice. If you already have these features, they are enhanced or expanded upon. Additionally, you gain 1 level of Language Mastery in Celestial. If you are already Fluent in Celestial, you gain 1 level of Language Mastery in another Language of your choice.',
        cs:'Celestial Spark\nJako Minor Action můžeš vyzařovat Bright Light v 5 Space Radius a kdykoli efekt ukončit. Navíc získáš:\n\n• Celestial Origin: Získáš přístup k Angelborn Ancestry a 2 Ancestry Points použitelné pouze na Angelborn Traits.\n\n• Celestial Protection: Naučíš se Careful Spell Meta Magic (nebo jinou možnost, pokud ji už znáš) a Careful Spell tě stojí 0 MP.\n\n• Celestial Overload: Jednou za Combat během Overload můžeš utratit 1 AP a vytvořit 5 Space Aura zářivého světla. Každou vybranou bytost v dosahu buď Healneš, nebo Seared.\n• Healed: Obnoví 1 HP.\n• Seared: Proveď Spell Attack proti AD každého cíle. Hit: 1 Radiant damage.\n\nCelestial Appearance (Flavor Feature)\nZískáš nebo zesílíš andělské rysy. Navíc získáš 1 level Language Mastery v Celestial; pokud už jsi Fluent, získáš 1 level v jiném Language dle výběru.'
      },
      {
        name:'Draconic',
        en:'Draconic Spark\nYou gain the following abilities:\n\n• Draconic Origin: You gain access to the Dragonborn Ancestry and you gain 2 Ancestry Points that can only be spent on Dragonborn Traits. Additionally, choose a Draconic Origin from the Dragonborn Ancestry if you have not already.\n\n• Draconic Overload: While Overloaded, you gain Resistance (1) to Physical damage and your Draconic Origin damage type.\n\n• Draconic Transmutation: You gain the Transmuted Spell Meta Magic (choose another Meta Magic option if you already have Transmuted Spell). Transmuted Spell now costs you 0 MP to use if you change the damage type to your Draconic Origin damage type.\n\nDraconic Appearance (Flavor Feature)\nYou gain additional draconic features such as scales, fangs, claws, or other changes of your choice. If you already have these features, they are enhanced or expanded upon. Additionally, you gain 1 level of Language Mastery in Draconic. If you are already Fluent in Draconic, you gain 1 level of Language Mastery in another Language of your choice.',
        cs:'Draconic Spark\nZískáš následující schopnosti:\n\n• Draconic Origin: Získáš přístup k Dragonborn Ancestry a 2 Ancestry Points použitelné pouze na Dragonborn Traits. Pokud ještě nemáš Draconic Origin, jeden si vyber.\n\n• Draconic Overload: Během Overload získáš Resistance (1) vůči Physical damage a damage typu svého Draconic Origin.\n\n• Draconic Transmutation: Získáš Transmuted Spell Meta Magic (nebo jinou možnost, pokud ho už máš). Transmuted Spell stojí 0 MP, pokud mění damage type na damage type tvého Draconic Origin.\n\nDraconic Appearance (Flavor Feature)\nZískáš nebo zesílíš dračí rysy. Navíc získáš 1 level Language Mastery v Draconic; pokud už jsi Fluent, získáš 1 level v jiném Language dle výběru.'
      },
      paragon
    ],
    talents:[
      {name:'Expanded Meta Magic',req:'Requirement: Meta Magic',en:'You gain the following benefits:\n\n• Your maximum MP increases by 2.\n\n• You gain 2 additional Meta Magic Spell Enhancement. You cannot choose the same option more than once.',cs:'Získáš následující benefity:\n\n• Maximum MP se zvýší o 2.\n\n• Získáš 2 další Meta Magic Spell Enhancements. Stejnou možnost nemůžeš vybrat více než jednou.'},
      {name:'Greater Innate Power',req:'Requirements: Innate Power, Level 3',en:'You gain the following benefits:\n\n• Your MP maximum increases by 1.\n\n• You gain the benefit of an additional 1 point Focus Property of your choice. You can change either or both Properties whenever you finish a Short or Long Rest.\n\n• You gain another Sorcerous Origin of your choice.',cs:'Získáš následující benefity:\n\n• Maximum MP se zvýší o 1.\n\n• Získáš benefit další 1 point Focus Property dle výběru. Jednu nebo obě Properties můžeš změnit po Short nebo Long Restu.\n\n• Získáš další Sorcerous Origin dle svého výběru.'},
      {name:'Font of Magic',req:'Requirements: Meta Magic, Level 3',en:'Your magical vitality grants you the following benefits:\n\n• You can spend 2 Rest Points in place of 1 MP on Meta Magic.\n\n• You regain 2 Rest Points when you roll for Initiative.',cs:'Tvoje magická vitalita ti dává následující benefity:\n\n• Na Meta Magic můžeš utratit 2 Rest Points místo 1 MP.\n\n• Když hodíš Initiative, obnovíš 2 Rest Points.'}
    ]
  };
})();
