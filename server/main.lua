local function notify(playerId, message, msgType, duration, title)
    if not playerId then return end
    TriggerClientEvent('l-redm-ui:notify', playerId, message, msgType, duration, title)
end

local function announce(playerId, title, subtitle, duration)
    if not playerId then return end
    TriggerClientEvent('l-redm-ui:announce', playerId, title, subtitle, duration)
end

local function warn(playerId, message, title, author)
    if not playerId then return end
    TriggerClientEvent('l-redm-ui:warn', playerId, message, title, author)
end

local function countdown(playerId, seconds, endText)
    if not playerId then return end
    TriggerClientEvent('l-redm-ui:countdown', playerId, seconds, endText)
end

local function cancelCountdown(playerId)
    if not playerId then return end
    TriggerClientEvent('l-redm-ui:cancelCountdown', playerId)
end

local function showObjectives(playerId, data)
    if not playerId then return end
    TriggerClientEvent('l-redm-ui:objectives', playerId, data)
end

local function setObjective(playerId, id, done)
    if not playerId then return end
    TriggerClientEvent('l-redm-ui:setObjective', playerId, id, done)
end

local function hideObjectives(playerId)
    if not playerId then return end
    TriggerClientEvent('l-redm-ui:hideObjectives', playerId)
end

exports('Notify', notify)
exports('Announce', announce)
exports('Warn', warn)
exports('Countdown', countdown)
exports('CancelCountdown', cancelCountdown)
exports('ShowObjectives', showObjectives)
exports('SetObjective', setObjective)
exports('HideObjectives', hideObjectives)

if Config.TxAdmin.announcements then
    AddEventHandler('txAdmin:events:announcement', function(data)
        if type(data) ~= 'table' or type(data.message) ~= 'string' or data.message == '' then return end
        announce(-1, Config.TxAdmin.announceTitle, data.message, nil)
    end)
end

if Config.TxAdmin.directMessage then
    AddEventHandler('txAdmin:events:playerDirectMessage', function(data)
        if type(data) ~= 'table' or type(data.message) ~= 'string' or data.message == '' then return end
        local target = tonumber(data.target)
        if not target then return end
        local title = Config.TxAdmin.directMessageTitle
        if type(data.author) == 'string' and data.author ~= '' then
            title = ('%s (%s)'):format(title, data.author)
        end
        notify(target, data.message, 'support', Config.TxAdmin.directMessageDuration, title)
    end)
end

if Config.TxAdmin.warns then
    AddEventHandler('txAdmin:events:playerWarned', function(data)
        if type(data) ~= 'table' or type(data.reason) ~= 'string' or data.reason == '' then return end
        local target = tonumber(data.targetNetId) or tonumber(data.target)
        if not target then return end
        warn(target, data.reason, Config.TxAdmin.warnTitle, data.author)
    end)
end

if Config.TxAdmin.scheduledRestart then
    AddEventHandler('txAdmin:events:scheduledRestart', function(data)
        if type(data) ~= 'table' then return end
        local message = data.translatedMessage
        if type(message) ~= 'string' or message == '' then
            local seconds = tonumber(data.secondsRemaining)
            if not seconds then return end
            if seconds >= 60 then
                message = ('Server restart in %d minutes'):format(math.floor(seconds / 60))
            else
                message = ('Server restart in %d seconds'):format(seconds)
            end
        end
        announce(-1, Config.TxAdmin.restartTitle, message, Config.TxAdmin.restartDuration)
    end)
end
