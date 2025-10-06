import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
{ /* Search */ }
_jsx(TextField, { fullWidth: true, size: "small", placeholder: "\u041F\u043E\u0448\u0443\u043A \u0430\u0433\u0435\u043D\u0442\u0456\u0432...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), sx: {
        mt: 1,
        mb: 2,
        '& .MuiInputBase-root': {
            color: nexusColors.frost,
            borderColor: nexusColors.quantum
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: nexusColors.quantum,
            },
            '&:hover fieldset': {
                borderColor: nexusColors.sapphire,
            },
        }
    }, InputProps: {
        endAdornment: searchQuery && (_jsx(IconButton, { onClick: () => setSearchQuery(''), size: "small", children: _jsx(CloseIcon, { fontSize: "small", sx: { color: nexusColors.frost } }) }))
    } });
{ /* Agents list */ }
_jsx(Box, { sx: { maxHeight: 300, overflowY: 'auto', pr: 1 }, children: filteredAgents.map(agent => (_jsxs(Box, { sx: {
            display: 'flex',
            alignItems: 'center',
            mb: 1.5,
            p: 1,
            borderRadius: 1,
            bgcolor: 'rgba(30, 40, 50, 0.4)',
            borderLeft: `3px solid ${statusColors[agent.status]}`,
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'translateX(-3px)',
                bgcolor: 'rgba(40, 50, 60, 0.6)'
            }
        }, children: [_jsx(Box, { sx: {
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: statusColors[agent.status],
                    mr: 2,
                    flexShrink: 0
                } }), _jsxs(Box, { sx: { flexGrow: 1, minWidth: 0 }, children: [_jsx(Typography, { sx: {
                            color: nexusColors.frost,
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }, children: agent.name }), _jsxs(Typography, { variant: "body2", sx: {
                            color: nexusColors.quantum,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }, children: [agent.type, " \u2022 \u041E\u0441\u0442\u0430\u043D\u043D\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u0456\u0441\u0442\u044C: ", agent.lastActive.toLocaleTimeString()] })] }), _jsx(IconButton, { size: "small", sx: { color: nexusColors.quantum }, children: _jsx(MoreVertIcon, {}) })] }, agent.id))) });
