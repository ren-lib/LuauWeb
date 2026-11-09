local LocalizationService = {
    welcome = {
        ru = `Этот сайт написан на Luau.`,
        en = `This website is built with Luau.`,
        da = `Denne hjemmeside er bygget med Luau.`,
    },
    welcomeSubtitle = {
        ru = `Удивлен? Скоро тут появится мое портфолио, наберись терпения...`,
        en = `Surprised? My portfolio will be coming soon. Stay tuned and be patient...`,
        da = `Overrasket? Min portfolio kommer snart. Hav lidt tålmodighed...`,
    },
    debris1 = {
        ru = `твоя текущая локаль браузера: {Client.Language}`,
        en = `your current browser locale: {Client.Language}`,
    },
    debris2 = {
        ru = `твой размер экрана: {Client.ScreenSize.X}x{Client.ScreenSize.Y}`,
        en = `your current screen size: {Client.ScreenSize.X}x{Client.ScreenSize.Y}`,
    },
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