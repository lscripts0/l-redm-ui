local currentMenu = nil
local textUIOpen = false

local function playSound(kind)
    if not Config.Sounds.enabled then return end
    local sound = Config.Sounds[kind]
    if sound then
        PlaySoundFrontend(sound.name, sound.ref, true, 0)
    end
end

local function findItem(id)
    if not currentMenu then return nil end
    for _, item in ipairs(currentMenu.items) do
        if item.id == id then
            return item
        end
    end
    return nil
end

local function pressedWithRepeat(hash, holdUntil)
    if IsControlJustPressed(0, hash) then
        holdUntil[hash] = GetGameTimer() + 350
        return true
    end
    if IsControlPressed(0, hash) then
        if holdUntil[hash] and GetGameTimer() >= holdUntil[hash] then
            holdUntil[hash] = GetGameTimer() + 120
            return true
        end
    else
        holdUntil[hash] = nil
    end
    return false
end

local function sendKey(key)
    SendNUIMessage({ action = 'menu:key', key = key })
end

local closeMenu

local function startKeyboardThread(menu)
    CreateThread(function()
        local holdUntil = {}
        while currentMenu == menu do
            if pressedWithRepeat(`INPUT_FRONTEND_UP`, holdUntil) then sendKey('up') end
            if pressedWithRepeat(`INPUT_FRONTEND_DOWN`, holdUntil) then sendKey('down') end
            if pressedWithRepeat(`INPUT_FRONTEND_LEFT`, holdUntil) then sendKey('left') end
            if pressedWithRepeat(`INPUT_FRONTEND_RIGHT`, holdUntil) then sendKey('right') end
            if IsControlJustPressed(0, `INPUT_FRONTEND_ACCEPT`) then sendKey('select') end
            if IsControlJustPressed(0, `INPUT_FRONTEND_CANCEL`) then
                closeMenu('back')
            elseif IsPauseMenuActive() then
                closeMenu('close')
            end
            Wait(0)
        end
    end)
end

closeMenu = function(reason)
    if not currentMenu then return end
    local menu = currentMenu
    currentMenu = nil
    SendNUIMessage({ action = 'menu:close' })
    SetNuiFocus(false, false)
    if reason == 'back' then
        playSound('back')
        if menu.onBack then
            menu.onBack()
        elseif menu.onClose then
            menu.onClose()
        end
    else
        playSound('close')
        if menu.onClose then
            menu.onClose()
        end
    end
end

local function openMenu(menu)
    if type(menu) ~= 'table' or type(menu.items) ~= 'table' or #menu.items == 0 then
        return false
    end
    local replacing = currentMenu ~= nil
    currentMenu = menu
    local nuiItems = {}
    for _, item in ipairs(menu.items) do
        nuiItems[#nuiItems + 1] = {
            id = item.id,
            label = item.label,
            icon = item.icon,
            type = item.type,
            description = item.description,
            rightLabel = item.rightLabel,
            disabled = item.disabled,
            arrow = item.arrow,
            options = item.options,
            index = item.index,
            min = item.min,
            max = item.max,
            step = item.step,
            value = item.value,
            checked = item.checked
        }
    end
    SendNUIMessage({
        action = 'menu:open',
        menu = {
            title = menu.title or '',
            subtitle = menu.subtitle,
            position = menu.position == 'left' and 'left' or 'right',
            maxVisible = menu.maxVisible or Config.MaxVisibleItems,
            items = nuiItems
        }
    })
    startKeyboardThread(menu)
    if not replacing then
        playSound('open')
    end
    return true
end

local function showTextUI(text, key, position)
    if type(text) ~= 'string' or text == '' then return end
    textUIOpen = true
    SendNUIMessage({
        action = 'textui:show',
        text = text,
        key = key,
        position = position or Config.TextUIPosition
    })
end

local function hideTextUI()
    if not textUIOpen then return end
    textUIOpen = false
    SendNUIMessage({ action = 'textui:hide' })
end

local function notify(message, msgType, duration, title)
    if type(message) ~= 'string' or message == '' then return end
    duration = duration or Config.NotifyDuration
    SendNUIMessage({
        action = 'notify',
        message = message,
        title = title,
        type = msgType or 'info',
        duration = duration,
        position = Config.NotifyPosition
    })
    playSound('notify')
    SetTimeout(math.floor(duration), function()
        playSound('notifyHide')
    end)
