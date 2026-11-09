local LocalizationService = {
    WelcomeText = {
        ru = `ПРИВЕТ`,
        en = `HEJ`
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
            return `{CurrentLanguage} not found in LocalizationService.[{name}]!`
        end
    else
        return `{name} not found in LocalizationService!`
    end
end

return LocalizationService