# Gangsterka

Offline-first herní reference a kampaňový web pro `dc20.honzanacestach.cz`.

## Lokální otevření
Rozbal složku a otevři `index.html` v prohlížeči.

## Pages CMS
Konfigurace je v `.pages.yml` v kořeni projektu a obsahuje dvě samostatné části:

### Gangy
- **Název gangu**
- **Logo / ikonka** — volitelné
- **Popis** — rich-text/Markdown editor

Každý gang je v CMS sbalený pod svým názvem. Popis může obsahovat normální odstavce, nadpisy a odrážky. Web navíc umí při vykreslení rozpoznat řádky začínající `-`, `*`, `•`, `–`, `—`, `➢` nebo `❖` jako seznam.

### Kronika
- **Název**
- **Den**
- **Popis co se stalo** — rich-text/Markdown editor

Každá session je v CMS sbalená jako `Název — Den`.

### Obrázky
Nahraná loga gangů se ukládají do `assets/uploads/`.

### Zapnutí Pages CMS
1. Otevři `https://app.pagescms.org/` a přihlas se přes GitHub.
2. Nainstaluj / povol Pages CMS GitHub App pro repository s webem.
3. Vyber repository `dc20` a větev `main`.
4. Pages CMS načte `.pages.yml` automaticky.
5. V levém menu uvidíš **Gangy** a **Kronika**.

Po uložení Pages CMS vytvoří commit do GitHubu. CMS JSON soubory web načítá network-first, takže nová verze se při online použití neblokuje starou offline cache.

## Nasazení
Projekt je připravený pro GitHub Pages a doménu `dc20.honzanacestach.cz` přes soubor `CNAME`.
