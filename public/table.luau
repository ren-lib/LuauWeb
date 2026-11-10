-- Небольшие вспомогательные операции для таблиц.
-- Стандартная глобальная библиотека Luau `table` остаётся доступна отдельно.
local Table = {}

function Table.ShallowCopy(source)
    assert(type(source) == `table`, `Table.ShallowCopy expects a table`)

    local copy = {}
    for key, value in source do
        copy[key] = value
    end
    return copy
end

function Table.DeepCopy(source, seen)
    assert(type(source) == `table`, `Table.DeepCopy expects a table`)

    seen = seen or {}
    if seen[source] then
        return seen[source]
    end

    local copy = {}
    seen[source] = copy
    for key, value in source do
        local copiedKey = if type(key) == `table` then Table.DeepCopy(key, seen) else key
        local copiedValue = if type(value) == `table` then Table.DeepCopy(value, seen) else value
        copy[copiedKey] = copiedValue
    end
    return copy
end

function Table.Merge(first, second)
    assert(type(first) == `table` and type(second) == `table`, `Table.Merge expects two tables`)

    local merged = Table.ShallowCopy(first)
    for key, value in second do
        merged[key] = value
    end
    return merged
end

function Table.Count(source)
    assert(type(source) == `table`, `Table.Count expects a table`)

    local count = 0
    for _ in source do
        count += 1
    end
    return count
end

return Table
