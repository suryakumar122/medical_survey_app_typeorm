import { getRepository } from "@lib/db";
import { User, UserRole, UserStatus } from "@entities/User";
import { hashPassword } from "@lib/utils";
import { generateToken } from "@lib/utils";
import { sendActivationEmail } from "@lib/email";
import { UserRegistration } from "@types/index";

export class UserService {
  static async getUserById(id: string): Promise<User | null> {
    try {
      const userRepository = await getRepository<User>(User);
      const user = await userRepository.findOne({ 
        where: { id },
        select: ["id", "email", "name", "phone", "role", "status", "profilePicture", "createdAt", "updatedAt"]
      });
      
      return user;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const userRepository = await getRepository<User>(User);
      const user = await userRepository.findOne({ 
        where: { email },
        select: ["id", "email", "name", "phone", "role", "status", "profilePicture", "createdAt", "updatedAt"]
      });
      
      return user;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  static async createUser(userData: UserRegistration): Promise<User | null> {
    try {
      const userRepository = await getRepository<User>(User);
      
      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email: userData.email } });
      
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
      
      const hashedPassword = await hashPassword(userData.password);
      const activationToken = generateToken();
      
      const newUser = userRepository.create({
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        phone: userData.phone || null,
        role: userData.role,
        status: "pending",
        activationToken,
      });
      
      const savedUser = await userRepository.save(newUser);
      
      // Send activation email (in production)
      if (process.env.NODE_ENV === "production") {
        const activationLink = `${process.env.NEXTAUTH_URL}/activate-account?token=${activationToken}`;
        await sendActivationEmail(userData.email, userData.name, activationLink);
      }
      
      return savedUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async activateUser(token: string): Promise<boolean> {
    try {
      const userRepository = await getRepository<User>(User);
      
      const user = await userRepository.findOne({ where: { activationToken: token } });
      
      if (!user) {
        throw new Error("Invalid activation token");
      }
      
      user.status = "active";
      user.activationToken = null;
      
      await userRepository.save(user);
      
      return true;
    } catch (error) {
      console.error("Error activating user:", error);
      return false;
    }
  }

  static async updateUserStatus(userId: string, status: UserStatus): Promise<boolean> {
    try {
      const userRepository = await getRepository<User>(User);
      
      const user = await userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        throw new Error("User not found");
      }
      
      user.status = status;
      await userRepository.save(user);
      
      return true;
    } catch (error) {
      console.error("Error updating user status:", error);
      return false;
    }
  }

  static async updateUserProfile(userId: string, profileData: { name?: string; phone?: string; profilePicture?: string }): Promise<User | null> {
    try {
      const userRepository = await getRepository<User>(User);
      
      const user = await userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        throw new Error("User not found");
      }
      
      if (profileData.name) user.name = profileData.name;
      if (profileData.phone) user.phone = profileData.phone;
      if (profileData.profilePicture) user.profilePicture = profileData.profilePicture;
      
      const updatedUser = await userRepository.save(user);
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return null;
    }
  }
}
