require(`Pages/corePage`)()

local CurrentPagePath = Client.PagePath

if CurrentPagePath == `/` then
    CurrentPagePath = `main`
end

local Success, Result = pcall(function()
    return require(`Pages/{CurrentPagePath}`)
end)

if Success then
    require(`Pages/{CurrentPagePath}`)()
else
    if Result:find(`ModuleNotExists`, 1, true) then
        require(`Pages/404`)()
    else
        require(`Pages/page_broken`)(Result)
    end
end