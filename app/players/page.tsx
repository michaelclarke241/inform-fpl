'use client';

import Dashboard from '@/app/Components/Dashboard';
import { PAGES } from '@/app/lib/constants';

export default function PlayerPage() {
  return <Dashboard page={PAGES.allPlayers} />;
}
