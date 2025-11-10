
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/page-header";
import { UserTable } from "@/components/admin/user-table";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { useUserProfile } from '@/hooks/use-user-profile';

export default function AdminPage() {
  const { userProfile, isLoading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if loading is finished and the user is defined but not an admin.
    if (!isLoading && userProfile && userProfile.role !== 'Admin') {
      router.push('/overview');
    }
  }, [userProfile, isLoading, router]);

  // While loading, show a loading state.
  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><p>Verifying access...</p></div>;
  }

  // After loading, if the user is not an admin, show unauthorized. 
  // The useEffect above will handle the redirection.
  if (userProfile?.role !== 'Admin') {
    return <div className="flex items-center justify-center h-full"><p>Unauthorized access.</p></div>;
  }
  
  // If the user is an admin, render the page.
  return (
    <div>
      <PageHeader title="User Management">
        <AddUserDialog />
      </PageHeader>
      <UserTable />
    </div>
  );
}
