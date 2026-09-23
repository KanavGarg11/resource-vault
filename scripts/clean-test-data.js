const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  console.log('Cleaning test and sample data...');
  try {
    // Delete all sample resources
    const deletedResources = await prisma.resource.deleteMany();
    console.log(`Deleted ${deletedResources.count} test resources.`);

    // Delete all sample timetable entries
    const deletedTimetable = await prisma.timetableEntry.deleteMany();
    console.log(`Deleted ${deletedTimetable.count} test timetable entries.`);

    // Delete all sample academic events
    const deletedEvents = await prisma.academicEvent.deleteMany();
    console.log(`Deleted ${deletedEvents.count} test academic events.`);

    console.log('Database is now a completely clean slate.');
  } catch (err) {
    console.warn('Cleanup notice:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

clean();