end

local function announce(title, subtitle, duration)
    if type(title) ~= 'string' or title == '' then return end
    duration = duration or Config.AnnounceDuration
    SendNUIMessage({
        action = 'announce',
        title = title,
        subtitle = subtitle,
        duration = duration
    })
    playSound('announce')
    SetTimeout(math.floor(duration), function()
        playSound('announceHide')
    end)
end

local holdTextUIOpen = false
local holdToken = 0

local function hideHoldTextUI()
    if not holdTextUIOpen then return end
    holdTextUIOpen = false
    holdToken = holdToken + 1
    SendNUIMessage({ action = 'textui-hold:hide' })
end

local function showHoldTextUI(text, keyLabel, keyHash, duration, onComplete, position)
    if type(text) ~= 'string' or text == '' then return end
    if type(keyHash) ~= 'number' then return end
    duration = duration or Config.HoldTextUIDuration
    holdToken = holdToken + 1
    local token = holdToken
    holdTextUIOpen = true
    SendNUIMessage({
        action = 'textui-hold:show',
        text = text,
        key = keyLabel,
        position = position or Config.TextUIPosition
    })
    CreateThread(function()
        local held = 0.0
        local lastSent = -1.0
        while holdTextUIOpen and holdToken == token do
            Wait(0)
            if IsControlPressed(0, keyHash) or IsDisabledControlPressed(0, keyHash) then
                held = held + GetFrameTime() * 1000.0
            else
                held = 0.0
            end
            local progress = held / duration
            if progress >= 1.0 then
                holdTextUIOpen = false
                SendNUIMessage({ action = 'textui-hold:hide' })
                if onComplete then
                    local ok, err = pcall(onComplete)
                    if not ok then
                        print(('l-redm-ui: hold textui onComplete failed: %s'):format(tostring(err)))
                    end
                end
                break
            end
            if math.abs(progress - lastSent) >= 0.01 then
                lastSent = progress
                SendNUIMessage({ action = 'textui-hold:progress', value = progress })
            end
        end
    end)
end

local currentDialog = nil

local function closeDialog()
    if not currentDialog then return end
    local dialog = currentDialog
    currentDialog = nil
    SendNUIMessage({ action = 'dialog:close' })
    SetNuiFocus(false, false)
    if dialog.onCancel then
        pcall(dialog.onCancel)
    end
end

local function openDialog(kind, data, handlers)
    if type(data) ~= 'table' or type(data.title) ~= 'string' or data.title == '' then return false end
    currentDialog = handlers
    SendNUIMessage({
        action = 'dialog:open',
        kind = kind,
        title = data.title,
        message = data.message,
        submitLabel = data.submitLabel or L('confirm'),
        cancelLabel = data.cancelLabel or L('cancel'),
        fields = data.fields
    })
    SetNuiFocus(true, true)
    playSound('open')
    return true
end

local function openAlert(data)
    if type(data) ~= 'table' or type(data.message) ~= 'string' then return false end
    if data.onConfirm or data.onCancel then
        return openDialog('alert', data, {
            onConfirm = data.onConfirm,
            onCancel = data.onCancel
        })
    end
    local p = promise.new()
    if not openDialog('alert', data, {
        onConfirm = function() p:resolve(true) end,
        onCancel = function() p:resolve(false) end
    }) then
        return false
    end
    return Citizen.Await(p)
end

local function openForm(data)
    if type(data) ~= 'table' or type(data.fields) ~= 'table' or #data.fields == 0 then return false end
    if data.onSubmit or data.onCancel then
        return openDialog('form', data, {
            onSubmit = data.onSubmit,
            onCancel = data.onCancel
        })
    end
    local p = promise.new()
    if not openDialog('form', data, {
        onSubmit = function(values) p:resolve(values) end,
        onCancel = function() p:resolve(nil) end
    }) then
        return nil
    end
    return Citizen.Await(p)
end

