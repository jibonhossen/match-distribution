// Prize Configuration Types

export type PrizeRuleType = 'equal_share' | 'rank_kill' | 'fixed_list';

export interface BasePrizeRule {
    id: string; // UUID from Supabase
    name: string;
    type: PrizeRuleType;
    created_at?: string;
}

export interface EqualShareRule extends BasePrizeRule {
    type: 'equal_share';
    config: {
        total_prize: number;
    };
}

export interface RankKillRule extends BasePrizeRule {
    type: 'rank_kill';
    config: {
        per_kill: number;
        rank_rewards: Record<string, number>; // "1": 500, "2": 300 (Key is rank as string)
    };
}

export interface FixedListRule extends BasePrizeRule {
    type: 'fixed_list';
    config: {
        prizes: number[]; // Index 0 = Rank 1, Index 1 = Rank 2, etc.
    };
}

export type PrizeRule = EqualShareRule | RankKillRule | FixedListRule;


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

export interface MatchHistoryLog {
    match_id: string; // The game match ID
    rule_id: string; // The rule used
    title: string;
    completed_at: string;
    winners: Winner[];
}
