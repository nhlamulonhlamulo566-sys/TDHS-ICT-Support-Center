
'use server';
/**
 * @fileOverview A ticket diagnosis AI agent.
 *
 * - diagnoseTicket - A function that handles the ticket diagnosis process.
 * - DiagnoseTicketInput - The input type for the diagnoseTicket function.
 * - DiagnoseTicketOutput - The return type for the diagnoseTicket function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DiagnoseTicketInputSchema = z.object({
  description: z.string().describe('The detailed description of the IT issue from the ticket.'),
});
export type DiagnoseTicketInput = z.infer<typeof DiagnoseTicketInputSchema>;

const DiagnoseTicketOutputSchema = z.object({
  potentialDiagnosis: z.string().describe("The likely cause of the issue based on the description."),
  suggestedSteps: z.array(z.string()).describe("A list of concrete, actionable steps the technician should take to resolve the issue."),
});
export type DiagnoseTicketOutput = z.infer<typeof DiagnoseTicketOutputSchema>;

export async function diagnoseTicket(input: DiagnoseTicketInput): Promise<DiagnoseTicketOutput> {
  const diagnoseTicketFlow = ai.defineFlow(
    {
      name: 'diagnoseTicketFlow',
      inputSchema: DiagnoseTicketInputSchema,
      outputSchema: DiagnoseTicketOutputSchema,
    },
    async ({ description }) => {
      const prompt = `You are an expert IT support technician with years of experience in a corporate environment.
      A new ticket has come in. Your task is to analyze the user's description of the problem and provide a preliminary diagnosis and a set of actionable steps for a junior technician to follow.

      Focus on common issues related to software, hardware, networking, and user accounts. Provide clear, concise, and practical advice.

      Ticket Description:
      "${description}"

      Based on this description, provide your expert diagnosis and suggested troubleshooting steps.
      `;
      
      const llmResponse = await ai.generate({
        prompt: prompt,
        output: {
          schema: DiagnoseTicketOutputSchema,
        },
      });

      return llmResponse.output!;
    }
  );
  return diagnoseTicketFlow(input);
}
