
"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, UserRole, UserAvailability } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle, UserCheck, UserX } from "lucide-react"
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { EditUserDialog } from "./edit-user-dialog";
import { DisableUserDialog } from "./delete-user-dialog";


interface UserTableProps {
  roleFilter?: UserRole;
}

const roleBadgeVariant: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
  'Admin': 'destructive',
  'Supervisor': 'default',
  'Technician': 'secondary',
  'Help Desk': 'outline',
}

const availabilityBadgeVariant: Record<UserAvailability, "default" | "secondary" > = {
  'Available': 'default',
  'On Leave': 'secondary',
}

const availabilityBadgeClass: Record<UserAvailability, string> = {
    'Available': 'bg-green-500',
    'On Leave': 'bg-gray-500',
}


export function UserTable({ roleFilter }: UserTableProps) {
  const firestore = useFirestore();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [disablingUser, setDisablingUser] = useState<User | null>(null);
  
  const usersCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection<User>(usersCollection);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!roleFilter) return users;
    return users.filter(user => user.role === roleFilter);
  }, [users, roleFilter]);


  const getAvatarUrl = (avatarId: string) => {
    return PlaceHolderImages.find(img => img.id === avatarId)?.imageUrl;
  }
  
  const handleAvailabilityChange = (userId: string, newAvailability: UserAvailability) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    updateDocumentNonBlocking(userDocRef, { availability: newAvailability });
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{roleFilter ? `${roleFilter}s` : "System Users"}</CardTitle>
          <CardDescription>
            {roleFilter ? `A list of all ${roleFilter}s.` : "A list of all users in the system."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Persal No.</TableHead>
                <TableHead className="hidden lg:table-cell">Phone No.</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                <TableRow key={user.id} className={user.disabled ? "bg-muted/50 text-muted-foreground" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                      <Badge variant={roleBadgeVariant[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.disabled ? (
                        <Badge variant="destructive">Disabled</Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-green-500 text-white">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.persalNumber || 'N/A'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{user.phoneNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={availabilityBadgeVariant[user.availability]} className={availabilityBadgeClass[user.availability]}>{user.availability}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" disabled={user.disabled}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => setEditingUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.availability === 'On Leave' && (
                            <DropdownMenuItem onClick={() => handleAvailabilityChange(user.id, 'Available')}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              <span>Mark as Available</span>
                            </DropdownMenuItem>
                          )}
                          {user.availability === 'Available' && (
                            <DropdownMenuItem onClick={() => handleAvailabilityChange(user.id, 'On Leave')}>
                              <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                              <span>Mark as On Leave</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                           {user.disabled ? (
                             <DropdownMenuItem onClick={() => updateDocumentNonBlocking(doc(firestore, 'users', user.id), { disabled: false })}>
                               <UserCheck className="mr-2 h-4 w-4" />
                               <span>Enable User</span>
                             </DropdownMenuItem>
                           ) : (
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => setDisablingUser(user)}>
                                <UserX className="mr-2 h-4 w-4" />
                                <span>Disable User</span>
                            </DropdownMenuItem>
                           )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
              ) : (
                  <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                      No users found.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          isOpen={!!editingUser}
          onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}
        />
      )}

      {disablingUser && (
        <DisableUserDialog
          user={disablingUser}
          isOpen={!!disablingUser}
          onOpenChange={(isOpen) => !isOpen && setDisablingUser(null)}
        />
      )}
    </>
  );
}
