import PlayerDetails from './PlayerDetails';
import PlayerPastFixtures from './PlayerPastFixtures';
import PlayerNextFixtures from './PlayerNextFixtures';
import SimilarPlayers from './SimilarPlayers';

const Player = (props: { playerId: number }) => {
  return (
    <div>
      <PlayerDetails playerId={props.playerId} />
      <PlayerPastFixtures playerId={props.playerId} />
      <PlayerNextFixtures playerId={props.playerId} />
      <SimilarPlayers playerId={props.playerId} />
    </div>
  );
};

export default Player;
