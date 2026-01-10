
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

//SERVICIUL DE BAZA DE DATE
//Acest fisier initializeaza clientul Prisma o singura data.

const prisma = new PrismaClient();

export default prisma;