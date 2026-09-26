import { Request, Response, NextFunction } from 'express';
import {
  eventQuerySchema,
  eventCreateSchema,
  eventUpdateSchema,
  eventCheckinSchema,
  eventCompleteSchema,
} from '@perpusjal/types';
import { eventsService } from './events.service.js';

export class EventsController {
  async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const query = eventQuerySchema.parse(req.query);
      const result = await eventsService.getEvents(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getEventBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const result = await eventsService.getEventBySlug(slug, req.user);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const input = eventCreateSchema.parse(req.body);
      const result = await eventsService.createEvent(input, req.user!);
      res.status(201).json({ data: result, message: 'Kegiatan berhasil dibuat.' });
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const input = eventUpdateSchema.parse(req.body);
      const result = await eventsService.updateEvent(id, input, req.user!);
      res.status(200).json({ data: result, message: 'Kegiatan berhasil diperbarui.' });
    } catch (error) {
      next(error);
    }
  }

  async registerEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await eventsService.registerEvent(id, req.user!);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async cancelRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await eventsService.cancelRegistration(id, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await eventsService.getRegistrations(id, req.user!);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async checkin(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const input = eventCheckinSchema.parse(req.body);
      const result = await eventsService.checkin(id, input, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async completeEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const input = eventCompleteSchema.parse(req.body);
      const result = await eventsService.completeEvent(id, input, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await eventsService.getEventById(id, req.user);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await eventsService.deleteEvent(id, req.user!);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eventsService.getMyRegistrations(req.user!);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  async getIcsCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const ics = await eventsService.generateIcs(id);
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="event-${id}.ics"`);
      res.send(ics);
    } catch (error) {
      next(error);
    }
  }
}

export const eventsController = new EventsController();
