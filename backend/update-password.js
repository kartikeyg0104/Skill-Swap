const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    const email = 'jit@gmail.com';
    const newPassword = 'Agnik@1234';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { passwordHash: hashedPassword }
    });
    
    console.log('Password updated successfully for user:', updatedUser.email);
    console.log('New password is:', newPassword);
    
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword(); 