local function openInput(data)
    if type(data) ~= 'table' then return false end
    local payload = {
        title = data.title,
        submitLabel = data.submitLabel,
        cancelLabel = data.cancelLabel,
        fields = {
            {
                id = 'value',
                label = data.label,
                type = data.type or 'text',
                placeholder = data.placeholder,
                value = data.value,
                required = data.required,
                min = data.min,
                max = data.max
            }
        }
    }
    if data.onSubmit or data.onCancel then
        local onSubmit = data.onSubmit
        return openDialog('form', payload, {
            onSubmit = onSubmit and function(values)
                onSubmit(values.value)
            end or nil,
            onCancel = data.onCancel
        })
    end
    local p = promise.new()
    if not openDialog('form', payload, {
        onSubmit = function(values) p:resolve(values.value) end,
        onCancel = function() p:resolve(nil) end
    }) then
        return nil
    end
    return Citizen.Await(p)
end

RegisterNUICallback('dialog:result', function(data, cb)
    cb('ok')
    if not currentDialog then return end
    local dialog = currentDialog
    currentDialog = nil
    SetNuiFocus(false, false)
    if data.canceled then
        playSound('back')
        if dialog.onCancel then
            pcall(dialog.onCancel)
        end
        return
    end
    playSound('select')
    if dialog.onConfirm then
        pcall(dialog.onConfirm)
    elseif dialog.onSubmit then
        local ok, err = pcall(dialog.onSubmit, data.values or {})
        if not ok then
            print(('l-redm-ui: dialog onSubmit failed: %s'):format(tostring(err)))
        end
    end
end)

local currentKeyConfirm = nil
local keyConfirmToken = 0

local function finishKeyConfirm(reason)
    if not currentKeyConfirm then return end
    local confirm = currentKeyConfirm
    currentKeyConfirm = nil
    keyConfirmToken = keyConfirmToken + 1
    SendNUIMessage({ action = 'keyconfirm:hide' })
    if reason == 'accept' then
        playSound('select')
        if confirm.onAccept then pcall(confirm.onAccept) end
    elseif reason == 'decline' then
        playSound('back')
        if confirm.onDecline then pcall(confirm.onDecline) end
    elseif reason == 'timeout' then
        if confirm.onTimeout then pcall(confirm.onTimeout) end
    end
end

local function showKeyConfirm(data)
    if type(data) ~= 'table' or type(data.text) ~= 'string' or data.text == '' then return false end
    if type(data.acceptKey) ~= 'number' then return false end
    finishKeyConfirm('cancel')
    keyConfirmToken = keyConfirmToken + 1
    local token = keyConfirmToken
    local duration = data.duration or Config.KeyConfirmDuration
    local acceptKey = data.acceptKey
    local declineKey = data.declineKey
    currentKeyConfirm = {
        onAccept = data.onAccept,
        onDecline = data.onDecline,
        onTimeout = data.onTimeout
    }
    SendNUIMessage({
        action = 'keyconfirm:show',
        text = data.text,
        position = data.position == 'left' and 'left' or 'right',
        duration = duration,
        acceptLabel = data.acceptLabel,
        acceptText = data.acceptText,
        declineLabel = data.declineLabel,
        declineText = data.declineText,
        hasDecline = declineKey ~= nil
    })
    playSound('open')
    local holdMs = tonumber(data.hold)
    CreateThread(function()
        local deadline = GetGameTimer() + duration
        local heldAccept, heldDecline = 0.0, 0.0
        local sentAccept, sentDecline = -1.0, -1.0
        local function keyDown(hash)
            return IsControlPressed(0, hash) or IsDisabledControlPressed(0, hash)
        end
        local function sendHold(key, value, lastSent)
            if math.abs(value - lastSent) < 0.02 then return lastSent end
            SendNUIMessage({ action = 'keyconfirm:hold', key = key, value = value })
            return value
        end
        while currentKeyConfirm and keyConfirmToken == token do
            Wait(0)
            if holdMs and holdMs > 0 then
                local dt = GetFrameTime() * 1000.0
                heldAccept = keyDown(acceptKey) and heldAccept + dt or 0.0
                heldDecline = (declineKey and keyDown(declineKey)) and heldDecline + dt or 0.0
                sentAccept = sendHold('accept', math.min(heldAccept / holdMs, 1.0), sentAccept)
                sentDecline = sendHold('decline', math.min(heldDecline / holdMs, 1.0), sentDecline)
                if heldAccept >= holdMs then
                    finishKeyConfirm('accept')
                elseif declineKey and heldDecline >= holdMs then
                    finishKeyConfirm('decline')
                elseif GetGameTimer() >= deadline then
                    finishKeyConfirm('timeout')
                end
            else
                if IsControlJustPressed(0, acceptKey) or IsDisabledControlJustPressed(0, acceptKey) then
                    finishKeyConfirm('accept')
                elseif declineKey and (IsControlJustPressed(0, declineKey) or IsDisabledControlJustPressed(0, declineKey)) then
                    finishKeyConfirm('decline')
                elseif GetGameTimer() >= deadline then
                    finishKeyConfirm('timeout')
                end
            end
        end
    end)
    return true
