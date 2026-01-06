import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './db';
import { PrizeRule, MatchHistoryLog, MatchTemplate } from './types';

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

// PUT /api/rules/:id - Update an existing rule
app.put('/api/rules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove id and created_at from updates if present
        delete updates.id;
        delete updates.created_at;

        if (!updates.name || !updates.type || !updates.config) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('prize_rules')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/rules/:id - Delete a rule
app.delete('/api/rules/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('prize_rules')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Rule deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ================== MATCH TEMPLATES ==================

// GET /api/templates - Fetch all templates
app.get('/api/templates', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('match_templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/templates - Create a new template
app.post('/api/templates', async (req, res) => {
    try {
        const template: Omit<MatchTemplate, 'id' | 'created_at'> = req.body;

        // Basic validation
        if (!template.name || !template.title || !template.match_type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('match_templates')
            .insert([template])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/templates/:id - Update an existing template
app.put('/api/templates/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove id and created_at from updates if present
        delete updates.id;
        delete updates.created_at;

        const { data, error } = await supabase
            .from('match_templates')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/templates/:id - Delete a template
app.delete('/api/templates/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('match_templates')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Template deleted successfully' });
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

// GET /api/history/user/:uid - Fetch history for specific user
app.get('/api/history/user/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const { limit = 20 } = req.query;

        // Use JSON containment operator to find rows where winners array contains an object with this uid
        const { data, error } = await supabase
            .from('match_history')
            .select('*')
            .contains('winners', JSON.stringify([{ uid }])) // Query JSONB column
            .order('completed_at', { ascending: false })
            .limit(Number(limit));

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error('Error fetching user history:', error);
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
