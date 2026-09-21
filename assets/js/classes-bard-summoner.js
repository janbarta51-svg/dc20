(() => {
  const R = window.DC20_RULES;
  if (!R?.classes) return;

  const paragon = {
    name: 'Paragon',
    en: 'Novice Paragon\nYou gain a Class Talent of your choice from your Class.\n\nJack of one Trade (Flavor Feature)\nYou gain 1 Trade Point.',
    cs: 'Novice Paragon\nZískej 1 Class Talent dle svého výběru ze své Class.\n\nJack of one Trade (Flavor Feature)\nZískej 1 Trade Point.'
  };

  R.classes.bard = {
    name: 'Bard',
    tagline: {
      en: 'Bards use artistic expression to connect with the emotions and heart of magic. They excel at helping allies, performing, and adapting their spellcasting to the moment.',
      cs: 'Bardi používají umělecké vyjádření k propojení s emocemi a srdcem magie. Vynikají v podpoře spojenců, vystupování a přizpůsobivém sesílání kouzel.'
    },
    sourceOfPower: {
      en: 'Bards draw power from emotion, determination, and force of will, channeling those feelings through music, dance, poetry, storytelling, painting, speech, or another artistic expression.',
      cs: 'Bardi čerpají sílu z emocí, odhodlání a vůle a vedou ji skrze hudbu, tanec, poezii, vyprávění, malbu, řeč nebo jiné umělecké vyjádření.'
    },
    sourcePage: '213-216',
    level1: { hp: '+7', mp: 6, sp: 0, spells: 4, maneuvers: 0, training: 'Spell Focuses, Light Armor, Light Shields' },
    progression: [
      {level:1,hp:'+7',attribute:'',skill:'',trade:'',resource:'+6 MP',known:'+4 Spells',features:'Class Features'},
      {level:2,hp:'+1',attribute:'',skill:'',trade:'',resource:'',known:'',features:'Class Feature, Talent, Path Progression'},
      {level:3,hp:'+1',attribute:'+1',skill:'+1',trade:'+1',resource:'+3 MP',known:'+1 Spell',features:'Subclass Feature'},
      {level:4,hp:'+1',attribute:'',skill:'',trade:'',resource:'',known:'',features:'Talent, 2 Ancestry Points, Path Progression'},
      {level:5,hp:'+1',attribute:'+1',skill:'+2',trade:'+1',resource:'+3 MP',known:'+1 Spell',features:'Class Feature'},
      {level:6,hp:'+1',attribute:'',skill:'+1',trade:'',resource:'',known:'',features:'Talent, Path Progression'},
      {level:7,hp:'+1',attribute:'',skill:'',trade:'',resource:'+3 MP',known:'+1 Spell',features:'Subclass Expert Feature'},
      {level:8,hp:'+1',attribute:'+1',skill:'+1',trade:'+1',resource:'',known:'',features:'Talent, 2 Ancestry Points, Path Progression'},
      {level:9,hp:'+1',attribute:'',skill:'',trade:'',resource:'+3 MP',known:'+1 Spell',features:'Class Capstone Feature'},
      {level:10,hp:'+1',attribute:'+1',skill:'+2',trade:'+1',resource:'+3 MP',known:'+1 Spell',features:'Subclass Capstone Feature'}
    ],
    startingEquipment: [
      {name:'Arsenal', en:'Choose 3 of any of the following items: Spell Focus, Weapon, or Light Shield.', cs:'Vyber 3 položky z možností Spell Focus, Weapon nebo Light Shield.'},
      {name:'Armor', en:'1 set of Light Armor.', cs:'1 sada Light Armor.'},
      {name:'Trade Tools', en:"Choose 1 of any of the following items: Calligrapher's Supplies, Disguise Kit, Gaming Kit, Musical Instrument, or Sculptor's Tools.", cs:"Vyber 1: Calligrapher's Supplies, Disguise Kit, Gaming Kit, Musical Instrument nebo Sculptor's Tools."},
      {name:'Adventuring Pack', en:'Choose 1 Adventuring Pack (packs are marked as coming soon in this beta).', cs:'Vyber 1 Adventuring Pack (v této beta verzi jsou balíčky označené jako coming soon).'}
    ],
    pathName: 'Bard Spellcasting Path',
    pathDetails: [
      {name:'Combat Training', en:'Spell Focuses, Light Armor, Light Shields', cs:'Spell Focuses, Light Armor, Light Shields'},
      {name:'Spell List', en:'When you learn a new Spell, choose any Spell from the Enchantment Spell School or a Spell with the Embolden, Enfeeble, Healing, Illusion, or Sound Tag.', cs:'Když se učíš nový Spell, vyber libovolný Spell z Enchantment School nebo Spell s tagem Embolden, Enfeeble, Healing, Illusion či Sound.'},
      {name:'Spells Known', en:'The number of Spells you know increases as shown in the Spells Known column of the Bard Class Table.', cs:'Počet známých Spellů se zvyšuje podle sloupce Spells Known v Bard Class Table.'},
      {name:'Mana Points', en:'Your maximum Mana Points increase as shown in the Mana Points column of the Bard Class Table.', cs:'Tvoje maximum Mana Points se zvyšuje podle sloupce Mana Points v Bard Class Table.'}
    ],
    spellRule: {
      en: 'Spellcasting Path. Your Spell List contains the Enchantment Spell School plus Spells with the Embolden, Enfeeble, Healing, Illusion, or Sound Tags.',
      cs: 'Spellcasting Path. Tvůj Spell List obsahuje Enchantment School a Spelly s tagy Embolden, Enfeeble, Healing, Illusion nebo Sound.'
    },
    features: [
      {level:1,name:'Font of Inspiration',en:'You are an ever present source of aid for your allies.\n\n• Ranged Help Attack: The range of your Help Action when aiding an Attack increases to 10 Spaces.\n\n• Help Reaction: When a creature you can see makes a Check, you can take the Help Action as a Reaction to aid them with their Check, provided you are within range to do so.',cs:'Jsi stálým zdrojem pomoci pro své spojence.\n\n• Ranged Help Attack: Dosah Help Action při pomoci s Attackem se zvýší na 10 Spaces.\n\n• Help Reaction: Když bytost, kterou vidíš, provede Check, můžeš použít Help Action jako Reaction, pokud jsi v potřebném dosahu.'},
      {level:1,name:'Remarkable Repertoire',en:'You have picked up a few tricks along your travels.\n\n• Jack of All Trades: You gain 2 Skill Points.\n\n• Magical Secrets: You learn any 2 Spells of your choice from any Spell List.\n\n• Magical Expression: Choose Visual or Auditory expression. Visual lets you ignore Verbal Components but requires Somatic Components. Auditory lets you ignore Somatic Components but requires Verbal Components.',cs:'Na cestách ses naučil řadu triků.\n\n• Jack of All Trades: Získáš 2 Skill Points.\n\n• Magical Secrets: Naučíš se 2 libovolné Spelly z jakéhokoli Spell Listu.\n\n• Magical Expression: Vyber Visual nebo Auditory způsob. Visual dovolí ignorovat Verbal Components, ale vyžaduje Somatic Components. Auditory dovolí ignorovat Somatic Components, ale vyžaduje Verbal Components.'},
      {level:1,name:'Crowd Pleaser (Flavor Feature)',en:'After spending at least 5 minutes performing an Artistry Trade for people who are actively watching or listening, make an Artistry Trade Check contested by their Charisma Save. Success: You gain ADV on Charisma Checks against the target for 1 hour or until you become hostile.',cs:'Po alespoň 5 minutách vystupování s Artistry Trade před lidmi, kteří tě aktivně sledují nebo poslouchají, proveď Artistry Trade Check proti jejich Charisma Save. Success: Na 1 hodinu nebo do projevu nepřátelství získáš ADV na Charisma Checks proti cíli.'},
      {level:2,name:'Bardic Performance',en:'Spend 1 AP and 1 MP to start a 10 Space Aura for 1 minute. Choose one performance. Creatures of your choice in the Aura that can see or hear you gain its benefit.\n\n• Battle Ballad: d4 bonus to the first Attack Check on each of their turns.\n• Fast Tempo: +1 Speed.\n• Inspiring: 1 Temp HP at the start of each turn.\n• Emotional: Choose Charmed, Frightened, Intimidated, or Taunted; chosen creatures gain Resistance to that Condition and can Repeat the Save at the start of their turn if affected.\n\nChanging Performances: Once on each of your turns, spend 1 AP to change the performance.\n\nEnding Early: The performance ends if you become Incapacitated, die, or choose to end it for free.',cs:'Za 1 AP a 1 MP spustíš na 1 minutu Auru 10 Spaces. Vyber jednu performance. Vybrané bytosti v Auře, které tě vidí nebo slyší, získají její benefit.\n\n• Battle Ballad: d4 bonus k prvnímu Attack Checku v každém jejich tahu.\n• Fast Tempo: +1 Speed.\n• Inspiring: 1 Temp HP na začátku každého tahu.\n• Emotional: Vyber Charmed, Frightened, Intimidated nebo Taunted; bytosti získají Resistance proti danému Condition a při jeho působení mohou na začátku tahu zopakovat Save.\n\nChanging Performances: Jednou za svůj tah můžeš za 1 AP performance změnit.\n\nEnding Early: Performance skončí, pokud jsi Incapacitated, zemřeš nebo ji zdarma ukončíš.'},
      {level:5,name:'Expert Bard',en:'You gain the following improvements.\n\n• Font of Inspiration: Your Help Die now starts at a d10.\n\n• Remarkable Repertoire: Gain 2 Skill Points and learn any 2 Spells of your choice from any Spell List.\n\n• Bardic Performance: You can change performance at the start of each turn for free. When starting Bardic Performance, you may spend 2 additional MP to improve it: Battle Ballad becomes d8; Fast Tempo gives +2 Speed; Inspiring grants +2 Temp HP; Emotional grants Resistance to all four listed Conditions.',cs:'Získáš následující zlepšení.\n\n• Font of Inspiration: Help Die začíná na d10.\n\n• Remarkable Repertoire: Získej 2 Skill Points a nauč se 2 libovolné Spelly z jakéhokoli Spell Listu.\n\n• Bardic Performance: Performance můžeš zdarma změnit na začátku každého tahu. Při spuštění Bardic Performance můžeš utratit další 2 MP: Battle Ballad se změní na d8, Fast Tempo dává +2 Speed, Inspiring dává +2 Temp HP a Emotional dává Resistance proti všem čtyřem uvedeným Conditionům.'}
    ],
    subclasses: [
      {name:'Eloquence',en:'Beguiling Presence\n\n• Enthrall: Learn the Charm Spell, and it does not end as a result of the target taking damage. If you already know it, learn another Spell with the Charmed Tag.\n\n• Misleading Muse: When a creature in your Bardic Performance targets only you with an Attack, spend 1 AP as a Reaction to make a Spell Check against the Attack Check. Success: The creature becomes Charmed by you until the end of your next turn and must target a different creature in range or the Attack fails.\n\n• Mind Games: When the Charmed Condition ends on a creature Charmed by you, you may deal 1 Psychic damage to it.\n\nEloquent Orator (Flavor Feature): Creatures can always understand the words you speak if they speak at least 1 Language.',cs:'Beguiling Presence\n\n• Enthrall: Naučíš se Charm Spell a neskončí kvůli damage cíle. Pokud ho už znáš, nauč se jiný Spell s tagem Charmed.\n\n• Misleading Muse: Když tě bytost v Bardic Performance cílí jako jediný cíl Attacku, za 1 AP jako Reaction proveď Spell Check proti Attack Checku. Success: Bytost je Charmed tebou do konce tvého příštího tahu a musí zvolit jiný cíl v dosahu, jinak Attack selže.\n\n• Mind Games: Když skončí Charmed Condition na bytosti Charmed tebou, můžeš jí udělit 1 Psychic damage.\n\nEloquent Orator: Bytosti rozumí tvým slovům, pokud mluví alespoň jedním Language.'},
      {name:'Jester',en:'Antagonizing Act\n\n• Heckle: Once per Round when a creature of your choice within Bardic Performance fails a Save, it is Taunted by you on the next Attack it makes before the end of its next turn.\n\n• Distraction: When a hostile creature within 10 Spaces makes an Attack, spend 1 AP as a Reaction to roll a Help Die and subtract it from the Check.\n\n• Pratfall: When you fail a Save imposed by a hostile creature, grant a creature in your Bardic Performance ADV on a Check of its choice before the end of its next turn.\n\nComedian (Flavor Feature): You have ADV on Checks to make other creatures laugh.',cs:'Antagonizing Act\n\n• Heckle: Jednou za Round, když vybraná bytost v Bardic Performance neuspěje na Save, je Taunted tebou na svůj příští Attack před koncem svého příštího tahu.\n\n• Distraction: Když nepřátelská bytost do 10 Spaces provede Attack, za 1 AP jako Reaction hoď Help Die a odečti ho od jejího Checku.\n\n• Pratfall: Když neuspěješ na Save od nepřátelské bytosti, dej bytosti v Bardic Performance ADV na Check dle jejího výběru před koncem jejího příštího tahu.\n\nComedian: Máš ADV na Checks, kterými se snažíš ostatní rozesmát.'},
      paragon
    ],
    talents: [
      {name:'Expanded Repertoire',req:'Requirement: Remarkable Repertoire, Level 3',en:'You can only gain this Talent once. Gain 2 Skill Points, learn 2 Spells of your choice from any Spell List, and gain another manner of Magical Expression so you can choose Auditory or Visual each time you cast a Spell.',cs:'Tento Talent můžeš získat pouze jednou. Získej 2 Skill Points, nauč se 2 Spelly dle výběru z jakéhokoli Spell Listu a získej druhý způsob Magical Expression, takže při každém Spellu můžeš zvolit Auditory nebo Visual.'},
      {name:'Helping Hands',req:'Requirement: Font of Inspiration, Level 3',en:'Once per Round, when you take the Help Action, grant a bonus d8 Help Die to a different creature within range (including yourself) that it can apply to the same type of Check.',cs:'Jednou za Round, když použiješ Help Action, dej bonusový d8 Help Die jiné bytosti v dosahu (včetně sebe), která ho může použít na stejný typ Checku.'}
    ]
  };

  R.classes.summoner = {
    name: 'Summoner',
    tagline: {
      en: 'Summoners specialize in conjuring creatures, sharing actions with them, and moving allies and enemies through a persistent personal demiplane.',
      cs: 'Summoneři se specializují na vyvolávání bytostí, sdílení akcí se svými summonovanými tvory a přesuny spojenců i nepřátel skrze osobní demiplane.'
    },
    sourceOfPower: {
      en: 'This Summoner class is presented in DC20 Magazine Volume 23 as a Level 1-5 class built around the summoning spells introduced for DC20 Beta 0.10.5.',
      cs: 'Tato Summoner class pochází z DC20 Magazine Volume 23 jako class pro Level 1-5 postavená kolem summoning spellů z DC20 Beta 0.10.5.'
    },
    sourcePage: 'DC20 Magazine Vol. 23, pp. 3-5',
    level1: { hp: '+7', mp: 6, sp: 0, spells: 4, maneuvers: 0, training: 'Spell Focuses, Light Armor' },
    progression: [
      {level:1,hp:'+7',attribute:'',skill:'',trade:'',resource:'+6 MP',known:'+4 Spells',features:'Class Features'},
      {level:2,hp:'+1',attribute:'',skill:'',trade:'',resource:'',known:'',features:'Class Feature, Talent, Path Progression'},
      {level:3,hp:'+1',attribute:'+1',skill:'+1',trade:'+1',resource:'+3 MP',known:'+1 Spell',features:'Subclass Features'},
      {level:4,hp:'+1',attribute:'',skill:'',trade:'',resource:'',known:'',features:'Talent, Path Progression, 2 Ancestry Points'},
      {level:5,hp:'+1',attribute:'+1',skill:'+2',trade:'+1',resource:'+3 MP',known:'+1 Spell',features:'Class Expert Feature'},
      {level:6,hp:'+1',attribute:'',skill:'+1',trade:'',resource:'',known:'',features:'Talent, Path Progression'},
      {level:7,hp:'+1',attribute:'',skill:'',trade:'',resource:'+3 MP',known:'+1 Spell',features:'Subclass Expert Feature'},
      {level:8,hp:'+1',attribute:'+1',skill:'+1',trade:'+1',resource:'',known:'',features:'Talent, Path Progression, 2 Ancestry Points'},
      {level:9,hp:'+1',attribute:'',skill:'',trade:'',resource:'+3 MP',known:'+1 Spell',features:'Class Capstone Feature'},
      {level:10,hp:'+1',attribute:'+1',skill:'+2',trade:'+1',resource:'+3 MP',known:'+1 Spell',features:'Subclass Capstone Feature'}
    ],
    startingEquipment: [
      {name:'Arsenal', en:'2 Spell Focuses.', cs:'2 Spell Focuses.'},
      {name:'Armor', en:'1 set of Light Armor.', cs:'1 sada Light Armor.'},
      {name:'Trade Tools', en:"Choose 2 of any of the following items: Alchemist's Supplies, Calligrapher's Supplies, Glassblower's Tools, or Herbalist's Supplies.", cs:"Vyber 2: Alchemist's Supplies, Calligrapher's Supplies, Glassblower's Tools nebo Herbalist's Supplies."},
      {name:'Adventuring Pack', en:'Choose 1 Adventuring Pack (packs are marked as coming soon).', cs:'Vyber 1 Adventuring Pack (balíčky jsou označené jako coming soon).'}
    ],
    pathName: 'Summoner Spellcasting Path',
    pathDetails: [
      {name:'Combat Training', en:'Spell Focuses, Light Armor', cs:'Spell Focuses, Light Armor'},
      {name:'Spell List', en:'When you learn a new Spell, choose any Spell from Astromancy, Conjuration, and Transmutation Spell Schools or any Spell with the Summoning Spell Tag.', cs:'Když se učíš nový Spell, vyber libovolný Spell z Astromancy, Conjuration nebo Transmutation School, případně Spell s tagem Summoning.'},
      {name:'Spells Known', en:'The number of Spells you know increases as shown in the Spells Known column of the Summoner Class Table.', cs:'Počet známých Spellů se zvyšuje podle sloupce Spells Known v Summoner Class Table.'},
      {name:'Mana Points', en:'Your maximum Mana Points increase as shown in the Mana Points column of the Summoner Class Table.', cs:'Tvoje maximum Mana Points se zvyšuje podle sloupce Mana Points v Summoner Class Table.'}
    ],
    spellRule: {
      en: 'Spellcasting Path. Your Spell List contains Astromancy, Conjuration, Transmutation, and any Spell with the Summoning Tag.',
      cs: 'Spellcasting Path. Tvůj Spell List obsahuje Astromancy, Conjuration, Transmutation a každý Spell s tagem Summoning.'
    },
    features: [
      {level:1,name:'Bonded Summons',en:'Learn 1 of the following Spells: Summon Aberration, Summon Beast, Summon Celestial, Summon Construct, Summon Dragon, Summon Elemental, Summon Fey, Summon Fiend, Summon Ooze, Summon Plant, or Summon Undead.\n\nWhen you cast one of these Spells:\n• Creatures summoned by the Spell can use your AP when taking Actions.\n• While Sustaining 1 or more of these Spells, you can Sustain 1 of them for free.',cs:'Nauč se 1 z těchto Spellů: Summon Aberration, Beast, Celestial, Construct, Dragon, Elemental, Fey, Fiend, Ooze, Plant nebo Undead.\n\nKdyž jeden z nich castíš:\n• Bytosti summonované Spellem mohou při Actions používat tvoje AP.\n• Když Sustainuješ jeden nebo více těchto Spellů, jeden z nich můžeš Sustainovat zdarma.'},
      {level:1,name:'Personal Demiplane',en:'Spend 1 AP to open a portal in an unoccupied Space within 2 Spaces. It lasts until the start of your next turn and leads to a persistent 3 Space diameter demiplane of your creation with breathable air, room temperature, and normal gravity. Creatures can enter through the portal. A creature can leave for 1 Space of movement while the portal is open, or for 1 AP near the portal’s last location while it is closed. If you die, everything immediately exits and the demiplane ceases to exist.',cs:'Za 1 AP otevři portal v neobsazeném Space do 2 Spaces. Trvá do začátku tvého příštího tahu a vede do stálého osobního demiplane o průměru 3 Spaces s dýchatelným vzduchem, pokojovou teplotou a normální gravitací. Bytosti mohou vstupovat portálem. Když je portal otevřený, lze odejít za 1 Space movement; když je zavřený, za 1 AP poblíž jeho poslední pozice. Když zemřeš, vše okamžitě vystoupí a demiplane zanikne.'},
      {level:1,name:'Pocket Dimension (Flavor Feature)',en:'You have a small pocket dimension that can hold 1 Tiny item. Teleport an item from your hand into it, or back into your hand, using a Minor Action. If you die, the item immediately appears in your Space.',cs:'Máš malou pocket dimension pro 1 Tiny item. Jako Minor Action můžeš předmět z ruky teleportovat dovnitř nebo zpět do ruky. Když zemřeš, předmět se okamžitě objeví ve tvém Space.'},
      {level:2,name:'Summon Exchange',en:'Spend 1 AP to switch places with a creature within 10 Spaces that you have summoned, such as with Call Familiar, Summon Celestial, or Summon Undead.',cs:'Za 1 AP si vyměň místo s bytostí do 10 Spaces, kterou jsi summonoval, například pomocí Call Familiar, Summon Celestial nebo Summon Undead.'},
      {level:5,name:'Expert Summoner',en:'You gain the following benefits:\n\n• Summon Conduit: Cast Spells as if you were standing in the Space of a creature you summoned, provided it is within 10 Spaces.\n\n• Summon Translocation: When using Summon Exchange, you may instead switch the places of two creatures you summoned, provided both are within range.\n\n• Extended Summoning: Spells listed in Bonded Summons now last until you complete a Long Rest.',cs:'Získáš následující benefity:\n\n• Summon Conduit: Casti Spelly, jako bys stál ve Space bytosti, kterou jsi summonoval, pokud je do 10 Spaces.\n\n• Summon Translocation: Při Summon Exchange můžeš místo sebe prohodit dvě bytosti, které jsi summonoval, pokud jsou obě v dosahu.\n\n• Extended Summoning: Spelly uvedené v Bonded Summons nyní trvají do dokončení Long Restu.'}
    ],
    subclasses: [
      {name:'Chimera',en:'Summon Chimera\n\n• Learn 2 Spells of your choice from those listed in Bonded Summons.\n• When you summon a creature with one of those Spells, the first creature summoned also gains the Base Summon Traits from another listed Spell you know.\n• When you use Additional Traits, you can also choose from the Expanded Summon Traits of another listed Spell you know.\n\nA creature granted Traits from another listed Spell gains that Spell’s Creature Type in addition to its own.\n\nChimeric Appearance (Flavor Feature): As a Minor Action, manifest cosmetic characteristics of any Creature Type matching a Bonded Summons Spell you know.',cs:'Summon Chimera\n\n• Nauč se 2 Spelly dle výběru ze seznamu Bonded Summons.\n• Když jedním z nich summonuješ bytost, první summonovaná bytost navíc získá Base Summon Traits z jiného známého Spellu ze seznamu.\n• Při Additional Traits můžeš vybírat i Expanded Summon Traits jiného známého Spellu ze seznamu.\n\nBytost, která dostane Traits jiného Spellu, získá navíc jeho Creature Type.\n\nChimeric Appearance: Jako Minor Action můžeš kosmeticky projevit rysy libovolného Creature Type odpovídajícího Bonded Summons Spellu, který znáš.'},
      {name:'Dread Lord',en:'Unending March\n\nLearn Summon Undead, or another Bonded Summons Spell if you already know it. Creatures you summon with a Bonded Summons Spell gain:\n• Life Steal: When the creature hits with its Unarmed Strike, it regains 1 HP.\n• Undying: When the creature dies, spend 1 AP and 1 or more MP as a Reaction to bring it back with 2 HP per MP spent.\n\nAnguished Dead (Flavor Feature): Near a corpse, grave, or contained ashes you can hear the cries of a spirit that remains on the plane and discern the general reason it remains.',cs:'Unending March\n\nNauč se Summon Undead, nebo jiný Bonded Summons Spell, pokud ho už znáš. Bytosti summonované Bonded Summons Spellem získají:\n• Life Steal: Když bytost zasáhne Unarmed Strike, obnoví 1 HP.\n• Undying: Když zemře, za 1 AP a 1 nebo více MP jako Reaction ji vrať k životu s 2 HP za každé utracené MP.\n\nAnguished Dead: U mrtvoly, hrobu nebo uchovaných ostatků slyšíš nářek ducha, který stále zůstává na této plane, a poznáš obecný důvod, proč zůstává.'},
      paragon
    ],
    talents: [
      {name:'Creature Specialist',req:'Requires: Bonded Summons',en:'Choose 1 Bonded Summons Spell you know. When you cast it, grant 3 points worth of Summon Traits as if you used Additional Traits. You can do this once per Long Rest and regain the use when you roll for Initiative.',cs:'Vyber 1 Bonded Summons Spell, který znáš. Při jeho castu přidej 3 body Summon Traits, jako bys použil Additional Traits. Použij jednou za Long Rest; použití obnovíš při hodu na Initiative.'},
      {name:'Horde Summoner',req:'Requires: Bonded Summons',en:'Versatile Summoner: Learn 2 Bonded Summons Spells.\n\nSplit Summon: When casting a Bonded Summons Spell, use Additional Creatures once for free; the extra creature shares HP with the first summon. This can be used once per Long Rest and refreshes on Initiative.\n\nCombo Summon: When using Additional Creature, the additional creature can come from a different Bonded Summons Spell you know.',cs:'Versatile Summoner: Nauč se 2 Bonded Summons Spelly.\n\nSplit Summon: Při castu Bonded Summons Spellu použij Additional Creatures jednou zdarma; další bytost sdílí HP s první summonovanou bytostí. Jednou za Long Rest, obnoví se na Initiative.\n\nCombo Summon: Při Additional Creature může další bytost pocházet z jiného Bonded Summons Spellu, který znáš.'},
      {name:'Grand Entrance',req:'Requires: Personal Demiplane',en:'Once per Combat when you use Personal Demiplane, each creature you summoned that exits the demiplane appears in an unoccupied Space within 5 Spaces of the portal and can immediately make an Unarmed Strike for free against a target in range.',cs:'Jednou za Combat při použití Personal Demiplane se každá tebou summonovaná bytost, která vyjde ven, objeví v neobsazeném Space do 5 Spaces od portalu a může okamžitě zdarma provést Unarmed Strike proti cíli v dosahu.'},
      {name:'Reverse Summoning',req:'Requires: Personal Demiplane',en:'Once per Combat when you use Personal Demiplane, each creature of your choice within 1 Space of the portal makes a Might Save against your Save DC. Failure: It enters your demiplane and cannot leave for 1 Round.',cs:'Jednou za Combat při použití Personal Demiplane každá tebou vybraná bytost do 1 Space od portalu provede Might Save proti tvému Save DC. Failure: Vstoupí do demiplane a 1 Round ho nemůže opustit.'}
    ]
  };
})();