end

local currentMinigame = nil

local function finishMinigame(success)
    if not currentMinigame then return end
    local minigame = currentMinigame
    currentMinigame = nil
    SetNuiFocus(false, false)
    playSound(success and 'select' or 'back')
    if minigame.onFinish then
        pcall(minigame.onFinish, success == true)
    end
end

local function startMinigame(kind, data)
    if currentMinigame then return false end
    if type(data) ~= 'table' then data = {} end
    local onFinish = data.onFinish
    local awaitPromise = nil
    if onFinish == nil then
        awaitPromise = promise.new()
        onFinish = function(success) awaitPromise:resolve(success) end
    end
    currentMinigame = { onFinish = onFinish }
    local hint = nil
    if kind == 'skillbar' or kind == 'circle' then
        hint = L('hit_the_zone')
    elseif kind == 'tension' then
        hint = L('stay_in_the_zone')
    end
    SendNUIMessage({
        action = 'minigame:start',
        kind = kind,
        label = data.label,
        rounds = data.rounds,
        speed = data.speed,
        zoneSize = data.zoneSize,
        length = data.length,
        time = data.time,
        key = data.key,
        gain = data.gain,
        decay = data.decay,
        hint = hint
    })
    SetNuiFocus(true, false)
    if awaitPromise then
        return Citizen.Await(awaitPromise)
    end
    return true
end

local function cancelMinigame()
    if not currentMinigame then return end
    SendNUIMessage({ action = 'minigame:stop' })
    finishMinigame(false)
end

RegisterNUICallback('minigame:result', function(data, cb)
    cb('ok')
    finishMinigame(data.success == true)
end)

local keyLegendOpen = false

local function showKeyLegend(entries, position)
    if type(entries) ~= 'table' or #entries == 0 then return false end
    keyLegendOpen = true
    SendNUIMessage({
        action = 'keylegend:show',
        entries = entries,
        position = position or Config.TextUIPosition
    })
    return true
end

local function hideKeyLegend()
    if not keyLegendOpen then return end
    keyLegendOpen = false
    SendNUIMessage({ action = 'keylegend:hide' })
end

local progressActive = false
local progressToken = 0
local progressOnCancel = nil
local progressCleanup = nil

local function runProgressCleanup()
    local cleanup = progressCleanup
    progressCleanup = nil
    if cleanup then
        pcall(cleanup)
    end
end

local function cancelProgress()
    if not progressActive then return end
    progressActive = false
    progressToken = progressToken + 1
    SendNUIMessage({ action = 'progress:stop' })
    runProgressCleanup()
    local onCancel = progressOnCancel
    progressOnCancel = nil
    if onCancel then
        pcall(onCancel)
    end
end

