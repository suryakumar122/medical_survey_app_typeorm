import { getRepository } from "@lib/db";
import { User } from "@entities/User";
import { Doctor } from "@entities/Doctor";
import { DoctorClientMapping } from "@entities/DoctorClientMapping";
import { DoctorRepMapping } from "@entities/DoctorRepMapping";
import { UserService } from "./UserService";
import { hashPassword, parseCSV } from "@lib/utils";
import { DoctorRegistration, CSVDoctor } from "@types/index";
import { sendActivationEmail } from "@lib/email";
import { generateToken } from "@lib/utils";

export class DoctorService {
  static async getDoctorById(id: string): Promise<Doctor | null> {
    try {
      const doctorRepository = await getRepository<Doctor>(Doctor);
      const doctor = await doctorRepository.findOne({
        where: { id },
        relations: ["user"],
      });
      
      return doctor;
    } catch (error) {
      console.error("Error getting doctor by ID:", error);
      return null;
    }
  }

  static async getDoctorByUserId(userId: string): Promise<Doctor | null> {
    try {
      const doctorRepository = await getRepository<Doctor>(Doctor);
      const doctor = await doctorRepository.findOne({
        where: { userId },
        relations: ["user"],
      });
      
      return doctor;
    } catch (error) {
      console.error("Error getting doctor by user ID:", error);
      return null;
    }
  }

  static async getAllDoctors(): Promise<Doctor[]> {
    try {
      const doctorRepository = await getRepository<Doctor>(Doctor);
      const doctors = await doctorRepository.find({
        relations: ["user"],
      });
      
      return doctors;
    } catch (error) {
      console.error("Error getting all doctors:", error);
      return [];
    }
  }

  static async createDoctor(doctorData: DoctorRegistration): Promise<Doctor | null> {
    try {
      const userRepository = await getRepository<User>(User);
      const doctorRepository = await getRepository<Doctor>(Doctor);
      const doctorClientRepository = await getRepository<DoctorClientMapping>(DoctorClientMapping);
      const doctorRepRepository = await getRepository<DoctorRepMapping>(DoctorRepMapping);
      
      // Create user first
      const hashedPassword = await hashPassword(doctorData.password);
      const activationToken = generateToken();
      
      const newUser = userRepository.create({
        email: doctorData.email,
        name: doctorData.name,
        password: hashedPassword,
        phone: doctorData.phone || null,
        role: "doctor",
        status: "pending",
        activationToken,
      });
      
      const savedUser = await userRepository.save(newUser);
      
      // Create doctor profile
      const newDoctor = doctorRepository.create({
        userId: savedUser.id,
        specialty: doctorData.specialty || null,
        hospital: doctorData.hospital || null,
        totalPoints: 0,
        redeemedPoints: 0,
      });
      
      const savedDoctor = await doctorRepository.save(newDoctor);
      
      // Create mappings if client or rep IDs are provided
      if (doctorData.clientId) {
        const newClientMapping = doctorClientRepository.create({
          doctorId: savedDoctor.id,
          clientId: doctorData.clientId,
        });
        await doctorClientRepository.save(newClientMapping);
      }
      
      if (doctorData.repId) {
        const newRepMapping = doctorRepRepository.create({
          doctorId: savedDoctor.id,
          repId: doctorData.repId,
        });
        await doctorRepRepository.save(newRepMapping);
      }
      
      // Send activation email (in production)
      if (process.env.NODE_ENV === "production") {
        const activationLink = `${process.env.NEXTAUTH_URL}/activate-account?token=${activationToken}`;
        await sendActivationEmail(doctorData.email, doctorData.name, activationLink);
      }
      
      return savedDoctor;
    } catch (error) {
      console.error("Error creating doctor:", error);
      throw error;
    }
  }

  static async processCsvUpload(csvContent: string, clientId: string): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const records = parseCSV(csvContent);
      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };
      
      for (const record of records) {
        try {
          // Validate required fields
          if (!record.name || !record.email) {
            results.failed++;
            results.errors.push(`Row with email ${record.email || 'unknown'}: Missing required fields (name or email)`);
            continue;
          }
          
          // Check if user already exists
          const existingUser = await UserService.getUserByEmail(record.email);
          if (existingUser) {
            results.failed++;
            results.errors.push(`Row with email ${record.email}: User already exists`);
            continue;
          }
          
          // Generate a random password for initial setup
          const tempPassword = generateToken(8);
          
          // Create the doctor
          const doctorData: DoctorRegistration = {
            name: record.name,
            email: record.email,
            password: tempPassword,
            phone: record.phone,
            role: "doctor",
            specialty: record.specialty,
            hospital: record.hospital,
            clientId,
          };
          
          // If repEmail is provided, find the rep and assign them
          if (record.repEmail) {
            const repUser = await UserService.getUserByEmail(record.repEmail);
            if (repUser && repUser.role === "representative") {
              const repRepository = await getRepository<Doctor>(Doctor);
              const rep = await repRepository.findOne({ where: { userId: repUser.id } });
              if (rep) {
                doctorData.repId = rep.id;
              }
            }
          }
          
          await this.createDoctor(doctorData);
          results.success++;
        } catch (error) {
          console.error(`Error processing row with email ${record.email}:`, error);
          results.failed++;
          results.errors.push(`Row with email ${record.email}: ${(error as Error).message}`);
        }
      }
      
      return results;
    } catch (error) {
      console.error("Error processing CSV upload:", error);
      throw error;
    }
  }

  static async updateDoctorPoints(doctorId: string, pointsEarned: number): Promise<boolean> {
    try {
      const doctorRepository = await getRepository<Doctor>(Doctor);
      const doctor = await doctorRepository.findOne({ where: { id: doctorId } });
      
      if (!doctor) {
        throw new Error("Doctor not found");
      }
      
      doctor.totalPoints += pointsEarned;
      await doctorRepository.save(doctor);
      
      return true;
    } catch (error) {
      console.error("Error updating doctor points:", error);
      return false;
    }
  }

  static async getDoctorsByClientId(clientId: string): Promise<Doctor[]> {
    try {
      const doctorClientRepository = await getRepository<DoctorClientMapping>(DoctorClientMapping);
      const mappings = await doctorClientRepository.find({
        where: { clientId },
        relations: ["doctor", "doctor.user"],
      });
      
      return mappings.map(m => m.doctor);
    } catch (error) {
      console.error("Error getting doctors by client ID:", error);
      return [];
    }
  }

  static async getDoctorsByRepId(repId: string): Promise<Doctor[]> {
    try {
      const doctorRepRepository = await getRepository<DoctorRepMapping>(DoctorRepMapping);
      const mappings = await doctorRepRepository.find({
        where: { repId },
        relations: ["doctor", "doctor.user"],
      });
      
      return mappings.map(m => m.doctor);
    } catch (error) {
      console.error("Error getting doctors by rep ID:", error);
      return [];
    }
  }
}
