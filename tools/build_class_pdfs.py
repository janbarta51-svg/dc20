from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfbase.pdfmetrics import stringWidth
from pathlib import Path
import math

W,H=letter
PURPLE=HexColor('#281A49'); PURPLE2=HexColor('#48347A'); GOLD=HexColor('#D2B45F')
PAPER=HexColor('#F7F1E6'); INK=HexColor('#211D24'); MUTED=HexColor('#675E6D')
LAV=HexColor('#E9E1F2'); LINE=HexColor('#CFC2A8'); WHITE=HexColor('#FFFFFF')
OUT=Path('assets/references')
OUT.mkdir(parents=True, exist_ok=True)


def wrap(text,font,size,width):
    words=str(text).split(); out=[]; line=''
    for word in words:
        cand=(line+' '+word).strip()
        if stringWidth(cand,font,size) <= width:
            line=cand
        else:
            if line: out.append(line)
            line=word
    if line: out.append(line)
    return out


def rings(c,dark=False):
    c.saveState(); c.setLineWidth(2)
    c.setStrokeColor(Color(.55,.45,.75,alpha=.15) if dark else Color(.27,.18,.47,alpha=.07))
    for cx,cy in [(78,700),(530,675),(70,92),(525,110),(306,405)]:
        for r in ([24,40] if cx!=306 else [120,150,180,210]): c.circle(cx,cy,r,stroke=1,fill=0)
    c.restoreState()


def bg(c):
    c.setFillColor(PAPER); c.rect(0,0,W,H,fill=1,stroke=0); rings(c)
    c.setStrokeColor(LINE); c.setLineWidth(.6); c.rect(28,28,W-56,H-56,fill=0,stroke=1)


def footer(c,page):
    c.setFillColor(MUTED); c.setFont('Helvetica',7.5)
    c.drawString(42,35,'Gangsterka - DC20 class reference')
    c.drawRightString(W-42,35,str(page))


def titlebar(c,title,kicker='CLASS REFERENCE'):
    c.setFillColor(PURPLE); c.setFont('Helvetica-Bold',8.5); c.drawString(44,742,kicker)
    c.setFont('Times-Bold',25); c.drawString(44,714,title)
    c.setStrokeColor(GOLD); c.setLineWidth(1.1); c.line(44,704,W-44,704)


def d20(c,cx,cy,r):
    c.saveState(); c.setStrokeColor(WHITE); c.setLineWidth(1.4)
    pts=[]
    for i in range(6):
        a=math.radians(90-i*60); pts.append((cx+r*math.cos(a),cy+r*math.sin(a)))
    p=c.beginPath(); p.moveTo(*pts[0])
    for q in pts[1:]: p.lineTo(*q)
    p.close(); c.drawPath(p)
    for q in pts: c.line(q[0],q[1],cx,cy)
    c.restoreState()


def cover(c,name,path_label):
    c.setFillColor(PURPLE); c.rect(0,0,W,H,fill=1,stroke=0); rings(c,True)
    c.setFillColor(WHITE); c.setFont('Times-Bold',58); c.drawCentredString(W/2,655,'DC20')
    c.setFillColor(LAV); c.setFont('Helvetica-Bold',10); c.drawCentredString(W/2,626,'CLASS REFERENCE')
    c.setStrokeColor(GOLD); c.setLineWidth(3.5); c.circle(W/2,407,73,stroke=1,fill=0)
    d20(c,W/2,407,58)
    c.setFillColor(WHITE); c.setFont('Helvetica-Bold',15); c.drawCentredString(W/2,400,path_label)
    c.setFont('Times-Bold',39); c.drawCentredString(W/2,145,name.upper())
    c.setFillColor(LAV); c.setFont('Times-Italic',11); c.drawCentredString(W/2,116,'DC20 Beta 0.10.5 - table reference')
    c.showPage()


