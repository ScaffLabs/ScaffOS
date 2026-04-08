import axios from 'axios';
import config from '../config';
import { ServiceError } from '../utils/errors';
import { query } from '../utils/connectionPool';

export const fetchChartData = async () => {
    try {
        const sql = 'SELECT date, price FROM chart_data ORDER BY date ASC';
        const result = await query(sql, []);
        if (!Array.isArray(result)) throw new ServiceError('Invalid data structure');
        return result;
    } catch (error) {
        throw new ServiceError('Error fetching chart data: ' + error.message);
    }
};

export const validateChartData = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
        throw new ServiceError('Chart data cannot be empty or invalid');
    }
    data.forEach(item => {
        if (typeof item.date !== 'string' || typeof item.price !== 'number') {
            throw new ServiceError('Invalid data item');
        }
    });
};

export const addChartData = async (date: string, price: number) => {
    if (typeof date !== 'string' || typeof price !== 'number') {
        throw new ServiceError('Invalid input for chart data');
    }
    try {
        const sql = 'INSERT INTO chart_data (date, price) VALUES (?, ?)';
        await query(sql, [date, price]);
    } catch (error) {
        throw new ServiceError('Error adding chart data: ' + error.message);
    }
};

export const deleteChartData = async (date: string) => {
    if (typeof date !== 'string') {
        throw new ServiceError('Invalid date input for deletion');
    }
    try {
        const sql = 'DELETE FROM chart_data WHERE date = ?';
        await query(sql, [date]);
    } catch (error) {
        throw new ServiceError('Error deleting chart data: ' + error.message);
    }
};