'use client';

import { useMemo, useEffect, useState } from 'react';
import { PlayerGameweek, User } from '../types';

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { getGameweek, getPlayerGameweekData } from '../actions';
import { useRouter } from 'next/navigation';
import { getUserData } from '../api/fpl/apim';
import { COLOR_SCALE } from '../lib/constants';

const UserCurrentTeam = () => {
  const router = useRouter();

  const [gameweek, setGameweek] = useState<number>();
  const [data, setData] = useState<PlayerGameweek[]>([]);
  const [user, setUser] = useState<User>();
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      try {
        const gameweek = await getGameweek();
        setUser(await getUserData());
        setGameweek(gameweek);
        setData(await getPlayerGameweekData(gameweek));
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

  const columns = useMemo<MRT_ColumnDef<PlayerGameweek>[]>(
    () => [
      {
        accessorKey: 'id',
        header: '#',
        size: 20,
      },
      {
        accessorKey: 'number',
        header: '#',
        size: 20,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 150,
      },
      {
        accessorKey: 'position',
        header: 'Pos',
        size: 20,
      },
      // {
      //   accessorKey: 'team',
      //   header: 'Team',
      //   size: 20,
      // },
      {
        accessorKey: 'price',
        header: 'Price',
        size: 20,
      },
      {
        accessorKey: 'fixture',
        header: 'Fixture',
        size: 20,
      },
      {
        accessorKey: 'captain',
        header: 'C',
        size: 10,
        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={{ fontWeight: 'bold', color: cell.getValue<boolean>() ? 'darkblue' : 'inherit' }}
          >
            {cell.getValue<boolean>() ? '©' : ''}
          </Box>
        ),
      },
      {
        accessorKey: 'pointsGW',
        header: 'GW Points',
        size: 20,
      },
      {
        accessorKey: 'formRating',
        header: 'FormRating',
        size: 20,
      },
      {
        accessorKey: 'fixtureRating',
        header: 'FixtureRating',
        size: 20,
      },
      {
        accessorKey: 'inFormScore',
        header: 'inForm',
        size: 20,
        Cell: ({ cell }) => (
          <Box
            component="span"
            sx={{
              backgroundColor:
                cell.getValue<number>() < 33
                  ? COLOR_SCALE.low // red
                  : cell.getValue<number>() < 44
                    ? COLOR_SCALE.midLow // orange
                    : cell.getValue<number>() < 55
                      ? COLOR_SCALE.mid // yellow
                      : cell.getValue<number>() < 66
                        ? COLOR_SCALE.midHigh // light green
                        : COLOR_SCALE.high, // dark green
              borderRadius: '0.25rem',
              color: '#fff',
              fontWeight: 'bold',
              p: '0.25rem',
            }}
          >
            {cell.getValue<number>()}
          </Box>
        ),
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    initialState: {
      showColumnFilters: false,
      density: 'compact',
      columnVisibility: { id: false },
      sorting: [
        {
          id: 'number',
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
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        router.push(`/player/${row.getValue('id')}`);
      },
      //conditionally style rows based on position and other rules
      sx: {
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'lightblue',
        },
        backgroundColor:
          row.getValue<number>('number') > 11
            ? 'lightgrey'
            : row.getValue<string>('position') === 'GK'
              ? '#e0f7fa' // light cyan for Goalkeepers
              : row.getValue<string>('position') === 'DEF'
                ? '#e8f5e9' // light green for Defenders
                : row.getValue<string>('position') === 'MID'
                  ? '#fff3e0' // light orange for Midfielders
                  : row.getValue<string>('position') === 'FWD'
                    ? '#fce4ec' // light pink for Forwards
                    : '',
      },
    }),
  });

  return (
    <div>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
        Gameweek {gameweek} - Your Team
      </Typography>
      {user && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2,
            border: '1px solid lightgray',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <List>
            <ListItem>
              <ListItemText
                primary="Team Name"
                secondary={user.name}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
            </ListItem>
            <ListItem sx={{ display: 'flex', justifyContent: 'space-between', width: '30%' }}>
              <ListItemText
                primary="GW Points"
                secondary={user.summary_event_points}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
              <ListItemText
                primary="GW Rank"
                secondary={user.summary_event_rank}
                primaryTypographyProps={{ fontWeight: 'bold' }}
                sx={{ textAlign: 'left' }}
              />
            </ListItem>
            <ListItem sx={{ display: 'flex', justifyContent: 'space-between', width: '30%' }}>
              <ListItemText
                primary="Overall Points"
                secondary={user.summary_overall_points}
                primaryTypographyProps={{ fontWeight: 'bold' }}
              />
              <ListItemText
                primary="Overall Rank"
                secondary={user.summary_overall_rank}
                primaryTypographyProps={{ fontWeight: 'bold' }}
                sx={{ textAlign: 'left' }}
              />
            </ListItem>

            <ListItem>
              <ListItemText
                primary="inForm Team Rating"
                secondary={(
                  data.reduce((sum, player) => sum + player.inFormScore, 0) / data.length
                ).toFixed(2)}
                primaryTypographyProps={{ fontWeight: 'bold' }}
                secondaryTypographyProps={{
                  fontWeight: 'bold',
                  color: 'white',
                  textAlign: 'center',
                  maxWidth: '6ch',
                  borderRadius: '8px',
                  bgcolor: (() => {
                    const avgScore =
                      data.reduce((sum, player) => sum + player.inFormScore, 0) / data.length;
                    if (avgScore < 33) return COLOR_SCALE.low;
                    if (avgScore < 44) return COLOR_SCALE.midLow;
                    if (avgScore < 55) return COLOR_SCALE.mid;
                    if (avgScore < 66) return COLOR_SCALE.midHigh;
                    return COLOR_SCALE.high;
                  })(),
                }}
              />
            </ListItem>
          </List>
        </Box>
      )}
      {<MaterialReactTable table={table} />}
    </div>
  );
};

export default UserCurrentTeam;
