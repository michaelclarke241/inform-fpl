'use server';

import { getGameData, getPlayerSummary, getUserData, getUserPicksData } from '@/app/api/fpl/apim';
import { TEAM_ID, X_POINTS_PER_M } from '@/app/lib/constants';
import {
  GameData,
  PlayerGameweek,
  User,
  UserPicks,
  Element,
  Pick,
  Fixture,
  PlayerSummary,
  Team,
  History,
  PlayerDetails,
} from '@/app/types';
import { FPL_API } from '../api/fpl';
import { getPlayerDetails } from '../actions';

export async function mapPosition(positionId: number) {
  switch (positionId) {
    case 1:
      return 'GK';
    case 2:
      return 'DEF';
    case 3:
      return 'MID';
    case 4:
      return 'FWD';
    default:
      return '-';
  }
}

export async function getAverageFixtureDiff(playerId: number, gameData: GameData): Promise<number> {
  const playerSummary: PlayerSummary | null = await getPlayerSummary(playerId);
  const teams: Team[] = gameData.teams;

  let strengthTotal = 0;

  if (playerSummary) {
    const history = playerSummary?.history;

    history.forEach((historyFixture) => {
      const opponentId = historyFixture.opponent_team;
      const team = teams.find((t) => t.id === opponentId);
      if (team?.strength) {
        strengthTotal += team?.strength;
      }
    });

    if (strengthTotal > 0) {
      return strengthTotal / history.length;
    }
  }

  return 3;
}

export async function getFixture(
  playerId: number,
  gameData: GameData,
  gameweek: number,
): Promise<string> {
  const playerSummary: PlayerSummary | null = await getPlayerSummary(playerId);
  const teams: Team[] = gameData.teams;

  if (playerSummary) {
    const history = playerSummary?.history;

    const historyFixture = history.find((x) => x.round === gameweek);

    if (historyFixture) {
      const fixtureTeam = teams.find((x) => x.id === historyFixture.opponent_team) ?? null;

      if (fixtureTeam) {
        if (historyFixture.was_home) {
          return fixtureTeam.short_name;
        } else {
          return fixtureTeam.short_name.toLowerCase();
        }
      }
    }
  }

  return '';
}

export async function getTeamFromShortName(
  shortName: string,
  gameData: GameData,
): Promise<Team | null> {
  return gameData.teams.find((x) => x.short_name.toLowerCase() === shortName.toLowerCase()) ?? null;
}

export async function getTeamNameFromId(teamId: number, gameData: GameData): Promise<string> {
  return gameData.teams.find((x) => x.id === teamId)?.short_name ?? '';
}

export async function getTeamFromId(teamId: number, gameData: GameData): Promise<Team | null> {
  return gameData.teams.find((x) => x.id === teamId) ?? null;
}

/**
 * For each gameweek round calculate Adjusted Score (AS)
 * Adjusted Score (AS) = points * fixture difficulty
 * For each AS, apply Recency Weighting (AS2)
 * Recency Weighting = most recent games weighted higher
 * e.g. round 4 = 1, round 3 = 0.9, round 2 = 0.8, round 1 = 0.7
 * Then apply standard deviation (SD) to AS2
 * Form Rating = AS2_TOTAL/(numberOfGamesPlayed) - SD/10
 * @param playerId
 * @param gameData
 * @param limit
 * @returns
 */
export async function calculateFormRating(
  playerId: number,
  gameData: GameData,
  limit?: number,
): Promise<number> {
  const FDR_DIVISOR = 20;
  const RECENCY_DECREMENT = 0.1;
  const MAX_DIVISOR = 10;

  const playerSummary: PlayerSummary | null = await getPlayerSummary(playerId);
  if (!playerSummary || !playerSummary.history) {
    return 0;
  }

  const history = limit ? playerSummary.history.slice(0, limit) : playerSummary.history;
  const teams = gameData.teams;

  const adjustedScores = calculateAdjustedScores(history, teams, FDR_DIVISOR);
  if (adjustedScores.length === 0 || adjustedScores.every((score) => score === 0)) {
    return 0;
  }

  const formRating = applyRecencyWeighting(adjustedScores, RECENCY_DECREMENT);
  const divisor = Math.min(adjustedScores.length, MAX_DIVISOR);
  const sDev = standardDeviation(adjustedScores, true) / 10;

  return Math.round((formRating / divisor - sDev) * 100) / 100;
}

