export type GameData = {
  events: Event[];
  game_settings: GameSettings;
  phases: Phase[];
  teams: Team[];
  total_players: number;
  elements: Element[];
  element_stats: ElementStat[];
  element_types: ElementType[];
};

export type ElementStat = {
  label: string;
  name: string;
};

export type ElementType = {
  id: number;
  plural_name: string;
  plural_name_short: string;
  singular_name: string;
  singular_name_short: string;
  squad_select: number;
  squad_min_select: null;
  squad_max_select: null;
  squad_min_play: number;
  squad_max_play: number;
  ui_shirt_specific: boolean;
  sub_positions_locked: number[];
  element_count: number;
};

export type Element = {
  chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null;
  code: number;
  cost_change_event: number;
  cost_change_event_fall: number;
  cost_change_start: number;
  cost_change_start_fall: number;
  dreamteam_count: number;
  element_type: number;
  ep_next: string;
  ep_this: string;
  event_points: number;
  first_name: string;
  form: string;
  id: number;
  in_dreamteam: boolean;
  news: string;
  news_added: Date | null;
  now_cost: number;
  photo: string;
  points_per_game: string;
  second_name: string;
  selected_by_percent: string;
  special: boolean;
  squad_number: null;
  status: Status;
  team: number;
  team_code: number;
  total_points: number;
  transfers_in: number;
  transfers_in_event: number;
  transfers_out: number;
  transfers_out_event: number;
  value_form: string;
  value_season: string;
  web_name: string;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  starts: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  influence_rank: number;
  influence_rank_type: number;
  creativity_rank: number;
  creativity_rank_type: number;
  threat_rank: number;
  threat_rank_type: number;
  ict_index_rank: number;
  ict_index_rank_type: number;
  corners_and_indirect_freekicks_order: number | null;
  corners_and_indirect_freekicks_text: string;
  direct_freekicks_order: number | null;
  direct_freekicks_text: string;
  penalties_order: number | null;
  penalties_text: string;
  expected_goals_per_90: number;
  saves_per_90: number;
  expected_assists_per_90: number;
  expected_goal_involvements_per_90: number;
  expected_goals_conceded_per_90: number;
  goals_conceded_per_90: number;
  now_cost_rank: number;
  now_cost_rank_type: number;
  form_rank: number;
  form_rank_type: number;
  points_per_game_rank: number;
  points_per_game_rank_type: number;
  selected_rank: number;
  selected_rank_type: number;
  starts_per_90: number;
  clean_sheets_per_90: number;
};

export enum Status {
  A = 'a',
  D = 'd',
  I = 'i',
  N = 'n',
  S = 's',
  U = 'u',
}

export type Event = {
  id: number;
  name: string;
  deadline_time: Date;
  release_time: null;
  average_entry_score: number;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_entry: number | null;
  deadline_time_epoch: number;
  deadline_time_game_offset: number;
  highest_score: number | null;
  is_previous: boolean;
  is_current: boolean;
  is_next: boolean;
  cup_leagues_created: boolean;
  h2h_ko_matches_created: boolean;
  ranked_count: number;
  chip_plays: ChipPlay[];
  most_selected: number | null;
  most_transferred_in: number | null;
  top_element: number | null;
  top_element_info: TopElementInfo | null;
  transfers_made: number;
  most_captained: number | null;
  most_vice_captained: number | null;
};

export type ChipPlay = {
  chip_name: string;
  num_played: number;
};

export type TopElementInfo = {
  id: number;
  points: number;
};

export type GameSettings = {
  league_join_private_max: number;
  league_join_public_max: number;
  league_max_size_public_classic: number;
  league_max_size_public_h2h: number;
  league_max_size_private_h2h: number;
  league_max_ko_rounds_private_h2h: number;
  league_prefix_public: string;
  league_points_h2h_win: number;
  league_points_h2h_lose: number;
  league_points_h2h_draw: number;
  league_ko_first_instead_of_random: boolean;
  cup_start_event_id: null;
  cup_stop_event_id: null;
  cup_qualifying_method: null;
  cup_type: null;
  featured_entries: any[];
  percentile_ranks: number[];
  squad_squadplay: number;
  squad_squadsize: number;
  squad_team_limit: number;
  squad_total_spend: number;
  ui_currency_multiplier: number;
  ui_use_special_shirts: boolean;
  ui_special_shirt_exclusions: any[];
  stats_form_days: number;
  sys_vice_captain_enabled: boolean;
  transfers_cap: number;
  transfers_sell_on_fee: number;
  max_extra_free_transfers: number;
  league_h2h_tiebreak_stats: string[];
  timezone: string;
};

export type Phase = {
  id: number;
  name: string;
  start_event: number;
  stop_event: number;
  highest_score: number | null;
};

export type Team = {
  code: number;
  draw: number;
  form: null;
  id: number;
  loss: number;
  name: string;
  played: number;
  points: number;
  position: number;
  short_name: string;
  strength: number;
  team_division: null;
  unavailable: boolean;
  win: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
  pulse_id: number;
};

