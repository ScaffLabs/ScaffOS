import React, { useEffect, useState } from 'react';
import { postConfiguration, fetchConfigurations, deleteConfiguration } from '../services/ServiceClient';
import { ConfigurationItem, ConfigurationItemSchema } from '../types';
import { ValidationError } from '../errors/CustomErrors';

const Configuration: React.FC = () => {
    const [key, setKey] = useState<string>('');
    const [value, setValue] = useState<string>('');
    const [configurations, setConfigurations] = useState<ConfigurationItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetches all existing configurations from the server
    const fetchAllConfigurations = async () => {
        setLoading(true);
        try {
            const configs = await fetchConfigurations(); // Get configurations from the service
            setConfigurations(configs); // Set them in local state
        } catch (err) {
            setError(`Error fetching configurations: ${err.message}`); // Handle errors gracefully
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    useEffect(() => {
        fetchAllConfigurations(); // Call fetch on component mount
    }, []);

    // Validates the input fields before submitting the form
    const validateInputs = () => {
        if (!key.trim()) throw new ValidationError('Key cannot be empty'); // Ensure key is not empty
        if (!value.trim()) throw new ValidationError('Value cannot be empty'); // Ensure value is not empty
    };

    // Handles form submission to create a new configuration
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission
        setError(null); // Reset errors
        setSuccessMessage(null); // Reset success message

        try {
            validateInputs(); // Validate inputs before proceeding
            const configItem: ConfigurationItem = { key: key as ConfigurationItem['key'], value };
            ConfigurationItemSchema.parse(configItem); // Validate with Zod schema
            setLoading(true); // Set loading state
            await postConfiguration(configItem); // Make API call to create configuration
            setSuccessMessage('Configuration created successfully!'); // Inform user of success
            setKey(''); // Reset key input
            setValue(''); // Reset value input
            fetchAllConfigurations(); // Refresh configuration list
        } catch (err) {
            if (err instanceof ValidationError) {
                setError(err.message); // Handle validation errors
            } else {
                setError(`Failed to create configuration: ${err.message}`); // Handle other errors
            }
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    // Handles deletion of a configuration
    const handleDelete = async (key: string) => {
        setLoading(true); // Set loading state
        try {
            await deleteConfiguration(key); // Make API call to delete configuration
            setSuccessMessage('Configuration deleted successfully!'); // Inform user of success
            fetchAllConfigurations(); // Refresh configuration list
        } catch (err) {
            setError(`Failed to delete configuration: ${err.message}`); // Handle errors
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
            <h2>Existing Configurations:</h2>
            <ul>
                {configurations.map((config) => (
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