'use client';

import { useMemo, useEffect, useState } from 'react';
import { PlayerNextFixture } from '../types';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { getPlayerNextFixtures } from '../actions';
import { COLOR_SCALE } from '../lib/constants';

const PlayerNextFixtures = (props: { playerId: number }) => {
  const fixtureCount = 10;
  const playerId = props.playerId;

  const [data, setData] = useState<PlayerNextFixture[]>([]);
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
        const playerFixtures: PlayerNextFixture[] = await getPlayerNextFixtures(
          playerId,
          fixtureCount,
        );
        if (playerFixtures) {
          setData(playerFixtures);
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

  const columns = useMemo<MRT_ColumnDef<PlayerNextFixture>[]>(
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
        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={(theme) => ({
              backgroundColor:
                cell.getValue<number>() === 5
                  ? COLOR_SCALE.low // red
                  : cell.getValue<number>() === 4
                    ? COLOR_SCALE.midLow // orange
                    : cell.getValue<number>() === 3
                      ? COLOR_SCALE.mid // yellow
                      : cell.getValue<number>() === 2
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
        Footer: () => (
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            AVG: {averageFixtureDiff}
          </Typography>
        ),
      },
    ],
    [averageFixtureDiff],
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
          desc: false,
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
        Player's Next Fixtures
      </Typography>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default PlayerNextFixtures;