local function setupProgressExtras(token, anim, prop)
    CreateThread(function()
        local ped = PlayerPedId()
        local obj = nil
        if anim and anim.dict and anim.clip then
            RequestAnimDict(anim.dict)
            local tries = 0
            while not HasAnimDictLoaded(anim.dict) and tries < 100 do
                tries = tries + 1
                Wait(10)
            end
        end
        if prop and prop.model then
            local model = type(prop.model) == 'string' and joaat(prop.model) or prop.model
            RequestModel(model, false)
            local tries = 0
            while not HasModelLoaded(model) and tries < 100 do
                tries = tries + 1
                Wait(10)
            end
            if HasModelLoaded(model) and progressActive and progressToken == token then
                local coords = GetEntityCoords(ped)
                obj = CreateObject(model, coords.x, coords.y, coords.z, true, true, false, false, true)
                local bone = GetEntityBoneIndexByName(ped, prop.bone or 'PH_R_Hand')
                local pos = prop.pos or vector3(0.0, 0.0, 0.0)
                local rot = prop.rot or vector3(0.0, 0.0, 0.0)
                AttachEntityToEntity(obj, ped, bone, pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, true, true, false, true, 1, true)
                SetModelAsNoLongerNeeded(model)
            end
        end
        if progressActive and progressToken == token then
            if anim and anim.dict and anim.clip and HasAnimDictLoaded(anim.dict) then
                TaskPlayAnim(ped, anim.dict, anim.clip, 1.0, 1.0, -1, anim.flag or 1, 0.0, false, false, false)
            end
            progressCleanup = function()
                if anim and anim.dict and anim.clip then
                    ClearPedTasks(ped)
                    RemoveAnimDict(anim.dict)
                end
                if obj and DoesEntityExist(obj) then
                    DeleteEntity(obj)
                end
            end
        elseif obj and DoesEntityExist(obj) then
            DeleteEntity(obj)
        end
    end)
end

local function startProgress(data, duration, onComplete, onCancel)
    local label, position, progressType, anim, prop
    local canCancel = true
    local disableMove = false
    if type(data) == 'table' then
        label = data.label
        duration = data.duration
        onComplete = data.onComplete
        onCancel = data.onCancel
        position = data.position
        progressType = data.type
        canCancel = data.canCancel ~= false
        disableMove = data.disableMove == true
        anim = data.anim
        prop = data.prop
    else
        label = data
    end
    if type(duration) ~= 'number' or duration <= 0 then return false end
    local awaitPromise = nil
    if type(data) == 'table' and onComplete == nil and onCancel == nil then
        awaitPromise = promise.new()
        onComplete = function() awaitPromise:resolve(true) end
        onCancel = function() awaitPromise:resolve(false) end
    end
    progressToken = progressToken + 1
    local token = progressToken
    progressActive = true
    progressOnCancel = onCancel
    local cancelable = canCancel and type(Config.Progress.cancelKey) == 'number'
    SendNUIMessage({
        action = 'progress:start',
        label = label,
        duration = duration,
        segments = Config.Progress.segments,
        position = position or Config.Progress.position,
        progressType = progressType == 'circle' and 'circle' or 'bar',
        cancelLabel = cancelable and Config.Progress.cancelLabel or nil
    })
    if anim or prop then
        setupProgressExtras(token, anim, prop)
    end
    if disableMove then
        CreateThread(function()
            while progressActive and progressToken == token do
                DisableControlAction(0, `INPUT_MOVE_LR`, true)
                DisableControlAction(0, `INPUT_MOVE_UD`, true)
                DisableControlAction(0, `INPUT_SPRINT`, true)
                DisableControlAction(0, `INPUT_JUMP`, true)
                Wait(0)
            end
        end)
    end
    SetTimeout(math.floor(duration), function()
        if not progressActive or progressToken ~= token then return end
        progressActive = false
        progressToken = progressToken + 1
        progressOnCancel = nil
        SendNUIMessage({ action = 'progress:stop' })
        runProgressCleanup()
        if onComplete then
            pcall(onComplete)
        end
    end)
    if cancelable then
        CreateThread(function()
            while progressActive and progressToken == token do
                Wait(0)
                if IsControlJustPressed(0, Config.Progress.cancelKey) or IsDisabledControlJustPressed(0, Config.Progress.cancelKey) then
                    cancelProgress()
                end
            end
        end)
    end
    if awaitPromise then
        return Citizen.Await(awaitPromise)
    end
    return true
end

local currentConversation = nil

local closeConversation