def contents(c,name,rows):
    bg(c); titlebar(c,'Contents',name.upper())
    y=660
    for label,pageno in rows:
        c.setFillColor(INK); c.setFont('Times-Roman',13); c.drawString(58,y,label)
        c.setStrokeColor(LINE); c.setDash(1,3); c.line(58+stringWidth(label,'Times-Roman',13)+8,y+3,527,y+3); c.setDash()
        c.setFillColor(PURPLE2); c.setFont('Helvetica-Bold',9); c.drawRightString(544,y,str(pageno)); y-=36
    c.setFillColor(LAV); c.roundRect(54,105,504,120,8,fill=1,stroke=0)
    c.setFillColor(PURPLE); c.setFont('Helvetica-Bold',8.5); c.drawString(70,199,'SOURCE & USE')
    note=(f'This reference is based on the {name} rules in the user-provided DC20 Beta 0.10.5 rulebook. '
          'It reorganizes the class table, level 1-6 features, subclasses, and class talents into a compact table-friendly format. '
          'Use the rulebook as the authority if a later rules update changes wording or values.')
    y=180; c.setFillColor(INK); c.setFont('Times-Roman',9.5)
    for line in wrap(note,'Times-Roman',9.5,468): c.drawString(70,y,line); y-=12
    footer(c,2); c.showPage()


def section(c,label,x,y,w):
    c.setFillColor(PURPLE); c.setFont('Helvetica-Bold',8.5); c.drawString(x,y,label.upper())
    c.setStrokeColor(GOLD); c.setLineWidth(.8); c.line(x,y-4,x+w,y-4)
    return y-19


def para(c,text,x,y,w,size=9.15,leading=11.4):
    for raw in str(text).split('\n'):
        if not raw.strip(): y-=leading*.45; continue
        c.setFillColor(INK); c.setFont('Times-Roman',size)
        for line in wrap(raw,'Times-Roman',size,w):
            c.drawString(x,y,line); y-=leading
        y-=1.5
    return y


def bullets(c,items,x,y,w,size=9.0,leading=11.2):
    for item in items:
        lines=wrap(item,'Times-Roman',size,w-14)
        c.setFillColor(PURPLE); c.setFont('Helvetica-Bold',8); c.drawString(x,y,'-')
        c.setFillColor(INK); c.setFont('Times-Roman',size)
        for line in lines:
            c.drawString(x+12,y,line); y-=leading
        y-=2
    return y


def class_table(c,rows,resource_label,known_label,x=46,y=646,w=520):
    cols=[32,54,54,54,54,58,62,152]
    labels=['Lvl','HP','Attr','Skill','Trade',resource_label,known_label,'Features']; h=19
    c.setFillColor(PURPLE); c.rect(x,y,w,h,fill=1,stroke=0)
    xx=x; c.setFillColor(WHITE); c.setFont('Helvetica-Bold',6.8)
    for cw,label in zip(cols,labels): c.drawCentredString(xx+cw/2,y+6,label); xx+=cw
    yy=y-h
    for i,row in enumerate(rows):
        c.setFillColor(LAV if i%2==0 else PAPER); c.rect(x,yy,w,h,fill=1,stroke=0)
        xx=x; c.setFillColor(INK); c.setFont('Helvetica',6.7)
        for cw,val in zip(cols,row): c.drawCentredString(xx+cw/2,yy+6,str(val)); xx+=cw
        yy-=h
    c.setStrokeColor(LINE); c.rect(x,yy+h,w,h*(len(rows)+1),fill=0,stroke=1)
    return yy-8


