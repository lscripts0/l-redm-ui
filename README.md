# l-redm-ui

UI kit for RedM, styled to fit RDR2: arrow key menus, npc conversations, radial menu, text ui, hold text ui, notifications, announce banner, fullscreen warn, alert/input/form dialogs, pin pad, key confirmations, progress bar and circle, skillcheck minigames, countdown, objectives tracker, a grouped key legend and a full chat replacement. Built with React, TypeScript and MUI.

## Install

1. Drop the resource into your resources folder.
2. Add `ensure l-redm-ui` to your server.cfg.
3. Optional: tweak `config.lua` (language, text ui position, sounds, visible rows).

Built in texts are localized through `locales/` (`en` and `de` ship with the resource, set via `Config.Locale`, add your own file for other languages). On start the server checks GitHub for a newer release and prints the result to the console (`Config.VersionCheck`).

## Theming

All colors live in `html/theme.css` as css variables: text, panel background, borders, selection highlight, glow, the confirm green and the cancel red. Edit the values there and restart the resource, no rebuild needed. The file explains every variable.

## Menu

```lua
exports['l-redm-ui']:OpenMenu({
    title = 'General Store',
    subtitle = 'Valentine',
    position = 'right',         -- 'left' | 'right'
    items = {
        { id = 'buy', label = 'Buy beans', icon = 'fa-solid fa-basket-shopping', rightLabel = '$0.75', description = 'A can of beans.',
            onSelect = function(item) print('bought beans') end },
        { id = 'ammo', label = 'Ammo', type = 'options', options = { 'Regular', 'Express' }, index = 1,
            onChange = function(item) print(item.options[item.index]) end },
        { id = 'amount', label = 'Amount', type = 'slider', min = 1, max = 10, step = 1, value = 1 },
        { id = 'wrap', label = 'Gift wrap', type = 'checkbox', checked = false },
        { id = 'more', label = 'More goods', arrow = true },
        { id = 'locked', label = 'Sold out', disabled = true }
    },
    onSelect = function(item) print(item.id) end,
    onChange = function(item) print(item.id, item.value, item.index, item.checked) end,
    onBack = function() end,    -- backspace, menu closes first; reopen a parent menu here
    onClose = function() end    -- escape or CloseMenu()
})
```

Every item can carry its own `onSelect` and `onChange`; when set they are called instead of the menu level ones, so you do not need an id switch in one big callback. The menu level `onSelect`/`onChange` still fire for items without their own.

Controls: arrow keys to navigate and change values, enter to select, backspace for back. Menus do not grab input, the player can keep moving while a menu is open.

Every item takes an optional `icon` with a Font Awesome class (free set is bundled). A bare name like `'star'` is treated as `fa-solid fa-star`.

Other exports:

```lua
exports['l-redm-ui']:CloseMenu()
exports['l-redm-ui']:IsMenuOpen()
```

## Conversation

An npc dialog panel at the bottom of the screen: npc name, spoken line and a list of answers. Arrow keys pick, enter selects, backspace or escape closes. Selecting closes the conversation; open the next one inside `onSelect` to build a dialog tree.

```lua
exports['l-redm-ui']:OpenConversation({
    name = 'Foreman Dawson',
    text = 'Looking for honest work?',
    choices = {
        { id = 'accept', label = 'Sign me up.',
            onSelect = function(choice) print('hired') end },
        { id = 'pay', label = 'How much does it pay?' },
        { id = 'leave', label = 'Not interested.' }
    },
    onSelect = function(choice) print(choice.id) end,
    onClose = function() end       -- backspace, escape or CloseConversation()
})

exports['l-redm-ui']:CloseConversation()
exports['l-redm-ui']:IsConversationOpen()
```

Like the menus, every choice can carry its own `onSelect`; the conversation level `onSelect` is the fallback for choices without one. Conversations do not grab input, the player keeps control.

## Radial Menu

A mouse driven wheel. The cursor is grabbed while it is open; click a slice to select. Right click, escape or a click on the center goes back one level, or closes the wheel at the top level.

