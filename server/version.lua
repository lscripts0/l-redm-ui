if Config.VersionCheck then
    CreateThread(function()
        Wait(2000)
        local current = GetResourceMetadata(GetCurrentResourceName(), 'version', 0) or '0.0.0'
        PerformHttpRequest('https://api.github.com/repos/lscripts0/l-redm-ui/releases/latest', function(status, body)
            if status ~= 200 or type(body) ~= 'string' then return end
            local ok, release = pcall(json.decode, body)
            if not ok or type(release) ~= 'table' or type(release.tag_name) ~= 'string' then return end
            local latest = release.tag_name:gsub('^v', '')
            local function toParts(version)
                local parts = {}
                for part in version:gmatch('%d+') do
                    parts[#parts + 1] = tonumber(part)
                end
                return parts
            end
            local mine, theirs = toParts(current), toParts(latest)
            local outdated = false
            for i = 1, math.max(#mine, #theirs) do
                local a, b = mine[i] or 0, theirs[i] or 0
                if a < b then
                    outdated = true
                    break
                elseif a > b then
                    break
                end
            end
            if outdated then
                print(('^3%s^7'):format(L('version_outdated', current, latest, 'https://github.com/lscripts0/l-redm-ui/releases/latest')))
            else
                print(('^2%s^7'):format(L('version_current', current)))
            end
        end, 'GET', '', { ['User-Agent'] = 'l-redm-ui' })
    end)
end
