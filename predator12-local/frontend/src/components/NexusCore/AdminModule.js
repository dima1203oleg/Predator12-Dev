import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Typography } from '@mui/material';
import { nexusColors } from '../../theme/nexusTheme';
const AdminModule = () => {
    return (_jsxs(Box, { sx: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: nexusColors.crimson,
        }, children: [_jsx(Typography, { variant: "h3", sx: { mb: 2 }, children: "\u0421\u0432\u044F\u0442\u0438\u043B\u0438\u0449\u0435 \u0410\u0440\u0445\u0456\u0442\u0435\u043A\u0442\u043E\u0440\u0430" }), _jsx(Typography, { variant: "body1", children: "\u041F\u0430\u043D\u0435\u043B\u044C \u0430\u0434\u043C\u0456\u043D\u0456\u0441\u0442\u0440\u0443\u0432\u0430\u043D\u043D\u044F \u0443 \u0440\u043E\u0437\u0440\u043E\u0431\u0446\u0456..." })] }));
};
export default AdminModule;