def champion_pdf():
    out=OUT/'DC20_Champion_Class_Reference.pdf'; c=canvas.Canvas(str(out),pagesize=letter)
    c.setTitle('DC20 Champion Class Reference'); cover(c,'Champion','MARTIAL')
    contents(c,'Champion',[('Class overview, table, and Martial Path',3),('Level 1 class features',4),('Levels 2-6 class features',5),('Subclasses: Hero and Sentinel',6),('Class talents and Level 1 quick reference',7)])
    bg(c); titlebar(c,'Champion','MARTIAL CLASS'); y=680
    y=para(c,'Champions are weapon and armor specialists who push themselves to the limit in combat. They master a wide variety of weapon types and learn their enemies as they fight them.',46,y,520,10,13)
    y-=7; y=section(c,'Champion Class Table',46,y,520)
    rows=[['1','+8','','','','+2','+2','Class Features'],['2','+2','','','','','','Class Feature, Talent, Path'],['3','+2','+1','+1','+1','+1','+1','Subclass Feature'],['4','+2','','','','','','Talent, 2 Ancestry, Path'],['5','+2','+1','+2','+1','+1','+1','Class Feature'],['6','+2','','','','','+1','Talent, Path']]
    y=class_table(c,rows,'SP','Man.',46,y,520)
    y=section(c,'Starting Equipment',46,y,248)
    y=bullets(c,['Arsenal: choose 3 Weapons or Shields.','Armor: 1 set of Armor.','Trade Tools: choose 1 - Carpenter\'s Tools, Cartographer\'s Tools, Gaming Kit, or Mason\'s Tools.','Adventuring Pack: choose 1 pack.'],46,y,248,8.7,10.6)
    y2=section(c,'Champion Martial Path',318,430,248)
    y2=para(c,'Combat Training: Weapons, All Armor, All Shields.',318,y2,248,9.1,11.4)
    y2=para(c,'Maneuvers: your Maneuvers Known increase as shown in the class table.',318,y2-3,248,9.1,11.4)
    y2=para(c,'Stamina Points: your maximum SP increases as shown in the class table.',318,y2-3,248,9.1,11.4)
    y2=para(c,'Stamina Regen: Once per Round, when you perform a Maneuver, regain up to half your maximum SP.',318,y2-3,248,9.1,11.4)
    footer(c,3); c.showPage()
    bg(c); titlebar(c,'Level 1 Class Features','CHAMPION'); y=675
    y=section(c,'Master-at-Arms',46,y,520)
    y=bullets(c,['Weapon Master: At the start of each of your turns, freely swap any Weapon currently wielded in each hand for another Weapon without provoking Opportunity Attacks.','Maneuver Master: Learn 1 Maneuver of your choice. Once per Round when you perform a Maneuver, reduce its SP cost by 1.'],46,y,520,9.3,11.7)
    y-=7; y=section(c,'Fighting Spirit',46,y,520); y=para(c,'You stand ready for Combat at any moment.',46,y,520,9.3,11.7)
    y=bullets(c,['Combat Readiness: At the start of your first turn in Combat, choose Fortify or Advance.','Fortify: Gain the benefits of the Dodge Action and ADV on the next Save you make until the end of Combat.','Advance: Gain the benefits of the Move Action and ADV on the next Martial Attack or Physical Check you make until the end of Combat.','Second Wind: Once per Combat when you start your turn Bloodied, regain 2 HP and 2 SP.'],46,y,520,9.2,11.5)
    y-=6; y=section(c,'Know Your Enemy - Flavor Feature',46,y,520)
    y=para(c,'Spend 1 minute observing or interacting with a creature out of Combat, or spend 1 AP in Combat. Choose Might, Agility, PD, AD, or HP. Make a DC 10 Knowledge or Insight Check. Success: learn whether that stat is higher, lower, or the same as yours. The GM can increase the DC for creatures that disguise or conceal their true power.',46,y,520,9.2,11.5)
    footer(c,4); c.showPage()
    bg(c); titlebar(c,'Levels 2-6 Class Features','CHAMPION'); y=675
    y=section(c,'Level 2 - Adaptive Tactics',46,y,520)
    y=para(c,'When you roll Initiative, and at the end of each of your turns, gain a d8 Tactical Die if you do not already have one.',46,y,520,9.2,11.5)
    y=bullets(c,['Assault: When you make a Martial Attack, add the Tactical Die to the Attack result.','Deflect: When you are Attacked, subtract the Tactical Die from the Attack result.'],46,y,520,9.2,11.5)
    y=para(c,'Level 2 also grants a Talent and Path Progression.',46,y-4,520,8.9,11.1)
    y-=7; y=section(c,'Level 3 - Subclass',46,y,520); y=para(c,'Choose Hero or Sentinel and gain its Level 3 features.',46,y,520,9.2,11.5)
    y-=7; y=section(c,'Level 4',46,y,520); y=para(c,'Gain 1 Talent, Path Progression, and 2 Ancestry Points.',46,y,520,9.2,11.5)
    y-=7; y=section(c,'Level 5 - Expert Champion',46,y,520)
    y=bullets(c,['Master-at-Arms: Learn 2 additional Maneuvers.','Fighting Spirit: Second Wind restores an additional 2 HP and 2 SP.','Adaptive Tactics: Your Tactical Die becomes a d10.'],46,y,520,9.2,11.5)
    y-=7; y=section(c,'Level 6',46,y,520); y=para(c,'Gain 1 Talent and Path Progression. The class table also grants 1 additional Maneuver Known at this level.',46,y,520,9.2,11.5)
    footer(c,5); c.showPage()
    bg(c); titlebar(c,'Subclasses','CHAMPION'); y=675
    y=section(c,"Hero - Hero's Resolve",46,y,520)
    y=bullets(c,['Adrenaline Boost: When you use Second Wind, gain +5 to Martial Attacks and Martial Checks until the end of your turn.','Cut Through: Martial Attacks that score Heavy Hits ignore the target\'s Physical Resistances.','Unyielding Spirit: While Bloodied, gain 1 Temp HP at the start of each of your turns.','Adventuring Hero - Flavor Feature: Ignore penalties from Forced March and being Encumbered, but not Heavily Encumbered.'],46,y,520,9.1,11.4)
    y-=12; y=section(c,'Sentinel - Stalwart Protector',46,y,520)
    y=bullets(c,['Steadfast Defender: Use Deflect against any Attack that targets a creature within your Melee Range.','Defensive Bash: When you use a Defensive Maneuver as a Reaction to an Attack from a creature within 1 Space, the attacker makes a Physical Save against your Attack Check. Failure: push it 1 Space or Taunt it until the end of its next turn.','Not on my Watch: Creatures Taunted by you deal 1 less damage to targets within 1 Space of you.','Vigilant Watcher - Flavor Feature: During a Long Rest, if both 4-hour periods are Light Activity, gain ADV on the Might Save to avoid Exhaustion; on a Failure the Save DC does not increase.'],46,y,520,9.0,11.3)
    footer(c,6); c.showPage()
    bg(c); titlebar(c,'Class Talents & Quick Reference','CHAMPION'); y=675
    y=section(c,"Champion's Resolve",46,y,250); y=para(c,'Requirement: Adaptive Tactics, Level 3. Assault also makes the Attack deal +1 damage. If Deflect causes the Attack to Miss, the Attacker takes 1 damage of a Physical damage type of your choice.',46,y,250,8.8,10.9)
    y-=7; y=section(c,'Disciplined Combatant',46,y,250); y=para(c,'Requirement: Fighting Spirit, Level 3. Once on each of your turns, spend 2 SP to gain the benefit of Combat Readiness. You may also use Second Wind without being Bloodied.',46,y,250,8.8,10.9)
    y2=section(c,'Level 1 at a glance',316,675,250)
    y2=bullets(c,['Base class HP: +8.','Maximum SP: 2.','Maneuvers Known: 2 from table + 1 from Maneuver Master = 3.','Training: Weapons, All Armor, All Shields.','Level 1 SSL = Combat Mastery = 1.','Once per Round, performing a Maneuver triggers Champion Stamina Regen.','Once per Round, Maneuver Master can reduce a Maneuver cost by 1 SP.','Combat Readiness strengthens the first turn; Second Wind is your once-per-Combat recovery.'],316,y2,250,8.8,10.8)
    c.setFillColor(LAV); c.roundRect(46,78,520,72,7,fill=1,stroke=0); c.setFillColor(PURPLE); c.setFont('Helvetica-Bold',8); c.drawString(60,130,'TABLE RHYTHM')
    para(c,'Swap weapons freely as the situation changes, use Maneuvers aggressively because they fuel Stamina Regen, and use Fighting Spirit to establish tempo immediately.',60,114,490,9.1,11.2)
    footer(c,7); c.showPage(); c.save(); return out


