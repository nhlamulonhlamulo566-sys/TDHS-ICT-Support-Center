
'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogCallDialog } from "@/components/tickets/log-call-dialog";
import { TrackTicketDialog } from "@/components/tickets/track-ticket-dialog";

export default function LandingPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white border-b">
        <Link href="#" className="flex items-center justify-center font-semibold" prefetch={false}>
          TDHS ICT Support Center
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" passHref>
             <Button variant="outline">Staff Login</Button>
          </Link>
        </nav>
      </header>
      <main 
        className="flex-1 flex flex-col justify-center items-center p-4 relative bg-gray-50"
      >
        <div 
          className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-10"
          style={{
            backgroundImage: "url('https://www.gauteng.gov.za/Style%20Library/GoG/images/logo.png')",
          }}
        />
        <div 
          className="relative z-10 flex flex-col items-center space-y-6 text-center w-full"
        >
            <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                TDHS ICT Support Center
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Log a new support ticket or track an existing one.
            </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <LogCallDialog />
              <TrackTicketDialog />
            </div>
        </div>
        <div 
            className="container grid items-start justify-center gap-4 px-4 md:px-6 mt-12 text-center max-w-3xl relative z-10"
        >
            <Card className="w-full bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Welcome to the TDHS Support System</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>If you are experiencing an issue, please log a call for assistance. Your new ticket will be reviewed by our Help Desk team.</p>
                    <p>Click the "Log New Call" button to get started. Please provide as much detail as possible so we can assist you effectively.</p>
                </CardContent>
            </Card>
        </div>
      </main>
      <footer className="bg-gray-50 p-4">
        <div className="container max-w-3xl mx-auto text-center text-xs text-gray-500 space-y-2">
            <p>
                <strong>ICT Department - Gauteng Dept of Health</strong> | <strong>Tel:</strong> 012 451 9071 / 9072 | <strong>e-mail:</strong> <a href="mailto:Tshwaneithelpdesk@gauteng.gov.za" className="text-primary underline">Tshwaneithelpdesk@gauteng.gov.za</a>
            </p>
            <p>
               This message may contain confidential information and is intended only for the individual named. If you are not the named addressee you should not disseminate, distribute or copy this e-mail.
            </p>
        </div>
      </footer>
    </div>
  );
}
