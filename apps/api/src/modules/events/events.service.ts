import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../utils/errors.js';
import {
  EventQueryInput,
  EventCreateInput,
  EventUpdateInput,
  EventCheckinInput,
  EventCompleteInput,
  EventItem,
  EventDetail,
  EventRegistrationItem,
  EventStatus,
  EventType,
  RegistrationStatus,
  Role,
  UserSessionPayload,
} from '@perpusjal/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function generateAttendanceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class EventsService {
  /**
   * List events with filter (upcoming vs completed)
   */
  async getEvents(query: EventQueryInput) {
    const { status = 'mendatang', type, page = 1, perPage = 12 } = query;
    const skip = (page - 1) * perPage;
    const now = new Date();

    const where: any = {};

    if (status === 'mendatang') {
      where.startAt = { gte: now };
      where.status = {
        in: [
          EventStatus.PUBLISHED,
          EventStatus.OPEN,
          EventStatus.FULL,
        ] as unknown as any[],
      };
    } else if (status === 'selesai') {
      where.OR = [
        { startAt: { lt: now } },
        { status: EventStatus.COMPLETED as unknown as any },
      ];
    }

    if (type) {
      where.type = type as unknown as any;
    }

    const orderBy: any = status === 'selesai' ? { startAt: 'desc' } : { startAt: 'asc' };

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
        include: {
          organizer: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              registrations: {
                where: {
                  status: {
                    in: [
                      RegistrationStatus.REGISTERED,
                      RegistrationStatus.ATTENDED,
                    ] as unknown as any[],
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const items: EventItem[] = events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      type: e.type as unknown as EventType,
      coverImage: e.coverImage,
      startAt: e.startAt.toISOString(),
      endAt: e.endAt.toISOString(),
      locationName: e.locationName,
      isOnline: e.isOnline,
      quota: e.quota,
      registeredCount: e._count.registrations,
      status: e.status as unknown as EventStatus,
      organizer: e.organizer,
    }));

    return {
      data: items,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  /**
   * Event dossier detail by slug (protects meetingUrl per AC-EVT-04)
   */
  async getEventBySlug(slug: string, user?: UserSessionPayload): Promise<EventDetail> {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        organizer: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            registrations: {
              where: {
                status: {
                  in: [
                    RegistrationStatus.REGISTERED,
                    RegistrationStatus.ATTENDED,
                  ] as unknown as any[],
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw HttpError.notFound('Kegiatan tidak ditemukan.');
    }

    let myRegistration: EventRegistrationItem | null = null;
    let isUserRegistered = false;

    if (user) {
      const reg = await prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId: event.id,
            userId: user.userId,
          },
        },
      });

      if (reg) {
        isUserRegistered =
          reg.status === (RegistrationStatus.REGISTERED as unknown as any) ||
          reg.status === (RegistrationStatus.ATTENDED as unknown as any);

        const canCancel =
          reg.status === (RegistrationStatus.REGISTERED as unknown as any) &&
          new Date(event.startAt).getTime() - Date.now() >= 24 * 60 * 60 * 1000;

        myRegistration = {
          id: reg.id,
          status: reg.status as unknown as RegistrationStatus,
          attendanceCode: reg.attendanceCode,
          note: reg.note,
          registeredAt: reg.registeredAt.toISOString(),
          checkedInAt: reg.checkedInAt ? reg.checkedInAt.toISOString() : null,
          canCancel,
          calendarUrl: `/api/v1/events/${event.id}/calendar.ics`,
        };
      }
    }

    const isOrganizerOrAdmin =
      user &&
      (user.userId === event.organizerId ||
        user.role === Role.KURATOR ||
        user.role === Role.ADMIN);

    // AC-EVT-04: meetingUrl is only visible to registered attendees or organizers
    const meetingUrl = isUserRegistered || isOrganizerOrAdmin ? event.meetingUrl : null;

    let participants: Array<{ name: string; registeredAt: string }> | undefined;
    if (event.isParticipantListPublic || isOrganizerOrAdmin) {
      const participantRows = await prisma.eventRegistration.findMany({
        where: {
          eventId: event.id,
          status: {
            in: [
              RegistrationStatus.REGISTERED,
              RegistrationStatus.ATTENDED,
            ] as unknown as any[],
          },
        },
        select: {
          user: { select: { name: true } },
          registeredAt: true,
        },
        orderBy: { registeredAt: 'asc' },
      });
      participants = participantRows.map((p) => ({
        name: p.user.name,
        registeredAt: p.registeredAt.toISOString(),
      }));
    }

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      type: event.type as unknown as EventType,
      coverImage: event.coverImage,
      description: event.description,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      locationName: event.locationName,
      locationDetail: event.locationDetail,
      mapUrl: event.mapUrl,
      isOnline: event.isOnline,
      meetingUrl,
      quota: event.quota,
      registeredCount: event._count.registrations,
      registrationOpenAt: event.registrationOpenAt ? event.registrationOpenAt.toISOString() : null,
      registrationCloseAt: event.registrationCloseAt ? event.registrationCloseAt.toISOString() : null,
      isParticipantListPublic: event.isParticipantListPublic,
      status: event.status as unknown as EventStatus,
      summary: event.summary,
      gallery: event.gallery ? (event.gallery as string[]) : null,
      organizer: event.organizer,
      myRegistration,
      participants,
    };
  }

  /**
   * Create Event (Kurator / Admin)
   */
  async createEvent(input: EventCreateInput, user: UserSessionPayload) {
    const baseSlug = slugify(input.title);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${randomSuffix}`;

    const created = await prisma.event.create({
      data: {
        title: input.title.trim(),
        slug,
        type: input.type as unknown as any,
        description: input.description,
        coverImage: input.coverImage || null,
        startAt: new Date(input.startAt),
        endAt: new Date(input.endAt),
        locationName: input.locationName.trim(),
        locationDetail: input.locationDetail ? input.locationDetail.trim() : null,
        mapUrl: input.mapUrl || null,
        isOnline: input.isOnline ?? false,
        meetingUrl: input.meetingUrl || null,
        quota: input.quota || null,
        registrationOpenAt: input.registrationOpenAt ? new Date(input.registrationOpenAt) : null,
        registrationCloseAt: input.registrationCloseAt ? new Date(input.registrationCloseAt) : null,
        isParticipantListPublic: input.isParticipantListPublic ?? false,
        status: input.status as unknown as any,
        organizerId: user.userId,
      },
    });

    return this.getEventBySlug(created.slug, user);
  }

  /**
   * Update Event
   */
  async updateEvent(id: string, input: EventUpdateInput, user: UserSessionPayload) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw HttpError.notFound('Kegiatan tidak ditemukan.');
    }

    if (user.role !== Role.ADMIN && event.organizerId !== user.userId) {
      throw HttpError.forbidden('Hanya penyelenggara kegiatan atau admin yang berhak menyunting kegiatan ini.');
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(input.title ? { title: input.title.trim() } : {}),
        ...(input.type ? { type: input.type as unknown as any } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.coverImage !== undefined ? { coverImage: input.coverImage } : {}),
        ...(input.startAt ? { startAt: new Date(input.startAt) } : {}),
        ...(input.endAt ? { endAt: new Date(input.endAt) } : {}),
        ...(input.locationName ? { locationName: input.locationName.trim() } : {}),
        ...(input.locationDetail !== undefined ? { locationDetail: input.locationDetail } : {}),
        ...(input.mapUrl !== undefined ? { mapUrl: input.mapUrl } : {}),
        ...(input.isOnline !== undefined ? { isOnline: input.isOnline } : {}),
        ...(input.meetingUrl !== undefined ? { meetingUrl: input.meetingUrl } : {}),
        ...(input.quota !== undefined ? { quota: input.quota } : {}),
        ...(input.registrationOpenAt !== undefined ? { registrationOpenAt: input.registrationOpenAt ? new Date(input.registrationOpenAt) : null } : {}),
        ...(input.registrationCloseAt !== undefined ? { registrationCloseAt: input.registrationCloseAt ? new Date(input.registrationCloseAt) : null } : {}),
        ...(input.isParticipantListPublic !== undefined ? { isParticipantListPublic: input.isParticipantListPublic } : {}),
        ...(input.status ? { status: input.status as unknown as any } : {}),
      },
    });

    return this.getEventBySlug(updated.slug, user);
  }

  /**
   * Register attendee for an event (FR-EVT-01, AC-EVT-01)
   */
  async registerEvent(id: string, user: UserSessionPayload) {
    return prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw HttpError.notFound('Kegiatan tidak ditemukan.');
      }

      if (event.endAt < new Date()) {
        throw HttpError.badRequest('Kegiatan ini sudah selesai diselenggarakan.');
      }

      // Check existing registration
      const existing = await tx.eventRegistration.findUnique({
        where: {
          eventId_userId: {
            eventId: id,
            userId: user.userId,
          },
        },
      });

      if (existing && existing.status === (RegistrationStatus.REGISTERED as unknown as any)) {
        throw HttpError.conflict('Anda sudah terdaftar sebagai peserta dalam kegiatan ini.');
      }

      // Check quota
      if (event.quota) {
        const registeredCount = await tx.eventRegistration.count({
          where: {
            eventId: id,
            status: RegistrationStatus.REGISTERED as unknown as any,
          },
        });

        if (registeredCount >= event.quota) {
          throw HttpError.unprocessable('Kuota peserta untuk kegiatan ini sudah penuh.', 'EVENT_FULL');
        }
      }

      const attendanceCode = generateAttendanceCode();

      const reg = await tx.eventRegistration.upsert({
        where: {
          eventId_userId: {
            eventId: id,
            userId: user.userId,
          },
        },
        create: {
          eventId: id,
          userId: user.userId,
          status: RegistrationStatus.REGISTERED as unknown as any,
          attendanceCode,
          registeredAt: new Date(),
        },
        update: {
          status: RegistrationStatus.REGISTERED as unknown as any,
          attendanceCode,
          registeredAt: new Date(),
          cancelledAt: null,
        },
      });

      return {
        status: reg.status,
        attendanceCode: reg.attendanceCode,
        calendarUrl: `/api/v1/events/${event.id}/calendar.ics`,
        message: 'Pendaftaran berhasil! Simpan kode hadir Anda.',
      };
    });
  }

  /**
   * Cancel attendee registration (allowed until H-1 per FR-EVT-02)
   */
  async cancelRegistration(id: string, user: UserSessionPayload) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw HttpError.notFound('Kegiatan tidak ditemukan.');
    }

    const reg = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId: user.userId,
        },
      },
    });

    if (!reg || reg.status !== (RegistrationStatus.REGISTERED as unknown as any)) {
      throw HttpError.notFound('Pendaftaran tidak ditemukan atau sudah dibatalkan.');
    }

    // Check H-1 rule
    const hoursLeft = (new Date(event.startAt).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft < 24) {
      throw HttpError.badRequest(
        'Pembatalan mandiri hanya dapat dilakukan hingga H-1 kegiatan. Silakan hubungi panitia penyelenggara.'
      );
    }

    await prisma.eventRegistration.update({
      where: { id: reg.id },
      data: {
        status: RegistrationStatus.CANCELLED as unknown as any,
        cancelledAt: new Date(),
      },
    });

    return { message: 'Pendaftaran kegiatan berhasil dibatalkan.' };
  }

  /**
   * Panitia: Get attendee list
   */
  async getRegistrations(id: string, user: UserSessionPayload) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw HttpError.notFound('Kegiatan tidak ditemukan.');
    }

    if (user.role !== Role.ADMIN && event.organizerId !== user.userId) {
      throw HttpError.forbidden('Hanya panitia penyelenggara yang berhak mengakses daftar peserta.');
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      orderBy: { registeredAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return registrations.map((r) => ({
      id: r.id,
      status: r.status as unknown as RegistrationStatus,
      attendanceCode: r.attendanceCode,
      note: r.note,
      registeredAt: r.registeredAt.toISOString(),
      checkedInAt: r.checkedInAt ? r.checkedInAt.toISOString() : null,
      canCancel: false,
      calendarUrl: '',
      user: r.user,
    }));
  }

  /**
   * Panitia: Check-in attendee with attendanceCode or userId (FR-EVT-04)
   */
  async checkin(id: string, input: EventCheckinInput, user: UserSessionPayload) {
    const { attendanceCode, userId } = input;
    if (!attendanceCode && !userId) {
      throw HttpError.badRequest('attendanceCode atau userId harus disertakan.');
    }

    const where: any = { eventId: id };
    if (attendanceCode) {
      where.attendanceCode = attendanceCode.trim().toUpperCase();
    } else if (userId) {
      where.userId = userId;
    }

    const reg = await prisma.eventRegistration.findFirst({
      where,
      include: { user: true },
    });

    if (!reg) {
      throw HttpError.notFound('Peserta dengan kode atau ID tersebut tidak terdaftar.');
    }

    const updated = await prisma.eventRegistration.update({
      where: { id: reg.id },
      data: {
        status: RegistrationStatus.ATTENDED as unknown as any,
        checkedInAt: new Date(),
      },
    });

    return {
      message: `Presensi berhasil! Selamat datang, ${reg.user.name}.`,
      attendeeName: reg.user.name,
    };
  }

  /**
   * Panitia: Complete event with post-event documentation (FR-EVT-05)
   */
  async completeEvent(id: string, input: EventCompleteInput, user: UserSessionPayload) {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw HttpError.notFound('Kegiatan tidak ditemukan.');
    }

    if (user.role !== Role.ADMIN && event.organizerId !== user.userId) {
      throw HttpError.forbidden('Hanya panitia penyelenggara yang berhak mengunggah dokumentasi.');
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.COMPLETED as unknown as any,
        summary: input.summary.trim(),
        gallery: (input.gallery as any) || undefined,
      },
    });

    return {
      message: 'Dokumentasi kegiatan berhasil disimpan.',
      event: updated,
    };
  }

  /**
   * Generate iCalendar (.ics) format string
   */
  async generateIcs(id: string): Promise<string> {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw HttpError.notFound('Kegiatan tidak ditemukan.');
    }

    const formatDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const start = formatDate(event.startAt);
    const end = formatDate(event.endAt);

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Perpusjal Blora//Literacy Events//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.id}@perpusjalblora.id`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.locationDetail || 'Kegiatan literasi Perpustakaan Jalanan Blora.'}`,
      `LOCATION:${event.locationName}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }
}

export const eventsService = new EventsService();
