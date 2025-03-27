import { Request, Response } from "express";
import { EventService } from "../services/eventService";
import { IEvent } from "../models/Event";

export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
    // Bind methods to maintain correct 'this' context
    this.createEvent = this.createEvent.bind(this);
    this.getEventById = this.getEventById.bind(this);
    this.getAllEvents = this.getAllEvents.bind(this);
    this.updateEvent = this.updateEvent.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
  }

  // Create a new event
  async createEvent(req: Request, res: Response) {
    try {
      const event = await this.eventService.createEvent(req.body);
      res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Error creating event",
      });
    }
  }

  // Get a single event by ID
  async getEventById(req: Request, res: Response) {
    try {
      const event = await this.eventService.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }
      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Error fetching event",
      });
    }
  }

  // Get all events with optional filtering and pagination
  async getAllEvents(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters: any = {};

      // Apply filters if provided
      if (req.query.category) filters.category = req.query.category;
      if (req.query.date) filters.date = new Date(req.query.date as string);
      if (req.query.organizer) filters.organizer = req.query.organizer;

      const { events, total } = await this.eventService.getAllEvents(
        page,
        limit,
        filters
      );

      res.status(200).json({
        success: true,
        data: events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Error fetching events",
      });
    }
  }

  // Update an event
  async updateEvent(req: Request, res: Response) {
    try {
      const event = await this.eventService.updateEvent(
        req.params.id,
        req.body
      );
      if (!event) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }
      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Error updating event",
      });
    }
  }

  // Delete an event
  async deleteEvent(req: Request, res: Response) {
    try {
      const event = await this.eventService.deleteEvent(req.params.id);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }
      res.status(200).json({
        success: true,
        data: {},
        message: "Event deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Error deleting event",
      });
    }
  }
}
