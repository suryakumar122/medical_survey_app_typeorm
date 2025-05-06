import { getRepository } from "@lib/db";
import { User } from "@entities/User";
import { Client } from "@entities/Client";
import { UserService } from "./UserService";
import { ClientRegistration } from "@types/index";
import { hashPassword } from "@lib/utils";
import { generateToken } from "@lib/utils";
import { sendActivationEmail } from "@lib/email";

export class ClientService {
  static async getClientById(id: string): Promise<Client | null> {
    try {
      const clientRepository = await getRepository<Client>(Client);
      const client = await clientRepository.findOne({
        where: { id },
        relations: ["user"],
      });
      
      return client;
    } catch (error) {
      console.error("Error getting client by ID:", error);
      return null;
    }
  }

  static async getClientByUserId(userId: string): Promise<Client | null> {
    try {
      const clientRepository = await getRepository<Client>(Client);
      const client = await clientRepository.findOne({
        where: { userId },
        relations: ["user"],
      });
      
      return client;
    } catch (error) {
      console.error("Error getting client by user ID:", error);
      return null;
    }
  }

  static async getAllClients(): Promise<Client[]> {
    try {
      const clientRepository = await getRepository<Client>(Client);
      const clients = await clientRepository.find({
        relations: ["user"],
      });
      
      return clients;
    } catch (error) {
      console.error("Error getting all clients:", error);
      return [];
    }
  }

  static async createClient(clientData: ClientRegistration): Promise<Client | null> {
    try {
      const userRepository = await getRepository<User>(User);
      const clientRepository = await getRepository<Client>(Client);
      
      // Create user first
      const hashedPassword = await hashPassword(clientData.password);
      const activationToken = generateToken();
      
      const newUser = userRepository.create({
        email: clientData.email,
        name: clientData.name,
        password: hashedPassword,
        phone: clientData.phone || null,
        role: "client",
        status: "pending",
        activationToken,
      });
      
      const savedUser = await userRepository.save(newUser);
      
      // Create client profile
      const newClient = clientRepository.create({
        userId: savedUser.id,
        companyName: clientData.companyName,
        industry: clientData.industry || null,
        contactPerson: clientData.contactPerson || null,
        contactPhone: clientData.contactPhone || null,
        address: clientData.address || null,
      });
      
      const savedClient = await clientRepository.save(newClient);
      
      // Send activation email (in production)
      if (process.env.NODE_ENV === "production") {
        const activationLink = `${process.env.NEXTAUTH_URL}/activate-account?token=${activationToken}`;
        await sendActivationEmail(clientData.email, clientData.name, activationLink);
      }
      
      return savedClient;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  }

  static async updateClient(
    clientId: string, 
    updateData: { 
      companyName?: string; 
      industry?: string; 
      contactPerson?: string; 
      contactPhone?: string; 
      address?: string;
    }
  ): Promise<Client | null> {
    try {
      const clientRepository = await getRepository<Client>(Client);
      const client = await clientRepository.findOne({ where: { id: clientId } });
      
      if (!client) {
        throw new Error("Client not found");
      }
      
      if (updateData.companyName) client.companyName = updateData.companyName;
      if (updateData.industry) client.industry = updateData.industry;
      if (updateData.contactPerson) client.contactPerson = updateData.contactPerson;
      if (updateData.contactPhone) client.contactPhone = updateData.contactPhone;
      if (updateData.address) client.address = updateData.address;
      
      const updatedClient = await clientRepository.save(client);
      
      return updatedClient;
    } catch (error) {
      console.error("Error updating client:", error);
      return null;
    }
  }
}
