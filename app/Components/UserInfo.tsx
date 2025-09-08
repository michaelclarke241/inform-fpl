import { useEffect, useState } from 'react';
import { User } from '../types';
import { List, ListItem, ListItemText, Typography } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { FPL_API } from '../api/fpl/index';

const UserInfo = () => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const loadData = async () => {
      setUser(await FPL_API.getUserData());
    };
    loadData();
  }, []);

  return (
    <div>
      <Typography variant="h5" gutterBottom align="center" color={blueGrey}>
        My Team
      </Typography>
      {user && (
        <List>
          <ListItem>
            <ListItemText primary={`Team Name: ${user.name}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`Total Points: ${user.summary_overall_points}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`GW: ${user.current_event}`} />
          </ListItem>
          <ListItem>
            <ListItemText primary={`GW Points: ${user.summary_event_points}`} />
          </ListItem>
        </List>
      )}
    </div>
  );
};

export default UserInfo;
