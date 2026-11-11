export type props = {
    parentTo:Instance?,
	title: string?,
	subTitle: string?,
	children: { Instance }?,
    listProps:{[string]:any}?,
}

local Container = require(`Container`)
local Text = require(`Text`)

local function PageContainer(props: props)
	local Children = props.children or {}

	if props.title then
		table.insert(
			Children,
			Text({
				props = { 
                    LayoutOrder = -2,
                    TextXAlignment = Enum.TextXAlignment.Left 
                },
				text = props.title,
				textSize = 45,
				font = `MontserratBlack`,
			})
		)
	end
	if props.subTitle then
		table.insert(
			Children,
			Text({
				props = { 
                    LayoutOrder = -1,
                    TextXAlignment = Enum.TextXAlignment.Left 
                },
				text = props.subTitle,
				textSize = 20,
			})
		)
	end

	table.insert(
		Children,
		Instance.new(`UIPadding`, {
			PaddingRadius = UDim.new(0, 15),
		})
	)

	local PageContainer = Container({
        parentTo = props.parentTo,
		animate = true,
		children = Children,
        listProps = props.listProps,
	})

	return PageContainer
end

return PageContainer