WILD=[('1','Transform into a Sheep: HP 2, PD & AD 5, Melee Attack +2, Damage 1.'),('2','Magical explosion: take True damage equal to Prime Modifier; creatures within 5 Spaces make a Physical Save or take the same damage.'),('3','You are Stunned 3.'),('4','DisADV on all Checks and Saves.'),('5','You are Stunned 1.'),('6','You are Blinded and Deafened.'),('7','All living creatures become Invisible to you.'),('8','Gain a d4 penalty on all Checks and Saves.'),('9','Grow 1 Size, become twice as heavy, Speed -2.'),('10','All creatures within 5 Spaces make a Might Save or are pulled 4 Spaces toward you.'),('11','All creatures within 5 Spaces except you make a Might Save or are pushed 4 Spaces away.'),('12','Grow 1 Size, become 1.5 times heavier, Speed +2.'),('13','Gain a d4 bonus to all Checks and Saves.'),('14','Gain Truesight 10 Spaces.'),('15','Become Invisible.'),('16','Maximum AP +1 and gain 1 AP.'),('17','ADV on all Checks and Saves.'),('18','+5 to all Spell Checks.'),('19','You and creatures within 5 Spaces regain HP equal to your Prime Modifier.'),('20','Transform into a Young Purple Dragon without Breath Weapon: HP 30, PD & AD 16, Attack +10, Damage 4, Fly Speed 6.')]


