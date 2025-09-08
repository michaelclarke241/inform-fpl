'use server';

import { TEAM_ID } from '@/app/lib/constants';
import {
  GameData,
  PlayerGameweek,
  User,
  UserPicks,
  Element,
  Pick,
  Fixture,
  PlayerSummary,
} from '@/app/types';

const BASE_URL = 'https://fantasy.premierleague.com/api';

export async function getGameData(): Promise<GameData> {
  return await fetch(`${BASE_URL}/bootstrap-static/`).then((res) => res.json());
}

export async function getUserData(): Promise<User> {
  return await fetch(`${BASE_URL}/entry/${TEAM_ID}/`).then((res) => res.json());
}

export async function getUserPicksData(gw: number): Promise<UserPicks> {
  return await fetch(`${BASE_URL}/entry/${TEAM_ID}/event/${gw}/picks/`).then((res) => res.json());
}

export async function getGameweek(): Promise<number> {
  return (await getUserData().then(async (user) => user.current_event)) ?? 0;
}

export async function getPlayerCount(): Promise<number> {
  return await getGameData().then((result) => result.elements.length);
}

export async function getFixtureData(): Promise<Fixture[]> {
  return await fetch(`${BASE_URL}/fixtures/`).then((res) => res.json());
}

export async function getPlayerSummary(playerId: number): Promise<PlayerSummary | null> {
  try {
    return await fetch(`${BASE_URL}/element-summary/${playerId}/`).then((res) => res.json());
  } catch (error) {
    return null;
  }
}

export async function getFixtureDataForGameweek(gameweek: number): Promise<Fixture[]> {
  const fixturesForGameweek: Fixture[] = [];

  const allFixtures = await getFixtureData();

  allFixtures.forEach((fixture) => {
    if (fixture.event === gameweek) {
      fixturesForGameweek.push(fixture);
    }
  });

  return fixturesForGameweek;
}

export async function getFixtureDataForGameweekForTeam(
  gameweek: number,
  teamId: number,
): Promise<Fixture | null> {
  const allGameweekFixtures = await getFixtureDataForGameweek(gameweek);

  if (allGameweekFixtures && allGameweekFixtures.length > 0) {
    // console.log('TRACE');
    // console.log({ teamId });
    allGameweekFixtures.forEach((fixture) => {
      if (fixture.team_h === teamId || fixture.team_a === teamId) {
        // console.log('found fixture');

        return fixture;
      }
    });
  }
  return null;
}

export async function getFixtureName(
  gameData: GameData,
  gameweek: number,
  teamId: number,
): Promise<string> {
  const fixture = await getFixtureDataForGameweekForTeam(gameweek, teamId);

  if (fixture) {
    if (fixture.team_a === teamId) {
      return gameData.teams.find((team) => team.id === fixture.team_h)?.name ?? '';
    }

    if (fixture.team_h === teamId) {
      return gameData.teams.find((team) => team.id === fixture.team_a)?.name ?? '';
    }
  }

  return '';
}

export async function login(username: string, password: string): Promise<string | null> {
  const LOGIN_URL = 'https://users.premierleague.com/accounts/login/';
  const payload = new URLSearchParams({
    login: username,
    password: password,
    app: 'plfpl-web',
    redirect_uri: 'https://fantasy.premierleague.com/a/login',
  });

  try {
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    console.log('Login response:', response);

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      const sessionCookie = cookies
        .split(';')
        .find((cookie) => cookie.trim().startsWith('pl_profile'));
      return sessionCookie ?? null;
    }

    return null;
  } catch (error) {
    console.error('Error during login:', error);
    return null;
  }
}
