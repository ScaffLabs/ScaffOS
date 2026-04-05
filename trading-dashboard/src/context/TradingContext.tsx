import React, { createContext, useContext, useState } from 'react';

const TradingContext = createContext<any>(null);

export const TradingContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tradingState, setTradingState] = useState({});

    return (
        <TradingContext.Provider value={{ tradingState, setTradingState }}>
            {children}
        </TradingContext.Provider>
    );
};

export const useTradingContext = () => useContext(TradingContext);