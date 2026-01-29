import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import { Appointment } from '@/models';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { Calendar, Clock, MapPin, User as UserIcon, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import AppointmentAction from '@/components/dashboard/clinician/AppointmentAction';

export default async function ClinicianAppointmentsPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== 'CLINICIAN') {
    redirect('/login');
  }

  await dbConnect();

  const appointmentsRaw = await Appointment.find({ therapist: session.user.id })
    .populate('patient', 'firstName lastName avatar email')
    .sort({ date: 1 })
    .lean();

  const appointments = JSON.parse(JSON.stringify(appointmentsRaw));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments Schedule</h1>
          <p className="text-muted-foreground font-medium">
            Manage your daily consultations and patient follow-ups.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {appointments.length > 0 ? (
          appointments.map((appt) => {
            const apptDate = new Date(appt.date);
            const isToday = new Date().toDateString() === apptDate.toDateString();

            return (
              <Card
                key={appt._id}
                className="overflow-hidden border-none shadow-sm transition-all hover:shadow-md"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Time Column */}
                    <div
                      className={`${isToday ? 'bg-primary/10' : 'bg-muted/50'} flex flex-col items-center justify-center p-6 md:w-32 lg:w-40`}
                    >
                      <span className="text-primary text-2xl font-black">
                        {apptDate.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                        {apptDate.toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {isToday && (
                        <Badge className="bg-primary mt-2 text-[10px] text-white">
                          TODAY
                        </Badge>
                      )}
                    </div>

                    {/* Patient and Info */}
                    <div className="flex flex-1 flex-col justify-between p-6 md:flex-row md:items-center">
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
                          {appt.patient?.avatar ? (
                            <Image
                              src={appt.patient.avatar}
                              alt={appt.patient.firstName || 'Patient'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center text-xl font-bold">
                              {appt.patient?.firstName?.[0] || 'P'}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">
                            {appt.patient?.firstName} {appt.patient?.lastName}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>{appt.type || 'General Consultation'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <MapPin className="h-4 w-4" />
                              <span>{appt.location || 'Virtual Session'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-4 md:mt-0">
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={
                              appt.status === 'Confirmed'
                                ? 'default'
                                : appt.status === 'Pending'
                                  ? 'outline'
                                  : appt.status === 'Cancelled'
                                    ? 'destructive'
                                    : 'secondary'
                            }
                            className="underline-none font-bold capitalize"
                          >
                            {appt.status}
                          </Badge>
                          <span className="text-muted-foreground text-[10px] font-medium tracking-tighter uppercase">
                            Status
                          </span>
                        </div>
                        <AppointmentAction appointmentId={appt._id.toString()} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="bg-card border-dashed py-20">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="bg-primary/5 mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                <Calendar className="text-primary/40 h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold">No Scheduled Appointments</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                You don't have any appointments scheduled yet. When you schedule
                consultations with patients, they will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
