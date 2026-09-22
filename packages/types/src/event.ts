import { z } from 'zod';
import { EventStatus, EventType, RegistrationStatus } from './enums.js';

export const eventQuerySchema = z.object({
  status: z.enum(['mendatang', 'selesai', 'all']).default('mendatang'),
  type: z.nativeEnum(EventType).optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(12),
});

export type EventQueryInput = z.infer<typeof eventQuerySchema>;

export const eventCreateSchema = z.object({
  title: z.string().min(3, 'Judul kegiatan minimal 3 karakter.').max(120),
  type: z.nativeEnum(EventType).default(EventType.LAINNYA),
  description: z.any(),
  coverImage: z.string().optional().nullable(),
  startAt: z.string().min(1, 'Waktu mulai kegiatan wajib diisi.'),
  endAt: z.string().min(1, 'Waktu selesai kegiatan wajib diisi.'),
  locationName: z.string().min(2, 'Nama lokasi wajib diisi.').max(120),
  locationDetail: z.string().max(300).optional().nullable(),
  mapUrl: z.string().optional().nullable(),
  isOnline: z.boolean().default(false),
  meetingUrl: z.string().optional().nullable(),
  quota: z.number().int().positive().optional().nullable(),
  registrationOpenAt: z.string().optional().nullable(),
  registrationCloseAt: z.string().optional().nullable(),
  isParticipantListPublic: z.boolean().default(false),
  status: z.nativeEnum(EventStatus).default(EventStatus.PUBLISHED),
});

export type EventCreateInput = z.infer<typeof eventCreateSchema>;

export const eventUpdateSchema = eventCreateSchema.partial();
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;

export const eventCheckinSchema = z.object({
  attendanceCode: z.string().length(6).optional(),
  userId: z.string().optional(),
});

export type EventCheckinInput = z.infer<typeof eventCheckinSchema>;

export const eventCompleteSchema = z.object({
  summary: z.string().min(10, 'Ringkasan kegiatan minimal 10 karakter.'),
  gallery: z.array(z.string()).optional(),
});

export type EventCompleteInput = z.infer<typeof eventCompleteSchema>;

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  type: EventType;
  coverImage: string | null;
  startAt: string;
  endAt: string;
  locationName: string;
  isOnline: boolean;
  quota: number | null;
  registeredCount: number;
  status: EventStatus;
  organizer: {
    id: string;
    name: string;
  };
}

export interface EventRegistrationItem {
  id: string;
  status: RegistrationStatus;
  attendanceCode: string;
  note: string | null;
  registeredAt: string;
  checkedInAt: string | null;
  canCancel: boolean;
  calendarUrl: string;
  user?: {
    id: string;
    name: string;
    username: string;
    email?: string;
  };
}

export interface EventDetail extends EventItem {
  description: any;
  locationDetail: string | null;
  mapUrl: string | null;
  meetingUrl?: string | null;
  registrationOpenAt: string | null;
  registrationCloseAt: string | null;
  isParticipantListPublic: boolean;
  summary: string | null;
  gallery: string[] | null;
  myRegistration?: EventRegistrationItem | null;
  participants?: Array<{ name: string; registeredAt: string }>;
}