function calculateAdjustedScores(history: History[], teams: Team[], fdrDivisor: number): number[] {
  return history.map((fixture) => {
    const fixtureDiff = teams.find((x) => x.id === fixture.opponent_team)?.strength ?? 3;
    const fdr = 1 + fixtureDiff / fdrDivisor;
    return Math.round(fixture.total_points * fdr * 100) / 100;
  });
}

function applyRecencyWeighting(scores: number[], recencyDecrement: number): number {
  let recency = 1;
  return scores.reduce((total, score) => {
    const weightedScore = score * recency;
    recency = Math.max(0, Math.round((recency - recencyDecrement) * 10) / 10);
    return total + weightedScore;
  }, 0);
}

function standardDeviation(arr: number[], usePopulation = false): number {
  const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
  return Math.sqrt(
    arr.reduce((acc, val) => acc + (val - mean) ** 2, 0) / (arr.length - (usePopulation ? 0 : 1)),
  );
}

export async function calculateMinPrice(price: number): Promise<number> {
  if (price > 110) {
    return 80;
  }

  if (price > 90) {
    return 70;
  }

  if (price > 70) {
    return 50;
  }

  return 30;
}

export async function calculateFixtureRating(
  playerId: number,
  gameData: GameData,
  upcomingGameweeks: number = 6,
): Promise<number> {
  const MAX_RATING = 5;
  const DEFAULT_RATING = 3;
  const MIN_RATING = 1;

  const playerSummary: PlayerSummary | null = await getPlayerSummary(playerId);
  if (!playerSummary || !playerSummary.fixtures) {
    return DEFAULT_RATING; // Default to the easiest rating if no fixtures are available
  }

  const teams = gameData.teams;

  // Filter fixtures for the specified upcoming gameweeks
  const upcomingFixtures = playerSummary.fixtures.slice(0, upcomingGameweeks);

  if (upcomingFixtures.length === 0) {
    return DEFAULT_RATING; // Default to the easiest rating if no upcoming fixtures are found
  }

  // Calculate the average difficulty of the upcoming fixtures
  let totalDifficulty = 0;
  upcomingFixtures.forEach((fixture) => {
    const opponentTeam = teams.find(
      (team) => team.id === (fixture.is_home ? fixture.team_a : fixture.team_h),
    );
    const fixtureDifficulty = opponentTeam?.strength ?? DEFAULT_RATING; // Default to average strength if not found
    totalDifficulty += fixtureDifficulty;
  });

  const averageDifficulty = totalDifficulty / upcomingFixtures.length;

  // Normalize the average difficulty to a scale of 1-5
  const normalizedRating = (averageDifficulty / 5) * MAX_RATING;

  // Ensure the rating is within the bounds of 1-5 and round to 2 decimal places
  return Math.round(Math.min(Math.max(normalizedRating, MIN_RATING), MAX_RATING) * 100) / 100;
}

export async function calculateExpectedGoalsRating(
  playerId: number,
  gameData: GameData,
): Promise<number> {
  // Constants for normalization
  const MIN_EXPECTED_GOALS = 0; // Minimum expected goals or involvements
  const MAX_EXPECTED_GOALS = 1; // Maximum expected goals or involvements per 90 minutes
  const MIN_EXPECTED_CONCEDED = 0; // Minimum expected goals conceded
  const MAX_EXPECTED_CONCEDED = 2; // Maximum expected goals conceded per 90 minutes

  if (gameData) {
    try {
      // Retrieve player details
      const element = gameData.elements.find((x) => x.id == playerId);

      if (!element) {
        throw new Error('Player details not found');
      }

      // Determine the metric to use based on the player's position
      let rawRating: number;
      if (element.element_type === 1) {
        // GK: Use expectedGoalsConcededPer90 (lower is better)
        rawRating = element.expected_goals_conceded_per_90;
        // Normalize the rating (lower is better, so invert the scale)
        return Math.round(
          (1 -
            (rawRating - MIN_EXPECTED_CONCEDED) / (MAX_EXPECTED_CONCEDED - MIN_EXPECTED_CONCEDED)) *
            100,
        );
      } else if (element.element_type === 2) {
        // DEF: Combine expectedGoalsConcededPer90 (defensive) and expected_goal_involvements_per_90 (attacking)
        // We'll average the normalized defensive and attacking ratings
        const defRating =
          1 -
          (element.expected_goals_conceded_per_90 - MIN_EXPECTED_CONCEDED) /
            (MAX_EXPECTED_CONCEDED - MIN_EXPECTED_CONCEDED);
        const attRating =
          (element.expected_goal_involvements_per_90 - MIN_EXPECTED_GOALS) /
          (MAX_EXPECTED_GOALS - MIN_EXPECTED_GOALS);
        const combined = defRating + attRating; // Weighting attacking slightly higher
        return Math.round(combined * 100);
      } else if (element.element_type === 3 || element.element_type === 4) {
        // MID/FWD: Use expectedGoalInvolvementsPer90 (higher is better)
        rawRating = element.expected_goal_involvements_per_90;
        return Math.round(
          ((rawRating - MIN_EXPECTED_GOALS) / (MAX_EXPECTED_GOALS - MIN_EXPECTED_GOALS)) * 100,
        );
      } else {
        // If the position is unknown, return a default rating of 0
        return 0;
      }
    } catch (error) {
      console.error(`Error calculating Expected Goals Rating for player ${playerId}:`, error);
      return 0; // Return 0 in case of an error
    }
  }

  return 0;
}

