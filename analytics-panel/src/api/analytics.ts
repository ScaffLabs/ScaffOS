import axios from 'axios';
import { ServiceError } from '../errors/customErrors';
import { logError } from '../utils/errorLogger';

const fetchComparisonData = async (strategyA: string, strategyB: string) => {
    try {
        const response = await axios.get(`/api/compare?strategyA=${strategyA}&strategyB=${strategyB}`);
        return response.data;
    } catch (error) {
        logError(error, 'Comparing strategies');
        throw new ServiceError('Failed to fetch comparison data: ' + error.message);
    }
};

export { fetchComparisonData };