'use server';

import { FPL_API } from './api/fpl';
import { POSITION } from './lib/constants';
import {
  calculateExpectedGoalsRating,
  calculateFixtureRating,
  calculateFormRating,
  calculateInFormScore,
  calculateMinPrice,
  getFixture,
  getTeamFromId,
  getTeamFromShortName,
  getTeamNameFromId,
  mapPosition,
} from './lib/utilities';
import {
  PlayerGameweek,
  Element,
  Player,
  PlayerPreviousFixture,
  PlayerNextFixture,
  PlayerDetails,
} from './types';

export async function getGameweek(): Promise<number> {
  return await FPL_API.getGameweek();
}

export async function getPlayerGameweekData(gameweek: number): Promise<PlayerGameweek[]> {
  const playersData: PlayerGameweek[] = [];
  const gameData = await FPL_API.getGameData();
  const userPicks = await FPL_API.getUserPicksData(gameweek);

  if (gameData && userPicks) {
    await Promise.all(
      userPicks.picks.map(async (pick) => {
        const player = gameData.elements.find((x) => x.id === pick.element);
        if (player) {
          const price = Math.round(player.now_cost * 10) / 100;
          const fixtureShortName = await getFixture(player.id, gameData, gameweek);
          // const opponentTeam = await getTeamFromShortName(fixtureShortName, gameData);
          const formRating = await calculateFormRating(player.id, gameData);
          const fixtureRating = await calculateFixtureRating(player.id, gameData);
          const expectedGoalsRating = await calculateExpectedGoalsRating(player.id, gameData);
          const inFormScore = await calculateInFormScore(
            price,
            formRating,
            fixtureRating,
            expectedGoalsRating,
          );

          // const form = isNaN(Number(player.form)) ? 0 : Number(player.form);

          playersData.push({
            id: player.id,
            number: pick.position,
            name: player.web_name,
            position: await mapPosition(player.element_type),
            captain: pick.is_captain,
            team: '',
            fixture: fixtureShortName,
            price: price,
            pointsGW:
              pick.multiplier > 0 ? player.event_points * pick.multiplier : player.event_points,
            points: player.total_points,
            form: player.form,
            formRating: formRating,
            fixtureRating: fixtureRating,
            inFormScore: inFormScore,
          });
        }
      }),
    );
  }

  return playersData;
}

export async function getPlayerPreviousFixtures(
  playerId: number,
  previousRounds: number,
): Promise<PlayerPreviousFixture[]> {
  const fixtures: PlayerPreviousFixture[] = [];
  const gameweek = await FPL_API.getGameweek();
  const gameData = await FPL_API.getGameData();
  const playerSummary = await FPL_API.getPlayerSummary(playerId);

  if (playerSummary && playerSummary.history) {
    await Promise.all(
      playerSummary.history.map(async (history) => {
        if (history.round > gameweek - previousRounds) {
          const price = Math.round(history.value * 10) / 100;
          const formRating = await calculateFormRating(playerId, gameData, history.round);
          const fixtureShortName = await getFixture(playerId, gameData, history.round);
          const opponentTeam = await getTeamFromShortName(fixtureShortName, gameData);
          fixtures.push({
            gameweek: history.round,
            fixture: fixtureShortName,
            fixtureDiff: opponentTeam?.strength ?? 3,
            points: history.total_points,
            formRating: formRating,
          });
        }
      }),
    );
  }
  return fixtures;
}

export async function getPlayerNextFixtures(
  playerId: number,
  nextRounds: number,
): Promise<PlayerNextFixture[]> {
  const fixtures: PlayerNextFixture[] = [];
  const gameweek = await FPL_API.getGameweek();
  const gameData = await FPL_API.getGameData();
  const playerSummary = await FPL_API.getPlayerSummary(playerId);

  if (playerSummary && playerSummary.fixtures) {
    await Promise.all(
      playerSummary.fixtures.map(async (fixture) => {
        if (fixture.event < gameweek + nextRounds) {
          //const formRating = await calculateFormRating(playerId, gameData);
          const teamId = fixture.is_home ? fixture.team_a : fixture.team_h;
          //const fixtureShortName = await getTeamNameFromId(teamId, gameData);
          const opponentTeam = await getTeamFromId(teamId, gameData);

          const teamNameToDisplay = opponentTeam ? opponentTeam.name : 'TBD';

          fixtures.push({
            gameweek: fixture.event,
            fixture: fixture.is_home
              ? teamNameToDisplay.toUpperCase()
              : teamNameToDisplay.toLowerCase(),
            fixtureDiff: fixture.difficulty,
          });
        }
      }),
    );
  }
  return fixtures;
}

