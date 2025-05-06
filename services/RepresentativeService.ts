import { getRepository } from "@lib/db";
import { User } from "@entities/User";
import { Representative } from "@entities/Representative";
import { UserService } from "./UserService";
import { RepresentativeRegistration } from "@types/index";
import { hashPassword } from "@lib/utils";
import { generateToken } from "@lib/utils";
import { sendActivationEmail } from "@lib/email";

export class RepresentativeService {
  static async getRepById(id: string): Promise<Representative | null> {
    try {
      const repRepository = await getRepository<Representative>(Representative);
      const rep = await repRepository.findOne({
        where: { id },
        relations: ["user", "client"],
      });
      
      return rep;
    } catch (error) {
      console.error("Error getting rep by ID:", error);
      return null;
    }
  }

  static async getRepByUserId(userId: string): Promise<Representative | null> {
    try {
      const repRepository = await getRepository<Representative>(Representative);
      const rep = await repRepository.findOne({
        where: { userId },
        relations: ["user", "client"],
      });
      
      return rep;
    } catch (error) {
      console.error("Error getting rep by user ID:", error);
      return null;
    }
  }

  static async getAllReps(): Promise<Representative[]> {
    try {
      const repRepository = await getRepository<Representative>(Representative);
      const reps = await repRepository.find({
        relations: ["user", "client"],
      });
      
      return reps;
    } catch (error) {
      console.error("Error getting all reps:", error);
      return [];
    }
  }

  static async getRepsByClientId(clientId: string): Promise<Representative[]> {
    try {
      const repRepository = await getRepository<Representative>(Representative);
      const reps = await repRepository.find({
        where: { clientId },
        relations: ["user"],
      });
      
      return reps;
    } catch (error) {
      console.error("Error getting reps by client ID:", error);
      return [];
    }
  }

  static async createRep(repData: RepresentativeRegistration): Promise<Representative | null> {
    try {
      const userRepository = await getRepository<User>(User);
      const repRepository = await getRepository<Representative>(Representative);
      
      // Create user first
      const hashedPassword = await hashPassword(repData.password);
      const activationToken = generateToken();
      
      const newUser = userRepository.create({
        email: repData.email,
        name: repData.name,
        password: hashedPassword,
        phone: repData.phone || null,
        role: "representative",
        status: "pending",
        activationToken,
      });
      
      const savedUser = await userRepository.save(newUser);
      
      // Create representative profile
      const newRep = repRepository.create({
        userId: savedUser.id,
        clientId: repData.clientId,
        region: repData.region || null,
        territory: repData.territory || null,
      });
      
      const savedRep = await repRepository.save(newRep);
      
      // Send activation email (in production)
      if (process.env.NODE_ENV === "production") {
        const activationLink = `${process.env.NEXTAUTH_URL}/activate-account?token=${activationToken}`;
        await sendActivationEmail(repData.email, repData.name, activationLink);
      }
      
      return savedRep;
    } catch (error) {
      console.error("Error creating representative:", error);
      throw error;
    }
  }

  static async updateRep(repId: string, updateData: { region?: string; territory?: string }): Promise<Representative | null> {
    try {
      const repRepository = await getRepository<Representative>(Representative);
      const rep = await repRepository.findOne({ where: { id: repId } });
      
      if (!rep) {
        throw new Error("Representative not found");
      }
      
      if (updateData.region) rep.region = updateData.region;
      if (updateData.territory) rep.territory = updateData.territory;
      
      const updatedRep = await repRepository.save(rep);
      
      return updatedRep;
    } catch (error) {
      console.error("Error updating representative:", error);
      return null;
    }
  }
}
