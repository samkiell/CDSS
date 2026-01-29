'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Stethoscope,
  Award,
  ShieldCheck,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText,
  Mail,
  Smartphone,
  Users,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Badge,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import ClinicianDetailsModal from './ClinicianDetailsModal';
import { verifyClinician } from '@/actions/admin';
import { toast } from 'sonner';

export default function AdminTherapistListClient({ initialTherapists = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedClinician, setSelectedClinician] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const filteredTherapists = useMemo(() => {
    return initialTherapists.filter((t) => {
      const matchesSearch =
        `${t.firstName} ${t.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.specialization &&
          t.specialization.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        activeFilter === 'ALL' ||
        (activeFilter === 'ACTIVE'
          ? t.isActive
          : activeFilter === 'UNVERIFIED'
            ? !t.professional?.verified
            : !t.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [initialTherapists, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    return {
      total: initialTherapists.length,
      active: initialTherapists.filter((t) => t.isActive).length,
      pending: initialTherapists.filter((t) => !t.professional?.verified).length,
    };
  }, [initialTherapists]);

  const handleOpenDetails = (clinician) => {
    setSelectedClinician(clinician);
    setIsModalOpen(true);
  };

  const handleVerify = async (clinicianId) => {
    setIsVerifying(true);
    const result = await verifyClinician(clinicianId);
    if (result.success) {
      toast.success('Clinician verified successfully');
      // Update local state is tricky without refetching or using router refresh,
      // but revalidatePath in action handles the refresh of the page props if this is a server component wrapper,
      // but client state might need manual update or just close modal + wait for refresh.
      // Since 'initialTherapists' comes from props, Next.js should re-render this component with new props automatically
      // if the parent server component refreshes.
      setIsModalOpen(false);
      setSelectedClinician(null);
    } else {
      toast.error('Verification failed: ' + result.error);
    }
    setIsVerifying(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <ClinicianDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clinician={selectedClinician}
        onVerify={handleVerify}
        isVerifying={isVerifying}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Total Clinicians"
          value={stats.total}
          icon={<Stethoscope />}
          color="bg-primary"
        />
        <StatCard
          title="Active Practitioners"
          value={stats.active}
          icon={<CheckCircle2 />}
          color="bg-emerald-500"
        />
        <StatCard
          title="Pending Verification"
          value={stats.pending}
          icon={<AlertTriangle />}
          color="bg-amber-500"
        />
      </div>

      {/* Constraints */}
      <Card className="bg-card rounded-[2rem] border-none shadow-sm">
        <CardContent className="flex flex-col justify-between gap-6 p-6 md:flex-row md:items-center lg:p-8">
          <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-muted/30 focus:ring-primary/20 h-14 w-full rounded-2xl pr-4 pl-12 text-sm font-medium focus:ring-2 focus:outline-none"
            />
          </div>
          <div className="bg-muted/30 flex items-center gap-2 rounded-2xl p-1">
            {['ALL', 'ACTIVE', 'UNVERIFIED'].map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={cn(
                  'rounded-xl px-6 py-2 text-xs font-bold tracking-widest uppercase transition-all',
                  activeFilter === status
                    ? 'text-primary bg-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTherapists.length > 0 ? (
          filteredTherapists.map((therapist) => (
            <Card
              key={therapist._id}
              className="bg-card group overflow-hidden rounded-[2.5rem] border-none shadow-sm transition-all hover:shadow-xl"
            >
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Identity Section */}
                  <div className="border-border/50 flex items-start gap-6 border-b p-8 lg:w-1/3 lg:border-r lg:border-b-0">
                    <Avatar className="ring-primary/10 h-20 w-20 rounded-[1.5rem] ring-4">
                      <AvatarImage src={therapist.avatar} />
                      <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                        {therapist.firstName?.[0]}
                        {therapist.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-foreground text-xl font-bold">
                          Dr. {therapist.firstName} {therapist.lastName}
                        </h3>
                        {therapist.professional?.verified ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <span className="text-primary text-xs font-bold tracking-widest uppercase">
                        {therapist.specialization || 'General Practitioner'}
                      </span>
                      <div className="mt-4 flex flex-col gap-2">
                        <span className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                          <Mail className="h-3.5 w-3.5" />
                          {therapist.email}
                        </span>
                        {therapist.phone && (
                          <span className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                            <Smartphone className="h-3.5 w-3.5" />
                            {therapist.phone}
                          </span>
                        )}
                        <span className="text-primary mt-1 flex items-center gap-2 text-xs font-bold">
                          <Users className="h-3.5 w-3.5" />
                          {therapist.patientCount || 0} Assigned Patients
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="grid flex-1 grid-cols-1 items-center gap-8 p-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted/50 text-muted-foreground flex h-10 w-10 items-center justify-center rounded-xl">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                            License Number
                          </p>
                          <p className="text-foreground text-sm font-bold">
                            {therapist.professional?.licenseNumber || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-muted/50 text-muted-foreground flex h-10 w-10 items-center justify-center rounded-xl">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                            Verification Status
                          </p>
                          <Badge
                            className={cn(
                              'mt-1 rounded-full border-none px-3 py-1 text-[10px] font-bold',
                              therapist.professional?.verified
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-amber-500/10 text-amber-600'
                            )}
                          >
                            {therapist.professional?.verified ? 'VERIFIED' : 'UNVERIFIED'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {!therapist.professional?.verified && (
                        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                          <strong>Action Required:</strong> Please verify medical
                          credentials to enable patient assignment.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-muted/10 border-border/50 hover:bg-muted/20 flex items-center justify-center gap-3 border-t p-8 transition-colors lg:w-48 lg:flex-col lg:border-t-0">
                    {/* Primary Button */}
                    {!therapist.professional?.verified ? (
                      <Button
                        className="h-11 w-full rounded-xl bg-emerald-600 text-[10px] font-bold tracking-widest text-white uppercase shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
                        onClick={() => handleOpenDetails(therapist)}
                      >
                        Verify Now
                      </Button>
                    ) : (
                      <Button
                        className="bg-primary/10 text-primary hover:bg-primary/20 h-11 w-full rounded-xl text-[10px] font-bold tracking-widest uppercase"
                        onClick={() => handleOpenDetails(therapist)}
                      >
                        View Profile
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground h-11 w-full rounded-xl text-[10px] font-bold tracking-widest uppercase"
                      onClick={() => handleOpenDetails(therapist)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center gap-4 p-20 text-center">
            <Stethoscope className="text-muted-foreground h-20 w-20 opacity-20" />
            <p className="text-muted-foreground text-2xl font-bold tracking-tight uppercase">
              No clinicians matched
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <Card className="bg-card group overflow-hidden rounded-[2rem] border-none shadow-sm">
      <CardContent className="flex items-center gap-6 p-8">
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110',
            color
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest uppercase">
            {title}
          </p>
          <h3 className="text-foreground text-3xl font-bold tracking-tight">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
