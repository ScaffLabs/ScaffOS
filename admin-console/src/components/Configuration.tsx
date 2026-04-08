import React, { useEffect, useState } from 'react';
import { postConfiguration } from '../services/ServiceClient';
import { ConfigurationItem, ConfigurationItemSchema } from '../types';
import { ValidationError } from '../errors/CustomErrors';

const Configuration: React.FC = () => {
    const [key, setKey] = useState<string>('');
    const [value, setValue] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            const configItem: ConfigurationItem = { key, value };
            ConfigurationItemSchema.parse(configItem);
            setLoading(true);
            await postConfiguration(configItem.key, configItem.value);
            setSuccessMessage('Configuration created successfully!');
            setKey('');
            setValue('');
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.message);
            } else if (err.response) {
                setError('Error: ' + err.response.data.error);
            } else {
                setError('Failed to create configuration. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Configuration Management</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="key">Key:</label>
                    <input
                        type="text"
                        id="key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="value">Value:</label>
                    <input
                        type="text"
                        id="value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Configuration'}</button>
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
        </div>
    );
};

export default Configuration;