export type User = {
  id: number;
  joined_time: Date;
  started_event: number;
  favourite_team: number;
  player_first_name: string;
  player_last_name: string;
  player_region_id: number;
  player_region_name: string;
  player_region_iso_code_short: string;
  player_region_iso_code_long: string;
  years_active: number;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
  current_event: number;
  leagues: Leagues;
  name: string;
  name_change_blocked: boolean;
  entered_events: number[];
  kit: null;
  last_deadline_bank: number;
  last_deadline_value: number;
  last_deadline_total_transfers: number;
};

export type Leagues = {
  classic: Classic[];
  h2h: any[];
  cup: Cup;
  cup_matches: any[];
};

export type Classic = {
  id: number;
  name: string;
  short_name: null | string;
  created: Date;
  closed: boolean;
  rank: null;
  max_entries: null;
  league_type: LeagueType;
  scoring: Scoring;
  admin_entry: number | null;
  start_event: number;
  entry_can_leave: boolean;
  entry_can_admin: boolean;
  entry_can_invite: boolean;
  has_cup: boolean;
  cup_league: null;
  cup_qualified: null;
  rank_count: number | null;
  entry_percentile_rank: number | null;
  active_phases: ActivePhase[];
  entry_rank: number;
  entry_last_rank: number;
};

export type ActivePhase = {
  phase: number;
  rank: number;
  last_rank: number;
  rank_sort: number;
  total: number;
  league_id: number;
  rank_count: number | null;
  entry_percentile_rank: number | null;
};

export enum LeagueType {
  S = 's',
  X = 'x',
}

export enum Scoring {
  C = 'c',
}

export type Cup = {
  matches: any[];
  status: CupStatus;
  cup_league: null;
};

export type CupStatus = {
  qualification_event: null;
  qualification_numbers: null;
  qualification_rank: null;
  qualification_state: null;
};

export type UserPicks = {
  active_chip: null;
  automatic_subs: any[];
  entry_history: { [key: string]: number };
  picks: Pick[];
};

export type Pick = {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
};

export type Player = {
  id: number;
  number: number;
  name: string;
  position: string;
  price: number;
  points: number;
  form: string;
  formRating: number;
  fixtureRating: number;
  team: string;
  inFormScore: number;
};

export type PlayerDetails = Player & {
  firstName: string;
  news: string;
  newsAdded: Date | null;
  secondName: string;
  selectedByPercent: string;
  minutes: number;
  goalsScored: number;
  expectedGoals: string;
  expectedGoalsPer90: number;
  assists: number;
  expectedAssists: string;
  expectedAssistsPer90: number;
  goalsConceded: number;
  expectedGoalsConceded: string;
  expectedGoalsConcededPer90: number;
  expectedGoalInvolvements: string;
  expectedGoalInvolvementsPer90: number;
};

export type PlayerGameweek = Player & {
  captain: boolean;
  fixture: string;
  pointsGW: number;
};

export type PlayerPreviousFixture = {
  gameweek: number;
  fixture: string;
  fixtureDiff: number;
  points: number;
  formRating: number;
};

export type PlayerNextFixture = {
  gameweek: number;
  fixture: string;
  fixtureDiff: number;
};

export type PlayerWithFixtures = Player & {
  fixtures: PlayerNextFixture[];
};

export type Fixture = {
  code: number;
  event: number;
  finished: boolean;
  finished_provisional: boolean;
  id: number;
  kickoff_time: Date;
  minutes: number;
  provisional_start_time: boolean;
  started: boolean;
  team_a: number;
  team_a_score: number | null;
  team_h: number;
  team_h_score: number | null;
  stats: Stat[];
  team_h_difficulty: number;
  team_a_difficulty: number;
  pulse_id: number;
};

export type Stat = {
  identifier: string;
  a: StatData[];
  h: StatData[];
};

export type StatData = {
  value: number;
  element: number;
};

export type PlayerSummary = {
  fixtures: PlayerSummaryFixture[];
  history: History[];
  history_past: HistoryPast[];
};

export type PlayerSummaryFixture = {
  id: number;
  code: number;
  team_h: number;
  team_h_score: null;
  team_a: number;
  team_a_score: null;
  event: number;
  finished: boolean;
  minutes: number;
  provisional_start_time: boolean;
  kickoff_time: Date;
  event_name: string;
  is_home: boolean;
  difficulty: number;
};

export type History = {
  element: number;
  fixture: number;
  opponent_team: number;
  total_points: number;
  was_home: boolean;
  kickoff_time: Date;
  team_h_score: number;
  team_a_score: number;
  round: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  starts: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  value: number;
  transfers_balance: number;
  selected: number;
  transfers_in: number;
  transfers_out: number;
};

export type HistoryPast = {
  season_name: string;
  element_code: number;
  start_cost: number;
  end_cost: number;
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  starts: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
};

export type SearchParams = {
  start: number;
  size: number;
  filters: string;
  globalFilter: string;
  sorting: string;
};
