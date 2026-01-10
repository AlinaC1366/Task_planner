import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

//    --- SCRIPT DE INITIALIZARE (DATABASE SEEDING) ---
// Rolul acestui script este să ne asigure un punct de plecare.
//  La pornirea serverului baza de date este goala, de aceea avem nevoie de admin pentru a putea crea utilizatori noi
//  Acest script rezolva problema creand automat primul Administrator
//  Etape de creare : 
//  1. Verifica daca exista deja un Admin (ne asiguram ca nu cream dubluri)
//  2. Cripteaza parola 
//  3. Salveaza utilizatorul în tabela.
async function main() {
  const email = 'admin@test.com';
  const passwordRaw = '123';//Parola simplă pentru dezvoltare 

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  // PASUL 1: Verificam daca adminul exista deja
  if (existingAdmin) {
    console.log('⚠️  Adminul există deja. Nu facem modificări.');
    return;
  }

  console.log('🌱 Seeding: Creare Admin default...');
  
  // 2. Criptam parola (Exact ca in controller)
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(passwordRaw, saltRounds);

  // 3. Introducem utilizatorul în baza
  await prisma.user.create({
    data: {
      name: 'Admin Suprem',
      email: email,
      passwordHash: passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin creat cu succes:');
  console.log(`   Email: ${email}`);
  console.log(`   Parola: ${passwordRaw}`);
}

main()
  .catch((e) => {
    console.error("❌ A apărut o eroare la seed:",e);
    process.exit(1);
  })
  .finally(async () => {

    //Inchidem conexiunea la baza de date
    await prisma.$disconnect();
  });