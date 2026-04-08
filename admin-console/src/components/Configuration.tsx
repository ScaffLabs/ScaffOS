import React, { useEffect, useState } from 'react';
import { postConfiguration } from '../services/ServiceClient';
import { ConfigurationItem } from '../types';

const Configuration: React.FC = () => {
    const [key, setKey] = useState<string>(''); // State for configuration key
    const [value, setValue] = useState<string>(''); // State for configuration value
    const [error, setError] = useState<string | null>(null); // Error message state
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // Success message state

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission behavior
        setError(null); // Reset error message
        setSuccessMessage(null); // Reset success message

        try {
            const configItem: ConfigurationItem = { key, value }; // Create configuration item object
            await postConfiguration(configItem.key, configItem.value); // Post configuration to the server
            setSuccessMessage('Configuration created successfully!'); // Set success message on successful post
            setKey(''); // Reset key input
            setValue(''); // Reset value input
        } catch (err) {
            setError('Failed to create configuration. Please try again.'); // Set error message if post fails
        }
    };

    return (
        <div>
            <h1>Configuration Management</h1>
            <form onSubmit={handleSubmit}> // Form for configuration input
                <div>
                    <label htmlFor="key">Key:</label>
                    <input
                        type="text"
                        id="key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)} // Update key state on input change
                        required
                    />
                </div>
                <div>
                    <label htmlFor="value">Value:</label>
                    <input
                        type="text"
                        id="value"
                        value={value}
                        onChange={(e) => setValue(e.target.value)} // Update value state on input change
                        required
                    />
                </div>
                <button type="submit">Create Configuration</button>
            </form>
            {error && <div style={{ color: 'red' }}>{error}</div>} // Display error message if exists
            {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>} // Display success message if exists
        </div>
    );
};

export default Configuration;