local function startConversationThread(conversation)
    CreateThread(function()
        local holdUntil = {}
        while currentConversation == conversation do
            if pressedWithRepeat(`INPUT_FRONTEND_UP`, holdUntil) then
                SendNUIMessage({ action = 'conversation:key', key = 'up' })
            end
            if pressedWithRepeat(`INPUT_FRONTEND_DOWN`, holdUntil) then
                SendNUIMessage({ action = 'conversation:key', key = 'down' })
            end
            if IsControlJustPressed(0, `INPUT_FRONTEND_ACCEPT`) then
                SendNUIMessage({ action = 'conversation:key', key = 'select' })
            end
            if IsControlJustPressed(0, `INPUT_FRONTEND_CANCEL`) or IsPauseMenuActive() then
                closeConversation(true)
            end
            Wait(0)
        end
    end)
end

closeConversation = function(fireCallback)
    if not currentConversation then return end
    local conversation = currentConversation
    currentConversation = nil
    SendNUIMessage({ action = 'conversation:close' })
    playSound('close')
    if fireCallback and conversation.onClose then
        pcall(conversation.onClose)
    end
end

local function openConversation(data)
    if type(data) ~= 'table' or type(data.text) ~= 'string' or data.text == '' then return false end
    if type(data.choices) ~= 'table' or #data.choices == 0 then return false end
    closeMenu('close')
    local replacing = currentConversation ~= nil
    local conversation = {
        choices = data.choices,
        onSelect = data.onSelect,
        onClose = data.onClose
    }
    currentConversation = conversation
    SendNUIMessage({
        action = 'conversation:open',
        name = data.name,
        text = data.text,
        choices = data.choices
    })
    startConversationThread(conversation)
    if not replacing then
        playSound('open')
    end
    return true
end

RegisterNUICallback('conversation:select', function(data, cb)
    cb('ok')
    if not currentConversation then return end
    local conversation = currentConversation
    currentConversation = nil
    SendNUIMessage({ action = 'conversation:close' })
    playSound('select')
    local choice = nil
    for _, entry in ipairs(conversation.choices) do
        if entry.id == data.id then
            choice = entry
            break
        end
    end
    if choice and conversation.onSelect then
        pcall(conversation.onSelect, choice)
    end
end)

RegisterNUICallback('conversation:nav', function(_, cb)
    cb('ok')
    playSound('nav')
end)

local currentPinPad = nil

local function closePinPad()
    if not currentPinPad then return end
    local pad = currentPinPad
    currentPinPad = nil
    SendNUIMessage({ action = 'pinpad:close' })
    SetNuiFocus(false, false)
    playSound('back')
    if pad.onCancel then
        pcall(pad.onCancel)
    end
end

local function openPinPad(data)
    if currentPinPad then return false end
    if type(data) ~= 'table' then data = {} end
    local handlers = { onSubmit = data.onSubmit, onCancel = data.onCancel }
    local awaitPromise = nil
    if handlers.onSubmit == nil and handlers.onCancel == nil then
        awaitPromise = promise.new()
        handlers.onSubmit = function(code) awaitPromise:resolve(code) end
        handlers.onCancel = function() awaitPromise:resolve(nil) end
    end
    currentPinPad = handlers
    SendNUIMessage({
        action = 'pinpad:open',
        title = data.title,
        length = data.length or 4,
        submitLabel = data.submitLabel or L('confirm'),
        cancelLabel = data.cancelLabel or L('cancel')
    })
    SetNuiFocus(true, true)
    playSound('open')
    if awaitPromise then
        return Citizen.Await(awaitPromise)
    end
    return true
end

RegisterNUICallback('pinpad:result', function(data, cb)
    cb('ok')
    if not currentPinPad then return end
    local pad = currentPinPad
    currentPinPad = nil
    SetNuiFocus(false, false)
    if data.canceled then
        playSound('back')
        if pad.onCancel then
            pcall(pad.onCancel)
        end
        return
    end
    playSound('select')
    if pad.onSubmit then
        pcall(pad.onSubmit, tostring(data.code or ''))
    end
end)

RegisterNUICallback('pinpad:nav', function(_, cb)
    cb('ok')
    playSound('nav')
end)

local currentRadial = nil

local function closeRadialMenu(fireCallback)
    if not currentRadial then return end
    local radial = currentRadial
    currentRadial = nil
    SendNUIMessage({ action = 'radial:close' })
    SetNuiFocus(false, false)
    playSound('close')
    if fireCallback and radial.onClose then
        pcall(radial.onClose)
    end
end

