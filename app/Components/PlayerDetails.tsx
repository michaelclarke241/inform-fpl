import { useEffect, useState } from 'react';
import type { PlayerDetails } from '../types';

import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import { getPlayerDetails } from '../actions';
import { COLOR_SCALE } from '../lib/constants';

const PlayerDetails = (props: { playerId: number }) => {
  const playerId = props.playerId;
  const [data, setData] = useState<PlayerDetails>();
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
        const playerDetails = await getPlayerDetails(playerId);

        if (playerDetails) {
          setData(playerDetails);
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
        <Alert severity="error">Failed to load player details. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        {data?.firstName} {data?.secondName}
      </Typography>
      {data?.news && (
        <Typography
          variant="subtitle1"
          sx={{ mt: 2, mb: 4, backgroundColor: '#ffeb3b', padding: '10px', borderRadius: '5px' }}
        >
          {data?.newsAdded ? `${new Date(data.newsAdded).toLocaleDateString('en-GB')}: ` : ''}
          {data?.news}
        </Typography>
      )}
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(350px, 100%), 1fr))',
          gap: 2,
        }}
      >
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <List>
              <ListItem>
                <Typography variant="body1">
                  <strong>Team:</strong> {data?.team}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  <strong>Position:</strong> {data?.position}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  <strong>Price:</strong> £{data?.price}m
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  <strong>Total Points:</strong> {data?.points}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  <strong>Owned:</strong> {data?.selectedByPercent}%
                </Typography>
              </ListItem>
            </List>
          </CardContent>
        </Card>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <List>
              <ListItem>
                <Typography variant="body1">
                  <strong>Minutes:</strong> {data?.minutes}
                </Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <Typography variant="body1">
                  <strong>Goals:</strong> {data?.goalsScored}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  <strong>xGoals:</strong> {data?.expectedGoals}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  <strong>xGoals90:</strong> {data?.expectedGoalsPer90}
                </Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <Typography variant="body1">
                  <strong>Assists:</strong> {data?.assists}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  <strong>xAssists:</strong> {data?.expectedAssists}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  <strong>xAssists90:</strong> {data?.expectedAssistsPer90}
                </Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <Typography variant="body1">
                  <strong>Conceded:</strong> {data?.goalsConceded}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  <strong>xConceded:</strong> {data?.expectedGoalsConceded}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  <strong>xConceded90:</strong> {data?.expectedGoalsConcededPer90}
                </Typography>
              </ListItem>
              {/* <Divider />
            <ListItem>
              <Typography variant="body1">
              <strong>Goal Involvements:</strong> {(data?.goalsScored ?? 0) + (data?.assists ?? 0)}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
              <strong>xGoal Involvements:</strong> {data?.expectedGoalInvolvements}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
              <strong>xGoal Involvements90:</strong> {data?.expectedGoalInvolvementsPer90}
              </Typography>
            </ListItem> */}
            </List>
          </CardContent>
        </Card>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
              inForm Score:
            </Typography>
            <Box
              sx={{
                border: '0.2em solid',
                borderColor:
                  data?.inFormScore && data.inFormScore < 33
                    ? COLOR_SCALE.low
                    : data?.inFormScore && data.inFormScore < 44
                      ? COLOR_SCALE.midLow
                      : data?.inFormScore && data.inFormScore < 55
                        ? COLOR_SCALE.mid
                        : data?.inFormScore && data.inFormScore < 66
                          ? COLOR_SCALE.midHigh
                          : COLOR_SCALE.high,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0.5em',
                borderRadius: '100%',
                height: '6em',
                width: '6em',
                textAlign: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color:
                    data?.inFormScore && data.inFormScore < 33
                      ? COLOR_SCALE.low
                      : data?.inFormScore && data.inFormScore < 44
                        ? COLOR_SCALE.midLow
                        : data?.inFormScore && data.inFormScore < 55
                          ? COLOR_SCALE.mid
                          : data?.inFormScore && data.inFormScore < 66
                            ? COLOR_SCALE.midHigh
                            : COLOR_SCALE.high,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: '2.5em',
                }}
              >
                {data?.inFormScore}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PlayerDetails;
