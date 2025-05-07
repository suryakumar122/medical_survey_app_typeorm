import { getDataSource } from "@lib/db";
import { User } from "@entities/User";
import { Doctor } from "@entities/Doctor";
import { Client } from "@entities/Client";
import { Representative } from "@entities/Representative";
import { hashPassword } from "@lib/utils";

async function seedDatabase() {
  console.log("Starting database seed...");
  
  try {
    // Get TypeORM data source
    const dataSource = await getDataSource();
    
    // Get repositories
    const userRepository = dataSource.getRepository(User);
    const doctorRepository = dataSource.getRepository(Doctor);
    const clientRepository = dataSource.getRepository(Client);
    const repRepository = dataSource.getRepository(Representative);
    
    // Check if users already exist
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log(`${existingUsers} users already exist. Skipping seed.`);
      return;
    }
    
    // Create test users
    const users = [
      // Admin user
      {
        email: "admin@example.com",
        name: "Admin User",
        password: await hashPassword("adminpass"),
        role: "admin",
        status: "active",
      },
      // Client user
      {
        email: "client@example.com",
        name: "Acme Pharmaceuticals",
        password: await hashPassword("clientpass"),
        role: "client",
        status: "active",
      },
      // Rep user
      {
        email: "rep@example.com",
        name: "Jane Rep",
        password: await hashPassword("reppass"),
        role: "representative",
        status: "active",
      },
      // Doctor user
      {
        email: "doctor@example.com",
        name: "Dr. John Smith",
        password: await hashPassword("doctorpass"),
        role: "doctor",
        status: "active",
      },
    ];
    
    console.log("Creating users...");
    for (const userData of users) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      
      // Create related entities
      if (user.role === "doctor") {
        const doctor = doctorRepository.create({
          userId: user.id,
          specialty: "Cardiology",
          hospital: "City General Hospital",
          totalPoints: 500,
          redeemedPoints: 100,
        });
        await doctorRepository.save(doctor);
      } else if (user.role === "client") {
        const client = clientRepository.create({
          userId: user.id,
          companyName: "Acme Pharmaceuticals",
          industry: "Pharmaceuticals",
          contactPerson: "John Doe",
          contactPhone: "+1234567890",
          address: "123 Main St, City",
        });
        await clientRepository.save(client);
      } else if (user.role === "representative") {
        // Find the client first
        const client = await clientRepository.findOne({
          where: {
            user: {
              email: "client@example.com"
            }
          }
        });
        
        if (client) {
          const rep = repRepository.create({
            userId: user.id,
            clientId: client.id,
            region: "North",
            territory: "City Area",
          });
          await repRepository.save(rep);
        }
      }
    }
    
    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase().catch(console.error);