local LocalizationService = {
    SupportedLanguages = {
        `ru`, `en`, 
    },
    
    [`ru`] = {
        ru = `Русский`,
        en = `Russian`,
    },
    [`en`] = {
        ru = `Английский`,
        en = `English`,
    },
    [`da`] = {
        ru = `Датский [в планах]`,
        en = `Danish [planned]`
    },
    [`ua`] = {
        ru = `Украинский [в планах]`,
        en = `Ukranian [planned]`,
    },
    [`language`] = {
        ru = `Язык`,
        en = `Language`,
    },
    [`language_not_supported`] = {
        en = `Your language isn’t officially supported yet, so all content will be shown in English. You can view the supported languages anytime by clicking Language at the top.`,
    },
    [`404_title`] = {
        ru = `Упс... Ошибка 404`,
        en = `Oops... 404 error`,
    },
    [`404_subtitle`] = {
        ru = `Кажется ты забрёл куда то не туда.`,
        en = `Looks like you've wandered off the beaten path.`,
    },
    [`404_backToMainPage`] = {
        ru = `Вернуться на Главную`,
        en = `Back to Home`,
    },
    [`main`] = {
        ru = `Главная`,
        en = `Home`,
    },
    [`welcome_title`] = {
        ru = `Привет`,
        en =  `Hello`,
        da = `Hej`,
    },
    [`welcome_subtitle`] = {
        ru = `тест`,
        en = `test`,
    },
    [`blog_button`] = {
        ru = `Блог`,
        en = `Blog`,
    },
    [`blog_title`] = {
        ru = `Добро пожаловать в <b>Блог</b>`,
        en = `Welcome to <b>Blog</b>`,
    },
    [`blog_subtitle`] = {
        ru = `Тут время от времени я буду публиковать что нибудь. :0`,
        en = `From time to time, I’ll post something here :0. All text will be shown in its original form (that is, in Russian).`,
    },
}

function LocalizationService.Get(name:string)
    local CurrentLanguage:string = Client.Get(`PinnedLanguage`) or Client.Language

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