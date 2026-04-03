import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create family members
  const johnPassword = await bcrypt.hash('johndoe123', 10);
  const familyPassword = await bcrypt.hash('petersfield2024', 10);

  const john = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: johnPassword,
      role: 'admin',
      age: 35
    }
  });

  const ece = await prisma.user.upsert({
    where: { email: 'ece@petersfield.com' },
    update: {},
    create: {
      email: 'ece@petersfield.com',
      name: 'Ece Sahin',
      password: familyPassword,
      role: 'parent',
      age: 43
    }
  });

  const erdem = await prisma.user.upsert({
    where: { email: 'erdem@petersfield.com' },
    update: {},
    create: {
      email: 'erdem@petersfield.com',
      name: 'Erdem Sahin',
      password: familyPassword,
      role: 'parent',
      age: 46
    }
  });

  const arya = await prisma.user.upsert({
    where: { email: 'arya@petersfield.com' },
    update: {},
    create: {
      email: 'arya@petersfield.com',
      name: 'Arya Sahin',
      password: familyPassword,
      role: 'child',
      age: 9
    }
  });

  const mira = await prisma.user.upsert({
    where: { email: 'mira@petersfield.com' },
    update: {},
    create: {
      email: 'mira@petersfield.com',
      name: 'Mira Sahin',
      password: familyPassword,
      role: 'child',
      age: 3
    }
  });

  console.log('Created users:', { john, ece, erdem, arya, mira });

  // Create locations
  const locations = [
    { name: "Ece's Bedroom", description: "Ece's personal bedroom" },
    { name: "Erdem's Office", description: "Erdem's home office" },
    { name: "Arya & Mira's Room", description: "Shared bedroom for Arya and Mira" },
    { name: "Kitchen", description: "Main kitchen area" },
    { name: "Living Room", description: "Family living room" },
    { name: "Main Bathroom", description: "Primary bathroom" },
    { name: "Kitchen Bathroom", description: "Bathroom in kitchen area" },
    { name: "Hallway", description: "Entrance hallway" },
    { name: "Boiler Room", description: "Utility boiler room" },
    { name: "Yellow Storage", description: "Big yellow storage area" }
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { name: loc.name },
      update: {},
      create: loc
    });
  }

  console.log('Created locations');

  // Create categories
  const categories = [
    { name: "Tidying Tools", description: "Tools and equipment for organizing", color: "#60B5FF" },
    { name: "Clothing", description: "Clothes and accessories", color: "#FF9149" },
    { name: "Furniture", description: "Furniture items", color: "#FF9898" },
    { name: "Appliances", description: "Home appliances", color: "#FF90BB" },
    { name: "Kitchen Items", description: "Kitchen utensils and tools", color: "#80D8C3" },
    { name: "Toys & Games", description: "Children's toys and games", color: "#A19AD3" },
    { name: "Books & Media", description: "Books, magazines, and media", color: "#72BF78" },
    { name: "Cleaning Supplies", description: "Cleaning products and tools", color: "#FF6363" },
    { name: "Storage Solutions", description: "Boxes, baskets, organizers", color: "#60B5FF" },
    { name: "Personal Care", description: "Personal hygiene and care items", color: "#FF9149" }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
  }

  console.log('Created categories');

  // Get created records for items
  const tidyingCategory = await prisma.category.findUnique({ where: { name: "Tidying Tools" } });
  const clothingCategory = await prisma.category.findUnique({ where: { name: "Clothing" } });
  const storageCategory = await prisma.category.findUnique({ where: { name: "Storage Solutions" } });
  const yellowStorage = await prisma.location.findUnique({ where: { name: "Yellow Storage" } });
  const hallway = await prisma.location.findUnique({ where: { name: "Hallway" } });
  const bedroom = await prisma.location.findUnique({ where: { name: "Ece's Bedroom" } });

  // Create initial purchased items
  if (tidyingCategory && storageCategory && clothingCategory && yellowStorage && hallway && bedroom) {
    const items = [
      {
        uniqueId: "PM-001",
        name: "Aspect 68L Collapsible & Portable Laundry Basket (Grey & White)",
        categoryId: storageCategory.id,
        quantity: 1,
        locationId: yellowStorage.id,
        notes: "First basket in yellow storage"
      },
      {
        uniqueId: "PM-002",
        name: "Aspect 68L Collapsible & Portable Laundry Basket (Grey & White)",
        categoryId: storageCategory.id,
        quantity: 1,
        locationId: hallway.id,
        notes: "Second basket in hallway"
      },
      {
        uniqueId: "PM-003",
        name: "KEPLIN Clothes Pegs for Washing Line - 48 Pack (Black)",
        categoryId: tidyingCategory.id,
        quantity: 48,
        locationId: yellowStorage.id,
        notes: "Black clothes pegs for laundry"
      },
      {
        uniqueId: "PM-004",
        name: "200pcs Coloured Natural Rubber Elastic Bands (38mm, Colourful)",
        categoryId: tidyingCategory.id,
        quantity: 200,
        locationId: yellowStorage.id,
        notes: "Multi-purpose elastic bands"
      },
      {
        uniqueId: "PM-005",
        name: "BoxLegend Clothes Folder T Shirt Folder Board (Black)",
        categoryId: tidyingCategory.id,
        quantity: 1,
        locationId: bedroom.id,
        notes: "For folding clothes neatly"
      },
      {
        uniqueId: "PM-006",
        name: "The Essentials Wardrobe Mens Boxer Shorts 6 Pack (Size XL)",
        categoryId: clothingCategory.id,
        quantity: 6,
        locationId: bedroom.id,
        notes: "Men's underwear - XL size"
      }
    ];

    for (const item of items) {
      await prisma.item.upsert({
        where: { uniqueId: item.uniqueId },
        update: {},
        create: item
      });
    }

    console.log('Created initial items');
  }

  // Create sample tasks
  const livingRoom = await prisma.location.findUnique({ where: { name: "Living Room" } });
  const kitchen = await prisma.location.findUnique({ where: { name: "Kitchen" } });
  const kidsRoom = await prisma.location.findUnique({ where: { name: "Arya & Mira's Room" } });

  const dailyTasks = [
    {
      title: "Tidy Living Room",
      description: "Pick up toys, fold blankets, arrange cushions",
      recurrence: "daily",
      locationId: livingRoom?.id,
      status: "pending"
    },
    {
      title: "Put Away Toys in Kids' Room",
      description: "Organize toys, make beds, tidy floor",
      recurrence: "daily",
      locationId: kidsRoom?.id,
      status: "pending"
    },
    {
      title: "Kitchen Cleanup",
      description: "Wash dishes, wipe counters, sweep floor",
      recurrence: "daily",
      locationId: kitchen?.id,
      status: "pending"
    },
    {
      title: "Morning Routine Checklist",
      description: "Make bed, get dressed, brush teeth",
      recurrence: "daily",
      status: "pending"
    }
  ];

  const weeklyTasks = [
    {
      title: "Deep Clean Kitchen",
      description: "Clean appliances, mop floor, organize pantry",
      recurrence: "weekly",
      locationId: kitchen?.id,
      status: "pending"
    },
    {
      title: "Organize Yellow Storage",
      description: "Sort items, label boxes, discard unused items",
      recurrence: "weekly",
      locationId: yellowStorage?.id,
      status: "pending"
    },
    {
      title: "Bathroom Deep Clean",
      description: "Scrub tiles, clean mirrors, organize toiletries",
      recurrence: "weekly",
      status: "pending"
    },
    {
      title: "Laundry Day",
      description: "Wash, dry, fold, and put away all laundry",
      recurrence: "weekly",
      status: "pending"
    }
  ];

  const allTasks = [...dailyTasks, ...weeklyTasks];
  const createdTasks = [];

  for (const task of allTasks) {
    const created = await prisma.task.create({
      data: task
    });
    createdTasks.push(created);
  }

  console.log('Created tasks');

  // Assign tasks to family members
  // Assign daily tasks to Ece and Erdem
  for (let i = 0; i < 4; i++) {
    if (i % 2 === 0) {
      await prisma.taskAssignment.upsert({
        where: {
          taskId_userId: {
            taskId: createdTasks[i].id,
            userId: ece.id
          }
        },
        update: {},
        create: {
          taskId: createdTasks[i].id,
          userId: ece.id
        }
      });
    } else {
      await prisma.taskAssignment.upsert({
        where: {
          taskId_userId: {
            taskId: createdTasks[i].id,
            userId: erdem.id
          }
        },
        update: {},
        create: {
          taskId: createdTasks[i].id,
          userId: erdem.id
        }
      });
    }
  }

  // Assign "Put Away Toys" to Arya
  await prisma.taskAssignment.upsert({
    where: {
      taskId_userId: {
        taskId: createdTasks[1].id,
        userId: arya.id
      }
    },
    update: {},
    create: {
      taskId: createdTasks[1].id,
      userId: arya.id
    }
  });

  console.log('Assigned tasks to family members');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
