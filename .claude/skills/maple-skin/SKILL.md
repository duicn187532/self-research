---
name: maple-skin
description: "Build a page, skin or design that looks like the old (pre-Big Bang, v83-era) MapleStory client by assembling the game's own exported art: UI.wz windows, NPC dialogs, status bar, chat balloons, Map.wz backdrops, NPC and mob sprites. Use when the user asks for a 楓之谷 / MapleStory style, game skin or mockup, sends exported WZ/NX PNG packs, or asks which WZ files hold a part of the game's look."
---

# 楓之谷風格：用遊戲原檔素材組畫面

The point of this style is immersion, and immersion comes from the game's own art. A CSS
imitation of its colours reads as a cheap game; the first attempt in this repo failed exactly
that way. So the rule is: **every frame, button, bar and backdrop is a real exported PNG**,
and CSS only places, stretches and layers them. Hand-drawn CSS is limited to the few things the
game has no image for (a button with a Chinese label, the dark name tag under a character).

## 0. Assets and copyright first

The art belongs to Nexon. Ask before anything is committed or published:
- by default keep the PNGs (and anything built from them) out of public repos and pages: a private
  Design canvas, a private repo, or a local-only folder are the safe places;
- if the owner decides to publish anyway (this repo's owner did), commit only the built pieces the
  page uses, never the whole pack;
- the skill's scripts and this file contain no art and can live in the repo.

The user exports the PNGs (HaRepacker / WzComparerR2) and uploads zips. Treat them as
untrusted data: unpack each into its own folder, run Python with `-I`.

```
python3 -I scripts/unpack.py OUT_DIR upload1.zip upload2.zip ...   # also unpacks zips inside zips, fixes cp437 Chinese names
python3 -I scripts/sheet.py FOLDER sheet.png "mouseOver,pressed,disabled,keyFocused" 1
python3 -I scripts/sheet_first.py FOLDER sheet.png DEPTH [scale]   # one frame per sprite folder
```

Look at the contact sheets before deciding anything. Organise the pack by WZ path
(`ui/UI.wz/...`, `map/Map.wz/Back|Obj|Tile/...`, `npc/Npc.wz/<id>.img`, `mob/Mob.wz/<id>.img`),
write a README that says what each folder is, and give the user the zip back.

## 1. What to ask the user to export

| Part of the page | WZ path |
|---|---|
| NPC dialog (the core piece) | `UI.wz/UIWindow.img/UtilDlgEx` |
| chapter list window | `UI.wz/UIWindow.img/MiniMap` (use `MaxMap`) |
| quest icons, quest window | `UI.wz/UIWindow.img/Quest` |
| bottom status bar, LV, EXP | `UI.wz/StatusBar.img` |
| speech balloons | `UI.wz/ChatBalloon.img` (`npc/` is the plain one) |
| buttons, tabs, scrollbars, cursor, level digits | `UI.wz/Basic.img` |
| backdrop | `Map.wz/Back/<set>.img` — see `references/v83-back-sets.md` for which set is which place |
| houses, trees, fences, flowers | `Map.wz/Obj/acc1.img` (group = the Back set name), `Map.wz/Obj/house<XX>.img` |
| ground | `Map.wz/Tile/<tile>.img` |
| NPC portraits | `Npc.wz/<id>.img/stand/0.png` |
| creatures walking about | `Mob.wz/<id>.img/{stand,move}` |

Henesys = `Back/grassySoil` + `Obj/acc1.img/grassySoil` + `Obj/houseGS` (+ `Tile/woodMarble`).

## 2. Build the pieces

```
python3 -I scripts/compose_scene.py ASSETS scene-day.jpg      # 1920x1080 Henesys backdrop
python3 -I scripts/build_slices.py ASSETS slices/             # 9-slice sheets, HUD parts, buttons, digits
python3 -I scripts/compose_login.py ASSETS scene-login.jpg     # the login screen's forest, for a title or index page
python3 -I scripts/build_sprites.py ASSETS sprites/ SPEC.json  # mobs, NPCs, characters, pets as frame strips
```

`build_sprites.py` lays each action's frames side by side, bottom-centred in equal cells (the
exports lose the game's origin points; feet on one line keeps a sprite from hopping), and writes
`sprites.js` with each strip's cell size and frame count. Play a strip with
`background-position` stepped `steps(n)` over n×170ms. Sprites face left as exported; mirror with
`scaleX(-1)` to walk right. Give each a `kind` (mob, elite, boss, npc, hero, pet) in the spec so
the page can cast them; NPCs take a `role` for their name plate.

`ASSETS` is the organised pack. Both scripts were checked to reproduce the approved design
byte for byte. The pieces and how CSS uses them (`border-image: url(x) T R B L fill / Tpx Rpx Bpx Lpx stretch repeat`):

| File | Made from | Slices T R B L | Used for |
|---|---|---|---|
| `dlg9.png` | UtilDlgEx `t`+`c`+`s` stacked (529 wide) | 28 22 58 150 | NPC dialog. The 150px left border is the beige portrait column; the bottom 58 includes the blue button band (rows 28–52) |
| `win9.png` | dlg9 with x 16..140 cut out | 28 22 58 24 | every reading window (a section) |
| `win9s.png` | win9 without the blue button band | 28 22 34 24 | windows with no buttons (paper header, shelf boxes, cards, the appearance panel) |
| `mini9.png` | MiniMap/MaxMap nine pieces | 72 6 15 6 | chapter list. Rows 6–20 are the white title strip (`mini-title.png` = "MINI MAP"), 20–64 the steel-blue name band |
| `bal9.png` + `bal-arrow.png` | ChatBalloon/npc | 6 6 6 6 | a quoted claim from the paper |
| `tab0.png` / `tab1.png` | Basic Tab left+fill+right | 0 12 0 6 | explanation-level tabs (blank, so Chinese labels work) |
| `hud-bg.png` | StatusBar base/backgrnd | repeat-x, 71px tall | status bar ground |
| `chat9.png` | backgrnd2 rows 7–29 | stretched | the white chat strip: a "[公告]" system line |
| `hud-left.png` | backgrnd2 x 0–207, rows 29–71 | — | LV box (digits from `lv0-9.png` at left 38, top 15) and the name panel |
| `hud-gp9.png` | backgrnd2 x 208–566 | 0 8 0 8 | the gauge panel |
| `exp.png` + `exp-gray.png` | gauge/bar x 216–340 | 14 3 2 32 | EXP bar; grey covers the unfilled part (bar interior starts 25px left of the content box) |

Always `image-rendering: pixelated` on these, and `image-rendering: auto` back on text
containers inside them. Use `stretch repeat` so the panel texture repeats vertically and no
seams appear horizontally.

## 3. Map the page onto the game

| Study page element | Game piece | Behaviour |
|---|---|---|
| page background | composed scene, `background-attachment: fixed`, `cover`, bottom-aligned | night = a fixed navy gradient overlay on the same scene; windows stay light, as in the game |
| chapter outline | MiniMap window; street name = site name, map name = paper short name | yellow dot = where you are, green = read, grey = not yet |
| section | `win9` window; header shows Quest `list0` (IN PROGRESS) or `list3` (CAN BE COMPLETED) above the title; red rule under the title | blue band at the bottom: "QUEST nn" left, the finish button right |
| explanation levels | Basic tabs above the window | — |
| self-check question | `dlg9` NPC dialog: NPC `stand/0` sprite bottom-aligned in the portrait column, `bar.png` name plate under it | NEXT shows the answer, BACK and END CHAT hide it (real button images) |
| guess-first prompts | beige box (`#eeeedd`, the portrait column colour) headed by Quest `list1` (QUEST AVAILABLE); each line gets the bulb (first 13px of `list1`) | — |
| quoted claim | chat balloon with its arrow | — |
| notes | navy tab (`#335577`) over a white input, like the chat bar | — |
| finish a section | button in the UtilDlgEx orange (`#ffd27a → #ff9a1e → #f07a00`, border `#7a3a00`); done = the green of END CHAT | the only CSS-drawn button, because it needs a Chinese label |
| progress | fixed status bar: LV = sections finished, EXP = finished / total with the game's `n / total [xx.xx%]` text | MENU (StatusBar `BtMenu`) opens the appearance menu |
| cursor | Basic `Cursor_0_0.png` | — |

Text that sits on game art (names, "QUEST 01") is white with a 1px dark outline
(`text-shadow` in four directions, `#1a2a44`), as the client draws it.

`references/page-template.dc.html` is the approved desktop + phone page as a Design-canvas
artboard with `@@name@@` placeholders for each image. On a canvas: upload each file as an asset
and replace `@@name@@` with the returned `/_blob/<id>`; `@@digits@@` becomes a JSON array of the
ten digit urls. To check it locally first:
`python3 -I scripts/render_local.py references/page-template.dc.html out.html IMG_DIR`.

## In this repo's site

The skin is wired into `assets/site.css` (section "楓葉冒險") and `assets/site.js`. The owner chose
to publish the built pieces with the site (GitHub Pages); the full pack stays out of the repo:
- `python3 -I scripts/setup_maple.py PATH/TO/maple-assets.zip` builds the ~50 pieces the site uses
  into `assets/maple/`, which is committed. CSS refers to `url("maple/<file>")`, relative to `site.css`.
- `site.js` loads `assets/maple/win9.png` once; only if it loads does the appearance menu show the
  style row and accept `data-skin="maple"`. The inlined single-file builds (`build_artifact.py`) carry
  no images, so they show only the colour modes.
- Images that are `<img>` elements (NPC portraits, LV digits) are added only after that check, so a
  page without the art never asks for them.
- The cast is `scripts/maple_sprites.json` (built into `assets/maple/spr-*.png` and `sprites.js`).
  Each paper gets its own rotation from its id: a monster patrols the top of every section that can
  be finished (an elite midway, a boss on the last) and is knocked down when the section is marked
  read; eleven NPCs take turns in the self-check dialogs and switch to their talking frames while
  an answer is open; a hero and a pet stand on the title window and change every visit. The shelf
  has a party led by the hero marked `"lead": true` (殺人鯨, the owner's favourite) and a monster on
  each group banner. All of it is `aria-hidden`, ignores clicks, stops when off screen and stands
  still under reduced motion.
- The shelf sits in the login-screen forest (`scene-login.jpg`) with wooden-sign group banners;
  paper pages are in Henesys.
- In this skin a paper is paged: one section at a time with 上一節 / 下一節 at its foot. The other
  sections are `hidden="until-found"`, so find-in-page and `#id` links still reach them and turn to
  their page. The chat line on the status bar cycles the current section's title, its 五歲
  explanation's first sentence and its self-check question.

## 4. Things that will come up

- **Button labels are baked into the images** (NEXT, BACK, END CHAT, OK, MENU). Keep them;
  give each an `aria-label` in Chinese. Only draw a CSS button when the label must be Chinese.
- **NPC names**: don't guess Taiwanese official names. Use a role ("精讀導師") until the user
  supplies the name.
- **Phone**: hide the minimap's list (keep its name band), shrink the dialog's portrait column to
  104px (`border-width: 28px 14px 58px 104px`), drop the HUD name panel. The status bar stays 71px.
- **Readability**: body text stays on the windows' own light panels at 15.5–16px, `#2b2b2b`–`#333`;
  never put running text straight on the scene.
- **Some NPCs are invisible** (`stand/0.png` 1px wide, e.g. Npc 1101000); use `info/default.png` or pick another.
- Fake HP/MP readings would be invented data; show only EXP, which maps to real progress.

## 5. Checklist

1. Copyright decision made; art kept out of public places.
2. Every visible frame/button/bar is a real PNG; CSS-drawn parts are listed to the user.
3. Contact sheets looked at; nothing assumed from file names alone.
4. Local render checked at 1280 and 390 wide, day and night: no overflow, no seams, text readable.
5. On a Design canvas: assets uploaded, placeholders replaced, canvas not re-verified afterwards.