/**
 * Calculates the "In Form" score for a player based on their price, form rating, and fixture rating.
 * The score is normalized to a scale of 1-100, where higher scores indicate better value and performance.
 *
 * The calculation considers three factors:
 * - Price: Lower prices are better, and the price is normalized and weighted.
 * - Form Rating: Higher form ratings are better, and the form rating is normalized and weighted.
 * - Fixture Rating: Easier fixtures are better, and the fixture rating is normalized and weighted.
 *
 * Each factor is assigned a weight, and the final score is computed as a weighted sum of the normalized values.
 *
 * @param price - The player's price (e.g., in millions).
 * @param formRating - The player's form rating, which reflects recent performance.
 * @param fixtureRating - The player's fixture rating, which reflects the difficulty of upcoming fixtures.
 * @param expectedGoalsRating - The player's expected goals rating, which reflects their goal-scoring/goal-conceding potential.
 * @returns A promise that resolves to the calculated "In Form" score, normalized to a scale of 1-100.
 */
export async function calculateInFormScore(
  price: number,
  formRating: number,
  fixtureRating: number,
  expectedGoalsRating: number,
): Promise<number> {
  // Constants for normalization
  const MIN_PRICE = 4.0;
  const MAX_PRICE = 15.0;
  const MAX_FORM_RATING = 10; // Approximate maximum form rating
  const MIN_FIXTURE_RATING = 1;
  const MAX_FIXTURE_RATING = 5;
  const MAX_XG_RATING = 100;

  // Normalize price (lower price is better, so invert the scale)
  const normalizedPrice = 1 - (price - MIN_PRICE) / (MAX_PRICE - MIN_PRICE);

  // Normalize formRating (higher formRating is better)
  const normalizedFormRating = formRating / MAX_FORM_RATING;

  // Normalize fixtureRating (lower fixtureRating is better, so invert the scale)
  const normalizedFixtureRating =
    1 - (fixtureRating - MIN_FIXTURE_RATING) / (MAX_FIXTURE_RATING - MIN_FIXTURE_RATING);

  // Normalize formRating (higher formRating is better)
  const normalizedXGRating = expectedGoalsRating / MAX_XG_RATING;

  // Weights for each factor (adjust these based on importance)
  const PRICE_WEIGHT = 0.2;
  const FORM_WEIGHT = 0.6;
  const FIXTURE_WEIGHT = 0.3;
  const XG_WEIGHT = 0.3;

  // Calculate the weighted player rating
  const rawPlayerRating =
    normalizedPrice * PRICE_WEIGHT +
    normalizedFormRating * FORM_WEIGHT +
    normalizedFixtureRating * FIXTURE_WEIGHT;
  normalizedXGRating * XG_WEIGHT;

  // Normalize the player rating to a scale of 1-100
  const normalizedPlayerRating = Math.round(rawPlayerRating * 100);

  // console.log(`In Form Score: ${normalizedPlayerRating} (Price: ${normalizedPrice * PRICE_WEIGHT}, Form: ${normalizedFormRating * FORM_WEIGHT}, Fixture: ${normalizedFixtureRating * FIXTURE_WEIGHT}, XG: ${normalizedXGRating * XG_WEIGHT})`);

  return normalizedPlayerRating;
}
