import xss from 'xss';

export const sanitize = (data: any) => {
    if (Array.isArray(data)) {
        return data.map(item => sanitize(item));
    }
    if (typeof data === 'object' && data !== null) {
        return Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = sanitize(value);
            return acc;
        }, {});
    }
    if (typeof data === 'string') {
        return xss(data); // sanitize string inputs to prevent XSS
    }
    return data; // return as is for other data types
};