local function openRadialMenu(data)
    if type(data) ~= 'table' or type(data.items) ~= 'table' or #data.items == 0 then return false end
    closeMenu('close')
    currentRadial = {
        items = data.items,
        onSelect = data.onSelect,
        onClose = data.onClose
    }
    SendNUIMessage({ action = 'radial:open', items = data.items })
    SetNuiFocus(true, true)
    playSound('open')
    return true
end

RegisterNUICallback('radial:select', function(data, cb)
    cb('ok')
    if not currentRadial then return end
    local radial = currentRadial
    currentRadial = nil
    SendNUIMessage({ action = 'radial:close' })
    SetNuiFocus(false, false)
    playSound('select')
    local item = nil
    for _, entry in ipairs(radial.items) do
        if entry.id == data.id then
            item = entry
            break
        end
    end
    if item and radial.onSelect then
        pcall(radial.onSelect, item)
    end
end)

RegisterNUICallback('radial:close', function(_, cb)
    cb('ok')
    closeRadialMenu(true)
end)

RegisterNUICallback('radial:nav', function(_, cb)
    cb('ok')
    playSound('nav')
end)

local countdownToken = 0
local countdownActive = false

local function startCountdown(seconds, endText)
    seconds = math.floor(tonumber(seconds) or 3)
    if seconds < 1 then seconds = 1 end
    if seconds > 3599 then seconds = 3599 end
    countdownToken = countdownToken + 1
    local token = countdownToken
    countdownActive = true
    CreateThread(function()
        local remaining = seconds
        while remaining > 0 and countdownToken == token do
            SendNUIMessage({ action = 'countdown:tick', value = remaining })
            Wait(1000)
            remaining = remaining - 1
        end
        if countdownToken ~= token then return end
        SendNUIMessage({ action = 'countdown:tick', value = 0, text = endText or L('countdown_go') })
        Wait(2500)
        if countdownToken == token then
            countdownActive = false
            SendNUIMessage({ action = 'countdown:hide' })
        end
    end)
    return true
end

local function cancelCountdown()
    if not countdownActive then return end
    countdownActive = false
    countdownToken = countdownToken + 1
    SendNUIMessage({ action = 'countdown:hide' })
end

local currentObjectives = nil

local function showObjectives(data)
    if type(data) ~= 'table' or type(data.entries) ~= 'table' or #data.entries == 0 then return false end
    currentObjectives = {
        title = data.title,
        entries = data.entries,
        position = data.position or Config.ObjectivesPosition
    }
    SendNUIMessage({
        action = 'objectives:show',
        title = currentObjectives.title,
        entries = currentObjectives.entries,
        position = currentObjectives.position
    })
    return true
end

local function setObjective(id, done)
    if not currentObjectives then return false end
    for _, entry in ipairs(currentObjectives.entries) do
        if entry.id == id then
            entry.done = done == true
            SendNUIMessage({ action = 'objectives:update', entries = currentObjectives.entries })
            if entry.done then
                playSound('select')
            end
            return true
        end
    end
    return false
end

local function hideObjectives()
    if not currentObjectives then return end
    currentObjectives = nil
    SendNUIMessage({ action = 'objectives:hide' })
end

local warnActive = false

local function showWarn(message, title, author)
    if type(message) ~= 'string' or message == '' then return end
    closeMenu('close')
    SendNUIMessage({
        action = 'warn:show',
        message = message,
        title = title or L('warning'),
        author = author,
        holdLabel = Config.Warn.holdLabel
    })
    playSound('warn')
    if warnActive then return end
    warnActive = true
    CreateThread(function()
        local held = 0.0
        local lastSent = -1.0
        local holdSeconds = Config.Warn.holdSeconds or 5
        while warnActive do
            Wait(0)
            if IsControlPressed(0, `INPUT_FRONTEND_ACCEPT`) then
                held = held + GetFrameTime()
            else
                held = 0.0
            end
            local progress = held / holdSeconds
            if progress >= 1.0 then
                warnActive = false
                SendNUIMessage({ action = 'warn:hide' })
            elseif math.abs(progress - lastSent) >= 0.01 then
                lastSent = progress
                SendNUIMessage({ action = 'warn:progress', value = progress })
            end
        end
    end)
end

