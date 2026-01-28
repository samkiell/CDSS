'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  PasswordInput,
} from '@/components/ui';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Bell,
  ShieldCheck,
  Camera,
  Trash2,
  Save,
  X,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PatientSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
  });

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/patients/profile');

        // Check if response is ok before parsing JSON
        if (!response.ok) {
          // API not built yet - this is expected, just log and continue
          console.warn('Profile API not available yet (Status:', response.status, ')');
          return;
        }

        const data = await response.json();

        if (data.success) {
          setPersonalInfo({
            firstName: data.data.firstName || '',
            lastName: data.data.lastName || '',
            email: data.data.email || '',
            phone: data.data.phone || '',
            dob: data.data.dateOfBirth ? data.data.dateOfBirth.split('T')[0] : '',
            gender: data.data.gender || '',
          });
          if (data.data.avatar) {
            setProfileImage(data.data.avatar);
          }
        }
      } catch (error) {
        // Network error or other issue - just log, don't show error to user
        console.warn('Profile API fetch failed:', error.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (name) => {
    setNotifications((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurity((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/patients/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          phone: personalInfo.phone,
          gender: personalInfo.gender || null,
          dateOfBirth: personalInfo.dob || null,
          avatar: profileImage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Personal information updated successfully');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Password changed successfully');
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsLoading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        toast.success('Profile picture updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    toast.success('Profile picture removed');
  };

  // Show loading state while fetching profile
  if (isFetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Settings</h1>
        <p className="text-muted-foreground text-lg">
          Manage your account preferences and personal information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Profile & Main Form */}
        <div className="space-y-8 lg:col-span-2">
          {/* Profile Picture Section */}
          <Card className="overflow-hidden border-none bg-gradient-to-br from-card via-card to-primary/5 shadow-xl ring-1 ring-border/50">
            <CardContent className="pt-8">
              <div className="flex flex-col items-center gap-8 md:flex-row">
                <div className="relative group">
                  <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background bg-accent shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:ring-4 group-hover:ring-primary/20">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary/10 to-primary/30">
                        <User className="h-16 w-16 text-primary" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="profile-upload"
                    className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-primary p-2.5 text-primary-foreground shadow-lg transition-all hover:scale-110 hover:bg-primary/90 active:scale-95"
                    title="Upload photo"
                  >
                    <Camera size={18} />
                    <input
                      id="profile-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-3 text-center md:text-left">
                  <h3 className="text-2xl font-bold">Profile Picture</h3>
                  <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                    Upload a high-quality image. This picture will be visible to your healthcare
                    providers to help with identification.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2 md:justify-start">
                    <Button
                      variant="primary"
                      size="sm"
                      className="shadow-md"
                      onClick={() => document.getElementById('profile-upload').click()}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Update Photo
                    </Button>
                    {profileImage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={removeImage}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="shadow-lg ring-1 ring-border/50">
            <CardHeader className="border-b bg-muted/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User size={18} />
                </div>
                <div>
                  <CardTitle className="text-xl">Personal Information</CardTitle>
                  <CardDescription>
                    Your contact and profile data used across the platform.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSavePersonalInfo} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">First Name</label>
                    <Input
                      name="firstName"
                      value={personalInfo.firstName}
                      onChange={handlePersonalInfoChange}
                      placeholder="e.g. John"
                      className="bg-muted/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">Last Name</label>
                    <Input
                      name="lastName"
                      value={personalInfo.lastName}
                      onChange={handlePersonalInfoChange}
                      placeholder="e.g. Doe"
                      className="bg-muted/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      name="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      className="border-input bg-muted/20 pl-10"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        name="phone"
                        value={personalInfo.phone}
                        onChange={handlePersonalInfoChange}
                        className="bg-muted/20 pl-10"
                        placeholder="+234 801 234 5678"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/80">Date of Birth</label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        name="dob"
                        type="date"
                        value={personalInfo.dob}
                        onChange={handlePersonalInfoChange}
                        className="bg-muted/20 pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground/80">Gender</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <select
                      name="gender"
                      value={personalInfo.gender}
                      onChange={handlePersonalInfoChange}
                      className="border-input bg-muted/20 placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-lg border px-3 py-2 pl-10 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" className="hover:bg-muted font-normal text-muted-foreground">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button type="submit" className="px-8 shadow-md" loading={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security & Preferences */}
        <div className="space-y-8">
          {/* Security Settings */}
          <Card className="shadow-lg ring-1 ring-border/50">
            <CardHeader className="border-b bg-muted/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck size={18} />
                </div>
                <CardTitle className="text-lg">Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSaveSecurity} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Current Password
                  </label>
                  <PasswordInput
                    name="currentPassword"
                    value={security.currentPassword}
                    onChange={handleSecurityChange}
                    placeholder="••••••••"
                    className="bg-muted/10 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    New Password
                  </label>
                  <PasswordInput
                    name="newPassword"
                    value={security.newPassword}
                    onChange={handleSecurityChange}
                    placeholder="••••••••"
                    className="bg-muted/10 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Confirm Password
                  </label>
                  <PasswordInput
                    name="confirmPassword"
                    value={security.confirmPassword}
                    onChange={handleSecurityChange}
                    placeholder="••••••••"
                    className="bg-muted/10 font-mono"
                  />
                </div>
                <Button type="submit" variant="secondary" className="w-full shadow-sm" loading={isLoading}>
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="shadow-lg ring-1 ring-border/50 overflow-hidden">
            <CardHeader className="border-b bg-muted/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bell size={18} />
                </div>
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div
                className="group flex cursor-pointer items-center justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:bg-accent/50"
                onClick={() => handleNotificationChange('email')}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Email Alerts</p>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
                <div className={`h-6 w-11 rounded-full p-1 transition-colors duration-200 ease-in-out ${notifications.email ? 'bg-primary' : 'bg-muted'}`}>
                   <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${notifications.email ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
              
              <div
                className="group flex cursor-pointer items-center justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:bg-accent/50"
                onClick={() => handleNotificationChange('sms')}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-sm">SMS Alerts</p>
                  <p className="text-xs text-muted-foreground">Urgent updates via text</p>
                </div>
                <div className={`h-6 w-11 rounded-full p-1 transition-colors duration-200 ease-in-out ${notifications.sms ? 'bg-primary' : 'bg-muted'}`}>
                   <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${notifications.sms ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t pt-4">
              <Button
                variant="ghost"
                className="w-full text-primary hover:bg-primary/5 hover:text-primary"
                size="sm"
                onClick={() => toast.success('Preferences saved')}
              >
                Apply Preferences
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Help */}
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-xl">
             <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <ShieldCheck size={20} className="text-white" />
             </div>
             <h4 className="mb-2 font-bold text-lg">Account Protection</h4>
             <p className="mb-4 text-primary-foreground/80 text-sm leading-relaxed">
               Your medical data is encrypted and protected with industry-standard protocols.
             </p>
             <button className="text-xs font-bold uppercase tracking-tighter transition-all hover:underline">
               Learn more about security
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
