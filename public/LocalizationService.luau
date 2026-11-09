local LocalizationService = {
    welcome = {
        ru = `ПРИВЕТ МИР`,
        en = `HELLO WORLD`,
        da = `HEJ VERDEN`,
    },
    welcomeSubtitle = {
        ru = `это тест локализации. Например это текст на русском!`,
        en = `this is localization test. For example this text in engilish!`,
    }
}

function LocalizationService.Get(name:string)
    local CurrentLanguage:string = Client.Language
    CurrentLanguage = CurrentLanguage:lower()

    if LocalizationService[name] then
        local Localizated = LocalizationService[name][CurrentLanguage]

        if Localizated then
            return Localizated
        else
            print(`LocalizationService: Для {name} нету локали {CurrentLanguage}; будет использоваться локаль en.`)
            return LocalizationService[name][`en`]
        end
    else
        return `{name} not found in LocalizationService!`
    end
end

return LocalizationService