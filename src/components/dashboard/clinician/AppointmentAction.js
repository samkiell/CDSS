'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
} from '@/components/ui';

export default function AppointmentAction({ appointmentId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        console.error('Failed to cancel appointment');
        alert('Failed to cancel appointment');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Error cancelling appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this appointment permanentely?'))
      return;

    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        console.error('Failed to delete appointment');
        alert('Failed to delete appointment');
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
      alert('Error deleting appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="bg-muted hover:bg-muted/80 flex h-10 w-10 items-center justify-center rounded-full transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-destructive focus:text-destructive font-bold"
          onClick={handleCancel}
          disabled={loading}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancel Appointment
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive font-bold"
          onClick={handleDelete}
          disabled={loading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
