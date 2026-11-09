# Obnovení čtyř archivovaných stránek

Dne 9. 11. 2026 byly deaktivovány záložky **Bard, Champion, Cleric, Summoner**, nikoli jejich data.

## Zachované podklady
- `assets/js/app.js`: funkce `renderClass(route)` i její pomocné funkce zůstaly.
- `assets/js/classes-current.js`, `assets/js/classes-extra.js`, `assets/js/classes-bard-summoner.js`, `assets/js/rules-data.js`: data a pravidla.
- `assets/media/`: ilustrace; `assets/references/DC20_*_Class_Reference.pdf`: PDF (zůstávají dostupné).
- `index.html`: původní datové JavaScript soubory dál načítá. Soubory se při aktualizaci nesmazaly.

## Obnovení
1. V `index.html` před odkaz Postavy do `.nav-left` přidej:
```html
<a href="#bard" data-route="bard">Bard</a>
<a href="#champion" data-route="champion">Champion</a>
<a href="#cleric" data-route="cleric">Cleric</a>
<a href="#summoner" data-route="summoner">Summoner</a>
```
2. V `assets/js/app.js` vlož `'cleric','champion','bard','summoner'` do seznamu povolených rout ve funkci `classRoute()`.
3. Ve funkci `render()` v témže souboru vrať před podmínku pro Toolkit:
```js
else if(['cleric','champion','bard','summoner'].includes(route)) renderClass(route);
```
4. Přidej routy a kontroly zpět do `tools/check_mobile.cjs` a `.github/workflows/site-audit.yml`; nezapomeň upravit `version.json`, `APP_VERSION` v `app.js` a `CACHE` v `sw.js`.
5. Ulož do `main` a ověř zelený Site audit a GitHub Pages deployment.

Původní stránky lze také zkontrolovat v historii GitHubu před archivací: commit `0b6a35c1aa4987d03d7b7aba67e93e5a018213c0`.
