// scripts/seed.js
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function seedDatabase() {
  console.log("Starting database seed...");
  
  try {
    // Create a connection pool
    const pool = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432'),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'postgres',
    });
    
    // Check if users already exist
    const { rows: existingUsers } = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers[0].count) > 0) {
      console.log(`${existingUsers[0].count} users already exist. Skipping seed.`);
      await pool.end();
      return;
    }
    
    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // =====================
      // Create users
      // =====================
      console.log("Creating users...");
      
      // Admin user
      const { rows: [adminUser] } = await client.query(
        `INSERT INTO users(id, email, name, password, role, status, "createdAt", "updatedAt") 
         VALUES($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
         RETURNING id`,
        [uuidv4(), "admin@example.com", "Admin User", await hashPassword("adminpass"), "admin", "active"]
      );
      
      // Client users
      const clientUsers = [
        {
          name: "Acme Pharmaceuticals",
          email: "client1@example.com",
          companyName: "Acme Pharmaceuticals",
          industry: "Pharmaceuticals",
          contactPerson: "John Doe",
          contactPhone: "+1234567890",
          address: "123 Main St, New York, NY 10001"
        },
        {
          name: "MediCorp",
          email: "client2@example.com",
          companyName: "MediCorp",
          industry: "Medical Devices",
          contactPerson: "Jane Smith",
          contactPhone: "+9876543210",
          address: "456 Park Ave, Boston, MA 02115"
        }
      ];
      
      const clientIds = [];
      
      for (const clientData of clientUsers) {
        const clientId = uuidv4();
        await client.query(
          `INSERT INTO users(id, email, name, password, role, status, "createdAt", "updatedAt") 
           VALUES($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [clientId, clientData.email, clientData.name, await hashPassword("clientpass"), "client", "active"]
        );
        
        const { rows: [clientEntity] } = await client.query(
          `INSERT INTO clients(id, "userId", "companyName", industry, "contactPerson", "contactPhone", address, "createdAt", "updatedAt") 
           VALUES($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
           RETURNING id`,
          [uuidv4(), clientId, clientData.companyName, clientData.industry, clientData.contactPerson, clientData.contactPhone, clientData.address]
        );
        
        clientIds.push(clientEntity.id);
      }
      
      // Representative users
      const repUsers = [
        {
          name: "Sarah Rep",
          email: "rep1@example.com",
          clientId: clientIds[0],
          region: "Northeast",
          territory: "New York City"
        },
        {
          name: "Tom Rep",
          email: "rep2@example.com",
          clientId: clientIds[0],
          region: "West",
          territory: "California"
        },
        {
          name: "Maria Rep",
          email: "rep3@example.com",
          clientId: clientIds[1],
          region: "South",
          territory: "Texas"
        }
      ];
      
      const repIds = [];
      
      for (const repData of repUsers) {
        const repId = uuidv4();
        await client.query(
          `INSERT INTO users(id, email, name, password, role, status, "createdAt", "updatedAt") 
           VALUES($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [repId, repData.email, repData.name, await hashPassword("reppass"), "representative", "active"]
        );
        
        const { rows: [repEntity] } = await client.query(
          `INSERT INTO representatives(id, "userId", "clientId", region, territory, "createdAt", "updatedAt") 
           VALUES($1, $2, $3, $4, $5, NOW(), NOW()) 
           RETURNING id`,
          [uuidv4(), repId, repData.clientId, repData.region, repData.territory]
        );
        
        repIds.push(repEntity.id);
      }
      
      // Doctor users
      const doctorUsers = [
        {
          name: "Dr. John Smith",
          email: "doctor1@example.com",
          specialty: "Cardiology",
          hospital: "City General Hospital",
          bio: "Experienced cardiologist with 15 years of practice",
          totalPoints: 500,
          redeemedPoints: 100
        },
        {
          name: "Dr. Emily Jones",
          email: "doctor2@example.com",
          specialty: "Neurology",
          hospital: "Memorial Medical Center",
          bio: "Specializing in neurological disorders and treatments",
          totalPoints: 750,
          redeemedPoints: 200
        },
        {
          name: "Dr. Michael Lee",
          email: "doctor3@example.com",
          specialty: "Oncology",
          hospital: "University Hospital",
          bio: "Research-focused oncologist with focus on innovative treatments",
          totalPoints: 1000,
          redeemedPoints: 300
        },
        {
          name: "Dr. Sarah Williams",
          email: "doctor4@example.com",
          specialty: "Pediatrics",
          hospital: "Children's Health Center",
          bio: "Dedicated to children's health and preventative care",
          totalPoints: 350,
          redeemedPoints: 50
        }
      ];
      
      const doctorIds = [];
      
      for (const doctorData of doctorUsers) {
        const doctorId = uuidv4();
        await client.query(
          `INSERT INTO users(id, email, name, password, role, status, "createdAt", "updatedAt") 
           VALUES($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [doctorId, doctorData.email, doctorData.name, await hashPassword("doctorpass"), "doctor", "active"]
        );
        
        const { rows: [doctorEntity] } = await client.query(
          `INSERT INTO doctors(id, "userId", specialty, hospital, bio, "totalPoints", "redeemedPoints", "createdAt", "updatedAt") 
           VALUES($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
           RETURNING id`,
          [uuidv4(), doctorId, doctorData.specialty, doctorData.hospital, doctorData.bio, doctorData.totalPoints, doctorData.redeemedPoints]
        );
        
        doctorIds.push(doctorEntity.id);
      }
      
      // =====================
      // Create mappings
      // =====================
      console.log("Creating mappings between doctors, clients, and representatives...");
      
      // Doctor-Client mappings
      for (let i = 0; i < doctorIds.length; i++) {
        // Assign each doctor to at least one client
        await client.query(
          `INSERT INTO doctor_client_mappings(id, "doctorId", "clientId", "createdAt") 
           VALUES($1, $2, $3, NOW())`,
          [uuidv4(), doctorIds[i], clientIds[i % clientIds.length]]
        );
        
        // Add some doctors to multiple clients for testing
        if (i < 2) {
          await client.query(
            `INSERT INTO doctor_client_mappings(id, "doctorId", "clientId", "createdAt") 
             VALUES($1, $2, $3, NOW())`,
            [uuidv4(), doctorIds[i], clientIds[(i + 1) % clientIds.length]]
          );
        }
      }
      
      // Doctor-Rep mappings
      for (let i = 0; i < doctorIds.length; i++) {
        // Assign each doctor to a representative
        await client.query(
          `INSERT INTO doctor_rep_mappings(id, "doctorId", "repId", "createdAt") 
           VALUES($1, $2, $3, NOW())`,
          [uuidv4(), doctorIds[i], repIds[i % repIds.length]]
        );
      }
      
      // =====================
      // Create surveys
      // =====================
      console.log("Creating surveys with questions...");
      
      const surveys = [
        {
          clientId: clientIds[0],
          title: "Cardiovascular Treatment Preferences",
          description: "Survey about prescribing habits for cardiovascular medications",
          points: 100,
          estimatedTime: 15,
          status: "active",
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          targetSpecialty: "Cardiology",
          questions: [
            {
              questionText: "How frequently do you prescribe ACE inhibitors?",
              questionType: "likert",
              options: {
                scale: 5,
                labels: ["Never", "Rarely", "Sometimes", "Often", "Very Often"]
              },
              required: true,
              orderIndex: 0
            },
            {
              questionText: "Which of the following factors influence your prescription decisions? (Select all that apply)",
              questionType: "checkbox",
              options: {
                choices: ["Clinical evidence", "Patient preference", "Cost", "Side effect profile", "Dosing convenience"]
              },
              required: true,
              orderIndex: 1
            },
            {
              questionText: "Please describe your typical treatment approach for newly diagnosed hypertension patients:",
              questionType: "text",
              required: true,
              orderIndex: 2
            }
          ]
        },
        {
          clientId: clientIds[1],
          title: "Medical Device Feedback",
          description: "Survey to gather feedback on our new glucose monitoring system",
          points: 150,
          estimatedTime: 20,
          status: "active",
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          targetSpecialty: null,
          questions: [
            {
              questionText: "Have you used our GlucoTrack device with your patients?",
              questionType: "multipleChoice",
              options: {
                choices: ["Yes", "No"]
              },
              required: true,
              orderIndex: 0
            },
            {
              questionText: "Please rate the following aspects of the device:",
              questionType: "matrix",
              options: {
                rows: ["Ease of use", "Accuracy", "Patient comfort", "Data reporting"],
                columns: ["Poor", "Fair", "Good", "Very Good", "Excellent"]
              },
              required: true,
              orderIndex: 1
            },
            {
              questionText: "What improvements would you recommend for future versions?",
              questionType: "text",
              required: false,
              orderIndex: 2
            }
          ]
        }
      ];
      
      for (const surveyData of surveys) {
        // Create the survey
        const surveyId = uuidv4();
        await client.query(
          `INSERT INTO surveys(id, "clientId", title, description, points, "estimatedTime", status, "startsAt", "endsAt", "targetSpecialty", "createdAt", "updatedAt") 
           VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
          [surveyId, surveyData.clientId, surveyData.title, surveyData.description, surveyData.points, surveyData.estimatedTime, 
           surveyData.status, surveyData.startsAt, surveyData.endsAt, surveyData.targetSpecialty]
        );
        
        // Add questions to the survey
        for (const questionData of surveyData.questions) {
          const questionId = uuidv4();
          await client.query(
            `INSERT INTO survey_questions(id, "surveyId", "questionText", "questionType", options, required, "orderIndex", "createdAt", "updatedAt") 
             VALUES($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
            [questionId, surveyId, questionData.questionText, questionData.questionType, JSON.stringify(questionData.options), 
             questionData.required, questionData.orderIndex]
          );
        }
        
        // Create some completed survey responses
        if (surveyData.targetSpecialty === null || surveyData.targetSpecialty === "Cardiology") {
          // Find doctors who can take this survey (either matching specialty or no target specialty)
          const eligibleDoctors = doctorUsers.filter(d => 
            surveyData.targetSpecialty === null || d.specialty === surveyData.targetSpecialty
          );
          
          for (let i = 0; i < Math.min(2, eligibleDoctors.length); i++) {
            // Get the doctor ID
            const { rows: [doctor] } = await client.query(
              `SELECT id FROM doctors WHERE specialty = $1 LIMIT 1 OFFSET $2`,
              [eligibleDoctors[i].specialty, 0]
            );
            
            // Create a doctor survey response
            const responseId = uuidv4();
            const startedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
            const completedAt = new Date(startedAt.getTime() + 15 * 60 * 1000); // 15 minutes after starting
            
            await client.query(
              `INSERT INTO doctor_survey_responses(id, "doctorId", "surveyId", completed, "pointsEarned", "startedAt", "completedAt", "createdAt", "updatedAt") 
               VALUES($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
              [responseId, doctor.id, surveyId, true, surveyData.points, startedAt, completedAt]
            );
            
            // Get questions for this survey
            const { rows: questions } = await client.query(
              `SELECT id, "questionType" FROM survey_questions WHERE "surveyId" = $1 ORDER BY "orderIndex"`,
              [surveyId]
            );
            
            // Add responses to each question
            for (const question of questions) {
              let responseData;
              
              // Generate dummy response data based on question type
              switch (question.questionType) {
                case 'text':
                  responseData = { text: "Sample response text for testing purposes." };
                  break;
                case 'likert':
                  responseData = { value: Math.floor(Math.random() * 5) + 1 };
                  break;
                case 'multipleChoice':
                  responseData = { selected: "Yes" };
                  break;
                case 'checkbox':
                  responseData = { selected: ["Clinical evidence", "Patient preference"] };
                  break;
                case 'matrix':
                  responseData = { 
                    responses: {
                      "Ease of use": "Very Good",
                      "Accuracy": "Good",
                      "Patient comfort": "Excellent",
                      "Data reporting": "Very Good"
                    }
                  };
                  break;
                default:
                  responseData = {};
              }
              
              await client.query(
                `INSERT INTO question_responses(id, "doctorSurveyResponseId", "questionId", "responseData", "createdAt", "updatedAt") 
                 VALUES($1, $2, $3, $4, NOW(), NOW())`,
                [uuidv4(), responseId, question.id, JSON.stringify(responseData)]
              );
            }
          }
        }
      }
      
      // =====================
      // Create redemptions
      // =====================
      console.log("Creating redemption records...");
      
      const redemptionTypes = ['upi', 'amazon'];
      const redemptionStatuses = ['pending', 'processing', 'completed', 'rejected'];
      
      // Create a few redemption records for testing
      for (let i = 0; i < doctorIds.length; i++) {
        if (i % 2 === 0) { // Only create redemptions for some doctors
          const type = redemptionTypes[i % redemptionTypes.length];
          const status = redemptionStatuses[i % redemptionStatuses.length];
          const points = (i + 1) * 50;
          
          let redemptionDetails = {};
          
          if (type === 'upi') {
            redemptionDetails = {
              upiId: `doctor${i+1}@upi`,
              name: doctorUsers[i].name
            };
          } else {
            redemptionDetails = {
              email: doctorUsers[i].email
            };
          }
          
          await client.query(
            `INSERT INTO redemptions(id, "doctorId", points, "redemptionType", "redemptionDetails", status, notes, "createdAt", "updatedAt") 
             VALUES($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
            [uuidv4(), doctorIds[i], points, type, JSON.stringify(redemptionDetails), status, 
             status === 'rejected' ? "Insufficient points" : null]
          );
        }
      }
      
      // Commit transaction
      await client.query('COMMIT');
      console.log("Database seed completed successfully!");
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error during database seed:", error);
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
}

// Run the seed function
seedDatabase().catch(console.error);