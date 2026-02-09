# 🏛️ TaxPro - Tax Practice Management Platform

> **Comprehensive tax practice management platform for Enrolled Agents**  
> Built with Next.js 16, TypeScript, Prisma, and AI-powered automation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-informational.svg)](https://www.prisma.io/)

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔧 Technology Stack](#-technology-stack)
- [📊 Database Schema](#-database-schema)
- [🔐 Authentication](#-authentication)
- [📚 API Documentation](#-api-documentation)
- [🎨 UI Components](#-ui-components)
- [🤖 AI Integration](#-ai-integration)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Features

### 🏢 **Core Practice Management**
- **Client Management** - Complete client profiles with individual/business support
- **Document Management** - AI-powered document classification and OCR processing
- **IRS Notice Management** - Automated analysis and response management
- **Tax Return Workflow** - End-to-end return preparation and tracking
- **Task Engine** - Automated task assignment and deadline management
- **Communication System** - Template-based email and messaging
- **Billing & Invoicing** - Automated billing with payment processing
- **Compliance & Audit** - Activity logs and data protection

### 🔐 **Security & Access Control**
- **Role-Based Access Control** (Owner, Reviewer, Staff, Admin, Client)
- **JWT Authentication** with secure password hashing
- **Protected Routes** and API endpoints
- **Activity Logging** for audit compliance
- **Data Encryption** for sensitive information

### 🤖 **AI-Powered Features**
- **Document Classification** - Automatic categorization of tax documents
- **IRS Notice Analysis** - AI explanations and recommended actions
- **Data Extraction** - Automated data extraction from forms
- **Risk Assessment** - AI-powered risk scoring and alerts
- **Smart Recommendations** - Contextual suggestions for tax professionals

### 📊 **Analytics & Reporting**
- **Real-time Dashboard** with key performance metrics
- **Client Analytics** - Engagement history and revenue tracking
- **Productivity Reports** - Staff performance and bottleneck analysis
- **Compliance Reports** - Audit-ready activity logs
- **Financial Analytics** - Revenue, billing, and payment insights

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm** or **bun**
- **PostgreSQL** or **SQLite** for database
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jitenkr2030/EA-Tax-Practice-Management-Platform.git
   cd EA-Tax-Practice-Management-Platform
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   bun run db:generate
   
   # Push database schema
   bun run db:push
   
   # Seed demo data
   bunx tsx prisma/seed.ts
   ```

5. **Start Development Server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

6. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - **Demo Admin**: admin@taxpro.com / admin123
   - **Demo Staff**: staff@taxpro.com / staff123

---

## 📁 Project Structure

```
tax-practice-platform/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 api/               # API routes
│   │   │   ├── 📁 auth/          # Authentication endpoints
│   │   │   ├── 📁 clients/       # Client management API
│   │   │   ├── 📁 documents/     # Document management API
│   │   │   └── 📁 notices/       # IRS notice API
│   │   ├── 📁 clients/           # Client management pages
│   │   ├── 📁 documents/         # Document management pages
│   │   ├── 📁 notices/           # IRS notice pages
│   │   ├── 📄 login.tsx          # Authentication page
│   │   ├── 📄 page.tsx           # Main dashboard
│   │   ├── 📄 layout.tsx         # Root layout
│   │   └── 📄 globals.css        # Global styles
│   ├── 📁 components/            # Reusable components
│   │   ├── 📁 ui/                # shadcn/ui components
│   │   ├── 📁 auth/              # Authentication components
│   │   ├── 📁 clients/           # Client components
│   │   ├── 📁 layout/            # Layout components
│   │   └── 📁 shared/            # Shared components
│   ├── 📁 contexts/              # React contexts
│   │   └── 📄 auth-context.tsx   # Authentication context
│   ├── 📁 lib/                   # Utility libraries
│   │   ├── 📄 db.ts              # Prisma database client
│   │   └── 📄 utils.ts           # Utility functions
│   └── 📁 hooks/                 # Custom React hooks
├── 📁 prisma/                     # Database schema and migrations
│   ├── 📄 schema.prisma          # Database schema
│   └── 📄 seed.ts               # Seed data script
├── 📁 public/                     # Static assets
├── 📄 package.json               # Dependencies and scripts
├── 📄 tailwind.config.ts         # Tailwind CSS configuration
├── 📄 tsconfig.json              # TypeScript configuration
└── 📄 README.md                  # This file
```

---

## 🔧 Technology Stack

### **Frontend**
- **Next.js 16** - React framework with App Router
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **Zustand** - State management

### **Backend**
- **Prisma ORM** - Database toolkit
- **SQLite/PostgreSQL** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **z-ai-web-dev-sdk** - AI integration

### **Development**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static typing
- **Bun** - Fast JavaScript runtime

---

## 📊 Database Schema

### **Core Models**

#### **User Management**
```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String
  passwordHash      String
  role              UserRole @default(STAFF)
  isActive          Boolean  @default(true)
  // ... authentication fields
}
```

#### **Client Management**
```prisma
model ClientProfile {
  id                  String    @id @default(cuid())
  clientId            String    @unique
  type                ClientType
  firstName           String?
  lastName            String?
  businessName        String?
  email               String    @unique
  // ... client information
}
```

#### **Document Management**
```prisma
model Document {
  id              String    @id @default(cuid())
  name            String
  type            DocumentType
  category        DocumentCategory
  aiClassification String?
  ocrText         String?
  // ... document metadata
}
```

#### **IRS Notice Management**
```prisma
model IRSNotice {
  id              String    @id @default(cuid())
  noticeType      String
  summary         String?
  explanation     String?
  actionItems     String?
  responseDue     DateTime
  // ... notice details
}
```

### **Complete Schema**
- **20+ models** covering all aspects of tax practice management
- **Proper relationships** and data integrity
- **Enums** for consistent data types
- **Indexes** for performance optimization

---

## 🔐 Authentication

### **User Roles**
- **OWNER** - Full system access and configuration
- **REVIEWER** - Review and approve returns
- **STAFF** - Prepare returns and manage clients
- **ADMIN** - System administration
- **CLIENT** - Client portal access

### **Authentication Flow**
1. **Login** with email/password
2. **JWT token** generation and storage
3. **Protected routes** with authentication middleware
4. **Role-based access** control
5. **Session management** and logout

### **Security Features**
- **Password hashing** with bcryptjs
- **JWT token** validation
- **CORS** configuration
- **Input validation** and sanitization
- **Activity logging** for audit trails

---

## 📚 API Documentation

### **Authentication Endpoints**

#### **POST /api/auth/login**
```json
{
  "email": "admin@taxpro.com",
  "password": "admin123"
}
```

#### **POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "STAFF"
}
```

#### **GET /api/auth/me**
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/auth/me
```

### **Client Management Endpoints**

#### **GET /api/clients**
```bash
curl http://localhost:3000/api/clients?search=john&type=INDIVIDUAL
```

#### **POST /api/clients**
```json
{
  "type": "INDIVIDUAL",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@email.com",
  "createdById": "user-id"
}
```

#### **GET /api/clients/[id]**
```bash
curl http://localhost:3000/api/clients/client-id
```

### **Document Management Endpoints**

#### **GET /api/documents**
```bash
curl http://localhost:3000/api/documents?clientId=client-id&type=W2
```

#### **POST /api/documents**
```bash
curl -X POST \
     -F "file=@document.pdf" \
     -F "clientId=client-id" \
     -F "type=W2" \
     http://localhost:3000/api/documents
```

### **IRS Notice Endpoints**

#### **GET /api/notices**
```bash
curl http://localhost:3000/api/notices?status=RECEIVED
```

#### **POST /api/notices**
```json
{
  "clientId": "client-id",
  "noticeType": "CP2000",
  "receivedDate": "2024-03-20",
  "responseDue": "2024-04-19",
  "createdById": "user-id"
}
```

#### **POST /api/notices/[id]/analyze**
```bash
curl -X POST http://localhost:3000/api/notices/notice-id/analyze
```

---

## 🎨 UI Components

### **shadcn/ui Components**
- **Forms** - Input, Select, Textarea, Checkbox
- **Navigation** - Sidebar, Header, Breadcrumb
- **Data Display** - Table, Card, Badge, Avatar
- **Feedback** - Alert, Dialog, Toast, Skeleton
- **Layout** - Tabs, Accordion, Collapsible

### **Custom Components**
- **ProtectedRoute** - Authentication wrapper
- **ClientDetailModal** - Client information modal
- **DocumentUpload** - File upload component
- **NoticeAnalysis** - AI analysis display

### **Design System**
- **Color Palette** - Professional tax practice colors
- **Typography** - Clear hierarchy and readability
- **Spacing** - Consistent layout and padding
- **Responsive Design** - Mobile-first approach

---

## 🤖 AI Integration

### **Current AI Features**
- **Document Classification** - Automatic categorization
- **IRS Notice Analysis** - Type-specific insights
- **Risk Assessment** - Priority and urgency scoring
- **Action Recommendations** - Contextual suggestions

### **AI Integration Points**
```typescript
// Document AI Classification
const classification = await ai.classifyDocument(fileBuffer)

// IRS Notice Analysis
const analysis = await ai.analyzeNotice(noticeData)

// Data Extraction
const extractedData = await ai.extractData(documentImage)
```

### **Future AI Enhancements**
- **OCR Processing** - Text extraction from documents
- **Natural Language Processing** - Email and notice analysis
- **Predictive Analytics** - Client behavior forecasting
- **Chat Assistant** - AI-powered help system

---

## 🚀 Deployment

### **Environment Variables**
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# AI Configuration
AI_API_KEY="your-ai-api-key"
AI_BASE_URL="https://api.ai-service.com"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760" # 10MB
```

### **Production Deployment**

#### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

#### **Docker Deployment**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### **Environment Setup**
1. **Database** - Configure PostgreSQL for production
2. **File Storage** - Set up S3 or similar for file uploads
3. **Email Service** - Configure SMTP for notifications
4. **Domain** - Set up custom domain and SSL
5. **Monitoring** - Set up error tracking and analytics

---

## 🤝 Contributing

### **Development Guidelines**
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### **Code Standards**
- **TypeScript** strict mode
- **ESLint** configuration
- **Prettier** formatting
- **Conventional commits** messages
- **Component documentation**

### **Testing**
```bash
# Run linting
bun run lint

# Run type checking
bun run type-check

# Run tests
bun run test
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - Excellent React framework
- **Prisma** - Modern database toolkit
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Vercel** - Hosting and deployment platform

---

## 📞 Support

- **Documentation**: [Full documentation](https://docs.taxpro.com)
- **Issues**: [GitHub Issues](https://github.com/jitenkr2030/EA-Tax-Practice-Management-Platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jitenkr2030/EA-Tax-Practice-Management-Platform/discussions)
- **Email**: support@taxpro.com

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=jitenkr2030/EA-Tax-Practice-Management-Platform&type=Date)]

---

**Made with ❤️ for Tax Professionals** 🏛️

*Built to streamline tax practice management and empower Enrolled Agents to serve their clients better.*