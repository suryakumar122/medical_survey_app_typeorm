# Architecture Overview

## 1. Overview

This repository contains a medical survey platform built with Next.js. The platform enables pharmaceutical companies (clients) to create surveys for doctors, with representatives facilitating the relationship between companies and doctors. The application follows a role-based access control system with four user types: doctors, representatives, clients (pharmaceutical companies), and administrators.

The platform allows doctors to complete surveys and earn points that can be redeemed for rewards, while clients can analyze the survey results and manage their representatives and associated doctors.

## 2. System Architecture

### 2.1 Technology Stack

- **Frontend**: Next.js (React framework) with TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with TypeORM for ORM
- **Authentication**: NextAuth.js for session management and authentication
- **Styling**: Tailwind CSS with custom components
- **Email Service**: Nodemailer
- **Deployment**: Configured for deployment on platforms supporting Node.js

### 2.2 Application Structure

The application follows a typical Next.js project structure with some customizations:

- `/app`: Contains the Next.js App Router structure with pages and API routes
- `/components`: Reusable React components
- `/lib`: Utility functions and configurations
- `/entities`: TypeORM entity definitions
- `/services`: Business logic services
- `/types`: TypeScript type definitions
- `/middleware.ts`: Next.js middleware for authentication and authorization

## 3. Key Components

### 3.1 Authentication & Authorization

The application uses NextAuth.js for authentication with a custom credentials provider. Authentication is implemented in `/lib/auth.ts` with session persistence and JWT tokens. The middleware handles route protection and role-based access control.

Key features include:
- Custom credentials provider with email/password authentication
- Role-based access control via middleware
- JWT-based session management
- Protected routes based on user roles

### 3.2 Database Schema

The data model is implemented using TypeORM entities with the following key entities:

- **User**: Base entity for all users with common fields
- **Doctor**: Extends User with doctor-specific information
- **Representative**: Extends User with representative-specific information
- **Client**: Extends User with client-specific information
- **Survey**: Contains survey information created by clients
- **SurveyQuestion**: Questions within a survey
- **DoctorSurveyResponse**: Tracks doctor's responses to surveys
- **QuestionResponse**: Individual question responses
- **Redemption**: Points redemption requests from doctors
- **DoctorClientMapping**: Many-to-many relationship between doctors and clients
- **DoctorRepMapping**: Many-to-many relationship between doctors and representatives

### 3.3 Service Layer

The application implements a service layer pattern to encapsulate business logic. Key services include:

- **UserService**: User management operations
- **DoctorService**: Doctor-specific operations
- **RepresentativeService**: Representative-specific operations
- **ClientService**: Client-specific operations
- **SurveyService**: Survey creation, retrieval, and analysis
- **EmailService**: Email notifications

### 3.4 Components

The UI is built with reusable React components organized into categories:

- **layout**: Layout components like navigation and dashboard structure
- **ui**: Basic UI components like buttons, cards, forms, etc.
- **surveys**: Survey-related components for creation and completion
- **doctors**: Doctor management components
- **points**: Points and redemption components

## 4. Data Flow

### 4.1 Authentication Flow

1. User submits credentials through the login form
2. NextAuth validates credentials against the database
3. If valid, a JWT token is generated and stored in cookies
4. The middleware validates the token on protected routes
5. Role-based access is enforced based on the user's role in the token

### 4.2 Survey Creation Flow

1. Client creates a survey through the survey builder interface
2. Survey data is submitted to the API
3. The server validates and stores the survey and its questions
4. Surveys become available to doctors based on client mappings

### 4.3 Survey Response Flow

1. Doctor views available surveys
2. Doctor completes a survey
3. Responses are submitted to the API
4. Points are awarded to the doctor
5. Client can view aggregated survey results

### 4.4 Points Redemption Flow

1. Doctor requests redemption of earned points
2. Redemption request is stored in the database
3. Administrators process the redemption request
4. Doctor is notified of redemption status

## 5. External Dependencies

### 5.1 NPM Packages

Key dependencies include:
- `next` and `react`: Core framework
- `next-auth`: Authentication
- `typeorm`: ORM for database operations
- `bcryptjs`: Password hashing
- `nodemailer`: Email sending
- `tailwind-merge` and `clsx`: CSS utilities
- `react-hot-toast`: Toast notifications
- `@headlessui/react`: UI components
- `@heroicons/react`: Icon set

### 5.2 External Services

- **Email Service**: Configured to use an SMTP provider (configurable via environment variables)
- **Database**: PostgreSQL (configurable via environment variables)

## 6. Deployment Strategy

The application is configured for deployment with the following considerations:

- **Environment Variables**: Required for database connection, authentication, and email services
- **Database Migration**: TypeORM handles schema synchronization (with `synchronize: true` in development)
- **Build Process**: Standard Next.js build process
- **Replit Configuration**: Includes a `.replit` file for Replit deployment
- **Port Configuration**: Configurable through environment variables with a default of 5000

### 6.1 Development Setup

For local development:
1. Install dependencies with `npm install`
2. Configure environment variables
3. Run the development server with `npm run dev`

### 6.2 Production Deployment

For production:
1. Build the application with `npm run build`
2. Start the production server with `npm start`
3. Ensure database migrations are handled properly (disable `synchronize` in production)

### 6.3 Security Considerations

- Password hashing with bcrypt
- JWT-based authentication with secure cookies
- Protected API routes with proper authorization checks
- Input validation for all API endpoints