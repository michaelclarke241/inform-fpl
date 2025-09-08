'use client';

import Dashboard from '@/app/Components/Dashboard';
import { PAGES } from '@/app/lib/constants';

export default function PlayerPage({ params }: { params: { id: number } }) {
  const playerId = params.id;
  return <Dashboard page={PAGES.player} playerId={playerId} />;
}
