import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create demo admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@taxpro.com' },
    update: {},
    create: {
      email: 'admin@taxpro.com',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'OWNER',
      isActive: true,
    },
  })

  console.log('Created admin user:', adminUser)

  // Create demo staff user
  const staffPassword = await bcrypt.hash('staff123', 12)
  
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@taxpro.com' },
    update: {},
    create: {
      email: 'staff@taxpro.com',
      name: 'Staff Member',
      passwordHash: staffPassword,
      role: 'STAFF',
      isActive: true,
    },
  })

  console.log('Created staff user:', staffUser)

  // Create sample clients
  const client1 = await prisma.clientProfile.create({
    data: {
      clientId: 'CL-2024-0001',
      type: 'INDIVIDUAL',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      filingStatus: 'SINGLE',
      createdById: adminUser.id,
    },
  })

  console.log('Created client 1:', client1)

  const client2 = await prisma.clientProfile.create({
    data: {
      clientId: 'CL-2024-0002',
      type: 'BUSINESS',
      businessName: 'ABC Corporation',
      email: 'contact@abccorp.com',
      phone: '(555) 987-6543',
      address: '456 Business Ave',
      city: 'New York',
      state: 'NY',
      zip: '10002',
      entityType: 'S-Corp',
      createdById: adminUser.id,
    },
  })

  console.log('Created client 2:', client2)

  // Create sample engagement
  const engagement1 = await prisma.engagement.create({
    data: {
      clientId: client1.id,
      taxYear: 2024,
      type: 'FEDERAL_RETURN',
      status: 'IN_PROGRESS',
      dueDate: new Date('2024-04-15'),
      feeAmount: 500,
      assignedToId: adminUser.id,
    },
  })

  console.log('Created engagement 1:', engagement1)

  const engagement2 = await prisma.engagement.create({
    data: {
      clientId: client2.id,
      taxYear: 2024,
      type: 'FEDERAL_RETURN',
      status: 'DOCUMENTS_PENDING',
      dueDate: new Date('2024-04-15'),
      feeAmount: 1500,
      assignedToId: staffUser.id,
    },
  })

  console.log('Created engagement 2:', engagement2)

  // Create sample tax return
  const taxReturn1 = await prisma.taxReturn.create({
    data: {
      clientId: client1.id,
      engagementId: engagement1.id,
      taxYear: 2024,
      type: 'FEDERAL_RETURN',
      status: 'PREPARATION',
      assignedToId: adminUser.id,
      priority: 'MEDIUM',
    },
  })

  console.log('Created tax return 1:', taxReturn1)

  // Create sample tasks
  const task1 = await prisma.task.create({
    data: {
      taxReturnId: taxReturn1.id,
      clientId: client1.id,
      engagementId: engagement1.id,
      title: 'Request missing W-2 from client',
      description: 'Client needs to provide W-2 from second employer',
      type: 'DOCUMENT_REQUEST',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date('2024-03-25'),
      createdBy: adminUser.id,
      assignedToId: adminUser.id,
    },
  })

  console.log('Created task 1:', task1)

  // Create sample IRS notice
  const notice1 = await prisma.iRSNotice.create({
    data: {
      clientId: client2.id,
      noticeType: 'CP2000',
      noticeNumber: 'CP2000-2024-001',
      receivedDate: new Date('2024-03-20'),
      responseDue: new Date('2024-04-19'),
      status: 'RECEIVED',
      assignedToId: adminUser.id,
      summary: 'Underreported income discrepancy',
      explanation: 'IRS has identified a discrepancy between reported income and information received from third parties',
      actionItems: 'Review client income documents and prepare response',
      createdById: adminUser.id,
    },
  })

  console.log('Created IRS notice 1:', notice1)

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })