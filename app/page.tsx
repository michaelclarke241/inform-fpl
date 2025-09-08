import Dashboard from './Components/Dashboard';
import { PAGES } from './lib/constants';

export default function Home() {
  return <Dashboard page={PAGES.currentTeam} />;
}
