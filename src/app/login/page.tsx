
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { User as UserProfile } from "@/lib/types";


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/overview');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async () => {
    if (!auth || !firestore) return;
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      const userDocRef = doc(firestore, 'users', loggedInUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userProfile = userDocSnap.data() as UserProfile;
        if (userProfile.disabled) {
          await auth.signOut();
          toast({
            variant: "destructive",
            title: "Account Disabled",
            description: "Your account is disabled. Please contact an administrator for assistance.",
          });
          setIsLoading(false);
          return;
        }
        
        // Update last login timestamp
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp()
        });
      }
      
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      // Successful sign-in is handled by the onAuthStateChanged listener in the useUser hook
      // which will trigger the useEffect above to redirect.
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "The email or password you entered is incorrect. Please try again.",
        });
        setPassword(''); // Clear the password field
      } else {
         toast({
            variant: "destructive",
            title: "An Error Occurred",
            description: error.message || "Could not sign you in. Please try again later.",
        });
      }
    } finally {
        // Only set loading to false on error, success is handled by redirect
        if (auth.currentUser === null) {
            setIsLoading(false);
        }
    }
  };

  if (isUserLoading || user) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">TDHS ICT Support Center</CardTitle>
          <CardDescription>Enter your credentials to access the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="user@gphealth.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleSignIn} disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
          <Button variant="link" className="w-full" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
           <p className="px-8 text-center text-xs text-muted-foreground mt-2">
            Don't have an account? Please ask your administrator to create one for you.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
