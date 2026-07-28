import React from 'react';
import AdminControlCentreHub from '@/components/admin/AdminControlCentreHub';

export const metadata = {
  title: 'Symposium Admin Control Centre | Symphosium',
  description: 'Complete real-time control center for symposium event status, rounds, server telemetry, and emergency overrides.',
};

export default function AdminControlPage() {
  return <AdminControlCentreHub />;
}
