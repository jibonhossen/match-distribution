// Prize Configuration Types

export type PrizeRuleType = 'rank_kill';

export interface BasePrizeRule {
    id: string; // UUID from Supabase
    name: string;
    type: PrizeRuleType;
    created_at?: string;
}

export interface RankKillRule extends BasePrizeRule {
    type: 'rank_kill';
    config: {
        per_kill: number;
        rank_rewards: Record<string, number>; // "1": 500, "2": 300 (Key is rank as string)
    };
}

export type PrizeRule = RankKillRule;


// Match Result & History Types

export interface ParticipantResult {
    uid: string;
    username: string;
    teamId?: string; // If null, solo
    kills: number;
    rank: number;
}

export interface Winner {
    uid: string;
    amount: number;
    breakdown: string; // "Rank 1 (500) + 5 Kills (50)"
    position?: number;
}

// Match Template Types
export interface MatchTemplate {
    id: string;
    name: string;
    created_at?: string;
    title: string;
    match_type: 'Solo' | 'Duo' | 'Squad';
    category: string;
    map: string;
    entry_fee: number;
    prize_pool: number;
    per_kill: number;
    total_slots: number;
    prize_details: string;
}

export interface MatchHistoryLog {
    match_id: string; // The game match ID
    rule_id: string; // The rule used
    title: string;
    completed_at: string;
    winners: Winner[];
}
