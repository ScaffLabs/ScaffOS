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
        e.preventDefault(); // Prevent default form submission behavior
        setError(null);
        setSuccessMessage(null);

        try {
            const configItem: ConfigurationItem = { key, value };
            // Validate the item using Zod schema
            ConfigurationItemSchema.parse(configItem);
            setLoading(true); // Set loading state
            await postConfiguration(configItem.key, configItem.value);
            setSuccessMessage('Configuration created successfully!'); // Set success message
            setKey(''); // Reset key input
            setValue(''); // Reset value input
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.message); // Set the error message from validation
            } else {
                setError('Failed to create configuration. Please try again.'); // Set a generic error message
            }
        } finally {
            setLoading(false); // Reset loading state
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