```lua
exports['l-redm-ui']:OpenRadialMenu({
    items = {
        { id = 'greet', label = 'Greet', icon = 'handshake',
            onSelect = function(item) print('greeted') end },
        { id = 'rob', label = 'Rob', icon = 'sack-dollar' },
        { id = 'horse', label = 'Horse', icon = 'horse', items = {
            { id = 'feed', label = 'Feed', icon = 'wheat-awn' },
            { id = 'brush', label = 'Brush', icon = 'brush' }
        } }
    },
    onSelect = function(item) print(item.id) end,
    onClose = function() end
})

exports['l-redm-ui']:CloseRadialMenu()
exports['l-redm-ui']:IsRadialMenuOpen()
```

An item with its own `items` table opens that list as a sub wheel instead of selecting (marked with a small arrow next to the label, nest as deep as you want). Like in the menus, every item can carry its own `onSelect`; the top level `onSelect` is the fallback for items without one. Icons take Font Awesome classes like the menu items.

## Text UI

```lua
exports['l-redm-ui']:ShowTextUI('Open door', 'E')                 -- key badge is optional
exports['l-redm-ui']:ShowTextUI('Open door', 'E', 'top-center')   -- position override is optional
exports['l-redm-ui']:HideTextUI()
exports['l-redm-ui']:IsTextUIOpen()
```

The default position is set in `config.lua`. Valid positions: `top-left`, `top-center`, `top-right`, `left-center`, `right-center`, `bottom-left`, `bottom-center`, `bottom-right`.

## Hold Text UI

A prompt where the player must hold a key. You pass the label shown in the badge and the actual rdr3 control hash that gets polled; the badge fills up while holding.

```lua
exports['l-redm-ui']:ShowHoldTextUI('Hold to open the door', 'E', 0xCEFD9220, 1500, function()
    print('held long enough')                     -- ui hides itself before this fires
end)
exports['l-redm-ui']:ShowHoldTextUI('Hold', 'E', 0xCEFD9220)  -- duration falls back to config
exports['l-redm-ui']:HideHoldTextUI()
exports['l-redm-ui']:IsHoldTextUIOpen()
```

The sixth parameter overrides the position, like with `ShowTextUI`.

## Notify

```lua
exports['l-redm-ui']:Notify('Money received')                           -- type defaults to 'info'
exports['l-redm-ui']:Notify('Money received', 'success')                -- 'info' | 'success' | 'error' | 'support'
exports['l-redm-ui']:Notify('Money received', 'success', 6000)          -- duration in ms, defaults to config
exports['l-redm-ui']:Notify('Money received', 'success', 6000, 'Store') -- optional title above the message
```

Notifications stack and slide in on a painted panel, with an icon per type and a slim vertical bar next to the icon that drains with the remaining display time. A sound plays when they appear and another when they fade out (both set in `config.lua`, same for the announce banner). Stack position and default duration are set in `config.lua`.

## Announce

```lua
exports['l-redm-ui']:Announce('Valentine')
exports['l-redm-ui']:Announce('Valentine', 'A quiet little town')  -- subtitle optional
exports['l-redm-ui']:Announce('Valentine', nil, 8000)              -- duration in ms
```

A big centered panel at the top edge of the screen that fades in and out, for town arrivals, job starts and similar moments.

## Warn

```lua
exports['l-redm-ui']:Warn('You broke the rules.')                      -- title defaults to 'Warning'
exports['l-redm-ui']:Warn('You broke the rules.', 'Warning', 'Admin')  -- author is shown under the message
```

A fullscreen overlay the player has to dismiss by holding enter for `Config.Warn.holdSeconds`, with a progress bar. The hold hint text is set via `Config.Warn.holdLabel`.

## Alert, Input and Form

Centered dialogs with a dimmed backdrop. The player is locked while one is open; enter confirms, escape cancels. Each of them can be called two ways: with callbacks the call returns immediately, without callbacks it blocks your thread until the player is done and returns the result directly.

