import express from 'express';
import { InMemoryStore } from './storage/InMemoryStore';
import { migrateData, seedData } from './storage/migrations';
import { Position } from './types';

const app = express();
app.use(express.json());

const positionStore = new InMemoryStore<Position>();

migrateData(positionStore, seedData());

app.get('/api/positions', (req, res) => {
    const positions = Object.values(positionStore); // Assuming the store has a method to get all records
    res.status(200).json(positions);
});

app.post('/api/positions', (req, res) => {
    const newPosition = req.body;
    positionStore.create(newPosition);
    res.status(201).json({ message: 'Position created successfully', position: newPosition });
});

app.put('/api/positions/:id', (req, res) => {
    const { id } = req.params;
    const updatedPosition = positionStore.update(id, req.body);
    if (updatedPosition) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Position not found' });
    }
});

app.delete('/api/positions/:id', (req, res) => {
    const { id } = req.params;
    const deleted = positionStore.delete(id);
    if (deleted) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Position not found' });
    }
});

export default app;
