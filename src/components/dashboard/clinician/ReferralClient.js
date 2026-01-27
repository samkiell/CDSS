'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  FileOutput,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  User,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui';
import { cn } from '@/lib/cn';

export default function ReferralClient({ initialPatients = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = useMemo(
    () =>
      initialPatients.filter((patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [initialPatients, searchQuery]
  );

  return (
    <div className="space-y-10">
      {/* Enhanced Search */}
      <div className="relative max-w-2xl">
        <Search className="text-muted-foreground absolute top-1/2 left-6 h-5 w-5 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search patients for referral..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-card focus:ring-primary/20 h-16 w-full rounded-[1.5rem] border-none pr-6 pl-16 text-sm font-bold shadow-sm transition-all focus:ring-2 focus:outline-none"
        />
      </div>

      <div className="space-y-6">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="group bg-card overflow-hidden rounded-[2.5rem] border-none shadow-sm transition-all duration-500 hover:shadow-xl"
            >
              <CardContent className="p-0">
                <div className="divide-border/50 flex flex-col divide-y md:flex-row md:divide-x md:divide-y-0">
                  {/* Patient Profile */}
                  <div className="flex items-center gap-6 p-8 md:w-1/3">
                    <Avatar className="ring-primary/5 group-hover:ring-primary/20 h-16 w-16 rounded-2xl ring-4 transition-all">
                      <AvatarImage src={patient.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-black">
                        {patient.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-foreground text-lg font-black tracking-tight uppercase italic">
                        {patient.name}
                      </h3>
                      <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                        {patient.gender}
                      </p>
                    </div>
                  </div>

                  {/* Stats & Info */}
                  <div className="grid flex-1 grid-cols-2 items-center gap-6 p-8">
                    <div className="flex flex-col gap-1">
                      <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-black tracking-widest uppercase opacity-60">
                        <Calendar className="h-3 w-3" />
                        Last Assessment
                      </div>
                      <p className="text-foreground text-sm font-bold italic">
                        {new Date(patient.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-black tracking-widest uppercase opacity-60">
                        <MapPin className="h-3 w-3" />
                        Status
                      </div>
                      <Badge
                        className={cn(
                          'w-fit rounded-full border-none px-3 py-1 text-[10px] font-black',
                          patient.status === 'urgent'
                            ? 'bg-red-500 text-white'
                            : 'bg-emerald-500 text-white'
                        )}
                      >
                        {patient.status === 'urgent' ? 'URGENT' : 'STABLE'}
                      </Badge>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="bg-muted/10 flex items-center justify-center p-8 md:w-48">
                    <Button className="bg-primary shadow-primary/20 h-12 w-full gap-2 rounded-xl text-[10px] font-black tracking-widest text-white uppercase shadow-lg transition-all hover:brightness-110 active:scale-95">
                      <FileOutput className="h-4 w-4" />
                      Create
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="bg-muted text-muted-foreground flex h-20 w-20 items-center justify-center rounded-full">
              <User className="h-10 w-10 opacity-20" />
            </div>
            <p className="text-muted-foreground/30 text-xl font-black tracking-tighter uppercase italic">
              No patients found
            </p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="flex flex-col items-center gap-8 rounded-[2.5rem] border border-white/10 bg-[#0f172a] p-8 text-white shadow-2xl md:flex-row">
        <div className="bg-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
          <MapPin className="h-7 w-7" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="mb-1 text-lg font-black tracking-tight uppercase italic">
            External Facility Network
          </h4>
          <p className="text-sm font-medium text-gray-400">
            Connect patients with verified radiology centers and orthopaedic specialists
            across our partner network.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-14 rounded-2xl border-white/10 px-8 text-[10px] font-black tracking-widest text-white uppercase hover:bg-white/5"
        >
          Manage Facilities
        </Button>
      </div>
    </div>
  );
}
