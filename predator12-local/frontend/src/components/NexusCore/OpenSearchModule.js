import { jsx as _jsx } from "react/jsx-runtime";
import OpenSearchWrapper from '../nexus_visuals/OpenSearchWrapper';
export const OpenSearchModule = () => {
    const dashboardId = process.env.REACT_APP_OPENSEARCH_DEFAULT_DASHBOARD || 'Overview';
    const jwtToken = localStorage.getItem('jwt') || '';
    return (_jsx(OpenSearchWrapper, { dashboardId: dashboardId, jwtToken: jwtToken }));
};