RegisterNUICallback('menu:select', function(data, cb)
    cb('ok')
    local item = findItem(data.id)
    if not item or not currentMenu then return end
    playSound('select')
    if item.onSelect then
        pcall(item.onSelect, item)
    elseif currentMenu.onSelect then
        currentMenu.onSelect(item)
    end
end)

RegisterNUICallback('menu:change', function(data, cb)
    cb('ok')
    local item = findItem(data.id)
    if not item or not currentMenu then return end
    if data.index ~= nil then item.index = data.index end
    if data.value ~= nil then item.value = data.value end
    if data.checked ~= nil then item.checked = data.checked end
    playSound('change')
    if item.onChange then
        pcall(item.onChange, item)
    elseif currentMenu.onChange then
        currentMenu.onChange(item)
    end
end)

RegisterNUICallback('menu:nav', function(_, cb)
    cb('ok')
    playSound('nav')
end)

RegisterNUICallback('menu:back', function(_, cb)
    cb('ok')
    closeMenu('back')
end)

RegisterNUICallback('menu:close', function(_, cb)
    cb('ok')
    closeMenu('close')
end)

exports('OpenMenu', openMenu)
exports('CloseMenu', function() closeMenu('close') end)
exports('IsMenuOpen', function() return currentMenu ~= nil end)
exports('ShowTextUI', showTextUI)
exports('HideTextUI', hideTextUI)
exports('IsTextUIOpen', function() return textUIOpen end)
exports('ShowHoldTextUI', showHoldTextUI)
exports('HideHoldTextUI', hideHoldTextUI)
exports('IsHoldTextUIOpen', function() return holdTextUIOpen end)
exports('Notify', notify)
exports('Announce', announce)
exports('Warn', showWarn)
exports('Skillbar', function(data) return startMinigame('skillbar', data) end)
exports('Sequence', function(data) return startMinigame('sequence', data) end)
exports('Mash', function(data) return startMinigame('mash', data) end)
exports('Circle', function(data) return startMinigame('circle', data) end)
exports('Tension', function(data) return startMinigame('tension', data) end)
exports('OpenConversation', openConversation)
exports('CloseConversation', function() closeConversation(true) end)
exports('IsConversationOpen', function() return currentConversation ~= nil end)
exports('PinPad', openPinPad)
exports('ClosePinPad', closePinPad)
exports('IsPinPadOpen', function() return currentPinPad ~= nil end)
exports('OpenRadialMenu', openRadialMenu)
exports('CloseRadialMenu', function() closeRadialMenu(true) end)
exports('IsRadialMenuOpen', function() return currentRadial ~= nil end)
exports('CancelMinigame', cancelMinigame)
exports('IsMinigameActive', function() return currentMinigame ~= nil end)
exports('ShowKeyLegend', showKeyLegend)
exports('HideKeyLegend', hideKeyLegend)
exports('IsKeyLegendOpen', function() return keyLegendOpen end)
exports('Countdown', startCountdown)
exports('CancelCountdown', cancelCountdown)
exports('IsCountdownActive', function() return countdownActive end)
exports('ShowObjectives', showObjectives)
exports('SetObjective', setObjective)
exports('HideObjectives', hideObjectives)
exports('IsObjectivesOpen', function() return currentObjectives ~= nil end)
exports('Progress', startProgress)
exports('CancelProgress', cancelProgress)
exports('IsProgressActive', function() return progressActive end)
exports('Alert', openAlert)
exports('Input', openInput)
exports('Form', openForm)
exports('CloseDialog', closeDialog)
exports('IsDialogOpen', function() return currentDialog ~= nil end)
exports('KeyConfirm', showKeyConfirm)
exports('CancelKeyConfirm', function() finishKeyConfirm('cancel') end)
exports('IsKeyConfirmOpen', function() return currentKeyConfirm ~= nil end)

RegisterNetEvent('l-redm-ui:notify', function(message, msgType, duration, title)
    notify(message, msgType, duration, title)
end)

RegisterNetEvent('l-redm-ui:announce', function(title, subtitle, duration)
    announce(title, subtitle, duration)
end)

RegisterNetEvent('l-redm-ui:warn', function(message, title, author)
    showWarn(message, title, author)
end)

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    SetNuiFocus(false, false)
end)
