import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './db';
import { PrizeRule, MatchHistoryLog } from './types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ================== PRIZE RULES ==================

// GET /api/rules - Fetch all configured rules
app.get('/api/rules', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('prize_rules')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/rules - Create a new rule
app.post('/api/rules', async (req, res) => {
    try {
        const rule: Omit<PrizeRule, 'id' | 'created_at'> = req.body;

        // Basic validation (can be enhanced with Zod)
        if (!rule.name || !rule.type || !rule.config) {
            return res.status(400).json({ error: 'Missing defined fields' });
        }

        const { data, error } = await supabase
            .from('prize_rules')
            .insert([rule])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ================== MATCH HISTORY ==================

// GET /api/history - Fetch recent match history (for Main App)
app.get('/api/history', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const { data, error } = await supabase
            .from('match_history')
            .select('*')
            .order('completed_at', { ascending: false })
            .limit(Number(limit));

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/history - Log a completed match (Called by Admin App after distribution)
app.post('/api/history', async (req, res) => {
    try {
        const log: MatchHistoryLog = req.body;

        // Basic validation
        if (!log.match_id || !log.winners) {
            return res.status(400).json({ error: 'Invalid history log' });
        }

        const { data, error } = await supabase
            .from('match_history')
            .insert([log])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Health Check
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'prize-history-server' });
});

app.listen(port, () => {
    console.log(`Prize History Server running on port ${port}`);
});