```lua
exports['l-redm-ui']:Alert({
    title = 'Delete horse',
    message = 'Are you sure?',
    submitLabel = 'Delete',                   -- optional, default 'Confirm'
    cancelLabel = 'Keep',                     -- optional, default 'Cancel'
    onConfirm = function() end,
    onCancel = function() end                 -- also fired on escape
})

local confirmed = exports['l-redm-ui']:Alert({  -- true | false
    title = 'Delete horse',
    message = 'Are you sure?'
})

exports['l-redm-ui']:Input({
    title = 'Horse name',
    label = 'Name',                           -- optional
    type = 'text',                            -- 'text' | 'number' | 'password' | 'textarea'
    placeholder = 'Enter a name',
    value = '',                               -- prefill
    required = true,                          -- blocks empty submit
    onSubmit = function(value) end,
    onCancel = function() end
})

local name = exports['l-redm-ui']:Input({       -- string | nil on cancel
    title = 'Horse name',
    label = 'Name',
    required = true
})

exports['l-redm-ui']:Form({
    title = 'Register horse',
    submitLabel = 'Save',
    fields = {
        { id = 'name', label = 'Name', type = 'text', placeholder = 'Horse name', required = true },
        { id = 'age', label = 'Age', type = 'number', min = 0, max = 30, value = 4 },
        { id = 'gender', label = 'Gender', type = 'select', options = { 'Male', 'Female' }, index = 1 },
        { id = 'volume', label = 'Volume', type = 'slider', min = 0, max = 100, step = 5, value = 40 },
        { id = 'notes', label = 'Notes', type = 'textarea' },
        { id = 'insured', label = 'Insured', type = 'checkbox', checked = true }
    },
    onSubmit = function(values)
        print(values.name, values.age, values.gender, values.insured)
    end,
    onCancel = function() end
})

local values = exports['l-redm-ui']:Form({      -- table | nil on cancel
    title = 'Register horse',
    fields = {
        { id = 'name', label = 'Name', type = 'text', required = true }
    }
})

exports['l-redm-ui']:CloseDialog()
exports['l-redm-ui']:IsDialogOpen()
```

`values` is keyed by field id: strings for text fields, numbers for number fields (clamped to min/max) and sliders, booleans for checkboxes, the selected option string for selects. Required fields highlight and block the submit while empty.

## Pin Pad

A combination lock for safes, door codes and similar: the digits sit in a row and each one is turned up or down with the arrows above and below it, like the dials on a safe. Every digit starts at 0. Works with the mouse and the keyboard (arrow keys turn and move, number keys set a digit directly, enter confirms, escape cancels). Same two call styles as the dialogs.

```lua
exports['l-redm-ui']:PinPad({
    title = 'Safe',
    length = 4,                    -- number of digits, default 4
    onSubmit = function(code) print(code) end,
    onCancel = function() end
})

local code = exports['l-redm-ui']:PinPad({ title = 'Safe', length = 4 })  -- string | nil on cancel

exports['l-redm-ui']:ClosePinPad()
exports['l-redm-ui']:IsPinPadOpen()
```

The code comes back as a string so leading zeros survive.

## Key Confirm

A confirmation that slides in from the side and expires with a visible timeout bar. Does not block the player; the keys are polled as control hashes.

```lua
exports['l-redm-ui']:KeyConfirm({
    text = 'Join the poker table?',
    position = 'right',            -- 'left' | 'right'
    duration = 10000,              -- optional, ms until timeout
    hold = 1000,                   -- optional, keys must be held this long instead of a press
    acceptKey = 0x760A9C6F,        -- rdr3 control hash
    acceptLabel = 'G',             -- badge letter
    acceptText = 'Accept',         -- optional row text
    declineKey = 0x24978A28,       -- optional second key
    declineLabel = 'H',
    declineText = 'Decline',
    onAccept = function() end,
    onDecline = function() end,
    onTimeout = function() end
})
exports['l-redm-ui']:CancelKeyConfirm()
exports['l-redm-ui']:IsKeyConfirmOpen()
```

