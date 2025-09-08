import { useMemo, useEffect, useState } from 'react';
import { Player } from '../types';

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { getAllPlayersSimple } from '../actions';
import { useRouter } from 'next/navigation';

const AllPlayers = () => {
  const router = useRouter();

  const [data, setData] = useState<Player[]>([]);
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
        setData(await getAllPlayersSimple());
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
    /*
      Name
      Team
      Position
      Price
      Total Points
      InForm Score
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
        accessorKey: 'form',
        header: 'Form',
        size: 20,
      },
      {
        accessorKey: 'points',
        header: 'Points',
        size: 20,
      },
      // {
      //   accessorKey: 'inFormScore',
      //   header: 'inForm Score',
      //   size: 20,
      //   Cell: ({ cell }) => (
      //     <Box
      //       component="span"
      //       sx={(theme) => ({
      //         backgroundColor:
      //           cell.getValue<number>() < 30
      //             ? theme.palette.error.light
      //             : cell.getValue<number>() < 50
      //               ? theme.palette.warning.light
      //               : theme.palette.success.light,
      //         borderRadius: '0.25rem',
      //         color: '#fff',
      //         maxWidth: '9ch',
      //         p: '0.25rem',
      //       })}
      //     >
      //       {cell.getValue<number>()}
      //     </Box>
      //   ),
      // },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    initialState: {
      pagination: { pageSize: 25, pageIndex: 0 },
      showColumnFilters: false,
      density: 'compact',
      sorting: [
        {
          id: 'points',
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
        <Alert severity="error">Failed to load players. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>
        All Players
      </Typography>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default AllPlayers;
