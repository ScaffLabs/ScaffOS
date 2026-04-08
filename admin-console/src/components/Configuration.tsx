import React, { useEffect, useState } from 'react';
import { postConfiguration, fetchConfigurations, updateConfiguration, deleteConfiguration } from '../services/ServiceClient';
import { ConfigurationItem, ConfigurationItemSchema } from '../types';
import { ValidationError } from '../errors/CustomErrors';

const Configuration: React.FC = () => {
    const [key, setKey] = useState<string>('');
    const [value, setValue] = useState<string>('');
    const [configurations, setConfigurations] = useState<ConfigurationItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchAllConfigurations = async () => {
        setLoading(true);
        try {
            const configs = await fetchConfigurations();
            setConfigurations(configs);
        } catch (err) {
            setError('Error fetching configurations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllConfigurations();
    }, []);

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
            fetchAllConfigurations();
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.message);
            } else {
                setError('Failed to create configuration. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (key: string) => {
        setLoading(true);
        try {
            await deleteConfiguration(key);
            setSuccessMessage('Configuration deleted successfully!');
            fetchAllConfigurations();
        } catch (err) {
            setError('Failed to delete configuration.');
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
            <h2>Existing Configurations:</h2>
            <ul>
                {configurations.map(config => (
                    <li key={config.key}>
                        {config.key}: {config.value} 
                        <button onClick={() => handleDelete(config.key)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Configuration;