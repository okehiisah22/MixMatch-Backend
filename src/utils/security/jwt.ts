import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

class Jwt {
  public static issue(payload: any, expires: any): any {
    return jwt.sign({ payload }, process.env.JWT_SECRET as string, {
      expiresIn: expires as any,
    });
  }

  public static verify(token: string): any {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  }
}

export default Jwt;
