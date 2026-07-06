function L(key, ...)
    local locale = Locales[Config.Locale] or Locales['en'] or {}
    local text = locale[key]
    if text == nil and Locales['en'] then
        text = Locales['en'][key]
    end
    if text == nil then
        return key
    end
    if select('#', ...) > 0 then
        return text:format(...)
    end
    return text
end
