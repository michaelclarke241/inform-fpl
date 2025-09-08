import { useMemo, useEffect, useState } from 'react';
import { Player } from '../types';

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { Box, Typography } from '@mui/material';
import { getAllPlayersAdvanced } from '../actions';
import { useRouter } from 'next/navigation';
import { COLOR_SCALE, POSITION } from '../lib/constants';

const TopPlayersTable = (props: { position: POSITION }) => {
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
        setData(await getAllPlayersAdvanced(props.position, 20, true));
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
      pagination: { pageSize: 10, pageIndex: 0 },
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

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 4 }}>
        {(() => {
          switch (props.position) {
            case POSITION.GK:
              return 'Top Goalkeepers';
            case POSITION.DEF:
              return 'Top Defenders';
            case POSITION.MID:
              return 'Top Midfielders';
            case POSITION.FWD:
              return 'Top Forwards';
            default:
              return 'Top Players';
          }
        })()}
      </Typography>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default TopPlayersTable;
