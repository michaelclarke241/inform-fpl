import { Box, Typography } from '@mui/material';
import TopPlayersTable from './TopPlayersTable';
import { POSITION } from '../lib/constants';

const TopPlayers = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        Top Players
      </Typography>
      <TopPlayersTable position={POSITION.GK} />
      <TopPlayersTable position={POSITION.DEF} />
      <TopPlayersTable position={POSITION.MID} />
      <TopPlayersTable position={POSITION.FWD} />
    </Box>
  );
};

export default TopPlayers;
