import "dotenv/config";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { envVars } from "../config/env";


export const seedAdmin = async () => {
  const existingUser=await prisma.user.findUnique({where:{
    email:"admin1@gmail.com"
  }})
  if (existingUser) {
    throw new Error("Admin user already exists.");
  }
  try {
   const result= await auth.api.signUpEmail({
    body: {
      name: "admin12",
      email: envVars.Email, 
      password: envVars.Password,
      emailVerified:true,
      phone: "01804935939",
      role:"ADMIN",
    },
  });
  if(!result){
    console.error("Failed to create admin user");
  }
  return {success:true,message:"user created successfully",data:result}

  } catch (error) {
    console.error({ error }, "Seed admin script failed");
  }
};

seedAdmin();