## Minigames

Five skillcheck style minigames. They take keyboard focus while running (the player stands still). Pass `onFinish = function(success) end` and the call returns immediately, or pass no callback and the call blocks and returns `true`/`false`. Escape always fails.

```lua
local ok = exports['l-redm-ui']:Skillbar({
    label = 'Lockpicking',
    rounds = 3,          -- how many zones to hit in a row
    speed = 1.2,         -- sweeps per second
    zoneSize = 16        -- target zone width in percent
})

local ok = exports['l-redm-ui']:Sequence({
    label = 'Calm the horse',
    length = 6,          -- number of letters to type in order
    time = 6000          -- ms before it fails
})

local ok = exports['l-redm-ui']:Mash({
    label = 'Break free',
    key = 'E',           -- letter to mash
    time = 6000,         -- ms before it fails
    gain = 8,            -- percent gained per press
    decay = 22           -- percent lost per second
})

local ok = exports['l-redm-ui']:Circle({
    label = 'Safecracking',
    rounds = 3,          -- how many zones to hit in a row
    speed = 0.6,         -- rotations per second
    zoneSize = 40        -- target zone size in degrees
})

local ok = exports['l-redm-ui']:Tension({
    label = 'Reeling in',
    time = 15000,        -- ms before it fails
    zoneSize = 25,       -- zone size in percent
    speed = 1,           -- how fast the zone drifts
    gain = 22,           -- progress per second inside the zone
    decay = 16           -- progress lost per second outside
})

exports['l-redm-ui']:CancelMinigame()
exports['l-redm-ui']:IsMinigameActive()
```

Skillbar and Circle are hit-the-zone checks, one with a sweeping bar, one with a rotating pointer. Tension is hold-to-stay-in-the-zone: holding space raises the marker, releasing lets it sink while the zone drifts; the progress bar fills inside the zone and drains outside, full wins, empty or the timer running out fails.

## Key Legend

A grouped key hint panel: several key badges with labels in one box, for interactions with multiple keys. Display only, the keys themselves are polled by your script.

```lua
exports['l-redm-ui']:ShowKeyLegend({
    { key = 'E', label = 'Talk' },
    { key = 'G', label = 'Trade' },
    { key = 'X', label = 'Leave' }
}, 'bottom-right')       -- position optional, defaults to Config.TextUIPosition

exports['l-redm-ui']:HideKeyLegend()
exports['l-redm-ui']:IsKeyLegendOpen()
```

## Countdown

A countdown in mm:ss at the top center of the screen, for races, duels and events. It slides in, counts down, shows the end word for a moment and slides out again. Fire and forget, no callbacks and no sounds: your script decides when things start, the countdown is just the visual.

```lua
exports['l-redm-ui']:Countdown(3)              -- seconds, capped at 59:59
exports['l-redm-ui']:Countdown(3, 'FIGHT')     -- optional text shown at the end instead of GO

exports['l-redm-ui']:CancelCountdown()
exports['l-redm-ui']:IsCountdownActive()
```

## Objectives

A small task tracker panel for jobs and heists: a title, a list of objectives with diamond checkboxes, ticked off one by one from your script.

```lua
exports['l-redm-ui']:ShowObjectives({
    title = 'Stagecoach Robbery',
    position = 'right-center',        -- optional, defaults to Config.ObjectivesPosition
    entries = {
        { id = 'steal', label = 'Steal the stagecoach' },
        { id = 'lose', label = 'Lose the law' },
        { id = 'fence', label = 'Deliver it to the fence', done = false }
    }
})

exports['l-redm-ui']:SetObjective('steal', true)   -- tick or untick a single entry
exports['l-redm-ui']:HideObjectives()
exports['l-redm-ui']:IsObjectivesOpen()
```

## Progress

