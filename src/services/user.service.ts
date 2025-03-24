// src/services/user.service.ts
import { User, IUser } from '../models/user.model';
import logger from '../config/logger';

export class UserService {
  public static async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  public static async authenticate(
    email: string,
    password: string
  ): Promise<IUser | null> {
    try {
      const user = await this.findByEmail(email);
      
      if (!user) {
        return null;
      }

      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error('Error authenticating user:', error);
      throw error;
    }
  }
}