def sorcerer_pdf():
    out=OUT/'DC20_Sorcerer_Class_Reference.pdf'; c=canvas.Canvas(str(out),pagesize=letter)
    c.setTitle('DC20 Sorcerer Class Reference'); cover(c,'Sorcerer','SPELLCASTING')
    contents(c,'Sorcerer',[('Class overview, table, and Spellcasting Path',3),('Level 1 features and Wild Magic',4),('Levels 2-6 class features',5),('Subclasses: Angelic and Draconic',6),('Class talents and Level 1 quick reference',7)])
    bg(c); titlebar(c,'Sorcerer','SPELLCASTING CLASS'); y=680
    y=para(c,'Sorcerers channel raw magic through their own bodies. They manipulate and sculpt magic with instinct, can overload themselves, and push beyond normal magical limits.',46,y,520,10,13)
    y-=7; y=section(c,'Sorcerer Class Table',46,y,520)
    rows=[['1','+7','','','','+6','+4','Class Features'],['2','+1','','','','','','Class Feature, Talent, Path'],['3','+1','+1','+1','+1','+3','+1','Subclass Feature'],['4','+1','','','','','','Talent, 2 Ancestry, Path'],['5','+1','+1','+2','+1','+3','+1','Class Feature'],['6','+1','','','','','+1','Talent, Path']]
    y=class_table(c,rows,'MP','Spells',46,y,520)
    y=section(c,'Starting Equipment',46,y,248)
    y=bullets(c,['Arsenal: 2 Spell Focuses.','Armor: 1 set of Light Armor.','Trade Tools: choose 2 - Alchemist\'s Supplies, Calligrapher\'s Supplies, Jeweler\'s Tools, or Weaver\'s Tools.','Adventuring Pack: choose 1 pack.'],46,y,248,8.7,10.6)
    y2=section(c,'Sorcerer Spellcasting Path',318,430,248)
    y2=para(c,'Combat Training: Spell Focuses, Light Armor.',318,y2,248,9.1,11.4)
    y2=para(c,'Spell List: Choose 1 Spell Source - Arcane, Divine, or Primal. When you learn a Spell, choose from that Source.',318,y2-3,248,9.1,11.4)
    y2=para(c,'Spells Known and maximum Mana Points increase according to the Sorcerer Class Table.',318,y2-3,248,9.1,11.4)
    footer(c,3); c.showPage()
    bg(c); titlebar(c,'Level 1 Features & Wild Magic','SORCERER'); y=675
    y=section(c,'Innate Power',46,y,520)
    y=para(c,'Choose one Sorcerous Origin. In addition, increase Maximum MP by 1 and gain the benefit of one 1-point Focus Property of your choice; change the Property after a Long Rest.',46,y,520,8.9,10.8)
    y=bullets(c,['Intuitive Magic: Learn 2 Spells of your choice from your Spell List.','Resilient Magic: Gain Dazed Resistance.','Unstable Magic: When you Critically Succeed or Fail on a Spell Attack or Spell Check, roll on the Wild Magic Table. Roll with ADV on Critical Success and DisADV on Critical Failure. Then gain ADV on the next Spell Attack or Spell Check before the end of your next turn.'],46,y,520,8.8,10.7)
    y-=3; y=section(c,'Wild Magic Table - d20',46,y,520); colw=252; yy1=y; yy2=y
    for idx,(roll,effect) in enumerate(WILD):
        xx=46 if idx<10 else 314; yy=yy1 if idx<10 else yy2
        lines=wrap(effect,'Times-Roman',7.2,colw-30); c.setFillColor(PURPLE); c.setFont('Helvetica-Bold',7.3); c.drawString(xx,yy,roll); c.setFillColor(INK); c.setFont('Times-Roman',7.2)
        for line in lines: c.drawString(xx+20,yy,line); yy-=8.6
        yy-=2.3
        if idx<10: yy1=yy
        else: yy2=yy
    footer(c,4); c.showPage()
    bg(c); titlebar(c,'Levels 1-6 Class Features','SORCERER'); y=675
    y=section(c,'Overload Magic - Level 1',46,y,520)
    y=para(c,'In Combat spend 1 AP + 1 MP to channel raw magical energy for 1 minute, until Incapacitated, dead, or freely ended. While Overloaded, gain +5 to all Spell Attacks and Spell Checks. Immediately make an Attribute Save of your choice against your Save DC, then repeat at the start of each turn. Failure: gain Exhaustion. Exhaustion gained this way is removed after a Short Rest. Sorcery - Flavor Feature: learn the Sorcery Spell.',46,y,520,8.8,10.7)
    y-=5; y=section(c,'Meta Magic - Level 2',46,y,520)
    y=para(c,'Learn 2 unique Spell Enhancements. Normally use only 1 of these per Spell. MP spent on Meta Magic does not count against your Mana Spend Limit.',46,y,520,8.8,10.7)
    y=bullets(c,['Careful Spell (1 MP): Exclude chosen creatures from an area Spell\'s damage and effects.','Distant Spell (1 MP): Increase range by 2 Spaces if range is 1, or by 10 Spaces if greater than 1.','Quickened Spell (1 MP): Reduce the AP cost of a Spell by 1, minimum 1 AP.','Subtle Spell (1 MP): Cast without Somatic and Verbal Components.','Transmuted Spell (1 MP): Change a Spell\'s damage type to another type except True damage.','Vicious Spell (1 MP): One target has DisADV on its first Save against the Spell.'],46,y,520,8.45,10.2)
    y=para(c,'Once per Long Rest, use 1 Meta Magic option without spending MP. Regain this use when you roll Initiative.',46,y-2,520,8.7,10.5)
    y-=5; y=section(c,'Levels 3-6',46,y,520)
    y=bullets(c,['Level 3: Choose a Subclass.','Level 4: Gain 1 Talent, Path Progression, and 2 Ancestry Points.','Level 5 - Expert Sorcerer: Maximum MP +1; gain one additional 1-point Focus Property; no Attribute Save when activating Overload, but still Save at the start of turns; learn 1 additional Meta Magic option and may use 2 different Meta Magic enhancements on the same Spell.','Level 6: Gain 1 Talent and Path Progression; the class table also grants 1 additional Spell Known.'],46,y,520,8.45,10.2)
    footer(c,5); c.showPage()
    bg(c); titlebar(c,'Subclasses','SORCERER'); y=675
    y=section(c,'Angelic - Celestial Spark',46,y,520)
    y=bullets(c,['Minor Action: emit Bright Light within a 5-Space Radius; end the effect freely.','Celestial Origin: Gain access to Angelborn and 2 Ancestry Points usable only on Angelborn Traits.','Celestial Protection: Learn Careful Spell Meta Magic, or another option if already known. Careful Spell costs 0 MP.','Celestial Overload: Once per Combat while Overloaded, spend 1 AP for a 5-Space Aura. Chosen creatures either regain 1 HP or are targeted by a Spell Attack vs AD; Hit: 1 Radiant damage.','Celestial Appearance - Flavor Feature: Gain or enhance angelic traits and gain 1 Language Mastery in Celestial, or another Language if already Fluent.'],46,y,520,8.75,10.6)
    y-=8; y=section(c,'Draconic - Draconic Spark',46,y,520)
    y=bullets(c,['Draconic Origin: Gain access to Dragonborn and 2 Ancestry Points usable only on Dragonborn Traits. Choose a Draconic Origin if needed.','Draconic Overload: While Overloaded, gain Resistance (1) to Physical damage and your Draconic Origin damage type.','Draconic Transmutation: Learn Transmuted Spell Meta Magic, or another option if already known. It costs 0 MP when changing damage to your Draconic Origin damage type.','Draconic Appearance - Flavor Feature: Gain or enhance draconic traits and gain 1 Language Mastery in Draconic, or another Language if already Fluent.'],46,y,520,8.75,10.6)
    footer(c,6); c.showPage()
    bg(c); titlebar(c,'Class Talents & Quick Reference','SORCERER'); y=675
    y=section(c,'Expanded Meta Magic',46,y,250); y=para(c,'Requirement: Meta Magic. Maximum MP +2 and learn 2 additional Meta Magic Spell Enhancements; do not choose the same option more than once.',46,y,250,8.7,10.7)
    y-=6; y=section(c,'Greater Innate Power',46,y,250); y=para(c,'Requirements: Innate Power, Level 3. Maximum MP +1, gain another 1-point Focus Property, and gain another Sorcerous Origin. Focus Properties can be changed after a Short or Long Rest.',46,y,250,8.7,10.7)
    y-=6; y=section(c,'Font of Magic',46,y,250); y=para(c,'Requirements: Meta Magic, Level 3. Spend 2 Rest Points in place of 1 MP on Meta Magic. Regain 2 Rest Points when you roll Initiative.',46,y,250,8.7,10.7)
    y2=section(c,'Level 1 at a glance',316,675,250)
    y2=bullets(c,['Base class HP: +7.','Class-table Mana: 6 MP; Innate Power raises Maximum MP by 1, for 7 total before other effects.','Spells Known: 4 from class table; Intuitive Magic adds 2 if chosen.','Training: Spell Focuses, Light Armor.','Choose exactly 1 Spell Source: Arcane, Divine, or Primal.','Level 1 MSL = Combat Mastery = 1.','Overload costs 1 AP + 1 MP and gives +5 to Spell Attacks/Checks, with Exhaustion risk.','Unstable Magic makes critical spell results trigger Wild Magic.'],316,y2,250,8.7,10.6)
    c.setFillColor(LAV); c.roundRect(46,76,520,74,7,fill=1,stroke=0); c.setFillColor(PURPLE); c.setFont('Helvetica-Bold',8); c.drawString(60,130,'TABLE RHYTHM')
    para(c,'Choose your Spell Source first, track your Sorcerous Origin, and treat Overload as a powerful risk-reward mode. At Level 2, Meta Magic becomes the main way you reshape spells.',60,114,490,9.0,11.1)
    footer(c,7); c.showPage(); c.save(); return out


if __name__=='__main__':
    print(champion_pdf())
    print(sorcerer_pdf())
