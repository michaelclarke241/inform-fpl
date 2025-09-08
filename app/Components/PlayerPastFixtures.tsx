'use client';

import { useMemo, useEffect, useState } from 'react';
import { PlayerPreviousFixture } from '../types';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { getPlayerPreviousFixtures } from '../actions';
import { COLOR_SCALE } from '../lib/constants';

const PlayerPastFixtures = (props: { playerId: number }) => {
  const fixtureCount = 10;
  const playerId = props.playerId;

  const [data, setData] = useState<PlayerPreviousFixture[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!data) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      try {
        const playerPreviousFixtures: PlayerPreviousFixture[] = await getPlayerPreviousFixtures(
          playerId,
          fixtureCount,
        );
        if (playerPreviousFixtures) {
          setData(playerPreviousFixtures);
        }
      } catch (error) {
        setIsError(true);
        console.error(error);
        return;
      }
      setIsError(false);
      setIsLoading(false);
      setIsRefetching(false);
    };

    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const averageFixtureDiff = useMemo(() => {
    const totalFixtureDiff = data.reduce((acc, row) => acc + row.fixtureDiff, 0);
    const totalFixtures = data.length;
    return (totalFixtureDiff / totalFixtures).toFixed(2);
  }, [data]);

  const totalP = useMemo(() => {
    return data.reduce((acc, row) => acc + row.points, 0).toFixed(2);
  }, [data]);

  const columns = useMemo<MRT_ColumnDef<PlayerPreviousFixture>[]>(
    () => [
      {
        accessorKey: 'gameweek',
        header: 'Gameweek',
        size: 20,
      },
      {
        accessorKey: 'fixture',
        header: 'Fixture',
        size: 20,
      },
      {
        accessorKey: 'fixtureDiff',
        header: 'Fixture Difficulty',
        size: 20,
        Footer: () => (
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            AVG: {averageFixtureDiff}
          </Typography>
        ),
      },
      {
        accessorKey: 'points',
        header: 'Points',
        size: 20,
        Footer: () => (
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Total: {totalP}
          </Typography>
        ),
      },
      {
        accessorKey: 'formRating',
        header: 'Form Rating',
        size: 20,
        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={(theme) => ({
              backgroundColor:
                cell.getValue<number>() < 1
                  ? COLOR_SCALE.low // red
                  : cell.getValue<number>() < 4
                    ? COLOR_SCALE.midLow // orange
                    : cell.getValue<number>() < 5
                      ? COLOR_SCALE.mid // yellow
                      : cell.getValue<number>() < 6
                        ? COLOR_SCALE.midHigh // light green
                        : COLOR_SCALE.high, // dark green
              borderRadius: '0.25rem',
              color: '#fff',
              fontWeight: 'bold',
              p: '0.25rem',
            })}
          >
            {cell.getValue<number>()}
          </Box>
        ),
      },
    ],
    [averageFixtureDiff, totalP],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    initialState: {
      showColumnFilters: false,
      density: 'compact',
      columnVisibility: { fixtureDiff: true },
      sorting: [
        {
          id: 'gameweek',
          desc: true,
        },
      ],
    },
    enablePagination: false,
    enableBottomToolbar: false,
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
    },
  });

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Alert severity="error">Failed to load player fixtures. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>
        Player's Past Fixtures
      </Typography>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default PlayerPastFixtures;
