(() => {
  const R=window.DC20_RULES;
  if(!R?.classes) return;
  const bi=t=>({en:t,cs:t});
  const paragon={name:'Paragon',...bi('Novice Paragon\nYou gain a Class Talent of your choice from your Class.\n\nJack of one Trade (Flavor Feature)\nYou gain 1 Trade Point.')};

  R.classes.bard={
    name:'Bard',
    tagline:bi('Bards utilize artistic expression through various forms to connect with the emotions and heart of magic. They are flexible and adaptable spellcasters who bring out the best in those around them through helping and performing.'),
    sourceOfPower:bi("Bards derive their power from harnessing their emotions and force of will, as well as those of others around them. A Bard's emotion, determination, and willpower flows through their unique artistic expression, touching the hearts and minds of those around them and bringing their magic to life."),
    sourcePage:'213-216',
    maxFeatureLevel:6,
    level1:{hp:'+7',mp:6,sp:0,spells:4,maneuvers:0,training:'Spell Focuses, Light Armor, Light Shields'},
    progression:[
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
    startingEquipment:[
      {name:'Arsenal',...bi('Choose 3 of any of the following items: Spell Focus, Weapon, or Light Shield.')},
      {name:'Armor',...bi('1 set of Light Armor.')},
      {name:'Trade Tools',...bi("Choose 1 of any of the following items: Calligrapher's Supplies, Disguise Kit, Gaming Kit, Musical Instrument, or Sculptor's Tools.")},
      {name:'Adventuring Pack',...bi('Choose 1 of the following packs: (Adventuring Packs Coming Soon).')}
    ],
    pathName:'Bard Spellcasting Path',
    pathDetails:[
      {name:'Combat Training',...bi('Spell Focuses, Light Armor, Light Shields')},
      {name:'Spell List',...bi('When you learn a new Spell, you can choose any Spell from the Enchantment Spell School or with the following Spell Tags: Embolden, Enfeeble, Healing, Illusion, or Sound.')},
      {name:'Spells Known',...bi('The number of Spells you know increases as shown in the Spells Known column of the Bard Class Table.')},
      {name:'Mana Points',...bi('Your maximum number of Mana Points increases as shown in the Mana Points column of the Bard Class Table.')}
    ],
    spellRule:bi('When you learn a new Spell, you can choose any Spell from the Enchantment Spell School or with the Embolden, Enfeeble, Healing, Illusion, or Sound Spell Tags.'),
    features:[
      {level:1,name:'Font of Inspiration',...bi("You are an ever present source of aid for your allies. You gain the following benefits:\n\n• Ranged Help Attack: The range of your Help Action when aiding an Attack increases to 10 Spaces.\n\n• Help Reaction: When a creature you can see makes a Check, you can take the Help Action as a Reaction to aid them with their Check, provided you're within range to do so.\n\nDC Tip: Helping with a Skill or Trade Check doesn't have a default range limitation. The GM determines the range of the type of help required.")},
      {level:1,name:'Remarkable Repertoire',...bi("You've picked up a few tricks along your travels, granting you the following benefits:\n\nJack of All Trades: You gain 2 Skill Points.\n\nMagical Secrets: You learn any 2 Spells of your choice from any Spell List.\n\nMagical Expression: You learn to express your art in a unique manner, granting you the ability to alter how you cast Spells. Choose the manner of your expression: Visual or Auditory.\n\n• Visual: Through acrobatics, dancing, juggling, painting, drawing, or miming, you can ignore the Verbal Components of a Spell you cast, but you must provide a Somatic Component instead.\n\n• Auditory: Through singing, playing music, poetry, comedy, or storytelling, you can ignore the Somatic Components of a Spell you cast, but you must provide a Verbal Component instead.")},
      {level:1,name:'Crowd Pleaser (Flavor Feature)',...bi('When you spend at least 5 minutes performing an Artistry Trade for one or more people who are actively watching or listening to your performance, you can make an Artistry Trade Check Contested by the targets’ Charisma Save. Success: You gain ADV on Charisma Checks against the target for 1 hour or until you become hostile. Creatures have ADV on the Save if they’re considered hostile toward you.\n\nDC Tip: If the performance is in front of a lot of people, the GM might decide to roll for ALL “commoners” in one single Save. For example, a group of commoners’ Charisma Save would probably only be a +1 or so. If there were also important NPCs within the crowd, then they could roll for those individually.')},
      {level:2,name:'Bardic Performance',...bi('You can spend 1 AP and 1 MP to start a performance that grants you a 10 Space Aura for 1 minute. Choose 1 of the performances below. While creatures of your choice are within your Aura (and can see or hear you) they benefit from your performance. A creature can only benefit from one instance of each performance at a time.\n\n• Battle Ballad: The chosen creatures gain a d4 bonus to the first Attack Check they make on each of their turns.\n\n• Fast Tempo: The chosen creatures gain +1 Speed.\n\n• Inspiring: The chosen creatures gain 1 Temp HP at the start of each of their turns.\n\n• Emotional: Choose 1 of the following Conditions: Charmed, Frightened, Intimidated, or Taunted. The chosen creatures have Resistance against the chosen Condition. If a target is effected by the chosen Condition at the start of its turn, it can immediately attempt to end the Condition on itself by Repeating its Save.\n\nChanging Performances: Once on each of your turns, you can spend 1 AP to change your performance to a different one.\n\nEnding Early: The performance ends early if you become Incapacitated, you die, or choose to end it for free.')},
      {level:5,name:'Expert Bard',...bi('You gain the following benefits for your Bard Class Features.\n\nFont of Inspiration: Your Help Die now starts at a d10.\n\nRemarkable Repertoire: You gain 2 Skill Points and learn any 2 Spells of your choice from any Spell List.\n\nBardic Performance\nChanging Performances: You can change your performance at the start of each of your turns for free.\n\nWhen you start your Bardic Performance you can spend an additional 2 MP to improve the performances in the following ways:\n\n• Battle Ballad: The size of the die increases to a d8.\n\n• Fast Tempo: The Speed increases by 2.\n\n• Inspiring: The Temp HP increases by 1.\n\n• Emotional: The chosen creatures have Resistance against all of the listed Conditions.')}
    ],
    subclasses:[
      {name:'Eloquence',...bi("Beguiling Presence\nYou gain the following benefits:\n\n• Enthrall: You learn the Charm Spell, and it doesn't end as a result of the target taking damage. If you already know it, you instead learn another spell with the Charmed Tag.\n\n• Misleading Muse: When a creature within your Bardic Performance targets only you with an Attack, you can spend 1 AP as a Reaction to make a Spell Check against the target's Attack Check. Success: The creature becomes Charmed by you until the end of your next turn. It must target a different creature of its choice (other than itself) within range, or the Attack fails.\n\n• Mind Games: When the Charmed Condition ends on a creature Charmed by you, you can choose to immediately deal 1 Psychic damage to them.\n\nEloquent Orator (Flavor Feature)\nYour speech is magically enchanted. Creatures can always understand the words you speak, provided they speak at least 1 Language.")},
      {name:'Jester',...bi("Antagonizing Act\nYou gain the following benefits:\n\nHeckle: Once per Round when a creature of your choice within your Bardic Performance fails a Save, they're Taunted by you on the next Attack they make before the end of their next turn.\n\nDistraction: When a hostile creature within 10 Spaces of you makes an Attack, you can spend 1 AP as a Reaction to roll a Help Die and subtract the result from the target's Check.\n\nPratfall: When you fail a Save imposed by a hostile creature, you can grant a creature within your Bardic Performance ADV on a Check of their choice before the end of their next turn.\n\nComedian (Flavor Feature)\nYou have ADV on Checks to make other creatures laugh.")},
      paragon
    ],
    talents:[
      {name:'Expanded Repertoire',req:'Requirement: Remarkable Repertoire, Level 3',...bi('You can only gain this Talent once.\n\n• You gain 2 Skill Point.\n\n• You learn 2 Spells of your choice from any Spell List.\n\n• You gain another manner of Magical Expression, allowing you to choose to gain the benefits of either the Auditory or Visual manner each time you cast a Spell.')},
      {name:'Helping Hands',req:'Requirement: Font of Inspiration, Level 3',...bi('Once per Round, when you take the Help Action, you can grant a bonus d8 Help Die to a different creature within range (including yourself) that they can apply to the same type of Check.')}
    ]
  };

  R.classes.summoner={
    name:'Summoner',
    tagline:bi('A spellcaster built around the summoning Spells introduced for DC20 Beta 0.10.5, focused on commanding, moving, and empowering summoned creatures.'),
    sourcePage:'DC20 Magazine Volume 23, pages 3-5',
    maxFeatureLevel:5,
    talentTitle:'Paragon Talents',
    level1:{hp:'+7',mp:6,sp:0,spells:4,maneuvers:0,training:'Spell Focuses, Light Armor'},
    progression:[
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
    startingEquipment:[
      {name:'Arsenal',...bi('2 Spell Focuses.')},
      {name:'Armor',...bi('1 set of Light Armor.')},
      {name:'Trade Tools',...bi("Choose 2 of any of the following items: Alchemist's Supplies, Calligrapher's Supplies, Glassblower's Tools, or Herbalist's Supplies.")},
      {name:'Adventuring Pack',...bi('Choose 1 of the following packs: (Adventuring Packs Coming Soon).')}
    ],
    pathName:'Summoner Spellcasting Path',
    pathDetails:[
      {name:'Combat Training',...bi('Spell Focuses, Light Armor')},
      {name:'Spell List',...bi('When you learn a new Spell, you can choose any Spell from Astromancy, Conjuration, and Transmutation Spell Schools or that have the Summoning Spell Tag.')},
      {name:'Spells Known',...bi('The number of Spells you know increases as shown in the Spells Known column of the Summoner Class Table.')},
      {name:'Mana Points',...bi('Your maximum number of Mana Points increases as shown in the Mana Points column of the Summoner Class Table.')}
    ],
    spellRule:bi('When you learn a new Spell, you can choose any Spell from Astromancy, Conjuration, and Transmutation Spell Schools or that have the Summoning Spell Tag.'),
    features:[
      {level:1,name:'Bonded Summons',...bi('You learn 1 of the following Spells of your choice: Summon Aberration, Summon Beast, Summon Celestial, Summon Construct, Summon Dragon, Summon Elemental, Summon Fey, Summon Fiend, Summon Ooze, Summon Plant, or Summon Undead.\n\nWhen you cast one of the listed Spells, it gains the following benefits:\n\n• Creatures summoned by the Spell can use your AP when taking Actions.\n\n• While Sustaining 1 or more of these Spells, you can Sustain 1 of them for free.')},
      {level:1,name:'Personal Demiplane',...bi("You can spend 1 AP to open a portal in an unoccupied Space of your choice within 2 Spaces. The portal lasts until the start of your next turn and leads to a demiplane of your creation.\n\nDemiplane: The demiplane is a 3 Space diameter Sphere that contains indefinite breathable air, is room temperature, and contains gravity identical to the material plane with the floor as its plane of gravity. A creature that enters the portal's Space instead enters the demiplane in an unoccupied Space of its choice.\n\nExiting the Demiplane: A creature can spend 1 Space of movement to exit the demiplane, emerging into the nearest unoccupied Space of their choice near the portal's entrance. If the portal is closed, a creature can spend 1 AP to emerge in the nearest unoccupied Space of their choice near the portal's last location. A creature can exit the demiplane for free when you open a new portal.\n\nPersistent Plane: Each time you use this Feature the portal opens to the same demiplane. If you are inside the demiplane when you open the portal, it opens at the last location. If you die, everything immediately exits the demiplane in your Space (or the portals last open location if you're inside) for free and the demiplane ceases to exist.")},
      {level:1,name:'Pocket Dimension (Flavor Feature)',...bi('You have a small pocket dimension that can hold 1 Tiny item at a time. You can teleport an item to your pocket dimension from your hand, and vice versa, using a Minor Action. If you die, the item immediately appears in your Space.')},
      {level:2,name:'Summon Exchange',...bi("You can spend 1 AP to switch places with a creature within 10 Spaces that you've summoned (such as with the Call Familiar, Summon Celestial, or Summon Undead Spells).")},
      {level:5,name:'Expert Summoner',...bi("You gain the following benefits:\n\n• Summon Conduit: You can cast Spells as if you were standing in the Space of a creature you've summoned, provided it's within 10 Spaces.\n\n• Summon Translocation: When you use Summon Exchange, you can instead switch the places of two creatures you have summoned provided they are both within range.\n\n• Extended Summoning: The duration of Spells listed in Bonded Summons now last until you complete a Long Rest.\n\nDC Tip: You can only Sustain 1 Spell at a time out of Combat, so if you have multiple Summon Spells active when Combat ends, all but one of them ends (you choose).")}
    ],
    subclasses:[
      {name:'Chimera',...bi('Summon Chimera\nYou gain the following benefits:\n\n• You learn 2 Spells of your choice from those listed in Bonded Summons.\n\n• When you summon a creature with one of the listed Spells, the first creature summoned also gains the Base Summon Traits from another listed Spell that you know.\n\n• When you use the Additional Traits Enhancement, you can also choose from your Expanded Summon Traits of another listed Spell you know.\n\nWhen you grant a summoned creature the Traits from a different listed Spell, it gains the Creature Type of the chosen Spell in addition to its own.\n\nChimeric Appearance (Flavor Feature)\nYou can use a Minor Action to manifest minor characteristics of any Creature Type that matches a Spell you know listed in Bonded Summons (such as the skin of an Ooze). The change in your appearance is purely cosmetic.')},
      {name:'Dread Lord',...bi("Unending March\nYou learn the Summon Undead Spell or another Spell listed in Bonded Summons if you already know it. Creatures you summon with a Spell listed in Bonded Summons gain the following benefits:\n\n• Life Steal: When the creature hits another creature with its Unarmed Strike, it regains 1 HP.\n\n• Undying: When the creature dies, you can spend 1 AP and 1 or more MP as a Reaction to bring it back to life with an amount of HP equal to 2 per MP spent.\n\nAnguished Dead (Flavor Feature)\nYou can hear the cries of the anguished dead. While within 5 Spaces of a creature's corpse, its grave, or its contained ashes, you can hear the lamentations of the creature's spirit if it still remains on the plane. When you do, you can discern the general reason it remains on the plane (such as unfinished business, a curse, or other happenstance) but no additional details. This Feature doesn't grant you any special means of communicating with the dead.")},
      paragon
    ],
    talents:[
      {name:'Creature Specialist',req:'Requires: Bonded Summons',...bi('Choose 1 of the Spells in Bonded Summons that you know. When you cast the chosen Spell, you can grant 3 points worth of Summon Traits as if you used the Additional Traits Enhancement. You can cast the Spell in this way once per Long Rest, but you regain the ability to do so again when you roll for Initiative.')},
      {name:'Horde Summoner',req:'Requires: Bonded Summons',...bi('You gain the following benefits:\n\nVersatile Summoner: You learn 2 of the Spells of your choice listed in Bonded Summons.\n\nSplit Summon: When you cast a Spell listed in Bonded Summons, you can use the Additional Creatures Enhancement once for free (doesn’t count against your Mana Spend Limit). When you do, the additional creature summoned shares the HP of the first creature summoned by the Spell. If both creatures take damage from the same source, they only take 1 instance of that damage. You can use this ability once per Long Rest, but you regain the ability to use it when you roll for Initiative.\n\nCombo Summon: When you cast a Spell listed in Bonded Summons and use the Additional Creature Enhancement, you can summon a creature from a different Summon Spell you know.')},
      {name:'Grand Entrance',req:'Requires: Personal Demiplane',...bi("Once per Combat when you use Personal Demiplane, each creature you've summoned that exits the demiplane, appears in an unoccupied Space within 5 Spaces of the portal and can immediately make an Unarmed Strike for free against a target of your choice within its range.")},
      {name:'Reverse Summoning',req:'Requires: Personal Demiplane',...bi('Once per Combat, when you use your Personal Demiplane, each creature of your choice within 1 Space of the portal must make a Might Save against your Save DC. Save Failure: The creature enters your demiplane and is unable to leave for 1 Round.')}
    ]
  };
})();