# Forever Class & Race Planner

Fan-made class and race planner for World of Warcraft: Forever. Not affiliated with or endorsed by Blizzard Entertainment.

Live page: https://brawnybravo.github.io/forever-calculator/

Pick a faction, the role you want, what you want to do (Pure PvP, PvE, Balanced, Casual or Gold farmer), your experience and a profession priority. The list on the left re-ranks as you click: one row per class with its best race, and the other races a tap away. Selecting a row plans that path on the right: the expected best talents for the spec, a starter gear set with a best, 2nd and 3rd choice per slot, enchants, live stats, a damage estimate against a raid boss, and the Legacy perks. Change any talent or slot and the numbers follow. "Why?" under a row shows how it scored.

Everything is saved in the link, so a set of choices and a full build can be shared as one address.

Ratings are provisional until beta tooltips and combat logs confirm them; "How it scores" under More says what is current and what is not. The talent trees carry the reported Forever changes; the item list is Classic-era data until Forever beta data exists.

The page is two files with no build step: `index.html` and `planner-data.js`. Keep them together, or use the published site. `preview.png` and `icon.png` are the link preview and the tab icon.

## Automatic checks

Every pull request, a weekly run and a manual run (Actions tab, "Site checks") test the page from the repository files: Lighthouse on phone settings for accessibility and speed (`lighthouserc.json`), and lychee for broken links, including the links inside the page's scripts (`lychee.toml`). Accessibility below the limit fails the check; speed and best-practice scores only warn. If the weekly link check finds a broken link, it opens or updates one issue labelled `broken-links`.

## Credits

Talent trees, item database and the raid preset builds come from [WoWSims Classic](https://github.com/wowsims/classic) (MIT licence). Talent and item tooltips and icons are served by [Wowhead](https://www.wowhead.com/classic).

## Licence

The page's own code and text are under the MIT licence (see `LICENSE`). Game data and names belong to Blizzard Entertainment.
