local chatInputActive = false
local chatInputActivating = false
local chatLoaded = false

RegisterNetEvent('chatMessage')
RegisterNetEvent('chat:addTemplate')
RegisterNetEvent('chat:addMessage')
RegisterNetEvent('chat:addSuggestion')
RegisterNetEvent('chat:addSuggestions')
RegisterNetEvent('chat:addMode')
RegisterNetEvent('chat:removeMode')
RegisterNetEvent('chat:removeSuggestion')
RegisterNetEvent('chat:clear')
RegisterNetEvent('__cfx_internal:serverPrint')
RegisterNetEvent('_chat:messageEntered')

AddEventHandler('chatMessage', function(author, color, text)
    local args = { text }
    if author ~= '' then
        table.insert(args, 1, author)
    end
    SendNUIMessage({
        type = 'ON_MESSAGE',
        message = {
            color = color,
            multiline = true,
            args = args
        }
    })
end)

AddEventHandler('__cfx_internal:serverPrint', function(msg)
    print(msg)
    SendNUIMessage({
        type = 'ON_MESSAGE',
        message = {
            templateId = 'print',
            multiline = true,
            args = { msg },
            mode = '_global'
        }
    })
end)

local function addChatMessage(message)
    if type(message) == 'string' then
        message = { args = { message } }
    end
    SendNUIMessage({
        type = 'ON_MESSAGE',
        message = message
    })
end

exports('addMessage', addChatMessage)
AddEventHandler('chat:addMessage', addChatMessage)

local function addSuggestion(name, help, params)
    SendNUIMessage({
        type = 'ON_SUGGESTION_ADD',
        suggestion = {
            name = name,
            help = help,
            params = params or nil
        }
    })
end

exports('addSuggestion', addSuggestion)
AddEventHandler('chat:addSuggestion', addSuggestion)

AddEventHandler('chat:addSuggestions', function(suggestions)
    for _, suggestion in ipairs(suggestions) do
        SendNUIMessage({
            type = 'ON_SUGGESTION_ADD',
            suggestion = suggestion
        })
    end
end)

AddEventHandler('chat:removeSuggestion', function(name)
    SendNUIMessage({
        type = 'ON_SUGGESTION_REMOVE',
        name = name
    })
end)

AddEventHandler('chat:addMode', function(mode)
    SendNUIMessage({
        type = 'ON_MODE_ADD',
        mode = mode
    })
end)

AddEventHandler('chat:removeMode', function(name)
    SendNUIMessage({
        type = 'ON_MODE_REMOVE',
        name = name
    })
end)

AddEventHandler('chat:addTemplate', function(id, html)
    SendNUIMessage({
        type = 'ON_TEMPLATE_ADD',
        template = {
            id = id,
            html = html
        }
    })
end)

AddEventHandler('chat:clear', function()
    SendNUIMessage({ type = 'ON_CLEAR' })
end)

RegisterNUICallback('chatResult', function(data, cb)
    chatInputActive = false
    SetNuiFocus(false, false)

    if not data.canceled and data.message and data.message ~= '' then
        if data.message:sub(1, 1) == '/' then
            ExecuteCommand(data.message:sub(2))
        else
            TriggerServerEvent('_chat:messageEntered', GetPlayerName(PlayerId()), { 255, 255, 255 }, data.message, data.mode)
        end
    end

    cb('ok')
end)

local function refreshCommands()
    if not GetRegisteredCommands then return end
    local registeredCommands = GetRegisteredCommands()
    local suggestions = {}
    for _, command in ipairs(registeredCommands) do
        if IsAceAllowed(('command.%s'):format(command.name)) then
            table.insert(suggestions, {
                name = '/' .. command.name,
                help = ''
            })
        end
    end
    TriggerEvent('chat:addSuggestions', suggestions)
end

AddEventHandler('onClientResourceStart', function()
    Wait(500)
    refreshCommands()
end)

AddEventHandler('onClientResourceStop', function()
    Wait(500)
    refreshCommands()
end)

RegisterNUICallback('chatLoaded', function(_, cb)
    TriggerServerEvent('chat:init')
    refreshCommands()
    chatLoaded = true
    cb('ok')
end)

CreateThread(function()
    pcall(function() SetTextChatEnabled(false) end)
    SetNuiFocus(false)

    while true do
        Wait(0)

        if not chatInputActive then
            if IsControlPressed(0, `INPUT_MP_TEXT_CHAT_ALL`) and not IsPauseMenuActive() then
                chatInputActive = true
                chatInputActivating = true
                SendNUIMessage({ type = 'ON_OPEN' })
            end
        end

        if chatInputActivating then
            if not IsControlPressed(0, `INPUT_MP_TEXT_CHAT_ALL`) then
                SetNuiFocus(true, false)
                chatInputActivating = false
                SendNUIMessage({ type = 'ON_FOCUS' })
            end
        end
    end
end)
