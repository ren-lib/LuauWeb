local LocalizationService = {
    SupportedLanguages = {
        `ru`, `en`, 
    },
    NotFullSupportedLanguages = {
        --[[`ua`, --]]`da`,
    },
    
    [`supported_languages`] = {
        ru = `Поддерживаемые языки`,
        en = `Supported languages`,
    },
    [`not_full_supported_languages`] = {
        ru = `Частично поддерживаемые языки`,
        en = `Partially supported languages`,
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
        ru = `Датский`,
        en = `Danish`
    },
    [`ua`] = {
        ru = `Украинский`,
        en = `Ukranian`,
    },
    [`404_title`] = {
        ru = `УПС...`,
        en = `OOPS...`,
    },
    [`404_subtitle`] = {
        ru = `Страница {Client.PagePath} не существует, кажется ты забрёл куда то не туда.`,
        en = `Page {Client.PagePath} not exits, looks like you've wandered off the beaten path.`,
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
        ru = `ПРИВЕТ, МИР`,
        en =  `HELLO, WORLD`,
        da = `HEJ`,
    },
    [`about_website_button`] = {
        ru = `О сайте`,
        en = `About website`,
    },
    [`welcome_subtitle`] = {
        ru = `Я создаю игры на <a href="https://roblox.com">Роблоксе</a>. Ты можешь знать меня под разными псевдонимами, например..\n<i>рен, ренатка, pearl, renTheTruth и так далее...</i>\n\nНа этом сайте ты можешь узнать больше обо мне: например, посмотреть <a href="http://renTheTruth.ru/portfolio">портфолио</a>, или <a href="http://renTheTruth.ru/blog">блог</a>.\nСайт все еще разрабатывается. Даже базовые страницы могут не существовать :)`,
        en = `I make games on <a href="https://roblox.com">Roblox</a>. You might know me by different aliases, such as…\n<i>ren, renatka, pearl, renTheTruth, and so on…</i>\n\nOn this site, you can learn more about me - for example, view my <a href="http://renTheTruth.ru/portfolio">portfolio</a> or <a href="http://renTheTruth.ru/blog">blog</a>.\nThe site is still under development. Even basic pages might not exist yet :)`,
    },
    [`blog_button`] = {
        ru = `Блог`,
        en = `Blog`,
    },
    [`blog_title`] = {
        ru = `ДОБРО ПОЖАЛОВАТЬ В <b>БЛОГ</b>`,
        en = `WELCOME TO <b>BLOG</b>`,
    },
    [`blog_subtitle`] = {
        ru = `Тут время от времени я буду публиковать что нибудь.`,
        en = `From time to time, I’ll post something here. All text will be shown in its original form (that is, in Russian).`,
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