export async function getPlayerDetails(playerId: number): Promise<PlayerDetails | null> {
  const gameData = await FPL_API.getGameData();

  if (gameData) {
    const element = gameData.elements.find((x) => x.id == playerId);

    if (element) {
      const position = await mapPosition(element.element_type);
      const formRating = await calculateFormRating(playerId, gameData);
      const fixtureRating = await calculateFixtureRating(playerId, gameData);
      const expectedGoalsRating = await calculateExpectedGoalsRating(playerId, gameData);
      const price = Math.round(element.now_cost * 10) / 100;
      const inFormScore = await calculateInFormScore(
        price,
        formRating,
        fixtureRating,
        expectedGoalsRating,
      );

      const teamName = await getTeamNameFromId(element.team, gameData);

      const playerDetails: PlayerDetails = {
        id: element.id,
        number: 0,
        name: element.web_name,
        position: position,
        price: price,
        points: element.total_points,
        form: element.form,
        formRating: formRating,
        fixtureRating: fixtureRating,
        team: teamName,
        inFormScore: inFormScore,
        firstName: element.first_name ?? '',
        secondName: element.second_name ?? '',
        news: element.news ?? '',
        newsAdded: element.news_added ? new Date(element.news_added) : null,
        selectedByPercent: element.selected_by_percent ?? '0',
        minutes: element.minutes ?? 0,
        goalsScored: element.goals_scored ?? 0,
        expectedGoals: element.expected_goals ?? 0,
        expectedGoalsPer90: element.expected_goals_per_90 ?? 0,
        assists: element.assists ?? 0,
        expectedAssists: element.expected_assists ?? 0,
        expectedAssistsPer90: element.expected_assists_per_90 ?? 0,
        goalsConceded: element.goals_conceded ?? 0,
        expectedGoalsConceded: element.expected_goals_conceded ?? 0,
        expectedGoalsConcededPer90: element.expected_goals_conceded_per_90 ?? 0,
        expectedGoalInvolvements: element.expected_goal_involvements ?? 0,
        expectedGoalInvolvementsPer90: element.expected_goal_involvements_per_90 ?? 0,
      };

      return playerDetails;
    }
  }

  return null;
}

export async function getPlayerSuggestedTransfers(playerId?: number): Promise<Player[]> {
  const players: Player[] = [];
  const gameData = await FPL_API.getGameData();

  let playerData: Element[] = [];

  let searchParams = {
    position: 0,
    priceMin: 0,
    priceMax: 0,
  };

  // Search params
  if (playerId) {
    const searchPlayer = gameData.elements.find((x) => x.id == playerId);
    if (searchPlayer) {
      searchParams.priceMax = searchPlayer.now_cost + 12;
      searchParams.priceMin = await calculateMinPrice(searchPlayer.now_cost);
      searchParams.position = searchPlayer.element_type;

      const playerDataFiltered = gameData.elements.filter(
        (x) =>
          x.total_points > 0 &&
          x.element_type == searchParams.position &&
          x.now_cost <= searchParams.priceMax &&
          x.now_cost >= searchParams.priceMin &&
          x.id != playerId,
      );
      if (playerDataFiltered && playerDataFiltered.length > 0) {
        playerData.splice(0, playerDataFiltered.length, ...playerDataFiltered);
      }
    }
  }

  if (playerData.length === 0) {
    playerData.splice(0, gameData.elements.length, ...gameData.elements);
  }

  if (playerData) {
    await Promise.all(
      playerData.map(async (player, index) => {
        if (player) {
          const formRating = await calculateFormRating(player.id, gameData);
          const fixtureRating = await calculateFixtureRating(player.id, gameData);
          const expectedGoalsRating = await calculateExpectedGoalsRating(player.id, gameData);
          const price = Math.round(player.now_cost * 10) / 100;
          const inFormScore = await calculateInFormScore(
            price,
            formRating,
            fixtureRating,
            expectedGoalsRating,
          );

          players.push({
            id: player.id,
            number: index + 1,
            name: player.web_name,
            position: await mapPosition(player.element_type),
            price: price,
            points: player.total_points,
            form: player.form,
            formRating: formRating,
            fixtureRating: fixtureRating,
            team: await getTeamNameFromId(player.team, gameData),
            inFormScore: inFormScore,
          });
        }
      }),
    );
  }

  players.sort((a, b) => b.inFormScore - a.inFormScore);
  players.splice(20);

  return players;
}

