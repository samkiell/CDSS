'use client';

import { useState } from 'react';
import { MoreHorizontal, Trash2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  StatusModal,
} from '@/components/ui';

export default function AppointmentAction({ appointmentId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  });

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Cancel Appointment',
      message:
        'Are you sure you want to cancel this appointment? This action will notify the patient.',
      confirmText: 'Yes, Cancel It',
      cancelText: 'Keep Appointment',
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/appointments/${appointmentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Cancelled' }),
          });

          if (res.ok) {
            router.refresh();
            setModal({
              isOpen: true,
              type: 'success',
              title: 'Appointment Cancelled',
              message: 'The appointment has been successfully cancelled.',
              onConfirm: closeModal,
            });
          } else {
            setModal({
              isOpen: true,
              type: 'error',
              title: 'Cancellation Failed',
              message: 'Could not cancel the appointment. Please try again.',
              onConfirm: closeModal,
            });
          }
        } catch (err) {
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'An unexpected error occurred.',
            onConfirm: closeModal,
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDelete = () => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Delete Appointment',
      message:
        'Are you sure you want to permanently delete this appointment? This action cannot be undone.',
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/appointments/${appointmentId}`, {
            method: 'DELETE',
          });

          if (res.ok) {
            router.refresh(); // Refresh first to remove the item from list logic
            setModal({
              isOpen: true,
              type: 'success',
              title: 'Deleted',
              message: 'Appointment record deleted successfully.',
              onConfirm: closeModal,
            });
          } else {
            setModal({
              isOpen: true,
              type: 'error',
              title: 'Delete Failed',
              message: 'Could not delete the appointment.',
              onConfirm: closeModal,
            });
          }
        } catch (err) {
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'An unexpected error occurred.',
            onConfirm: closeModal,
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="bg-muted hover:bg-muted/80 flex h-10 w-10 items-center justify-center rounded-full transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="font-bold text-orange-500 focus:text-orange-600"
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

      <StatusModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        isSubmitting={loading}
      />
    </>
  );
}
