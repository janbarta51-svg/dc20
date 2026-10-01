# Gangsterka

Offline-first herní reference a kampaňový web pro `dc20.honzanacestach.cz`.

## Lokální otevření
Rozbal složku a otevři `index.html` v prohlížeči.

## Pages CMS
Konfigurace je v `.pages.yml` v kořeni projektu a obsahuje tři části:

### Gangy
- **Název gangu**
- **Logo / ikonka** — volitelné
- **Popis** — rich-text/Markdown editor

Každý gang je v CMS sbalený pod svým názvem. Pro seznamy používej běžné Markdown odrážky `- položka` nebo nástroj seznamu v editoru.

### Řezníci
- **Jméno**
- **Popis** — rich-text/Markdown editor
- **Obrázek** — volitelný

### Kronika
- **Název**
- **Den**
- **Popis co se stalo** — rich-text/Markdown editor

Každá session je v CMS sbalená jako `Název — Den`.

### Obrázky
Nahraná loga gangů a obrázky postav se ukládají do `assets/uploads/`.

### Zapnutí Pages CMS
1. Otevři `https://app.pagescms.org/` a přihlas se přes GitHub.
2. Povol Pages CMS pro repository `dc20`.
3. Vyber branch `main`.
4. Pages CMS načte `.pages.yml` automaticky.
5. V levém menu uvidíš **Gangy**, **Řezníci** a **Kronika**.

Po uložení Pages CMS vytvoří commit do GitHubu. CMS JSON soubory web načítá network-first, takže online vždy preferuje nejnovější obsah a poslední úspěšná verze zůstává dostupná offline.

## Offline režim
Service Worker přednačítá hlavní HTML, CSS, JavaScript, obrázky a referenční PDF. Obsah z Pages CMS se aktualizuje ze sítě a současně ukládá pro offline použití.

## Herní podklady
Na úvodní stránce jsou ke stažení vyplnitelný list postavy DC20 Beta 0.10.0 (EN), tahák a statusy. Originální soubory jsou v `assets/downloads/` a jsou dostupné také offline po načtení webu.

## Kalendář
Kliknutí na termín v měsíčním přehledu otevře jeho detail. Tlačítko **Přidat do Google kalendáře** otevře předvyplněnou událost v časovém pásmu Europe/Prague; její uložení potvrzuje uživatel ve svém Google účtu.

## Nasazení
Projekt je připravený pro GitHub Pages a doménu `dc20.honzanacestach.cz` přes soubor `CNAME`.
