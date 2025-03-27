import { Event, IEvent } from "../models/Event";
import { Types } from "mongoose";

export class EventService {
  // Create a new event
  async createEvent(
    eventData: Omit<IEvent, "_id" | "createdAt" | "updatedAt">
  ): Promise<IEvent> {
    const event = new Event(eventData);
    return await event.save();
  }

  // Get a single event by ID
  async getEventById(id: string): Promise<IEvent | null> {
    return await Event.findById(id);
  }

  // Get all events with optional filtering and pagination
  async getAllEvents(
    page: number = 1,
    limit: number = 10,
    filters: {
      category?: string;
      date?: Date;
      organizer?: Types.ObjectId;
    } = {}
  ): Promise<{ events: IEvent[]; total: number }> {
    const query = Event.find(filters);
    const total = await Event.countDocuments(filters);

    const events = await query
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ date: 1 })
      .exec();

    return { events, total };
  }

  // Update an event
  async updateEvent(
    id: string,
    updateData: Partial<IEvent>
  ): Promise<IEvent | null> {
    return await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  // Delete an event
  async deleteEvent(id: string): Promise<IEvent | null> {
    return await Event.findByIdAndDelete(id);
  }
}
