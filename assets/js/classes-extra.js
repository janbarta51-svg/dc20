(() => {
  const R = window.DC20_RULES;
  if (!R?.classes) return;

  R.classes.champion = {
    name: 'Champion',
    tagline: {
      en: 'A weapon and armor specialist who adapts in the middle of battle, masters Maneuvers, and learns an enemy as the fight unfolds.',
      cs: 'Specialista na zbraně a brnění, který se během boje přizpůsobuje, ovládá Maneuvers a postupně čte svého protivníka.'
    },
    sourcePage: '216-220',
    level1: {
      hp: '+8',
      mp: 0,
      sp: 2,
      spells: 0,
      maneuvers: 2,
      training: 'Weapons, All Armor, All Shields'
    },
    spellRule: {
      en: 'Martial Path. You are trained with Weapons, All Armor, and All Shields. Your maximum Stamina and Maneuvers Known increase with the Champion Class Table. Once per Round, when you perform a Maneuver, you can regain up to half your maximum SP.',
      cs: 'Martial Path. Máš Combat Training se Weapons, All Armor a All Shields. Maximum Stamina a počet známých Maneuvers se zvyšují podle Champion Class Table. Jednou za Round, když provedeš Maneuver, můžeš obnovit až polovinu svého maxima SP.'
    },
    features: [
      {
        level: 1,
        name: 'Master-at-Arms',
        en: 'Weapon Master: At the start of each of your turns, you can freely swap any Weapon you are currently wielding in each hand for another Weapon without provoking Opportunity Attacks. Maneuver Master: You learn 1 additional Maneuver. Once per Round when you perform a Maneuver, reduce its SP cost by 1.',
        cs: 'Weapon Master: Na začátku každého svého tahu můžeš zdarma vyměnit Weapon, kterou právě držíš v každé ruce, za jinou Weapon bez vyvolání Opportunity Attacks. Maneuver Master: Naučíš se 1 další Maneuver. Jednou za Round, když provedeš Maneuver, sniž jeho cenu o 1 SP.'
      },
      {
        level: 1,
        name: 'Fighting Spirit',
        en: 'Combat Readiness: At the start of your first turn in Combat choose Fortify or Advance. Fortify grants the benefits of Dodge and ADV on your next Save until the end of Combat. Advance grants the benefits of Move and ADV on your next Martial Attack or Physical Check until the end of Combat. Second Wind: Once per Combat when you start your turn Bloodied, regain 2 HP and 2 SP.',
        cs: 'Combat Readiness: Na začátku svého prvního tahu v Combat zvol Fortify nebo Advance. Fortify ti dá benefity Dodge a ADV na příští Save do konce Combat. Advance ti dá benefity Move a ADV na příští Martial Attack nebo Physical Check do konce Combat. Second Wind: Jednou za Combat, když začínáš tah Bloodied, obnov 2 HP a 2 SP.'
      },
      {
        level: 1,
        name: 'Know Your Enemy',
        en: 'Flavor Feature. Spend 1 minute observing or interacting with a creature outside Combat, or spend 1 AP in Combat, and choose Might, Agility, PD, AD, or HP. Make a DC 10 Knowledge or Insight Check. On a Success you learn whether the chosen stat is higher, lower, or the same as yours. The GM can increase the DC for creatures concealing their true power.',
        cs: 'Flavor Feature. Mimo Combat strav 1 minutu pozorováním nebo interakcí s bytostí, případně v Combat utratíš 1 AP, a vyber Might, Agility, PD, AD nebo HP. Proveď DC 10 Knowledge nebo Insight Check. Při Success zjistíš, zda je zvolená hodnota vyšší, nižší nebo stejná jako tvoje. GM může zvýšit DC u bytostí, které svou skutečnou sílu skrývají.'
      },
      {
        level: 2,
        name: 'Adaptive Tactics',
        en: 'When you roll Initiative, and at the end of each of your turns, gain a d8 Tactical Die if you do not already have one. Spend it on Assault to add the die to a Martial Attack result, or Deflect when you are Attacked to subtract the die from the Attack result.',
        cs: 'Když hodíš Initiative a na konci každého svého tahu získáš d8 Tactical Die, pokud už žádný nemáš. Utrať ho na Assault a přičti kostku k výsledku Martial Attack, nebo na Deflect, když jsi Attacked, a odečti kostku od výsledku Attacku.'
      },
      {
        level: 5,
        name: 'Expert Champion',
        en: 'Master-at-Arms: Learn 2 additional Maneuvers. Fighting Spirit: Second Wind restores an additional 2 HP and 2 SP. Adaptive Tactics: Your Tactical Die becomes a d10.',
        cs: 'Master-at-Arms: Naučíš se 2 další Maneuvers. Fighting Spirit: Second Wind obnoví o další 2 HP a 2 SP více. Adaptive Tactics: Tvoje Tactical Die se změní na d10.'
      }
    ],
    talents: [
      {
        name: "Champion's Resolve",
        req: 'Requirement: Adaptive Tactics, Level 3',
        en: 'When you use a Tactical Die, Assault also makes the Attack deal +1 damage. If Deflect causes the Attack to Miss, the Attacker takes 1 damage of a Physical damage type of your choice.',
        cs: 'Když použiješ Tactical Die, Assault navíc přidá Attacku +1 damage. Pokud Deflect způsobí, že Attack Mine, Attacker dostane 1 damage Physical typu podle tvé volby.'
      },
      {
        name: 'Disciplined Combatant',
        req: 'Requirement: Fighting Spirit, Level 3',
        en: 'Once on each of your turns, you can spend 2 SP to gain the benefit of Combat Readiness. You can also use Second Wind without being Bloodied.',
        cs: 'Jednou v každém svém tahu můžeš utratit 2 SP a získat benefit Combat Readiness. Second Wind můžeš použít i bez toho, abys byl Bloodied.'
      }
    ],
    subclasses: [
      {
        name: 'Hero',
        en: "Hero's Resolve. Adrenaline Boost: After Second Wind, gain +5 to Martial Attacks and Martial Checks until the end of your turn. Cut Through: Martial Attacks that score Heavy Hits ignore the target's Physical Resistances. Unyielding Spirit: While Bloodied, gain 1 Temp HP at the start of each turn. Adventuring Hero: Ignore Forced March and Encumbered penalties, but not Heavily Encumbered.",
        cs: 'Hero\'s Resolve. Adrenaline Boost: Po použití Second Wind máš do konce tahu +5 k Martial Attacks a Martial Checks. Cut Through: Martial Attacks s Heavy Hit ignorují Physical Resistances cíle. Unyielding Spirit: Když jsi Bloodied, na začátku každého tahu získáš 1 Temp HP. Adventuring Hero: Ignoruješ postihy Forced March a Encumbered, nikoli Heavily Encumbered.'
      },
      {
        name: 'Sentinel',
        en: 'Stalwart Protector. Steadfast Defender lets you use Deflect against any Attack that targets a creature within your Melee Range. Defensive Bash: When you use a Defensive Maneuver as a Reaction to an Attack from within 1 Space, the attacker makes a Physical Save against your Attack Check; on failure push it 1 Space or Taunt it until the end of its next turn. Not on my Watch: Creatures Taunted by you deal 1 less damage to targets within 1 Space of you. Vigilant Watcher improves your ability to remain on watch during a Long Rest.',
        cs: 'Stalwart Protector. Steadfast Defender ti dovolí použít Deflect proti jakémukoli Attacku, který cílí bytost v tvém Melee Range. Defensive Bash: Když použiješ Defensive Maneuver jako Reaction proti Attacku od bytosti do 1 Space, útočník provede Physical Save proti tvému Attack Checku; při Failure ho posuň o 1 Space nebo ho Tauntni do konce jeho příštího tahu. Not on my Watch: Bytosti Taunted tebou dávají o 1 damage méně cílům do 1 Space od tebe. Vigilant Watcher zlepšuje hlídání během Long Restu.'
      }
    ]
  };

  R.classes.sorcerer = {
    name: 'Sorcerer',
    tagline: {
      en: 'A natural spellcaster who channels raw magic through their own body, reshapes spells with Meta Magic, and can overload beyond normal limits.',
      cs: 'Přirozený spellcaster, který vede surovou magii vlastním tělem, upravuje spelly pomocí Meta Magic a dokáže se přetížit za běžné hranice.'
    },
    sourcePage: '248-252',
    level1: {
      hp: '+7',
      mp: 6,
      sp: 0,
      spells: 4,
      maneuvers: 0,
      training: 'Spell Focuses, Light Armor'
    },
    spellRule: {
      en: 'Spellcasting Path. Choose 1 Spell Source: Arcane, Divine, or Primal. Whenever you learn a new Spell, it can be any Spell from that chosen Source. Your maximum Mana and Spells Known increase with the Sorcerer Class Table.',
      cs: 'Spellcasting Path. Vyber 1 Spell Source: Arcane, Divine nebo Primal. Kdykoli se učíš nový Spell, můžeš zvolit libovolný Spell z vybraného Source. Maximum Mana a počet známých Spellů se zvyšují podle Sorcerer Class Table.'
    },
    features: [
      {
        level: 1,
        name: 'Innate Power',
        en: 'Choose a Sorcerous Origin. Intuitive Magic: Learn 2 Spells from your Spell List. Resilient Magic: Gain Dazed Resistance. Unstable Magic: Critical Successes and Failures on Spell Attacks or Spell Checks trigger the Wild Magic Table; roll with ADV on a Critical Success and DisADV on a Critical Failure, then gain ADV on your next Spell Attack or Spell Check before the end of your next turn. In addition, increase Maximum MP by 1 and gain one 1-point Focus Property that can be changed after a Long Rest.',
        cs: 'Vyber Sorcerous Origin. Intuitive Magic: Nauč se 2 Spelly ze svého Spell Listu. Resilient Magic: Získej Dazed Resistance. Unstable Magic: Critical Success nebo Failure na Spell Attack či Spell Check spustí Wild Magic Table; při Critical Success házíš s ADV a při Critical Failure s DisADV, potom získáš ADV na příští Spell Attack nebo Spell Check do konce příštího tahu. Navíc si zvyš Maximum MP o 1 a získej benefit jedné 1-point Focus Property, kterou můžeš změnit po Long Restu.'
      },
      {
        level: 1,
        name: 'Wild Magic Table',
        en: 'Unstable Magic uses a d20 Wild Magic Table. Outcomes range from harmful transformations, Stunned, Blinded, forced movement, penalties, and size changes to bonuses, Truesight, Invisibility, extra AP, healing, and a temporary Young Purple Dragon form. Use the full d20 table reproduced in the Sorcerer class reference PDF.',
        cs: 'Unstable Magic používá d20 Wild Magic Table. Výsledky sahají od škodlivých transformací, Stunned, Blinded, nuceného pohybu, postihů a změn velikosti až po bonusy, Truesight, Invisibility, extra AP, léčení a dočasnou podobu Young Purple Dragon. Použij kompletní d20 tabulku v Sorcerer class reference PDF.'
      },
      {
        level: 1,
        name: 'Overload Magic',
        en: 'In Combat spend 1 AP + 1 MP to overload for 1 minute, until Incapacitated, dead, or ended freely. While Overloaded, gain +5 to all Spell Attacks and Spell Checks. Immediately make an Attribute Save of your choice against your own Save DC and repeat at the start of each turn. Failure: Gain Exhaustion. Exhaustion gained this way is removed when you complete a Short Rest.',
        cs: 'V Combat utratíš 1 AP + 1 MP a na 1 minutu se Overloadneš, dokud nejsi Incapacitated, nezemřeš nebo efekt zdarma neukončíš. Během Overload máš +5 ke všem Spell Attacks a Spell Checks. Okamžitě proveď Attribute Save podle volby proti svému Save DC a opakuj jej na začátku každého tahu. Failure: Získáš Exhaustion. Exhaustion získané tímto způsobem se odstraní po Short Restu.'
      },
      {
        level: 1,
        name: 'Sorcery',
        en: 'Flavor Feature. You learn the Sorcery Spell.',
        cs: 'Flavor Feature. Naučíš se Sorcery Spell.'
      },
      {
        level: 2,
        name: 'Meta Magic',
        en: 'Learn 2 Meta Magic options. You can normally apply only 1 Meta Magic enhancement to each Spell, and MP spent on these enhancements does not count against your Mana Spend Limit. Options: Careful Spell (exclude chosen creatures from area effects), Distant Spell (increase range), Quickened Spell (reduce AP cost by 1, minimum 1 AP), Subtle Spell (remove Somatic and Verbal Components), Transmuted Spell (change a damage type except True), and Vicious Spell (one target has DisADV on its first Save). Once per Long Rest, use one of these enhancements without spending MP; this use refreshes when you roll Initiative.',
        cs: 'Naučíš se 2 Meta Magic možnosti. Na jeden Spell můžeš běžně použít jen 1 Meta Magic enhancement a MP utracené za tyto enhancementy se nepočítají do Mana Spend Limitu. Možnosti: Careful Spell (vynechá z area efektu zvolené bytosti), Distant Spell (zvětší range), Quickened Spell (sníží AP cenu o 1, minimum 1 AP), Subtle Spell (odstraní Somatic a Verbal Components), Transmuted Spell (změní damage type kromě True) a Vicious Spell (jeden cíl má DisADV na první Save). Jednou za Long Rest použiješ jednu z těchto možností bez MP; tato možnost se obnoví při hodu na Initiative.'
      },
      {
        level: 5,
        name: 'Expert Sorcerer',
        en: 'Innate Power: Increase Maximum MP by 1 and gain one additional 1-point Focus Property; change either or both after a Long Rest. Overload Magic: You no longer make the Attribute Save when activating Overload, but still make it at the start of each turn. Meta Magic: Learn 1 additional option and you can use 2 different Meta Magic enhancements on the same Spell.',
        cs: 'Innate Power: Zvyš Maximum MP o 1 a získej další 1-point Focus Property; jednu nebo obě můžeš změnit po Long Restu. Overload Magic: Při aktivaci Overload už neprovádíš Attribute Save, ale stále ho provádíš na začátku každého tahu. Meta Magic: Nauč se 1 další možnost a na stejný Spell můžeš použít 2 rozdílné Meta Magic enhancementy.'
      }
    ],
    talents: [
      {
        name: 'Expanded Meta Magic',
        req: 'Requirement: Meta Magic',
        en: 'Increase your maximum MP by 2 and learn 2 additional Meta Magic Spell Enhancements. You cannot choose the same option more than once.',
        cs: 'Zvyš své maximum MP o 2 a nauč se 2 další Meta Magic Spell Enhancements. Stejnou možnost nemůžeš zvolit vícekrát.'
      },
      {
        name: 'Greater Innate Power',
        req: 'Requirements: Innate Power, Level 3',
        en: 'Increase maximum MP by 1, gain one additional 1-point Focus Property, and gain another Sorcerous Origin. You can change either or both Focus Properties after a Short or Long Rest.',
        cs: 'Zvyš maximum MP o 1, získej další 1-point Focus Property a další Sorcerous Origin. Jednu nebo obě Focus Properties můžeš změnit po Short nebo Long Restu.'
      },
      {
        name: 'Font of Magic',
        req: 'Requirements: Meta Magic, Level 3',
        en: 'You can spend 2 Rest Points in place of 1 MP on Meta Magic. When you roll Initiative, regain 2 Rest Points.',
        cs: 'Na Meta Magic můžeš místo 1 MP utratit 2 Rest Points. Když hodíš Initiative, obnov 2 Rest Points.'
      }
    ],
    subclasses: [
      {
        name: 'Angelic',
        en: 'Celestial Spark. Use a Minor Action to emit Bright Light in a 5-Space radius and end it freely. Celestial Origin grants access to Angelborn and 2 Ancestry Points usable only on Angelborn Traits. Celestial Protection teaches Careful Spell (or another Meta Magic option if already known) and makes Careful Spell cost 0 MP. Once per Combat while Overloaded, Celestial Overload costs 1 AP and creates a 5-Space Aura; chosen creatures either regain 1 HP or are attacked against AD for 1 Radiant damage. Celestial Appearance expands angelic traits and grants Language Mastery in Celestial.',
        cs: 'Celestial Spark. Minor Actionem můžeš vyzařovat Bright Light v radiusu 5 Spaces a zdarma ho ukončit. Celestial Origin zpřístupní Angelborn a 2 Ancestry Points použitelné jen na Angelborn Traits. Celestial Protection tě naučí Careful Spell (nebo jinou Meta Magic možnost, pokud ji už znáš) a Careful Spell stojí 0 MP. Jednou za Combat během Overload stojí Celestial Overload 1 AP a vytvoří 5-Space Auru; zvolené bytosti buď obnoví 1 HP, nebo proti jejich AD provedeš Spell Attack za 1 Radiant damage. Celestial Appearance rozšíří angelic rysy a přidá Language Mastery v Celestial.'
      },
      {
        name: 'Draconic',
        en: 'Draconic Spark. Draconic Origin grants access to Dragonborn and 2 Ancestry Points usable only on Dragonborn Traits, plus a Draconic Origin if needed. While Overloaded, Draconic Overload grants Resistance (1) to Physical damage and your Draconic Origin damage type. Draconic Transmutation teaches Transmuted Spell (or another option if already known) and makes it cost 0 MP when changing damage to your Draconic Origin type. Draconic Appearance expands draconic traits and grants Language Mastery in Draconic.',
        cs: 'Draconic Spark. Draconic Origin zpřístupní Dragonborn a 2 Ancestry Points použitelné jen na Dragonborn Traits a podle potřeby zvolíš Draconic Origin. Během Overload dává Draconic Overload Resistance (1) proti Physical damage a damage typu tvého Draconic Origin. Draconic Transmutation tě naučí Transmuted Spell (nebo jinou možnost, pokud ji už znáš) a při změně damage na typ tvého Draconic Origin stojí 0 MP. Draconic Appearance rozšíří draconic rysy a přidá Language Mastery v Draconic.'
      }
    ]
  };
})();
