import { Role } from '../../generated/prisma';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto'

import prisma from '../lib/prisma';
import config from '../../config';

const superAdminData = {
  name: 'Super Admin',
  email: 'admin@gmail.com',
  password: '',
  dateOfBirth: '01-09-2000',
  role: Role.SUPER_ADMIN
 
};

const seedSuperAdmin = async () => {
  // Check if a super admin already exists
  const isSuperAdminExists = await prisma.user.findFirst({
    where: {
      role: Role.SUPER_ADMIN,
    },
  });
  // If not, create one
  if (!isSuperAdminExists) {
    //  const salt = randomBytes(16).toString('hex');
    const salt = bcrypt.genSaltSync(Number(config.bcrypt_salt_rounds) || 12); // Generate a random salt
    const password = await bcrypt.hash(
      config.super_admin_password as string,
      salt
    );

    await prisma.user.create({
      data: {
        ...superAdminData,
        password,
        stripeCustomerId: "admin",
      },
    });

    console.log("Super Admin created successfully.");
    return;
  } else {
    console.log("Super Admin already exists.");
  }
};

export default seedSuperAdmin;
