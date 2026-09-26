# BF6 Best Loadouts

Pick a gun → see the **one best attachment layout** for close, medium, long, hipfire, recoil, ADS, and stealth. Thermal layouts are included when that gun has a thermal optic unlocked.

Live site: https://benwilks81.github.io/BF6-Best-Loadouts/

Set your **player level** and **weapon mastery** so recommendations only use attachments you can unlock. Each gun also shows the player level required to unlock it.

Favourites and level prefs are saved in your browser (`bf6-best-loadouts-favorites-v1`, `bf6-best-loadouts-levels-v1`).

This folder is self-contained: scripts only read/write under this directory.

## Why each option is chosen

Each build keeps a 100-point budget. The table for that build says why the usual optic, barrel, muzzle, grip, laser, light, magazine, ammo, and ergo win.

The same notes are on the site. From the main page, open **Why these parts**, or go to [why.html](https://benwilks81.github.io/BF6-Best-Loadouts/why.html).

The weekly data refresh rewrites the block between the markers, and that page, whenever weapon or attachment stats change. Do not edit that block by hand. Regenerate both after a scoring change with `node scripts/explain_loadouts.js`.

<!-- loadout-reasons:start -->
Generated for **gun level 50**, challenge parts off, one layout per primary (56 guns). Data embedded 2026-09-21T03:15:05+00:00.
Every part that wins a slot on at least one gun is listed. A gun on the main page can still differ.

### Close

0–20 m. Highest weights: hipfire spread, ADS speed, headshot time to kill, full-auto conversion. Spotting is not scored, so a suppressor's hide effect cannot beat recoil or hipfire on its own.

The on-site reason line is usually: clearer optic picture · better hipfire · faster reload.

| Slot | Why it is chosen |
| --- | --- |
| Optic | Standard Optic on 56 of 56 guns. Its aim score at this range is 0.55. The optic changes the picture score only, not recoil or spread. |
| Barrel | Short (15 pts) on 28 of 56 guns. 1 hipfire tier better; 1 velocity tier worse.<br>Extended (5 pts) on 19 of 56 guns. 1 velocity tier better.<br>Basic (10 pts) on 4 of 56 guns.<br>Heavy (10 pts) on 4 of 56 guns. Less ADS bloom per shot.<br>Suppressed (20 pts) on 1 of 56 guns. Spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that. |
| Muzzle | Compensated Brake (20 pts) on 49 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×.<br>Compensator (10 pts) on 3 of 56 guns. Recoil recovers at 1.2×.<br>Left empty on 2 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Hybrid Suppressor K (50 pts) on 1 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×; spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that.<br>Double-Port Brake (10 pts) on 1 of 56 guns. 1 recoil tier better. |
| Grip | Classic Vertical (35 pts) on 44 of 56 guns. 5 recoil tiers better; 1 moving ADS tier worse.<br>Full Angled (5 pts) on 6 of 56 guns. 1 moving ADS tier worse.<br>6H64 Vertical (25 pts) on 3 of 56 guns. 4 recoil tiers better; 1 moving ADS tier worse.<br>Left empty on 2 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Ribbed Vertical (20 pts) on 1 of 56 guns. 3 recoil tiers better; 1 moving ADS tier worse. |
| Laser | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Light | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Mag | 30 Rnd (5 pts) on 22 of 56 guns. 30 rounds; round count is scored against ADS and reload shifts.<br>20 Rnd (5 pts) on 7 of 56 guns. 20 rounds; round count is scored against ADS and reload shifts.<br>10 Rnd (5 pts) on 5 of 56 guns. 10 rounds; round count is scored against ADS and reload shifts.<br>50 Rnd (5 pts) on 3 of 56 guns. 50 rounds; round count is scored against ADS and reload shifts.<br>100 Rnd (5 pts) on 3 of 56 guns. 100 rounds; round count is scored against ADS and reload shifts.<br>15 Rnd (5 pts) on 2 of 56 guns. 15 rounds; round count is scored against ADS and reload shifts.<br>8 Rnd (25 pts) on 2 of 56 guns. 1 handling tier worse; 8 rounds; round count is scored against ADS and reload shifts.<br>7 Rnd (15 pts) on 2 of 56 guns. 1 handling tier worse; 7 rounds; round count is scored against ADS and reload shifts.<br>6 Rnd (5 pts) on 2 of 56 guns. 1 handling tier better; 6 rounds; round count is scored against ADS and reload shifts.<br>25 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 25 rounds; round count is scored against ADS and reload shifts.<br>17 Rnd (5 pts) on 1 of 56 guns. 17 rounds; round count is scored against ADS and reload shifts.<br>20 Fast (5 pts) on 1 of 56 guns. 1 moving ADS tier better; 3 handling tiers better; 20 rounds; round count is scored against ADS and reload shifts.<br>36 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 36 rounds; round count is scored against ADS and reload shifts.<br>60 Rnd (5 pts) on 1 of 56 guns. 60 rounds; round count is scored against ADS and reload shifts.<br>75 Rnd (10 pts) on 1 of 56 guns. 1 moving ADS tier better; 75 rounds; round count is scored against ADS and reload shifts.<br>45 Rnd (5 pts) on 1 of 56 guns. 45 rounds; round count is scored against ADS and reload shifts.<br>14 Rnd (5 pts) on 1 of 56 guns. 14 rounds; round count is scored against ADS and reload shifts. |
| Ammo | Polymer Case on 23 of 56 guns. 1 handling tier better.<br>FMJ on 18 of 56 guns. Default ballistics, kept when a special round does not earn its point cost.<br>Synthetic Tip on 10 of 56 guns. Raises the headshot multiplier, so headshot time to kill drops when that breakpoint is scored.<br>#01 BUCK on 4 of 56 guns. Wins on these guns because its scored trade beats the other rounds.<br>Match Grade on 1 of 56 guns. Wins on these guns because its scored trade beats the other rounds. |
| Ergo | Left empty on 33 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Improved Mag Catch (5 pts) on 20 of 56 guns. Reload at 1.1×.<br>Rail Cover (5 pts) on 2 of 56 guns.<br>Burst Mode (10 pts) on 1 of 56 guns. 1 recoil tier better. |

### Medium

20–50 m. Highest weights: recoil per shot, ADS bloom, optic picture, headshot time to kill. Spotting is not scored, so a suppressor's hide effect cannot beat recoil or hipfire on its own.

The on-site reason line is usually: clearer optic picture · less recoil · faster recoil recovery.

| Slot | Why it is chosen |
| --- | --- |
| Optic | Variable Low on 56 of 56 guns. Its aim score at this range is 0.88. The optic changes the picture score only, not recoil or spread. |
| Barrel | Extended (5 pts) on 43 of 56 guns. 1 velocity tier better.<br>Heavy Extended (10 pts) on 9 of 56 guns. 1 velocity tier better; less ADS bloom per shot.<br>Basic (10 pts) on 3 of 56 guns.<br>Suppressed (20 pts) on 1 of 56 guns. Spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that. |
| Muzzle | Compensated Brake (20 pts) on 49 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×.<br>Compensator (10 pts) on 3 of 56 guns. Recoil recovers at 1.2×.<br>Left empty on 2 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Hybrid Suppressor L (30 pts) on 1 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×; 1 hipfire tier worse; spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that.<br>Double-Port Brake (10 pts) on 1 of 56 guns. 1 recoil tier better. |
| Grip | Classic Vertical (35 pts) on 34 of 56 guns. 5 recoil tiers better; 1 moving ADS tier worse.<br>6H64 Vertical (25 pts) on 12 of 56 guns. 4 recoil tiers better; 1 moving ADS tier worse.<br>Full Angled (5 pts) on 6 of 56 guns. 1 moving ADS tier worse.<br>Ribbed Vertical (20 pts) on 2 of 56 guns. 3 recoil tiers better; 1 moving ADS tier worse.<br>Folding Vertical (10 pts) on 1 of 56 guns. 2 recoil tiers better; 1 moving ADS tier worse.<br>Left empty on 1 of 56 guns. Nothing in this slot raised the score enough to spend the points. |
| Laser | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Light | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Mag | 30 Rnd (5 pts) on 23 of 56 guns. 30 rounds; round count is scored against ADS and reload shifts.<br>20 Rnd (5 pts) on 7 of 56 guns. 20 rounds; round count is scored against ADS and reload shifts.<br>10 Rnd (5 pts) on 5 of 56 guns. 10 rounds; round count is scored against ADS and reload shifts.<br>50 Rnd (5 pts) on 4 of 56 guns. 50 rounds; round count is scored against ADS and reload shifts.<br>100 Rnd (5 pts) on 3 of 56 guns. 100 rounds; round count is scored against ADS and reload shifts.<br>15 Rnd (5 pts) on 2 of 56 guns. 15 rounds; round count is scored against ADS and reload shifts.<br>8 Rnd (25 pts) on 2 of 56 guns. 1 handling tier worse; 8 rounds; round count is scored against ADS and reload shifts.<br>7 Rnd (15 pts) on 2 of 56 guns. 1 handling tier worse; 7 rounds; round count is scored against ADS and reload shifts.<br>6 Rnd (5 pts) on 2 of 56 guns. 1 handling tier better; 6 rounds; round count is scored against ADS and reload shifts.<br>25 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 25 rounds; round count is scored against ADS and reload shifts.<br>17 Rnd (5 pts) on 1 of 56 guns. 17 rounds; round count is scored against ADS and reload shifts.<br>36 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 36 rounds; round count is scored against ADS and reload shifts.<br>60 Rnd (5 pts) on 1 of 56 guns. 60 rounds; round count is scored against ADS and reload shifts.<br>45 Rnd (5 pts) on 1 of 56 guns. 45 rounds; round count is scored against ADS and reload shifts.<br>14 Rnd (5 pts) on 1 of 56 guns. 14 rounds; round count is scored against ADS and reload shifts. |
| Ammo | FMJ on 19 of 56 guns. Default ballistics, kept when a special round does not earn its point cost.<br>Polymer Case on 17 of 56 guns. 1 handling tier better.<br>Synthetic Tip on 15 of 56 guns. Raises the headshot multiplier, so headshot time to kill drops when that breakpoint is scored.<br>#01 BUCK on 4 of 56 guns. Wins on these guns because its scored trade beats the other rounds.<br>Match Grade on 1 of 56 guns. Wins on these guns because its scored trade beats the other rounds. |
| Ergo | Left empty on 34 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Improved Mag Catch (5 pts) on 20 of 56 guns. Reload at 1.1×.<br>Rail Cover (5 pts) on 2 of 56 guns. |

### Long

50–100 m+. Highest weights: optic picture, recoil per shot, bullet velocity, ADS bloom. Spotting is not scored, so a suppressor's hide effect cannot beat recoil or hipfire on its own.

The on-site reason line is usually: clearer optic picture · less recoil · higher velocity.

| Slot | Why it is chosen |
| --- | --- |
| Optic | Variable High on 56 of 56 guns. Its aim score at this range is 0.96. The optic changes the picture score only, not recoil or spread. |
| Barrel | Extended (5 pts) on 43 of 56 guns. 1 velocity tier better.<br>Heavy Extended (10 pts) on 9 of 56 guns. 1 velocity tier better; less ADS bloom per shot.<br>Basic (10 pts) on 3 of 56 guns.<br>Suppressed (20 pts) on 1 of 56 guns. Spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that. |
| Muzzle | Compensated Brake (20 pts) on 49 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×.<br>Lightened Suppressor (30 pts) on 3 of 56 guns. Recoil recovers at 1.2×; 1 hipfire tier worse; spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that.<br>Left empty on 2 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Hybrid Suppressor L (30 pts) on 1 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×; 1 hipfire tier worse; spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that.<br>Long Suppressor (25 pts) on 1 of 56 guns. Recoil recovers at 1.2×; 1 hipfire tier worse; spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that. |
| Grip | Classic Vertical (35 pts) on 30 of 56 guns. 5 recoil tiers better; 1 moving ADS tier worse.<br>6H64 Vertical (25 pts) on 12 of 56 guns. 4 recoil tiers better; 1 moving ADS tier worse.<br>Full Angled (5 pts) on 6 of 56 guns. 1 moving ADS tier worse.<br>Ribbed Vertical (20 pts) on 4 of 56 guns. 3 recoil tiers better; 1 moving ADS tier worse.<br>Folding Vertical (10 pts) on 3 of 56 guns. 2 recoil tiers better; 1 moving ADS tier worse.<br>Left empty on 1 of 56 guns. Nothing in this slot raised the score enough to spend the points. |
| Laser | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Light | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Mag | 30 Rnd (5 pts) on 23 of 56 guns. 30 rounds; round count is scored against ADS and reload shifts.<br>20 Rnd (5 pts) on 7 of 56 guns. 20 rounds; round count is scored against ADS and reload shifts.<br>10 Rnd (5 pts) on 5 of 56 guns. 10 rounds; round count is scored against ADS and reload shifts.<br>50 Rnd (5 pts) on 4 of 56 guns. 50 rounds; round count is scored against ADS and reload shifts.<br>100 Rnd (5 pts) on 3 of 56 guns. 100 rounds; round count is scored against ADS and reload shifts.<br>15 Rnd (5 pts) on 2 of 56 guns. 15 rounds; round count is scored against ADS and reload shifts.<br>8 Rnd (25 pts) on 2 of 56 guns. 1 handling tier worse; 8 rounds; round count is scored against ADS and reload shifts.<br>7 Rnd (15 pts) on 2 of 56 guns. 1 handling tier worse; 7 rounds; round count is scored against ADS and reload shifts.<br>6 Rnd (5 pts) on 2 of 56 guns. 1 handling tier better; 6 rounds; round count is scored against ADS and reload shifts.<br>25 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 25 rounds; round count is scored against ADS and reload shifts.<br>17 Rnd (5 pts) on 1 of 56 guns. 17 rounds; round count is scored against ADS and reload shifts.<br>36 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 36 rounds; round count is scored against ADS and reload shifts.<br>60 Rnd (5 pts) on 1 of 56 guns. 60 rounds; round count is scored against ADS and reload shifts.<br>45 Rnd (5 pts) on 1 of 56 guns. 45 rounds; round count is scored against ADS and reload shifts.<br>14 Rnd (5 pts) on 1 of 56 guns. 14 rounds; round count is scored against ADS and reload shifts. |
| Ammo | FMJ on 21 of 56 guns. Default ballistics, kept when a special round does not earn its point cost.<br>Polymer Case on 15 of 56 guns. 1 handling tier better.<br>Synthetic Tip on 15 of 56 guns. Raises the headshot multiplier, so headshot time to kill drops when that breakpoint is scored.<br>#01 BUCK on 4 of 56 guns. Wins on these guns because its scored trade beats the other rounds.<br>Match Grade on 1 of 56 guns. Wins on these guns because its scored trade beats the other rounds. |
| Ergo | Left empty on 43 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Improved Mag Catch (5 pts) on 12 of 56 guns. Reload at 1.1×.<br>Burst Mode (10 pts) on 1 of 56 guns. 1 recoil tier better. |

### Hipfire

from the hip. Highest weights: hipfire spread, hipfire control, full-auto conversion, handling. Spotting is not scored, so a suppressor's hide effect cannot beat recoil or hipfire on its own.

The on-site reason line is usually: less recoil · snappier handling · better hipfire.

| Slot | Why it is chosen |
| --- | --- |
| Optic | Standard Optic on 48 of 56 guns. Its aim score at this range is 0.55. The optic changes the picture score only, not recoil or spread.<br>Iron Sights (1.50x) on 8 of 56 guns. Its aim score at this range is 0.42. |
| Barrel | Short (15 pts) on 28 of 56 guns. 1 hipfire tier better; 1 velocity tier worse.<br>Extended (5 pts) on 19 of 56 guns. 1 velocity tier better.<br>Basic (10 pts) on 4 of 56 guns.<br>Heavy (10 pts) on 4 of 56 guns. Less ADS bloom per shot.<br>Suppressed (20 pts) on 1 of 56 guns. Spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that. |
| Muzzle | Compensated Brake (20 pts) on 49 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×.<br>Compensator (10 pts) on 3 of 56 guns. Recoil recovers at 1.2×.<br>Left empty on 2 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Hybrid Suppressor K (50 pts) on 1 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×; spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that.<br>Double-Port Brake (10 pts) on 1 of 56 guns. 1 recoil tier better. |
| Grip | Classic Vertical (35 pts) on 47 of 56 guns. 5 recoil tiers better; 1 moving ADS tier worse.<br>Full Angled (5 pts) on 6 of 56 guns. 1 moving ADS tier worse.<br>Folding Vertical (10 pts) on 1 of 56 guns. 2 recoil tiers better; 1 moving ADS tier worse.<br>Left empty on 1 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>6H64 Vertical (25 pts) on 1 of 56 guns. 4 recoil tiers better; 1 moving ADS tier worse. |
| Laser | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Light | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Mag | 20 Rnd (5 pts) on 17 of 56 guns. 1 moving ADS tier better; 2 handling tiers better; 20 rounds; round count is scored against ADS and reload shifts.<br>30 Rnd (5 pts) on 9 of 56 guns. 30 rounds; round count is scored against ADS and reload shifts.<br>10 Rnd (5 pts) on 7 of 56 guns. 1 moving ADS tier better; 2 handling tiers better; 10 rounds; round count is scored against ADS and reload shifts.<br>50 Rnd (5 pts) on 4 of 56 guns. 50 rounds; round count is scored against ADS and reload shifts.<br>5 Rnd (5 pts) on 4 of 56 guns. 1 moving ADS tier better; 2 handling tiers better; 5 rounds; round count is scored against ADS and reload shifts.<br>20 Fast (5 pts) on 2 of 56 guns. 1 moving ADS tier better; 3 handling tiers better; 20 rounds; round count is scored against ADS and reload shifts.<br>100 Rnd (5 pts) on 2 of 56 guns. 100 rounds; round count is scored against ADS and reload shifts.<br>4 Rnd (5 pts) on 2 of 56 guns. 1 handling tier better; 4 rounds; round count is scored against ADS and reload shifts.<br>10 Fast (5 pts) on 1 of 56 guns. 1 moving ADS tier better; 3 handling tiers better; 10 rounds; round count is scored against ADS and reload shifts.<br>25 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 25 rounds; round count is scored against ADS and reload shifts.<br>17 Rnd (5 pts) on 1 of 56 guns. 17 rounds; round count is scored against ADS and reload shifts.<br>15 Rnd (5 pts) on 1 of 56 guns. 15 rounds; round count is scored against ADS and reload shifts.<br>36 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 36 rounds; round count is scored against ADS and reload shifts.<br>60 Rnd (5 pts) on 1 of 56 guns. 60 rounds; round count is scored against ADS and reload shifts.<br>75 Rnd (10 pts) on 1 of 56 guns. 1 moving ADS tier better; 75 rounds; round count is scored against ADS and reload shifts.<br>6 Rnd (5 pts) on 1 of 56 guns. 1 handling tier better; 6 rounds; round count is scored against ADS and reload shifts.<br>14 Rnd (5 pts) on 1 of 56 guns. 14 rounds; round count is scored against ADS and reload shifts. |
| Ammo | Polymer Case on 23 of 56 guns. 1 handling tier better.<br>FMJ on 18 of 56 guns. Default ballistics, kept when a special round does not earn its point cost.<br>Synthetic Tip on 10 of 56 guns. Raises the headshot multiplier, so headshot time to kill drops when that breakpoint is scored.<br>#01 BUCK on 4 of 56 guns. Wins on these guns because its scored trade beats the other rounds.<br>Match Grade on 1 of 56 guns. Wins on these guns because its scored trade beats the other rounds. |
| Ergo | Left empty on 33 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Improved Mag Catch (5 pts) on 18 of 56 guns. Reload at 1.1×.<br>Rail Cover (5 pts) on 2 of 56 guns.<br>Burst Mode (10 pts) on 2 of 56 guns. 1 recoil tier better.<br>Burst Training (15 pts) on 1 of 56 guns. |

### Recoil

control and recovery. Highest weights: recoil per shot, recoil recovery, ADS bloom, moving ADS spread. Spotting is not scored, so a suppressor's hide effect cannot beat recoil or hipfire on its own.

The on-site reason line is usually: less recoil · faster recoil recovery · tighter moving ADS.

| Slot | Why it is chosen |
| --- | --- |
| Optic | Variable Low on 39 of 56 guns. Its aim score at this range is 0.88. The optic changes the picture score only, not recoil or spread.<br>Standard Optic on 17 of 56 guns. Its aim score at this range is 0.58. The optic changes the picture score only, not recoil or spread. |
| Barrel | Extended (5 pts) on 43 of 56 guns. 1 velocity tier better.<br>Heavy (10 pts) on 7 of 56 guns. Less ADS bloom per shot.<br>Basic (10 pts) on 5 of 56 guns.<br>Suppressed (20 pts) on 1 of 56 guns. Spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that. |
| Muzzle | Compensated Brake (20 pts) on 49 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×.<br>Compensator (10 pts) on 3 of 56 guns. Recoil recovers at 1.2×.<br>Left empty on 2 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Hybrid Suppressor K (50 pts) on 1 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×; spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that.<br>Long Suppressor (25 pts) on 1 of 56 guns. Recoil recovers at 1.2×; 1 hipfire tier worse; spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that. |
| Grip | Classic Vertical (35 pts) on 46 of 56 guns. 5 recoil tiers better; 1 moving ADS tier worse.<br>Full Angled (5 pts) on 6 of 56 guns. 1 moving ADS tier worse.<br>6H64 Vertical (25 pts) on 3 of 56 guns. 4 recoil tiers better; 1 moving ADS tier worse.<br>Left empty on 1 of 56 guns. Nothing in this slot raised the score enough to spend the points. |
| Laser | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Light | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Mag | 30 Rnd (5 pts) on 22 of 56 guns. 30 rounds; round count is scored against ADS and reload shifts.<br>20 Rnd (5 pts) on 8 of 56 guns. 20 rounds; round count is scored against ADS and reload shifts.<br>10 Rnd (5 pts) on 5 of 56 guns. 10 rounds; round count is scored against ADS and reload shifts.<br>50 Rnd (5 pts) on 4 of 56 guns. 50 rounds; round count is scored against ADS and reload shifts.<br>100 Rnd (5 pts) on 3 of 56 guns. 100 rounds; round count is scored against ADS and reload shifts.<br>5 Rnd (5 pts) on 3 of 56 guns. 5 rounds; round count is scored against ADS and reload shifts.<br>6 Rnd (5 pts) on 2 of 56 guns. 1 handling tier better; 6 rounds; round count is scored against ADS and reload shifts.<br>25 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 25 rounds; round count is scored against ADS and reload shifts.<br>17 Rnd (5 pts) on 1 of 56 guns. 17 rounds; round count is scored against ADS and reload shifts.<br>15 Rnd (5 pts) on 1 of 56 guns. 15 rounds; round count is scored against ADS and reload shifts.<br>20 Fast (5 pts) on 1 of 56 guns. 1 moving ADS tier better; 3 handling tiers better; 20 rounds; round count is scored against ADS and reload shifts.<br>36 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 36 rounds; round count is scored against ADS and reload shifts.<br>60 Rnd (5 pts) on 1 of 56 guns. 60 rounds; round count is scored against ADS and reload shifts.<br>45 Rnd (5 pts) on 1 of 56 guns. 45 rounds; round count is scored against ADS and reload shifts.<br>8 Rnd (5 pts) on 1 of 56 guns. 8 rounds; round count is scored against ADS and reload shifts.<br>14 Rnd (5 pts) on 1 of 56 guns. 14 rounds; round count is scored against ADS and reload shifts. |
| Ammo | FMJ on 20 of 56 guns. Default ballistics, kept when a special round does not earn its point cost.<br>Polymer Case on 17 of 56 guns. 1 handling tier better.<br>Synthetic Tip on 14 of 56 guns. Raises the headshot multiplier, so headshot time to kill drops when that breakpoint is scored.<br>#01 BUCK on 4 of 56 guns. Wins on these guns because its scored trade beats the other rounds.<br>Match Grade on 1 of 56 guns. Wins on these guns because its scored trade beats the other rounds. |
| Ergo | Left empty on 33 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Improved Mag Catch (5 pts) on 20 of 56 guns. Reload at 1.1×.<br>Rail Cover (5 pts) on 2 of 56 guns.<br>Burst Mode (10 pts) on 1 of 56 guns. 1 recoil tier better. |

### ADS

snap onto target. Highest weights: ADS speed, handling, moving ADS spread, recoil per shot. Spotting is not scored, so a suppressor's hide effect cannot beat recoil or hipfire on its own.

The on-site reason line is usually: less recoil · tighter moving ADS · snappier handling.

| Slot | Why it is chosen |
| --- | --- |
| Optic | Standard Optic on 56 of 56 guns. Its aim score at this range is 0.55. The optic changes the picture score only, not recoil or spread. |
| Barrel | Extended (5 pts) on 43 of 56 guns. 1 velocity tier better.<br>Heavy (10 pts) on 7 of 56 guns. Less ADS bloom per shot.<br>Basic (10 pts) on 5 of 56 guns.<br>Suppressed (20 pts) on 1 of 56 guns. Spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that. |
| Muzzle | Compensated Brake (20 pts) on 49 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×.<br>Compensator (10 pts) on 3 of 56 guns. Recoil recovers at 1.2×.<br>Left empty on 2 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Hybrid Suppressor K (50 pts) on 1 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×; spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that.<br>Long Suppressor (25 pts) on 1 of 56 guns. Recoil recovers at 1.2×; 1 hipfire tier worse; spotted at 0 m in the world and 21 m on the minimap; hides the shot, but this build does not score that. |
| Grip | Classic Vertical (35 pts) on 45 of 56 guns. 5 recoil tiers better; 1 moving ADS tier worse.<br>Full Angled (5 pts) on 6 of 56 guns. 1 moving ADS tier worse.<br>6H64 Vertical (25 pts) on 3 of 56 guns. 4 recoil tiers better; 1 moving ADS tier worse.<br>Ribbed Vertical (20 pts) on 1 of 56 guns. 3 recoil tiers better; 1 moving ADS tier worse.<br>Left empty on 1 of 56 guns. Nothing in this slot raised the score enough to spend the points. |
| Laser | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Light | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Mag | 30 Rnd (5 pts) on 15 of 56 guns. 30 rounds; round count is scored against ADS and reload shifts.<br>20 Rnd (5 pts) on 11 of 56 guns. 20 rounds; round count is scored against ADS and reload shifts.<br>10 Rnd (5 pts) on 7 of 56 guns. 1 moving ADS tier better; 2 handling tiers better; 10 rounds; round count is scored against ADS and reload shifts.<br>50 Rnd (5 pts) on 6 of 56 guns. 50 rounds; round count is scored against ADS and reload shifts.<br>5 Rnd (5 pts) on 3 of 56 guns. 5 rounds; round count is scored against ADS and reload shifts.<br>20 Fast (5 pts) on 2 of 56 guns. 1 moving ADS tier better; 3 handling tiers better; 20 rounds; round count is scored against ADS and reload shifts.<br>100 Rnd (5 pts) on 2 of 56 guns. 100 rounds; round count is scored against ADS and reload shifts.<br>36 Rnd (5 pts) on 2 of 56 guns. 2 handling tiers better; 36 rounds; round count is scored against ADS and reload shifts.<br>6 Rnd (5 pts) on 2 of 56 guns. 1 handling tier better; 6 rounds; round count is scored against ADS and reload shifts.<br>10 Fast (5 pts) on 1 of 56 guns. 1 moving ADS tier better; 3 handling tiers better; 10 rounds; round count is scored against ADS and reload shifts.<br>25 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 25 rounds; round count is scored against ADS and reload shifts.<br>17 Rnd (5 pts) on 1 of 56 guns. 17 rounds; round count is scored against ADS and reload shifts.<br>15 Rnd (5 pts) on 1 of 56 guns. 15 rounds; round count is scored against ADS and reload shifts.<br>8 Rnd (5 pts) on 1 of 56 guns. 8 rounds; round count is scored against ADS and reload shifts.<br>14 Rnd (5 pts) on 1 of 56 guns. 14 rounds; round count is scored against ADS and reload shifts. |
| Ammo | Polymer Case on 24 of 56 guns. 1 handling tier better.<br>FMJ on 18 of 56 guns. Default ballistics, kept when a special round does not earn its point cost.<br>Synthetic Tip on 9 of 56 guns. Raises the headshot multiplier, so headshot time to kill drops when that breakpoint is scored.<br>#01 BUCK on 4 of 56 guns. Wins on these guns because its scored trade beats the other rounds.<br>Match Grade on 1 of 56 guns. Wins on these guns because its scored trade beats the other rounds. |
| Ergo | Left empty on 33 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Improved Mag Catch (5 pts) on 20 of 56 guns. Reload at 1.1×.<br>Rail Cover (5 pts) on 2 of 56 guns.<br>Burst Mode (10 pts) on 1 of 56 guns. 1 recoil tier better. |

### Close stealth

0–20 m, spotting scored. Highest weights: hipfire spread, ADS speed, headshot time to kill, full-auto conversion. Spotting is scored: world flash starts at 54 m and the minimap ping at 150 m, each multiplied by the muzzle, barrel, and ammo. A suppressor is 0 m in the world and 21 m on the minimap.

The on-site reason line is usually: harder to spot · clearer optic picture · better hipfire.

| Slot | Why it is chosen |
| --- | --- |
| Optic | Standard Optic on 56 of 56 guns. Its aim score at this range is 0.55. The optic changes the picture score only, not recoil or spread. |
| Barrel | Short (15 pts) on 28 of 56 guns. 1 hipfire tier better; 1 velocity tier worse.<br>Extended (5 pts) on 19 of 56 guns. 1 velocity tier better.<br>Basic (10 pts) on 4 of 56 guns.<br>Heavy (10 pts) on 4 of 56 guns. Less ADS bloom per shot.<br>Suppressed (30 pts) on 1 of 56 guns. Spotted at 0 m in the world and 9 m on the minimap. |
| Muzzle | Hybrid Suppressor K (50 pts) on 38 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×; spotted at 0 m in the world and 21 m on the minimap.<br>CQB Suppressor (30 pts) on 16 of 56 guns. Spotted at 0 m in the world and 21 m on the minimap.<br>Flash Hider (10 pts) on 1 of 56 guns. Spotted at 0 m in the world and 150 m on the minimap.<br>Left empty on 1 of 56 guns. Nothing in this slot raised the score enough to spend the points. |
| Grip | Folding Vertical (10 pts) on 26 of 56 guns. 2 recoil tiers better; 1 moving ADS tier worse.<br>Classic Vertical (35 pts) on 8 of 56 guns. 5 recoil tiers better; 1 moving ADS tier worse.<br>6H64 Vertical (25 pts) on 8 of 56 guns. 4 recoil tiers better; 1 moving ADS tier worse.<br>Full Angled (5 pts) on 6 of 56 guns. 1 moving ADS tier worse.<br>Ribbed Vertical (20 pts) on 4 of 56 guns. 3 recoil tiers better; 1 moving ADS tier worse.<br>Left empty on 4 of 56 guns. Nothing in this slot raised the score enough to spend the points. |
| Laser | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Light | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Mag | 30 Rnd (5 pts) on 22 of 56 guns. 30 rounds; round count is scored against ADS and reload shifts.<br>20 Rnd (5 pts) on 7 of 56 guns. 20 rounds; round count is scored against ADS and reload shifts.<br>10 Rnd (5 pts) on 6 of 56 guns. 10 rounds; round count is scored against ADS and reload shifts.<br>50 Rnd (5 pts) on 3 of 56 guns. 50 rounds; round count is scored against ADS and reload shifts.<br>100 Rnd (5 pts) on 3 of 56 guns. 100 rounds; round count is scored against ADS and reload shifts.<br>8 Rnd (25 pts) on 2 of 56 guns. 1 handling tier worse; 8 rounds; round count is scored against ADS and reload shifts.<br>7 Rnd (15 pts) on 2 of 56 guns. 1 handling tier worse; 7 rounds; round count is scored against ADS and reload shifts.<br>6 Rnd (5 pts) on 2 of 56 guns. 1 handling tier better; 6 rounds; round count is scored against ADS and reload shifts.<br>25 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 25 rounds; round count is scored against ADS and reload shifts.<br>17 Rnd (5 pts) on 1 of 56 guns. 17 rounds; round count is scored against ADS and reload shifts.<br>15 Rnd (5 pts) on 1 of 56 guns. 15 rounds; round count is scored against ADS and reload shifts.<br>20 Fast (5 pts) on 1 of 56 guns. 1 moving ADS tier better; 3 handling tiers better; 20 rounds; round count is scored against ADS and reload shifts.<br>36 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 36 rounds; round count is scored against ADS and reload shifts.<br>60 Rnd (5 pts) on 1 of 56 guns. 60 rounds; round count is scored against ADS and reload shifts.<br>75 Rnd (10 pts) on 1 of 56 guns. 1 moving ADS tier better; 75 rounds; round count is scored against ADS and reload shifts.<br>45 Rnd (5 pts) on 1 of 56 guns. 45 rounds; round count is scored against ADS and reload shifts.<br>14 Rnd (5 pts) on 1 of 56 guns. 14 rounds; round count is scored against ADS and reload shifts. |
| Ammo | Polymer Case on 23 of 56 guns. 1 handling tier better.<br>FMJ on 14 of 56 guns. Default ballistics, kept when a special round does not earn its point cost.<br>Synthetic Tip on 10 of 56 guns. Raises the headshot multiplier, so headshot time to kill drops when that breakpoint is scored.<br>Subsonic on 4 of 56 guns. Slower bullet, harder to spot when stealth is scored; spotted at 27 m in the world and 64.3 m on the minimap.<br>#01 BUCK on 4 of 56 guns. Wins on these guns because its scored trade beats the other rounds.<br>Match Grade on 1 of 56 guns. Wins on these guns because its scored trade beats the other rounds. |
| Ergo | Left empty on 44 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Improved Mag Catch (5 pts) on 11 of 56 guns. Reload at 1.1×.<br>Burst Mode (10 pts) on 1 of 56 guns. 1 recoil tier better. |

### Medium stealth

20–50 m, spotting scored. Highest weights: recoil per shot, ADS bloom, optic picture, headshot time to kill. Spotting is scored: world flash starts at 54 m and the minimap ping at 150 m, each multiplied by the muzzle, barrel, and ammo. A suppressor is 0 m in the world and 21 m on the minimap.

The on-site reason line is usually: clearer optic picture · harder to spot · less recoil.

| Slot | Why it is chosen |
| --- | --- |
| Optic | Variable Low on 56 of 56 guns. Its aim score at this range is 0.88. The optic changes the picture score only, not recoil or spread. |
| Barrel | Extended (5 pts) on 43 of 56 guns. 1 velocity tier better.<br>Heavy Extended (10 pts) on 9 of 56 guns. 1 velocity tier better; less ADS bloom per shot.<br>Basic (10 pts) on 3 of 56 guns.<br>Suppressed (30 pts) on 1 of 56 guns. Spotted at 0 m in the world and 9 m on the minimap. |
| Muzzle | Hybrid Suppressor K (50 pts) on 32 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×; spotted at 0 m in the world and 21 m on the minimap.<br>Long Suppressor (25 pts) on 11 of 56 guns. Recoil recovers at 1.2×; 1 hipfire tier worse; spotted at 0 m in the world and 21 m on the minimap.<br>Hybrid Suppressor L (30 pts) on 7 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×; 1 hipfire tier worse; spotted at 0 m in the world and 21 m on the minimap.<br>Lightened Suppressor (30 pts) on 3 of 56 guns. Recoil recovers at 1.2×; 1 hipfire tier worse; spotted at 0 m in the world and 21 m on the minimap.<br>CQB Suppressor (30 pts) on 2 of 56 guns. Spotted at 0 m in the world and 21 m on the minimap.<br>Left empty on 1 of 56 guns. Nothing in this slot raised the score enough to spend the points. |
| Grip | Folding Vertical (10 pts) on 27 of 56 guns. 2 recoil tiers better; 1 moving ADS tier worse.<br>6H64 Vertical (25 pts) on 9 of 56 guns. 4 recoil tiers better; 1 moving ADS tier worse.<br>Left empty on 6 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Full Angled (5 pts) on 6 of 56 guns. 1 moving ADS tier worse.<br>Classic Vertical (35 pts) on 5 of 56 guns. 5 recoil tiers better; 1 moving ADS tier worse.<br>Ribbed Vertical (20 pts) on 3 of 56 guns. 3 recoil tiers better; 1 moving ADS tier worse. |
| Laser | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Light | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Mag | 30 Rnd (5 pts) on 23 of 56 guns. 30 rounds; round count is scored against ADS and reload shifts.<br>20 Rnd (5 pts) on 7 of 56 guns. 20 rounds; round count is scored against ADS and reload shifts.<br>10 Rnd (5 pts) on 6 of 56 guns. 10 rounds; round count is scored against ADS and reload shifts.<br>50 Rnd (5 pts) on 4 of 56 guns. 50 rounds; round count is scored against ADS and reload shifts.<br>100 Rnd (5 pts) on 3 of 56 guns. 100 rounds; round count is scored against ADS and reload shifts.<br>7 Rnd (15 pts) on 2 of 56 guns. 1 handling tier worse; 7 rounds; round count is scored against ADS and reload shifts.<br>6 Rnd (5 pts) on 2 of 56 guns. 1 handling tier better; 6 rounds; round count is scored against ADS and reload shifts.<br>25 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 25 rounds; round count is scored against ADS and reload shifts.<br>17 Rnd (5 pts) on 1 of 56 guns. 17 rounds; round count is scored against ADS and reload shifts.<br>15 Rnd (5 pts) on 1 of 56 guns. 15 rounds; round count is scored against ADS and reload shifts.<br>36 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 36 rounds; round count is scored against ADS and reload shifts.<br>60 Rnd (5 pts) on 1 of 56 guns. 60 rounds; round count is scored against ADS and reload shifts.<br>45 Rnd (5 pts) on 1 of 56 guns. 45 rounds; round count is scored against ADS and reload shifts.<br>5 Rnd (5 pts) on 1 of 56 guns. 5 rounds; round count is scored against ADS and reload shifts.<br>8 Rnd (5 pts) on 1 of 56 guns. 8 rounds; round count is scored against ADS and reload shifts.<br>14 Rnd (5 pts) on 1 of 56 guns. 14 rounds; round count is scored against ADS and reload shifts. |
| Ammo | FMJ on 18 of 56 guns. Default ballistics, kept when a special round does not earn its point cost.<br>Polymer Case on 17 of 56 guns. 1 handling tier better.<br>Synthetic Tip on 16 of 56 guns. Raises the headshot multiplier, so headshot time to kill drops when that breakpoint is scored.<br>#01 BUCK on 4 of 56 guns. Wins on these guns because its scored trade beats the other rounds.<br>Match Grade on 1 of 56 guns. Wins on these guns because its scored trade beats the other rounds. |
| Ergo | Left empty on 46 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Improved Mag Catch (5 pts) on 10 of 56 guns. Reload at 1.1×. |

### Long stealth

50–100 m+, spotting scored. Highest weights: optic picture, recoil per shot, bullet velocity, ADS bloom. Spotting is scored: world flash starts at 54 m and the minimap ping at 150 m, each multiplied by the muzzle, barrel, and ammo. A suppressor is 0 m in the world and 21 m on the minimap.

The on-site reason line is usually: clearer optic picture · harder to spot · less recoil.

| Slot | Why it is chosen |
| --- | --- |
| Optic | Variable High on 56 of 56 guns. Its aim score at this range is 0.96. The optic changes the picture score only, not recoil or spread. |
| Barrel | Extended (5 pts) on 43 of 56 guns. 1 velocity tier better.<br>Heavy Extended (10 pts) on 9 of 56 guns. 1 velocity tier better; less ADS bloom per shot.<br>Basic (10 pts) on 3 of 56 guns.<br>Suppressed (30 pts) on 1 of 56 guns. Spotted at 0 m in the world and 9 m on the minimap. |
| Muzzle | Hybrid Suppressor L (30 pts) on 39 of 56 guns. 1 recoil tier better; recoil recovers at 1.2×; 1 hipfire tier worse; spotted at 0 m in the world and 21 m on the minimap.<br>Long Suppressor (25 pts) on 11 of 56 guns. Recoil recovers at 1.2×; 1 hipfire tier worse; spotted at 0 m in the world and 21 m on the minimap.<br>Lightened Suppressor (30 pts) on 3 of 56 guns. Recoil recovers at 1.2×; 1 hipfire tier worse; spotted at 0 m in the world and 21 m on the minimap.<br>CQB Suppressor (30 pts) on 2 of 56 guns. Spotted at 0 m in the world and 21 m on the minimap.<br>Left empty on 1 of 56 guns. Nothing in this slot raised the score enough to spend the points. |
| Grip | 6H64 Vertical (25 pts) on 30 of 56 guns. 4 recoil tiers better; 1 moving ADS tier worse.<br>Folding Vertical (10 pts) on 13 of 56 guns. 2 recoil tiers better; 1 moving ADS tier worse.<br>Full Angled (5 pts) on 6 of 56 guns. 1 moving ADS tier worse.<br>Classic Vertical (35 pts) on 4 of 56 guns. 5 recoil tiers better; 1 moving ADS tier worse.<br>Left empty on 2 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Ribbed Vertical (20 pts) on 1 of 56 guns. 3 recoil tiers better; 1 moving ADS tier worse. |
| Laser | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Light | Left empty on 56 of 56 guns. Many guns share one underbarrel slot, and a grip's recoil or ADS effect beats spending points on a laser or light. |
| Mag | 30 Rnd (5 pts) on 23 of 56 guns. 30 rounds; round count is scored against ADS and reload shifts.<br>20 Rnd (5 pts) on 7 of 56 guns. 20 rounds; round count is scored against ADS and reload shifts.<br>10 Rnd (5 pts) on 5 of 56 guns. 10 rounds; round count is scored against ADS and reload shifts.<br>50 Rnd (5 pts) on 4 of 56 guns. 50 rounds; round count is scored against ADS and reload shifts.<br>100 Rnd (5 pts) on 3 of 56 guns. 100 rounds; round count is scored against ADS and reload shifts.<br>15 Rnd (5 pts) on 2 of 56 guns. 15 rounds; round count is scored against ADS and reload shifts.<br>8 Rnd (25 pts) on 2 of 56 guns. 1 handling tier worse; 8 rounds; round count is scored against ADS and reload shifts.<br>7 Rnd (15 pts) on 2 of 56 guns. 1 handling tier worse; 7 rounds; round count is scored against ADS and reload shifts.<br>6 Rnd (5 pts) on 2 of 56 guns. 1 handling tier better; 6 rounds; round count is scored against ADS and reload shifts.<br>25 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 25 rounds; round count is scored against ADS and reload shifts.<br>17 Rnd (5 pts) on 1 of 56 guns. 17 rounds; round count is scored against ADS and reload shifts.<br>36 Rnd (5 pts) on 1 of 56 guns. 2 handling tiers better; 36 rounds; round count is scored against ADS and reload shifts.<br>60 Rnd (5 pts) on 1 of 56 guns. 60 rounds; round count is scored against ADS and reload shifts.<br>45 Rnd (5 pts) on 1 of 56 guns. 45 rounds; round count is scored against ADS and reload shifts.<br>14 Rnd (5 pts) on 1 of 56 guns. 14 rounds; round count is scored against ADS and reload shifts. |
| Ammo | FMJ on 20 of 56 guns. Default ballistics, kept when a special round does not earn its point cost.<br>Polymer Case on 16 of 56 guns. 1 handling tier better.<br>Synthetic Tip on 15 of 56 guns. Raises the headshot multiplier, so headshot time to kill drops when that breakpoint is scored.<br>#01 BUCK on 4 of 56 guns. Wins on these guns because its scored trade beats the other rounds.<br>Match Grade on 1 of 56 guns. Wins on these guns because its scored trade beats the other rounds. |
| Ergo | Left empty on 43 of 56 guns. Nothing in this slot raised the score enough to spend the points.<br>Improved Mag Catch (5 pts) on 12 of 56 guns. Reload at 1.1×.<br>Burst Mode (10 pts) on 1 of 56 guns. |

### Close thermal

No primary has a named thermal optic unlocked at gun level 50 (GRIM, PAS-35, TS-HD, or TH-RDS). This build shows on the site once those optics are in the data.

### Medium thermal

No primary has a named thermal optic unlocked at gun level 50 (GRIM, PAS-35, TS-HD, or TH-RDS). This build shows on the site once those optics are in the data.

### Long thermal

No primary has a named thermal optic unlocked at gun level 50 (GRIM, PAS-35, TS-HD, or TH-RDS). This build shows on the site once those optics are in the data.
<!-- loadout-reasons:end -->

## Keep the local site online

The **local** static server and healthcheck run as **user systemd** units so they keep working after SSH disconnect (user lingering is already enabled for `ben`). That keeps this host available for the weekly data refresh → GitHub sync. GitHub Pages itself is not health-checked.

```bash
cd "/home/ben/BF6 Visualisation Stats"
./install-refresh-timer.sh
```

That installs:

- `bf6-loadouts-http.service` — serves the site on **5175**, restarts on crash
- `bf6-loadouts-http-health.timer` — every 2 minutes checks local `/`, `index.html`, JS, and CSS; restarts the local server if anything fails
- `bf6-loadouts-refresh.timer` — weekly data refresh + push to GitHub

```bash
systemctl --user status bf6-loadouts-http.service
systemctl --user start bf6-loadouts-http-health.service   # run one health check now
journalctl --user -u bf6-loadouts-http.service -n 50
journalctl --user -u bf6-loadouts-http-health.service -n 50
```

Do **not** also run a manual `python3 -m http.server 5175` — it will conflict on the port.

## Open in Chrome

You can double-click `index.html` — layouts work offline via embedded data (weapon images still need network).

Or use the systemd server on **5175**:

- http://localhost:5175
- http://192.168.1.45:5175 (LAN)

For a one-off manual server (only if the systemd unit is stopped):

```bash
cd "/home/ben/BF6 Visualisation Stats"
python3 -m http.server 5175 --bind 127.0.0.1
```

Do **not** enable CSP `upgrade-insecure-requests` while serving plain HTTP, or the browser will block the local scripts.

Port map under `/home/ben`: Weather **8080**, switch-database **8081**, FeedBridge **8085**, NRL Stats **8003**, Petrol Prices **8004**, this app **5175**.

## How data stays up to date

Layouts are computed in the browser from **local** `js/embedded-data.js` (no GitHub fetch on page load).

Weapon pictures come from **battlefield6.gg** and, for guns they don’t host, **battlefieldmeta.gg**.

Upstream weapon/attachment JSON comes from [raymdl/BF6-Weapon-Analyzer](https://github.com/raymdl/BF6-Weapon-Analyzer). Unlock levels come from [battlefieldmeta.gg](https://app.battlefieldmeta.gg/). A **weekly** systemd timer checks for updates (Monday 03:15). The refresh script:

- only fetches from allowlisted hosts (redirects elsewhere are blocked)
- validates JSON shape / numeric `pts` before writing
- fetches unlock levels into `data/unlocks.json` and embeds them with the rest
- writes files atomically
- uses **ETags / hashes** so unchanged files are not re-downloaded or re-embedded
- **commits and pushes** changed data to this GitHub repo so GitHub Pages stays current
- rewrites the loadout-reason tables in this README from the current optimizer, and publishes that too when they change

If a browser refresh feels slow, that is the local layout optimizer — not a network download.

### Install the weekly check (once)

```bash
cd "/home/ben/BF6 Visualisation Stats"
./install-refresh-timer.sh
```

Re-run the installer after pulling service-file hardening changes so `~/.config/systemd/user/` stays in sync.

### Manual refresh

```bash
"/home/ben/BF6 Visualisation Stats/scripts/refresh-data.sh"
# or:
systemctl --user start bf6-loadouts-refresh.service
```

If nothing changed upstream, the data step exits with `refresh ok (noop)`. The loadout-reason rewrite still runs, and is published only if that section changed.

Logs: `journalctl --user -u bf6-loadouts-refresh.service -n 50`

## Security notes

- Page CSP blocks unexpected scripts/connections; favourites and weapon ids are validated before render.
- Browser never talks to GitHub for data — only the refresh timer/script does.
- Legacy `scripts/*.mjs` paths are unused; prefer `scripts/refresh_data.py`.
