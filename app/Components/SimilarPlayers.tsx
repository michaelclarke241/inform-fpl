import { useMemo, useEffect, useState } from 'react';
import { Player } from '../types';

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { getPlayerSuggestedTransfers } from '../actions';
import { useRouter } from 'next/navigation';
import { COLOR_SCALE } from '../lib/constants';

const SuggestedTransfers = (props: { playerId: number }) => {
  const router = useRouter();
  const playerId = props.playerId;

  const [data, setData] = useState<Player[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  //table state
  useEffect(() => {
    const loadData = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      try {
        const playerData = await getPlayerSuggestedTransfers(playerId);
        setData(playerData);
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

  {
    /* Suggested Transfers Table
      Name
      Team
      Price
      Total Points
      inForm Score
      */
  }

  const columns = useMemo<MRT_ColumnDef<Player>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 20,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 150,
      },
      {
        accessorKey: 'team',
        header: 'Team',
        size: 20,
      },
      {
        accessorKey: 'position',
        header: 'Pos',
        size: 20,
      },
      {
        accessorKey: 'price',
        header: 'Price',
        size: 20,
      },
      {
        accessorKey: 'points',
        header: 'Points',
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
      sorting: [
        {
          id: 'inFormScore',
          desc: true,
        },
      ],
    },
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
      sx: {
        cursor: 'pointer',
      },
    }),
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
        Suggested Transfers
      </Typography>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default SuggestedTransfers;