```lua
exports['l-redm-ui']:Progress('Chopping wood', 5000, onComplete, onCancel)  -- short form

local finished = exports['l-redm-ui']:Progress({  -- no callbacks: blocks, true | false on cancel
    label = 'Chopping wood',
    duration = 5000
})

exports['l-redm-ui']:Progress({
    label = 'Chopping wood',
    duration = 5000,
    type = 'bar',                  -- 'bar' (segmented) | 'circle'
    position = 'bottom-center',    -- optional, overrides config (8 spots like the text ui)
    canCancel = true,              -- optional, false hides the cancel hint and blocks X
    disableMove = false,           -- optional, true blocks movement/sprint/jump while running
    anim = {                       -- optional, played on the ped and stopped afterwards
        dict = 'mech_inventory@crafting@fallbacks',
        clip = 'full_craft_and_stow',
        flag = 27                  -- optional, defaults to 1
    },
    prop = {                       -- optional, attached to the ped and removed afterwards
        model = 'p_bottlejd01x',
        bone = 'SKEL_R_HAND',      -- optional bone name
        pos = vec3(0.0, 0.0, 0.0), -- optional offset
        rot = vec3(0.0, 0.0, 0.0)  -- optional rotation
    },
    onComplete = function() end,   -- fires on completion
    onCancel = function() end      -- fires on any cancel (key or CancelProgress)
})

exports['l-redm-ui']:CancelProgress()
exports['l-redm-ui']:IsProgressActive()
```

The bar shows the label on the left and the percentage on the right, with segments that fill one by one; the circle type shows a ring with the percentage inside and the label below. The player cancels with the cancel key (default X, shown as a hint below; key and label in `config.lua`, `cancelKey = false` disables it globally, `canCancel = false` per call). Segment count and default position are set in `config.lua`.

## Chat

Full replacement for the default cfx chat resource, restyled to match the kit. Remove `ensure chat` (and `ensure chat-theme-gtao`) from your server.cfg, l-redm-ui takes over.

All standard chat events keep working, so txAdmin, VORP and other resources need no changes: `chat:addMessage`, `chat:addSuggestion(s)`, `chat:removeSuggestion`, `chat:addTemplate`, `chat:addMode`/`chat:removeMode`, `chat:clear`, the `chatMessage` server event, `_chat:messageEntered` and the `/say` command. The server exports `addChatMessage(target, message)`, `registerMessageHook(fn)` and `registerMode(data)` mirror the original chat exports (only `exports.chat:addMessage` callers must switch to `exports['l-redm-ui']:addChatMessage`).

Usage: press T to open, enter sends, escape closes. There is no message display at all, only the input field; incoming chat messages are accepted for compatibility but not rendered. Arrow up/down cycles the input history, tab completes command suggestions, page up/down switches chat modes when a resource registered any. Messages support the usual `^0`-`^9` color codes and custom HTML templates.

## Server side

Everything is triggered through exports only. On the server the exports take the player id as first parameter (`-1` targets every player):

```lua
exports['l-redm-ui']:Notify(playerId, 'Money received', 'success', 6000, 'Store')
exports['l-redm-ui']:Announce(-1, 'Valentine', 'A quiet little town', 8000)
exports['l-redm-ui']:Warn(playerId, 'You broke the rules.', 'Warning', 'Admin')
```

## txAdmin

The resource catches txAdmin events server side and shows them in this ui, configurable in `config.lua`:

- `Config.TxAdmin.announcements` shows txAdmin announcements as the announce banner
- `Config.TxAdmin.scheduledRestart` shows scheduled restart warnings as the announce banner
- `Config.TxAdmin.directMessage` shows direct messages from staff to a player as a support notification
- `Config.TxAdmin.warns` shows txAdmin warns as the fullscreen warn ui

Set any of them to `false` to disable.

## Development

Frontend source lives in `web/`. Requires Node 18+.

```
cd web
npm install
npm run build
```

The build outputs to `html/`, which is what the resource ships.

## Support

If you find this resource useful, you can support development on Ko-fi:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/lscripts)
