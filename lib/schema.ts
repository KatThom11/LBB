import { z } from 'zod';
export const categories = ['My Theory', 'My Anti-Theory', 'Evidence', 'Objections', 'Questions', 'What Would Change My Mind?', 'Revised Conclusions'] as const;
export type Category = typeof categories[number];
export const journeyIds = ['atlas', 'trial', 'refraction'] as const;
export type JourneyId = typeof journeyIds[number];
export const provenanceKinds = ['scripted', 'ai-generated', 'source-paraphrase', 'visitor', 'placeholder'] as const;
export type Provenance = typeof provenanceKinds[number];
const boundedText = z.string().max(8000);
const messageSchema = z.object({ id: z.string(), role: z.enum(['user', 'assistant']), text: boundedText, kind: z.enum(provenanceKinds), createdAt: z.string(), sourceIds: z.array(z.string()).max(10), interrupted: z.boolean().optional() });
export type Message = z.infer<typeof messageSchema>;
const progressSchema = z.object({ step: z.number().int().min(0).max(3), thought: z.string().max(4000), disposition: z.string().max(100), reason: z.string().max(2000), complete: z.boolean() });
export type JourneyProgress = z.infer<typeof progressSchema>;
const conversationSchema = z.object({ id: z.string(), title: z.string().max(100), createdAt: z.string(), updatedAt: z.string(), messages: z.array(messageSchema).max(200), journeys: z.record(z.string(), progressSchema), currentJourney: z.enum(journeyIds).optional() });
export type Conversation = z.infer<typeof conversationSchema>;
const revisionSchema = z.object({ id: z.string(), text: z.string().min(1).max(4000), createdAt: z.string() });
export type Revision = z.infer<typeof revisionSchema>;
const entrySchema = z.object({ id: z.string(), category: z.enum(categories), conversationId: z.string(), journeyId: z.enum(journeyIds).optional(), sourceMessageId: z.string().optional(), origin: z.enum(['visitor', 'scripted', 'ai-generated']), status: z.literal('unverified'), revisions: z.array(revisionSchema).min(1).max(50) });
export type NotebookEntry = z.infer<typeof entrySchema>;
export const workspaceSchema = z.object({ version: z.literal(1), activeId: z.string().nullable(), conversations: z.array(conversationSchema).max(50), entries: z.array(entrySchema).max(200), contrast: z.boolean(), textSize: z.enum(['normal', 'large', 'larger']) });
export type Workspace = z.infer<typeof workspaceSchema>;
export const emptyWorkspace: Workspace = { version: 1, activeId: null, conversations: [], entries: [], contrast: false, textSize: 'normal' };
export const STORAGE_KEY = 'lbb-chat-workspace-v1';
export const id = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const freshConversation = (): Conversation => ({ id: id(), title: 'A fresh page', createdAt: now(), updatedAt: now(), messages: [], journeys: {} });
export const freshProgress = (): JourneyProgress => ({ step: 0, thought: '', disposition: 'Unresolved', reason: '', complete: false });
export const chatRequestSchema = z.object({
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(3000) })).min(1).max(16),
  journey: z.enum(journeyIds).optional(),
  shareNotebook: z.boolean(),
  notebook: z.array(z.object({ category: z.enum(categories), text: z.string().max(2000), status: z.literal('unverified') })).max(5),
}).strict().superRefine((value, ctx) => {
  if (value.notebook.length && !value.shareNotebook) ctx.addIssue({ code: 'custom', message: 'Notebook sharing requires explicit consent.', path: ['shareNotebook'] });
  if (value.messages.at(-1)?.role !== 'user') ctx.addIssue({ code: 'custom', message: 'The last message must be from the visitor.', path: ['messages'] });
});
