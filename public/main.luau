local CoreUI = Instance.new(`ScreenGui`)
local LocalizationService = require(`LocalizationService`)

local WelcomeTitle = Instance.new(`TextLabel`)
WelcomeTitle.Parent = CoreUI
WelcomeTitle.Font = `Montserrat`
WelcomeTitle.AutomaticSize = Enum.AutomaticSize.XY
WelcomeTitle.TextSize = 30
WelcomeTitle.Text = `your language is {Client.Language}`