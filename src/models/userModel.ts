const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Define user model here

module.exports = {
    prisma,
    // Export user model
};