/**
 * Does not include advanced stats (formRating, fixtureRating, inFormScore)
 * @returns All players with basic info (id, name, position, price, points, form)
 */
export async function getAllPlayersSimple(): Promise<Player[]> {
  const players: Player[] = [];
  const gameData = await FPL_API.getGameData();

  let playerData: Element[] = [];

  if (playerData.length === 0) {
    playerData.splice(0, gameData.elements.length, ...gameData.elements);
  }

  if (playerData) {
    await Promise.all(
      playerData.map(async (player, index) => {
        if (player) {
          players.push({
            id: player.id,
            number: index + 1,
            name: player.web_name,
            position: await mapPosition(player.element_type),
            price: Math.round(player.now_cost * 10) / 100,
            points: player.total_points,
            form: player.form,
            formRating: 0,
            fixtureRating: 0,
            team: await getTeamNameFromId(player.team, gameData),
            inFormScore: 0,
          });
        }
      }),
    );
  }

  return players;
}

/**
 * Does include advanced stats (formRating, fixtureRating, inFormScore) so ensure results are filtered (position, limit)
 * @param position - filter by position (GK, DEF, MID, FWD)
 * @param limit - limit number of players returned
 * @param sortByScore - sort players returned by inform score (inFormScore)
 * @returns All players with advanced info (id, name, position, price, points, form, formRating, fixtureRating, inFormScore)
 */
export async function getAllPlayersAdvanced(
  position?: POSITION,
  limit?: number,
  sortByScore?: boolean,
): Promise<Player[]> {
  const players: Player[] = [];
  const gameData = await FPL_API.getGameData();

  let playerData: Element[] = [];

  if (position) {
    const playerDataFiltered = gameData.elements.filter(
      (x) => x.total_points > 0 && x.element_type == position,
    );
    if (playerDataFiltered && playerDataFiltered.length > 0) {
      playerData.splice(0, playerDataFiltered.length, ...playerDataFiltered);
    }
  }

  if (playerData.length === 0) {
    playerData.splice(0, gameData.elements.length, ...gameData.elements);
    // Always limit to top 50 (based on total points) even if no filters applied
    playerData.sort((a, b) => b.total_points - a.total_points);
    players.splice(50);
  }

  if (playerData) {
    await Promise.all(
      playerData.map(async (player, index) => {
        if (player) {
          const formRating = await calculateFormRating(player.id, gameData);
          const fixtureRating = await calculateFixtureRating(player.id, gameData);
          const price = Math.round(player.now_cost * 10) / 100;
          const expectedGoalsRating = await calculateExpectedGoalsRating(player.id, gameData);
          const inFormScore = await calculateInFormScore(
            price,
            formRating,
            fixtureRating,
            expectedGoalsRating,
          );

          players.push({
            id: player.id,
            number: index + 1,
            name: player.web_name,
            position: await mapPosition(player.element_type),
            price: price,
            points: player.total_points,
            form: player.form,
            formRating: formRating,
            fixtureRating: fixtureRating,
            team: await getTeamNameFromId(player.team, gameData),
            inFormScore: inFormScore,
          });
        }
      }),
    );
  }

  if (sortByScore) {
    players.sort((a, b) => b.inFormScore - a.inFormScore);
  }

  if (limit && limit > 0) {
    players.splice(limit);
  }

  return players;
}

function getPaginatedData(array: any[], offset: number, limit: number) {
  if (limit < 0) return array.slice(offset);
  return array.slice(offset, offset + limit);
}

export async function getPlayerCount(): Promise<number> {
  return FPL_API.getPlayerCount();
}
