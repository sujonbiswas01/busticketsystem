var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express from "express";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.9.0",
  "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
  "activeProvider": "postgresql",
  "inlineSchema": 'model User {\n  id            String    @id @default(uuid())\n  name          String    @db.VarChar(255)\n  email         String    @unique @db.VarChar(255)\n  phone         String    @db.Char(15)\n  emailVerified Boolean   @default(false)\n  role          Role      @default(USER)\n  status        Status    @default(ACTIVE)\n  createdAt     DateTime  @default(now()) @map("created_at")\n  updatedAt     DateTime  @updatedAt @map("updated_at")\n  payments      Payment[]\n  bookings      Booking[]\n  seats         Seat[]\n  sessions      Session[]\n  accounts      Account[]\n\n  @@map("users")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Booking {\n  id             String        @id @default(uuid())\n  user_id        String\n  schedule_id    String\n  seat_id        String        @unique\n  total_price    Int\n  booking_status BookingStatus @default(PENDING)\n  payment_status PaymentStatus @default(PENDING)\n  created_at     DateTime      @default(now()) @db.Date\n  user           User          @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: Cascade)\n  seat           Seat          @relation(fields: [seat_id], references: [id], onDelete: Cascade, onUpdate: Cascade)\n  payment        Payment?\n\n  @@map("bookings")\n}\n\nmodel Bus {\n  id                 String     @id @default(uuid())\n  busName            String     @map("bus_name") @db.VarChar(255)\n  busNumber          String     @map("bus_number") @db.VarChar(100)\n  busType            BusType    @map("bus_type_")\n  totalSeats         Int        @map("total_seats")\n  registrationNumber String     @unique @map("registration_number") @db.VarChar(100)\n  status             BusStatus  @default(INACTIVE)\n  createdAt          DateTime   @default(now()) @map("created_at")\n  licenseNumber      String?    @map("licenseNumber")\n  driver             Driver?    @relation(fields: [licenseNumber], references: [licenseNumber], onDelete: Cascade, onUpdate: Cascade)\n  seats              Seat[]\n  schedules          Schedule[]\n  routeId            String\n  route              Route      @relation(fields: [routeId], references: [id], onDelete: Cascade, onUpdate: Cascade)\n  payment            Payment?\n\n  @@map("buses")\n}\n\nmodel Driver {\n  id            String       @id @default(uuid())\n  name          String       @db.VarChar(255)\n  phone         String       @db.VarChar(20)\n  licenseNumber String       @unique @default(uuid())\n  status        DriverStatus @default(ACTIVE)\n  createdAt     DateTime     @default(now()) @map("created_at")\n  buses         Bus[]\n\n  @@map("drivers")\n}\n\nenum Role {\n  USER\n  ADMIN\n  MANAGER\n}\n\nenum Status {\n  ACTIVE\n  INACTIVE\n  BLOCKED\n}\n\nenum BusType {\n  AC\n  NON_AC\n  DELUXE\n}\n\nenum BusStatus {\n  ACTIVE\n  INACTIVE\n  MAINTENANCE\n}\n\nenum DriverStatus {\n  ACTIVE\n  INACTIVE\n  ON_LEAVE\n  SUSPENDED\n}\n\nenum BookingStatus {\n  PENDING\n  CONFIRMED\n  CANCELLED\n}\n\nenum SeatStatus {\n  AVAILABLE\n  BOOKED\n  BLOCKED\n}\n\nenum PaymentStatus {\n  PAID\n  UNPAID\n  PENDING\n}\n\nmodel Payment {\n  id                 String        @id @default(uuid())\n  booking_id         String        @unique\n  transaction_id     String\n  amount             Int\n  payment_status     PaymentStatus @default(PENDING)\n  created_at         DateTime      @default(now())\n  user_id            String\n  stripeEventId      String?       @unique\n  transactionId      String?       @unique @db.Uuid()\n  paymentGatewayData Json?\n  bus_id             String        @unique\n\n  user User @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: Cascade)\n\n  booking Booking @relation(fields: [booking_id], references: [id], onDelete: Cascade, onUpdate: Cascade)\n  bus     Bus     @relation(fields: [bus_id], references: [id], onDelete: Cascade, onUpdate: Cascade)\n\n  @@map("payments")\n}\n\nmodel Route {\n  id         String     @id @default(uuid())\n  from_city  String\n  to_city    String\n  distance   String\n  base_price Int\n  created_at DateTime   @default(now()) @map("created_at")\n  schedules  Schedule[]\n  buses      Bus[]\n\n  @@map("routes")\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Seat {\n  id                  String     @id @default(uuid())\n  registration_Number String\n  seat_number         String     @unique\n  user_id             String\n  status              SeatStatus @default(AVAILABLE)\n  bus                 Bus        @relation(fields: [registration_Number], references: [registrationNumber], onDelete: Cascade, onUpdate: Cascade)\n  user                User?      @relation(fields: [user_id], references: [id], onDelete: Cascade, onUpdate: Cascade)\n  booking             Booking?\n\n  @@map("seats")\n}\n\nmodel Schedule {\n  id        String   @id @default(uuid())\n  bus_id    String\n  route_id  String\n  date      DateTime\n  time      String\n  createdAt DateTime @default(now()) @db.Date\n  updatedAt DateTime @updatedAt @db.Date\n  bus       Bus      @relation(fields: [bus_id], references: [id], onDelete: Cascade, onUpdate: Cascade)\n  route     Route    @relation(fields: [route_id], references: [id], onDelete: Cascade, onUpdate: Cascade)\n\n  @@map("schedules")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"Status"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToUser"},{"name":"seats","kind":"object","type":"Seat","relationName":"SeatToUser"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"}],"dbName":"users"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"schedule_id","kind":"scalar","type":"String"},{"name":"seat_id","kind":"scalar","type":"String"},{"name":"total_price","kind":"scalar","type":"Int"},{"name":"booking_status","kind":"enum","type":"BookingStatus"},{"name":"payment_status","kind":"enum","type":"PaymentStatus"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"BookingToUser"},{"name":"seat","kind":"object","type":"Seat","relationName":"BookingToSeat"},{"name":"payment","kind":"object","type":"Payment","relationName":"BookingToPayment"}],"dbName":"bookings"},"Bus":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"busName","kind":"scalar","type":"String","dbName":"bus_name"},{"name":"busNumber","kind":"scalar","type":"String","dbName":"bus_number"},{"name":"busType","kind":"enum","type":"BusType","dbName":"bus_type_"},{"name":"totalSeats","kind":"scalar","type":"Int","dbName":"total_seats"},{"name":"registrationNumber","kind":"scalar","type":"String","dbName":"registration_number"},{"name":"status","kind":"enum","type":"BusStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"licenseNumber","kind":"scalar","type":"String","dbName":"licenseNumber"},{"name":"driver","kind":"object","type":"Driver","relationName":"BusToDriver"},{"name":"seats","kind":"object","type":"Seat","relationName":"BusToSeat"},{"name":"schedules","kind":"object","type":"Schedule","relationName":"BusToSchedule"},{"name":"routeId","kind":"scalar","type":"String"},{"name":"route","kind":"object","type":"Route","relationName":"BusToRoute"},{"name":"payment","kind":"object","type":"Payment","relationName":"BusToPayment"}],"dbName":"buses"},"Driver":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"licenseNumber","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"DriverStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"buses","kind":"object","type":"Bus","relationName":"BusToDriver"}],"dbName":"drivers"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"booking_id","kind":"scalar","type":"String"},{"name":"transaction_id","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Int"},{"name":"payment_status","kind":"enum","type":"PaymentStatus"},{"name":"created_at","kind":"scalar","type":"DateTime"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"stripeEventId","kind":"scalar","type":"String"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"paymentGatewayData","kind":"scalar","type":"Json"},{"name":"bus_id","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"PaymentToUser"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToPayment"},{"name":"bus","kind":"object","type":"Bus","relationName":"BusToPayment"}],"dbName":"payments"},"Route":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"from_city","kind":"scalar","type":"String"},{"name":"to_city","kind":"scalar","type":"String"},{"name":"distance","kind":"scalar","type":"String"},{"name":"base_price","kind":"scalar","type":"Int"},{"name":"created_at","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"schedules","kind":"object","type":"Schedule","relationName":"RouteToSchedule"},{"name":"buses","kind":"object","type":"Bus","relationName":"BusToRoute"}],"dbName":"routes"},"Seat":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"registration_Number","kind":"scalar","type":"String"},{"name":"seat_number","kind":"scalar","type":"String"},{"name":"user_id","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"SeatStatus"},{"name":"bus","kind":"object","type":"Bus","relationName":"BusToSeat"},{"name":"user","kind":"object","type":"User","relationName":"SeatToUser"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToSeat"}],"dbName":"seats"},"Schedule":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bus_id","kind":"scalar","type":"String"},{"name":"route_id","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"time","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"bus","kind":"object","type":"Bus","relationName":"BusToSchedule"},{"name":"route","kind":"object","type":"Route","relationName":"RouteToSchedule"}],"dbName":"schedules"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","buses","_count","driver","seats","bus","schedules","route","payment","booking","seat","payments","bookings","sessions","accounts","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Booking.findUnique","Booking.findUniqueOrThrow","Booking.findFirst","Booking.findFirstOrThrow","Booking.findMany","Booking.createOne","Booking.createMany","Booking.createManyAndReturn","Booking.updateOne","Booking.updateMany","Booking.updateManyAndReturn","Booking.upsertOne","Booking.deleteOne","Booking.deleteMany","_avg","_sum","Booking.groupBy","Booking.aggregate","Bus.findUnique","Bus.findUniqueOrThrow","Bus.findFirst","Bus.findFirstOrThrow","Bus.findMany","Bus.createOne","Bus.createMany","Bus.createManyAndReturn","Bus.updateOne","Bus.updateMany","Bus.updateManyAndReturn","Bus.upsertOne","Bus.deleteOne","Bus.deleteMany","Bus.groupBy","Bus.aggregate","Driver.findUnique","Driver.findUniqueOrThrow","Driver.findFirst","Driver.findFirstOrThrow","Driver.findMany","Driver.createOne","Driver.createMany","Driver.createManyAndReturn","Driver.updateOne","Driver.updateMany","Driver.updateManyAndReturn","Driver.upsertOne","Driver.deleteOne","Driver.deleteMany","Driver.groupBy","Driver.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Route.findUnique","Route.findUniqueOrThrow","Route.findFirst","Route.findFirstOrThrow","Route.findMany","Route.createOne","Route.createMany","Route.createManyAndReturn","Route.updateOne","Route.updateMany","Route.updateManyAndReturn","Route.upsertOne","Route.deleteOne","Route.deleteMany","Route.groupBy","Route.aggregate","Seat.findUnique","Seat.findUniqueOrThrow","Seat.findFirst","Seat.findFirstOrThrow","Seat.findMany","Seat.createOne","Seat.createMany","Seat.createManyAndReturn","Seat.updateOne","Seat.updateMany","Seat.updateManyAndReturn","Seat.upsertOne","Seat.deleteOne","Seat.deleteMany","Seat.groupBy","Seat.aggregate","Schedule.findUnique","Schedule.findUniqueOrThrow","Schedule.findFirst","Schedule.findFirstOrThrow","Schedule.findMany","Schedule.createOne","Schedule.createMany","Schedule.createManyAndReturn","Schedule.updateOne","Schedule.updateMany","Schedule.updateManyAndReturn","Schedule.upsertOne","Schedule.deleteOne","Schedule.deleteMany","Schedule.groupBy","Schedule.aggregate","AND","OR","NOT","id","bus_id","route_id","date","time","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","registration_Number","seat_number","user_id","SeatStatus","status","from_city","to_city","distance","base_price","created_at","every","some","none","booking_id","transaction_id","amount","PaymentStatus","payment_status","stripeEventId","transactionId","paymentGatewayData","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","name","phone","licenseNumber","DriverStatus","busName","busNumber","BusType","busType","totalSeats","registrationNumber","BusStatus","routeId","schedule_id","seat_id","total_price","BookingStatus","booking_status","identifier","value","expiresAt","accountId","providerId","userId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","Role","role","Status","is","isNot","connectOrCreate","upsert","disconnect","delete","connect","createMany","set","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "2gVlsAERBwAAhQMAIA4AAIMDACAPAACEAwAgEAAAhgMAIBEAAIcDACDKAQAA_wIAMMsBAAAdABDMAQAA_wIAMM0BAQAAAAHSAUAAxAIAIdMBQADEAgAh4wEAAIIDoAIi-gEBAMICACH7AQEAwgIAIZsCAQAAAAGcAiAAgAMAIZ4CAACBA54CIgEAAAABACARAwAA-AIAIAgAAIkDACAMAACVAwAgygEAAJMDADDLAQAAAwAQzAEAAJMDADDNAQEAwgIAIc4BAQDCAgAh4QEBAMICACHoAUAAxAIAIewBAQDCAgAh7QEBAMICACHuAQIAwwIAIfABAAD8AvABIvEBAQD2AgAh8gEBAJYDACHzAQAAlAMAIAYDAACJBQAgCAAAjAUAIAwAAI4FACDxAQAAigQAIPIBAACKBAAg8wEAAIoEACARAwAA-AIAIAgAAIkDACAMAACVAwAgygEAAJMDADDLAQAAAwAQzAEAAJMDADDNAQEAAAABzgEBAAAAAeEBAQDCAgAh6AFAAMQCACHsAQEAAAAB7QEBAMICACHuAQIAwwIAIfABAAD8AvABIvEBAQAAAAHyAQEAAAAB8wEAAJQDACADAAAAAwAgAQAABAAwAgAABQAgCgQAAMYCACDKAQAA1wIAMMsBAAAHABDMAQAA1wIAMM0BAQDCAgAh0gFAAMQCACHjAQAA2AL-ASL6AQEAwgIAIfsBAQDCAgAh_AEBAMICACEBAAAABwAgEgYAAJIDACAHAACFAwAgCQAAxQIAIAoAAIoDACALAAD-AgAgygEAAI8DADDLAQAACQAQzAEAAI8DADDNAQEAwgIAIdIBQADEAgAh4wEAAJEDhQIi_AEBAPYCACH-AQEAwgIAIf8BAQDCAgAhgQIAAJADgQIiggICAMMCACGDAgEAwgIAIYUCAQDCAgAhBgYAAI8FACAHAACGBQAgCQAAiAQAIAoAAI0FACALAACLBQAg_AEAAIoEACASBgAAkgMAIAcAAIUDACAJAADFAgAgCgAAigMAIAsAAP4CACDKAQAAjwMAMMsBAAAJABDMAQAAjwMAMM0BAQAAAAHSAUAAxAIAIeMBAACRA4UCIvwBAQD2AgAh_gEBAMICACH_AQEAwgIAIYECAACQA4ECIoICAgDDAgAhgwIBAAAAAYUCAQDCAgAhAwAAAAkAIAEAAAoAMAIAAAsAIAEAAAAJACALAwAAjQMAIAgAAIkDACAMAACOAwAgygEAAIsDADDLAQAADgAQzAEAAIsDADDNAQEAwgIAId8BAQDCAgAh4AEBAMICACHhAQEAwgIAIeMBAACMA-MBIgMDAACJBQAgCAAAjAUAIAwAAI4FACALAwAAjQMAIAgAAIkDACAMAACOAwAgygEAAIsDADDLAQAADgAQzAEAAIsDADDNAQEAAAAB3wEBAMICACHgAQEAAAAB4QEBAMICACHjAQAAjAPjASIDAAAADgAgAQAADwAwAgAAEAAgDAgAAIkDACAKAACKAwAgygEAAIgDADDLAQAAEgAQzAEAAIgDADDNAQEAwgIAIc4BAQDCAgAhzwEBAMICACHQAUAAxAIAIdEBAQDCAgAh0gFAAMQCACHTAUAAxAIAIQIIAACMBQAgCgAAjQUAIAwIAACJAwAgCgAAigMAIMoBAACIAwAwywEAABIAEMwBAACIAwAwzQEBAAAAAc4BAQDCAgAhzwEBAMICACHQAUAAxAIAIdEBAQDCAgAh0gFAAMQCACHTAUAAxAIAIQMAAAASACABAAATADACAAAUACADAAAAEgAgAQAAEwAwAgAAFAAgAwAAAAkAIAEAAAoAMAIAAAsAIAEAAAASACABAAAACQAgAQAAAAMAIAEAAAAOACABAAAAEgAgEQcAAIUDACAOAACDAwAgDwAAhAMAIBAAAIYDACARAACHAwAgygEAAP8CADDLAQAAHQAQzAEAAP8CADDNAQEAwgIAIdIBQADEAgAh0wFAAMQCACHjAQAAggOgAiL6AQEAwgIAIfsBAQDCAgAhmwIBAMICACGcAiAAgAMAIZ4CAACBA54CIgEAAAAdACAOAwAA-AIAIAsAAP4CACANAAD9AgAgygEAAPoCADDLAQAAHwAQzAEAAPoCADDNAQEAwgIAIeEBAQDCAgAh6AFAAMQCACHwAQAA_ALwASKGAgEAwgIAIYcCAQDCAgAhiAICAMMCACGKAgAA-wKKAiIBAAAAHwAgAQAAAAMAIAMDAACJBQAgCwAAiwUAIA0AAIoFACAOAwAA-AIAIAsAAP4CACANAAD9AgAgygEAAPoCADDLAQAAHwAQzAEAAPoCADDNAQEAAAAB4QEBAMICACHoAUAAxAIAIfABAAD8AvABIoYCAQDCAgAhhwIBAAAAAYgCAgDDAgAhigIAAPsCigIiAwAAAB8AIAEAACIAMAIAACMAIAMAAAAOACABAAAPADACAAAQACAMAwAA-AIAIMoBAAD5AgAwywEAACYAEMwBAAD5AgAwzQEBAMICACHSAUAAxAIAIdMBQADEAgAhjQJAAMQCACGQAgEAwgIAIZgCAQDCAgAhmQIBAPYCACGaAgEA9gIAIQMDAACJBQAgmQIAAIoEACCaAgAAigQAIAwDAAD4AgAgygEAAPkCADDLAQAAJgAQzAEAAPkCADDNAQEAAAAB0gFAAMQCACHTAUAAxAIAIY0CQADEAgAhkAIBAMICACGYAgEAAAABmQIBAPYCACGaAgEA9gIAIQMAAAAmACABAAAnADACAAAoACARAwAA-AIAIMoBAAD1AgAwywEAACoAEMwBAAD1AgAwzQEBAMICACHSAUAAxAIAIdMBQADEAgAhjgIBAMICACGPAgEAwgIAIZACAQDCAgAhkQIBAPYCACGSAgEA9gIAIZMCAQD2AgAhlAJAAPcCACGVAkAA9wIAIZYCAQD2AgAhlwIBAPYCACEIAwAAiQUAIJECAACKBAAgkgIAAIoEACCTAgAAigQAIJQCAACKBAAglQIAAIoEACCWAgAAigQAIJcCAACKBAAgEQMAAPgCACDKAQAA9QIAMMsBAAAqABDMAQAA9QIAMM0BAQAAAAHSAUAAxAIAIdMBQADEAgAhjgIBAMICACGPAgEAwgIAIZACAQDCAgAhkQIBAPYCACGSAgEA9gIAIZMCAQD2AgAhlAJAAPcCACGVAkAA9wIAIZYCAQD2AgAhlwIBAPYCACEDAAAAKgAgAQAAKwAwAgAALAAgAQAAAAMAIAEAAAAfACABAAAADgAgAQAAACYAIAEAAAAqACABAAAAAQAgBQcAAIYFACAOAACEBQAgDwAAhQUAIBAAAIcFACARAACIBQAgAwAAAB0AIAEAADQAMAIAAAEAIAMAAAAdACABAAA0ADACAAABACADAAAAHQAgAQAANAAwAgAAAQAgDgcAAIEFACAOAAD_BAAgDwAAgAUAIBAAAIIFACARAACDBQAgzQEBAAAAAdIBQAAAAAHTAUAAAAAB4wEAAACgAgL6AQEAAAAB-wEBAAAAAZsCAQAAAAGcAiAAAAABngIAAACeAgIBFwAAOAAgCc0BAQAAAAHSAUAAAAAB0wFAAAAAAeMBAAAAoAIC-gEBAAAAAfsBAQAAAAGbAgEAAAABnAIgAAAAAZ4CAAAAngICARcAADoAMAEXAAA6ADAOBwAAwwQAIA4AAMEEACAPAADCBAAgEAAAxAQAIBEAAMUEACDNAQEAmwMAIdIBQACcAwAh0wFAAJwDACHjAQAAwASgAiL6AQEAmwMAIfsBAQCbAwAhmwIBAJsDACGcAiAAvgQAIZ4CAAC_BJ4CIgIAAAABACAXAAA9ACAJzQEBAJsDACHSAUAAnAMAIdMBQACcAwAh4wEAAMAEoAIi-gEBAJsDACH7AQEAmwMAIZsCAQCbAwAhnAIgAL4EACGeAgAAvwSeAiICAAAAHQAgFwAAPwAgAgAAAB0AIBcAAD8AIAMAAAABACAeAAA4ACAfAAA9ACABAAAAAQAgAQAAAB0AIAMFAAC7BAAgJAAAvQQAICUAALwEACAMygEAAOsCADDLAQAARgAQzAEAAOsCADDNAQEAsgIAIdIBQACzAgAh0wFAALMCACHjAQAA7gKgAiL6AQEAsgIAIfsBAQCyAgAhmwIBALICACGcAiAA7AIAIZ4CAADtAp4CIgMAAAAdACABAABFADAjAABGACADAAAAHQAgAQAANAAwAgAAAQAgAQAAACgAIAEAAAAoACADAAAAJgAgAQAAJwAwAgAAKAAgAwAAACYAIAEAACcAMAIAACgAIAMAAAAmACABAAAnADACAAAoACAJAwAAugQAIM0BAQAAAAHSAUAAAAAB0wFAAAAAAY0CQAAAAAGQAgEAAAABmAIBAAAAAZkCAQAAAAGaAgEAAAABARcAAE4AIAjNAQEAAAAB0gFAAAAAAdMBQAAAAAGNAkAAAAABkAIBAAAAAZgCAQAAAAGZAgEAAAABmgIBAAAAAQEXAABQADABFwAAUAAwCQMAALkEACDNAQEAmwMAIdIBQACcAwAh0wFAAJwDACGNAkAAnAMAIZACAQCbAwAhmAIBAJsDACGZAgEAtwMAIZoCAQC3AwAhAgAAACgAIBcAAFMAIAjNAQEAmwMAIdIBQACcAwAh0wFAAJwDACGNAkAAnAMAIZACAQCbAwAhmAIBAJsDACGZAgEAtwMAIZoCAQC3AwAhAgAAACYAIBcAAFUAIAIAAAAmACAXAABVACADAAAAKAAgHgAATgAgHwAAUwAgAQAAACgAIAEAAAAmACAFBQAAtgQAICQAALgEACAlAAC3BAAgmQIAAIoEACCaAgAAigQAIAvKAQAA6gIAMMsBAABcABDMAQAA6gIAMM0BAQCyAgAh0gFAALMCACHTAUAAswIAIY0CQACzAgAhkAIBALICACGYAgEAsgIAIZkCAQDJAgAhmgIBAMkCACEDAAAAJgAgAQAAWwAwIwAAXAAgAwAAACYAIAEAACcAMAIAACgAIAEAAAAsACABAAAALAAgAwAAACoAIAEAACsAMAIAACwAIAMAAAAqACABAAArADACAAAsACADAAAAKgAgAQAAKwAwAgAALAAgDgMAALUEACDNAQEAAAAB0gFAAAAAAdMBQAAAAAGOAgEAAAABjwIBAAAAAZACAQAAAAGRAgEAAAABkgIBAAAAAZMCAQAAAAGUAkAAAAABlQJAAAAAAZYCAQAAAAGXAgEAAAABARcAAGQAIA3NAQEAAAAB0gFAAAAAAdMBQAAAAAGOAgEAAAABjwIBAAAAAZACAQAAAAGRAgEAAAABkgIBAAAAAZMCAQAAAAGUAkAAAAABlQJAAAAAAZYCAQAAAAGXAgEAAAABARcAAGYAMAEXAABmADAOAwAAtAQAIM0BAQCbAwAh0gFAAJwDACHTAUAAnAMAIY4CAQCbAwAhjwIBAJsDACGQAgEAmwMAIZECAQC3AwAhkgIBALcDACGTAgEAtwMAIZQCQACzBAAhlQJAALMEACGWAgEAtwMAIZcCAQC3AwAhAgAAACwAIBcAAGkAIA3NAQEAmwMAIdIBQACcAwAh0wFAAJwDACGOAgEAmwMAIY8CAQCbAwAhkAIBAJsDACGRAgEAtwMAIZICAQC3AwAhkwIBALcDACGUAkAAswQAIZUCQACzBAAhlgIBALcDACGXAgEAtwMAIQIAAAAqACAXAABrACACAAAAKgAgFwAAawAgAwAAACwAIB4AAGQAIB8AAGkAIAEAAAAsACABAAAAKgAgCgUAALAEACAkAACyBAAgJQAAsQQAIJECAACKBAAgkgIAAIoEACCTAgAAigQAIJQCAACKBAAglQIAAIoEACCWAgAAigQAIJcCAACKBAAgEMoBAADmAgAwywEAAHIAEMwBAADmAgAwzQEBALICACHSAUAAswIAIdMBQACzAgAhjgIBALICACGPAgEAsgIAIZACAQCyAgAhkQIBAMkCACGSAgEAyQIAIZMCAQDJAgAhlAJAAOcCACGVAkAA5wIAIZYCAQDJAgAhlwIBAMkCACEDAAAAKgAgAQAAcQAwIwAAcgAgAwAAACoAIAEAACsAMAIAACwAIAnKAQAA5QIAMMsBAAB4ABDMAQAA5QIAMM0BAQAAAAHSAUAAxAIAIdMBQADEAgAhiwIBAMICACGMAgEAwgIAIY0CQADEAgAhAQAAAHUAIAEAAAB1ACAJygEAAOUCADDLAQAAeAAQzAEAAOUCADDNAQEAwgIAIdIBQADEAgAh0wFAAMQCACGLAgEAwgIAIYwCAQDCAgAhjQJAAMQCACEAAwAAAHgAIAEAAHkAMAIAAHUAIAMAAAB4ACABAAB5ADACAAB1ACADAAAAeAAgAQAAeQAwAgAAdQAgBs0BAQAAAAHSAUAAAAAB0wFAAAAAAYsCAQAAAAGMAgEAAAABjQJAAAAAAQEXAAB9ACAGzQEBAAAAAdIBQAAAAAHTAUAAAAABiwIBAAAAAYwCAQAAAAGNAkAAAAABARcAAH8AMAEXAAB_ADAGzQEBAJsDACHSAUAAnAMAIdMBQACcAwAhiwIBAJsDACGMAgEAmwMAIY0CQACcAwAhAgAAAHUAIBcAAIIBACAGzQEBAJsDACHSAUAAnAMAIdMBQACcAwAhiwIBAJsDACGMAgEAmwMAIY0CQACcAwAhAgAAAHgAIBcAAIQBACACAAAAeAAgFwAAhAEAIAMAAAB1ACAeAAB9ACAfAACCAQAgAQAAAHUAIAEAAAB4ACADBQAArQQAICQAAK8EACAlAACuBAAgCcoBAADkAgAwywEAAIsBABDMAQAA5AIAMM0BAQCyAgAh0gFAALMCACHTAUAAswIAIYsCAQCyAgAhjAIBALICACGNAkAAswIAIQMAAAB4ACABAACKAQAwIwAAiwEAIAMAAAB4ACABAAB5ADACAAB1ACABAAAAIwAgAQAAACMAIAMAAAAfACABAAAiADACAAAjACADAAAAHwAgAQAAIgAwAgAAIwAgAwAAAB8AIAEAACIAMAIAACMAIAsDAAC8AwAgCwAAvQMAIA0AAKwEACDNAQEAAAAB4QEBAAAAAegBQAAAAAHwAQAAAPABAoYCAQAAAAGHAgEAAAABiAICAAAAAYoCAAAAigICARcAAJMBACAIzQEBAAAAAeEBAQAAAAHoAUAAAAAB8AEAAADwAQKGAgEAAAABhwIBAAAAAYgCAgAAAAGKAgAAAIoCAgEXAACVAQAwARcAAJUBADALAwAAsAMAIAsAALEDACANAACrBAAgzQEBAJsDACHhAQEAmwMAIegBQACcAwAh8AEAAK8D8AEihgIBAJsDACGHAgEAmwMAIYgCAgCtAwAhigIAAK4DigIiAgAAACMAIBcAAJgBACAIzQEBAJsDACHhAQEAmwMAIegBQACcAwAh8AEAAK8D8AEihgIBAJsDACGHAgEAmwMAIYgCAgCtAwAhigIAAK4DigIiAgAAAB8AIBcAAJoBACACAAAAHwAgFwAAmgEAIAMAAAAjACAeAACTAQAgHwAAmAEAIAEAAAAjACABAAAAHwAgBQUAAKYEACAkAACpBAAgJQAAqAQAIGYAAKcEACBnAACqBAAgC8oBAADgAgAwywEAAKEBABDMAQAA4AIAMM0BAQCyAgAh4QEBALICACHoAUAAswIAIfABAADIAvABIoYCAQCyAgAhhwIBALICACGIAgIAvgIAIYoCAADhAooCIgMAAAAfACABAACgAQAwIwAAoQEAIAMAAAAfACABAAAiADACAAAjACABAAAACwAgAQAAAAsAIAMAAAAJACABAAAKADACAAALACADAAAACQAgAQAACgAwAgAACwAgAwAAAAkAIAEAAAoAMAIAAAsAIA8GAAD5AwAgBwAA-gMAIAkAAPsDACAKAACfBAAgCwAA_AMAIM0BAQAAAAHSAUAAAAAB4wEAAACFAgL8AQEAAAAB_gEBAAAAAf8BAQAAAAGBAgAAAIECAoICAgAAAAGDAgEAAAABhQIBAAAAAQEXAACpAQAgCs0BAQAAAAHSAUAAAAAB4wEAAACFAgL8AQEAAAAB_gEBAAAAAf8BAQAAAAGBAgAAAIECAoICAgAAAAGDAgEAAAABhQIBAAAAAQEXAACrAQAwARcAAKsBADABAAAABwAgDwYAANUDACAHAADWAwAgCQAA1wMAIAoAAJ0EACALAADYAwAgzQEBAJsDACHSAUAAnAMAIeMBAADTA4UCIvwBAQC3AwAh_gEBAJsDACH_AQEAmwMAIYECAADSA4ECIoICAgCtAwAhgwIBAJsDACGFAgEAmwMAIQIAAAALACAXAACvAQAgCs0BAQCbAwAh0gFAAJwDACHjAQAA0wOFAiL8AQEAtwMAIf4BAQCbAwAh_wEBAJsDACGBAgAA0gOBAiKCAgIArQMAIYMCAQCbAwAhhQIBAJsDACECAAAACQAgFwAAsQEAIAIAAAAJACAXAACxAQAgAQAAAAcAIAMAAAALACAeAACpAQAgHwAArwEAIAEAAAALACABAAAACQAgBgUAAKEEACAkAACkBAAgJQAAowQAIGYAAKIEACBnAAClBAAg_AEAAIoEACANygEAANkCADDLAQAAuQEAEMwBAADZAgAwzQEBALICACHSAUAAswIAIeMBAADbAoUCIvwBAQDJAgAh_gEBALICACH_AQEAsgIAIYECAADaAoECIoICAgC-AgAhgwIBALICACGFAgEAsgIAIQMAAAAJACABAAC4AQAwIwAAuQEAIAMAAAAJACABAAAKADACAAALACAKBAAAxgIAIMoBAADXAgAwywEAAAcAEMwBAADXAgAwzQEBAAAAAdIBQADEAgAh4wEAANgC_gEi-gEBAMICACH7AQEAwgIAIfwBAQAAAAEBAAAAvAEAIAEAAAC8AQAgAQQAAIkEACADAAAABwAgAQAAvwEAMAIAALwBACADAAAABwAgAQAAvwEAMAIAALwBACADAAAABwAgAQAAvwEAMAIAALwBACAHBAAAoAQAIM0BAQAAAAHSAUAAAAAB4wEAAAD-AQL6AQEAAAAB-wEBAAAAAfwBAQAAAAEBFwAAwwEAIAbNAQEAAAAB0gFAAAAAAeMBAAAA_gEC-gEBAAAAAfsBAQAAAAH8AQEAAAABARcAAMUBADABFwAAxQEAMAcEAACUBAAgzQEBAJsDACHSAUAAnAMAIeMBAACTBP4BIvoBAQCbAwAh-wEBAJsDACH8AQEAmwMAIQIAAAC8AQAgFwAAyAEAIAbNAQEAmwMAIdIBQACcAwAh4wEAAJME_gEi-gEBAJsDACH7AQEAmwMAIfwBAQCbAwAhAgAAAAcAIBcAAMoBACACAAAABwAgFwAAygEAIAMAAAC8AQAgHgAAwwEAIB8AAMgBACABAAAAvAEAIAEAAAAHACADBQAAkAQAICQAAJIEACAlAACRBAAgCcoBAADTAgAwywEAANEBABDMAQAA0wIAMM0BAQCyAgAh0gFAALMCACHjAQAA1AL-ASL6AQEAsgIAIfsBAQCyAgAh_AEBALICACEDAAAABwAgAQAA0AEAMCMAANEBACADAAAABwAgAQAAvwEAMAIAALwBACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIA4DAAC6AwAgCAAAuwMAIAwAAN8DACDNAQEAAAABzgEBAAAAAeEBAQAAAAHoAUAAAAAB7AEBAAAAAe0BAQAAAAHuAQIAAAAB8AEAAADwAQLxAQEAAAAB8gEBAAAAAfMBgAAAAAEBFwAA2QEAIAvNAQEAAAABzgEBAAAAAeEBAQAAAAHoAUAAAAAB7AEBAAAAAe0BAQAAAAHuAQIAAAAB8AEAAADwAQLxAQEAAAAB8gEBAAAAAfMBgAAAAAEBFwAA2wEAMAEXAADbAQAwDgMAALgDACAIAAC5AwAgDAAA3gMAIM0BAQCbAwAhzgEBAJsDACHhAQEAmwMAIegBQACcAwAh7AEBAJsDACHtAQEAmwMAIe4BAgCtAwAh8AEAAK8D8AEi8QEBALcDACHyAQEAtwMAIfMBgAAAAAECAAAABQAgFwAA3gEAIAvNAQEAmwMAIc4BAQCbAwAh4QEBAJsDACHoAUAAnAMAIewBAQCbAwAh7QEBAJsDACHuAQIArQMAIfABAACvA_ABIvEBAQC3AwAh8gEBALcDACHzAYAAAAABAgAAAAMAIBcAAOABACACAAAAAwAgFwAA4AEAIAMAAAAFACAeAADZAQAgHwAA3gEAIAEAAAAFACABAAAAAwAgCAUAAIsEACAkAACOBAAgJQAAjQQAIGYAAIwEACBnAACPBAAg8QEAAIoEACDyAQAAigQAIPMBAACKBAAgDsoBAADHAgAwywEAAOcBABDMAQAAxwIAMM0BAQCyAgAhzgEBALICACHhAQEAsgIAIegBQACzAgAh7AEBALICACHtAQEAsgIAIe4BAgC-AgAh8AEAAMgC8AEi8QEBAMkCACHyAQEAygIAIfMBAADLAgAgAwAAAAMAIAEAAOYBADAjAADnAQAgAwAAAAMAIAEAAAQAMAIAAAUAIAsEAADGAgAgCQAAxQIAIMoBAADBAgAwywEAAO0BABDMAQAAwQIAMM0BAQAAAAHkAQEAwgIAIeUBAQDCAgAh5gEBAMICACHnAQIAwwIAIegBQADEAgAhAQAAAOoBACABAAAA6gEAIAsEAADGAgAgCQAAxQIAIMoBAADBAgAwywEAAO0BABDMAQAAwQIAMM0BAQDCAgAh5AEBAMICACHlAQEAwgIAIeYBAQDCAgAh5wECAMMCACHoAUAAxAIAIQIEAACJBAAgCQAAiAQAIAMAAADtAQAgAQAA7gEAMAIAAOoBACADAAAA7QEAIAEAAO4BADACAADqAQAgAwAAAO0BACABAADuAQAwAgAA6gEAIAgEAACHBAAgCQAAhgQAIM0BAQAAAAHkAQEAAAAB5QEBAAAAAeYBAQAAAAHnAQIAAAAB6AFAAAAAAQEXAADyAQAgBs0BAQAAAAHkAQEAAAAB5QEBAAAAAeYBAQAAAAHnAQIAAAAB6AFAAAAAAQEXAAD0AQAwARcAAPQBADAIBAAAxwMAIAkAAMYDACDNAQEAmwMAIeQBAQCbAwAh5QEBAJsDACHmAQEAmwMAIecBAgCtAwAh6AFAAJwDACECAAAA6gEAIBcAAPcBACAGzQEBAJsDACHkAQEAmwMAIeUBAQCbAwAh5gEBAJsDACHnAQIArQMAIegBQACcAwAhAgAAAO0BACAXAAD5AQAgAgAAAO0BACAXAAD5AQAgAwAAAOoBACAeAADyAQAgHwAA9wEAIAEAAADqAQAgAQAAAO0BACAFBQAAwQMAICQAAMQDACAlAADDAwAgZgAAwgMAIGcAAMUDACAJygEAAL0CADDLAQAAgAIAEMwBAAC9AgAwzQEBALICACHkAQEAsgIAIeUBAQCyAgAh5gEBALICACHnAQIAvgIAIegBQACzAgAhAwAAAO0BACABAAD_AQAwIwAAgAIAIAMAAADtAQAgAQAA7gEAMAIAAOoBACABAAAAEAAgAQAAABAAIAMAAAAOACABAAAPADACAAAQACADAAAADgAgAQAADwAwAgAAEAAgAwAAAA4AIAEAAA8AMAIAABAAIAgDAAC_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-ASL6AQEAsgIAIfsBAQCyAgAh_AEBALICACEHBQAAtQIAICQAANYCACAlAADWAgAg1AEAAAD-AQLVAQAAAP4BCNYBAAAA_gEI2wEAANUC_gEiBwUAALUCACAkAADWAgAgJQAA1gIAINQBAAAA_gEC1QEAAAD-AQjWAQAAAP4BCNsBAADVAv4BIgTUAQAAAP4BAtUBAAAA_gEI1gEAAAD-AQjbAQAA1gL-ASIKBAAAxgIAIMoBAADXAgAwywEAAAcAEMwBAADXAgAwzQEBAMICACHSAUAAxAIAIeMBAADYAv4BIvoBAQDCAgAh-wEBAMICACH8AQEAwgIAIQTUAQAAAP4BAtUBAAAA_gEI1gEAAAD-AQjbAQAA1gL-ASINygEAANkCADDLAQAAuQEAEMwBAADZAgAwzQEBALICACHSAUAAswIAIeMBAADbAoUCIvwBAQDJAgAh_gEBALICACH_AQEAsgIAIYECAADaAoECIoICAgC-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_AgAwywEAAB0AEMwBAAD_AgAwzQEBAMICACHSAUAAxAIAIdMBQADEAgAh4wEAAIIDoAIi-gEBAMICACH7AQEAwgIAIZsCAQDCAgAhnAIgAIADACGeAgAAgQOeAiKgAgAAHQAgoQIAAB0AIAwDAAD4AgAgygEAAPkCADDLAQAAJgAQzAEAAPkCADDNAQEAwgIAIdIBQADEAgAh0wFAAMQCACGNAkAAxAIAIZACAQDCAgAhmAIBAMICACGZAgEA9gIAIZoCAQD2AgAhDgMAAPgCACALAAD-AgAgDQAA_QIAIMoBAAD6AgAwywEAAB8AEMwBAAD6AgAwzQEBAMICACHhAQEAwgIAIegBQADEAgAh8AEAAPwC8AEihgIBAMICACGHAgEAwgIAIYgCAgDDAgAhigIAAPsCigIiBNQBAAAAigIC1QEAAACKAgjWAQAAAIoCCNsBAADjAooCIgTUAQAAAPABAtUBAAAA8AEI1gEAAADwAQjbAQAA0gLwASINAwAAjQMAIAgAAIkDACAMAACOAwAgygEAAIsDADDLAQAADgAQzAEAAIsDADDNAQEAwgIAId8BAQDCAgAh4AEBAMICACHhAQEAwgIAIeMBAACMA-MBIqACAAAOACChAgAADgAgEwMAAPgCACAIAACJAwAgDAAAlQMAIMoBAACTAwAwywEAAAMAEMwBAACTAwAwzQEBAMICACHOAQEAwgIAIeEBAQDCAgAh6AFAAMQCACHsAQEAwgIAIe0BAQDCAgAh7gECAMMCACHwAQAA_ALwASLxAQEA9gIAIfIBAQCWAwAh8wEAAJQDACCgAgAAAwAgoQIAAAMAIBEHAACFAwAgDgAAgwMAIA8AAIQDACAQAACGAwAgEQAAhwMAIMoBAAD_AgAwywEAAB0AEMwBAAD_AgAwzQEBAMICACHSAUAAxAIAIdMBQADEAgAh4wEAAIIDoAIi-gEBAMICACH7AQEAwgIAIZsCAQDCAgAhnAIgAIADACGeAgAAgQOeAiIC1AEgAAAAAdsBIAD0AgAhBNQBAAAAngIC1QEAAACeAgjWAQAAAJ4CCNsBAADyAp4CIgTUAQAAAKACAtUBAAAAoAII1gEAAACgAgjbAQAA8AKgAiID6QEAAAMAIOoBAAADACDrAQAAAwAgA-kBAAAfACDqAQAAHwAg6wEAAB8AIAPpAQAADgAg6gEAAA4AIOsBAAAOACAD6QEAACYAIOoBAAAmACDrAQAAJgAgA-kBAAAqACDqAQAAKgAg6wEAACoAIAwIAACJAwAgCgAAigMAIMoBAACIAwAwywEAABIAEMwBAACIAwAwzQEBAMICACHOAQEAwgIAIc8BAQDCAgAh0AFAAMQCACHRAQEAwgIAIdIBQADEAgAh0wFAAMQCACEUBgAAkgMAIAcAAIUDACAJAADFAgAgCgAAigMAIAsAAP4CACDKAQAAjwMAMMsBAAAJABDMAQAAjwMAMM0BAQDCAgAh0gFAAMQCACHjAQAAkQOFAiL8AQEA9gIAIf4BAQDCAgAh_wEBAMICACGBAgAAkAOBAiKCAgIAwwIAIYMCAQDCAgAhhQIBAMICACGgAgAACQAgoQIAAAkAIA0EAADGAgAgCQAAxQIAIMoBAADBAgAwywEAAO0BABDMAQAAwQIAMM0BAQDCAgAh5AEBAMICACHlAQEAwgIAIeYBAQDCAgAh5wECAMMCACHoAUAAxAIAIaACAADtAQAgoQIAAO0BACALAwAAjQMAIAgAAIkDACAMAACOAwAgygEAAIsDADDLAQAADgAQzAEAAIsDADDNAQEAwgIAId8BAQDCAgAh4AEBAMICACHhAQEAwgIAIeMBAACMA-MBIgTUAQAAAOMBAtUBAAAA4wEI1gEAAADjAQjbAQAAvALjASITBwAAhQMAIA4AAIMDACAPAACEAwAgEAAAhgMAIBEAAIcDACDKAQAA_wIAMMsBAAAdABDMAQAA_wIAMM0BAQDCAgAh0gFAAMQCACHTAUAAxAIAIeMBAACCA6ACIvoBAQDCAgAh-wEBAMICACGbAgEAwgIAIZwCIACAAwAhngIAAIEDngIioAIAAB0AIKECAAAdACAQAwAA-AIAIAsAAP4CACANAAD9AgAgygEAAPoCADDLAQAAHwAQzAEAAPoCADDNAQEAwgIAIeEBAQDCAgAh6AFAAMQCACHwAQAA_ALwASKGAgEAwgIAIYcCAQDCAgAhiAICAMMCACGKAgAA-wKKAiKgAgAAHwAgoQIAAB8AIBIGAACSAwAgBwAAhQMAIAkAAMUCACAKAACKAwAgCwAA_gIAIMoBAACPAwAwywEAAAkAEMwBAACPAwAwzQEBAMICACHSAUAAxAIAIeMBAACRA4UCIvwBAQD2AgAh_gEBAMICACH_AQEAwgIAIYECAACQA4ECIoICAgDDAgAhgwIBAMICACGFAgEAwgIAIQTUAQAAAIECAtUBAAAAgQII1gEAAACBAgjbAQAA3wKBAiIE1AEAAACFAgLVAQAAAIUCCNYBAAAAhQII2wEAAN0ChQIiDAQAAMYCACDKAQAA1wIAMMsBAAAHABDMAQAA1wIAMM0BAQDCAgAh0gFAAMQCACHjAQAA2AL-ASL6AQEAwgIAIfsBAQDCAgAh_AEBAMICACGgAgAABwAgoQIAAAcAIBEDAAD4AgAgCAAAiQMAIAwAAJUDACDKAQAAkwMAMMsBAAADABDMAQAAkwMAMM0BAQDCAgAhzgEBAMICACHhAQEAwgIAIegBQADEAgAh7AEBAMICACHtAQEAwgIAIe4BAgDDAgAh8AEAAPwC8AEi8QEBAPYCACHyAQEAlgMAIfMBAACUAwAgDNQBgAAAAAHXAYAAAAAB2AGAAAAAAdkBgAAAAAHaAYAAAAAB2wGAAAAAAfQBAQAAAAH1AQEAAAAB9gEBAAAAAfcBgAAAAAH4AYAAAAAB-QGAAAAAARADAAD4AgAgCwAA_gIAIA0AAP0CACDKAQAA-gIAMMsBAAAfABDMAQAA-gIAMM0BAQDCAgAh4QEBAMICACHoAUAAxAIAIfABAAD8AvABIoYCAQDCAgAhhwIBAMICACGIAgIAwwIAIYoCAAD7AooCIqACAAAfACChAgAAHwAgCNQBAQAAAAHVAQEAAAAF1gEBAAAABdcBAQAAAAHYAQEAAAAB2QEBAAAAAdoBAQAAAAHbAQEAlwMAIQjUAQEAAAAB1QEBAAAABdYBAQAAAAXXAQEAAAAB2AEBAAAAAdkBAQAAAAHaAQEAAAAB2wEBAJcDACEAAAABqAIBAAAAAQGoAkAAAAABBR4AANMFACAfAADZBQAgogIAANQFACCjAgAA2AUAIKYCAAALACAFHgAA0QUAIB8AANYFACCiAgAA0gUAIKMCAADVBQAgpgIAAOoBACADHgAA0wUAIKICAADUBQAgpgIAAAsAIAMeAADRBQAgogIAANIFACCmAgAA6gEAIAAAAAGoAgAAAOMBAgUeAAC6BQAgHwAAzwUAIKICAAC7BQAgowIAAM4FACCmAgAACwAgBx4AALgFACAfAADMBQAgogIAALkFACCjAgAAywUAIKQCAAAdACClAgAAHQAgpgIAAAEAIAceAACoAwAgHwAAqwMAIKICAACpAwAgowIAAKoDACCkAgAAHwAgpQIAAB8AIKYCAAAjACAJAwAAvAMAIAsAAL0DACDNAQEAAAAB4QEBAAAAAegBQAAAAAHwAQAAAPABAoYCAQAAAAGIAgIAAAABigIAAACKAgICAAAAIwAgHgAAqAMAIAMAAAAfACAeAACoAwAgHwAArAMAIAsAAAAfACADAACwAwAgCwAAsQMAIBcAAKwDACDNAQEAmwMAIeEBAQCbAwAh6AFAAJwDACHwAQAArwPwASKGAgEAmwMAIYgCAgCtAwAhigIAAK4DigIiCQMAALADACALAACxAwAgzQEBAJsDACHhAQEAmwMAIegBQACcAwAh8AEAAK8D8AEihgIBAJsDACGIAgIArQMAIYoCAACuA4oCIgWoAgIAAAABqwICAAAAAawCAgAAAAGtAgIAAAABrgICAAAAAQGoAgAAAIoCAgGoAgAAAPABAgUeAAC8BQAgHwAAyQUAIKICAAC9BQAgowIAAMgFACCmAgAAAQAgBx4AALIDACAfAAC1AwAgogIAALMDACCjAgAAtAMAIKQCAAADACClAgAAAwAgpgIAAAUAIAwDAAC6AwAgCAAAuwMAIM0BAQAAAAHOAQEAAAAB4QEBAAAAAegBQAAAAAHtAQEAAAAB7gECAAAAAfABAAAA8AEC8QEBAAAAAfIBAQAAAAHzAYAAAAABAgAAAAUAIB4AALIDACADAAAAAwAgHgAAsgMAIB8AALYDACAOAAAAAwAgAwAAuAMAIAgAALkDACAXAAC2AwAgzQEBAJsDACHOAQEAmwMAIeEBAQCbAwAh6AFAAJwDACHtAQEAmwMAIe4BAgCtAwAh8AEAAK8D8AEi8QEBALcDACHyAQEAtwMAIfMBgAAAAAEMAwAAuAMAIAgAALkDACDNAQEAmwMAIc4BAQCbAwAh4QEBAJsDACHoAUAAnAMAIe0BAQCbAwAh7gECAK0DACHwAQAArwPwASLxAQEAtwMAIfIBAQC3AwAh8wGAAAAAAQGoAgEAAAABBR4AAMAFACAfAADGBQAgogIAAMEFACCjAgAAxQUAIKYCAAABACAFHgAAvgUAIB8AAMMFACCiAgAAvwUAIKMCAADCBQAgpgIAAAsAIAMeAADABQAgogIAAMEFACCmAgAAAQAgAx4AAL4FACCiAgAAvwUAIKYCAAALACADHgAAvAUAIKICAAC9BQAgpgIAAAEAIAMeAACyAwAgogIAALMDACCmAgAABQAgAx4AALoFACCiAgAAuwUAIKYCAAALACADHgAAuAUAIKICAAC5BQAgpgIAAAEAIAMeAACoAwAgogIAAKkDACCmAgAAIwAgAAAAAAALHgAA_QMAMB8AAIEEADCiAgAA_gMAMKMCAAD_AwAwpAIAAOQDADClAgAA5AMAMKYCAADkAwAwpwIAAIAEACCoAgAA5AMAMKkCAACCBAAwqgIAAOcDADALHgAAyAMAMB8AAM0DADCiAgAAyQMAMKMCAADKAwAwpAIAAMwDADClAgAAzAMAMKYCAADMAwAwpwIAAMsDACCoAgAAzAMAMKkCAADOAwAwqgIAAM8DADANBgAA-QMAIAcAAPoDACAJAAD7AwAgCwAA_AMAIM0BAQAAAAHSAUAAAAAB4wEAAACFAgL8AQEAAAAB_gEBAAAAAf8BAQAAAAGBAgAAAIECAoICAgAAAAGDAgEAAAABAgAAAAsAIB4AAPgDACADAAAACwAgHgAA-AMAIB8AANQDACABFwAAtwUAMBIGAACSAwAgBwAAhQMAIAkAAMUCACAKAACKAwAgCwAA_gIAIMoBAACPAwAwywEAAAkAEMwBAACPAwAwzQEBAAAAAdIBQADEAgAh4wEAAJEDhQIi_AEBAPYCACH-AQEAwgIAIf8BAQDCAgAhgQIAAJADgQIiggICAMMCACGDAgEAAAABhQIBAMICACECAAAACwAgFwAA1AMAIAIAAADQAwAgFwAA0QMAIA3KAQAAzwMAMMsBAADQAwAQzAEAAM8DADDNAQEAwgIAIdIBQADEAgAh4wEAAJEDhQIi_AEBAPYCACH-AQEAwgIAIf8BAQDCAgAhgQIAAJADgQIiggICAMMCACGDAgEAwgIAIYUCAQDCAgAhDcoBAADPAwAwywEAANADABDMAQAAzwMAMM0BAQDCAgAh0gFAAMQCACHjAQAAkQOFAiL8AQEA9gIAIf4BAQDCAgAh_wEBAMICACGBAgAAkAOBAiKCAgIAwwIAIYMCAQDCAgAhhQIBAMICACEJzQEBAJsDACHSAUAAnAMAIeMBAADTA4UCIvwBAQC3AwAh_gEBAJsDACH_AQEAmwMAIYECAADSA4ECIoICAgCtAwAhgwIBAJsDACEBqAIAAACBAgIBqAIAAACFAgINBgAA1QMAIAcAANYDACAJAADXAwAgCwAA2AMAIM0BAQCbAwAh0gFAAJwDACHjAQAA0wOFAiL8AQEAtwMAIf4BAQCbAwAh_wEBAJsDACGBAgAA0gOBAiKCAgIArQMAIYMCAQCbAwAhBx4AAKsFACAfAAC1BQAgogIAAKwFACCjAgAAtAUAIKQCAAAHACClAgAABwAgpgIAALwBACALHgAA7AMAMB8AAPEDADCiAgAA7QMAMKMCAADuAwAwpAIAAPADADClAgAA8AMAMKYCAADwAwAwpwIAAO8DACCoAgAA8AMAMKkCAADyAwAwqgIAAPMDADALHgAA4AMAMB8AAOUDADCiAgAA4QMAMKMCAADiAwAwpAIAAOQDADClAgAA5AMAMKYCAADkAwAwpwIAAOMDACCoAgAA5AMAMKkCAADmAwAwqgIAAOcDADAHHgAA2QMAIB8AANwDACCiAgAA2gMAIKMCAADbAwAgpAIAAAMAIKUCAAADACCmAgAABQAgDAMAALoDACAMAADfAwAgzQEBAAAAAeEBAQAAAAHoAUAAAAAB7AEBAAAAAe0BAQAAAAHuAQIAAAAB8AEAAADwAQLxAQEAAAAB8gEBAAAAAfMBgAAAAAECAAAABQAgHgAA2QMAIAMAAAADACAeAADZAwAgHwAA3QMAIA4AAAADACADAAC4AwAgDAAA3gMAIBcAAN0DACDNAQEAmwMAIeEBAQCbAwAh6AFAAJwDACHsAQEAmwMAIe0BAQCbAwAh7gECAK0DACHwAQAArwPwASLxAQEAtwMAIfIBAQC3AwAh8wGAAAAAAQwDAAC4AwAgDAAA3gMAIM0BAQCbAwAh4QEBAJsDACHoAUAAnAMAIewBAQCbAwAh7QEBAJsDACHuAQIArQMAIfABAACvA_ABIvEBAQC3AwAh8gEBALcDACHzAYAAAAABBR4AAK8FACAfAACyBQAgogIAALAFACCjAgAAsQUAIKYCAAAjACADHgAArwUAIKICAACwBQAgpgIAACMAIAcKAACgAwAgzQEBAAAAAc8BAQAAAAHQAUAAAAAB0QEBAAAAAdIBQAAAAAHTAUAAAAABAgAAABQAIB4AAOsDACADAAAAFAAgHgAA6wMAIB8AAOoDACABFwAArgUAMAwIAACJAwAgCgAAigMAIMoBAACIAwAwywEAABIAEMwBAACIAwAwzQEBAAAAAc4BAQDCAgAhzwEBAMICACHQAUAAxAIAIdEBAQDCAgAh0gFAAMQCACHTAUAAxAIAIQIAAAAUACAXAADqAwAgAgAAAOgDACAXAADpAwAgCsoBAADnAwAwywEAAOgDABDMAQAA5wMAMM0BAQDCAgAhzgEBAMICACHPAQEAwgIAIdABQADEAgAh0QEBAMICACHSAUAAxAIAIdMBQADEAgAhCsoBAADnAwAwywEAAOgDABDMAQAA5wMAMM0BAQDCAgAhzgEBAMICACHPAQEAwgIAIdABQADEAgAh0QEBAMICACHSAUAAxAIAIdMBQADEAgAhBs0BAQCbAwAhzwEBAJsDACHQAUAAnAMAIdEBAQCbAwAh0gFAAJwDACHTAUAAnAMAIQcKAACeAwAgzQEBAJsDACHPAQEAmwMAIdABQACcAwAh0QEBAJsDACHSAUAAnAMAIdMBQACcAwAhBwoAAKADACDNAQEAAAABzwEBAAAAAdABQAAAAAHRAQEAAAAB0gFAAAAAAdMBQAAAAAEGAwAAvwMAIAwAAMADACDNAQEAAAAB4AEBAAAAAeEBAQAAAAHjAQAAAOMBAgIAAAAQACAeAAD3AwAgAwAAABAAIB4AAPcDACAfAAD2AwAgARcAAK0FADALAwAAjQMAIAgAAIkDACAMAACOAwAgygEAAIsDADDLAQAADgAQzAEAAIsDADDNAQEAAAAB3wEBAMICACHgAQEAAAAB4QEBAMICACHjAQAAjAPjASICAAAAEAAgFwAA9gMAIAIAAAD0AwAgFwAA9QMAIAjKAQAA8wMAMMsBAAD0AwAQzAEAAPMDADDNAQEAwgIAId8BAQDCAgAh4AEBAMICACHhAQEAwgIAIeMBAACMA-MBIgjKAQAA8wMAMMsBAAD0AwAQzAEAAPMDADDNAQEAwgIAId8BAQDCAgAh4AEBAMICACHhAQEAwgIAIeMBAACMA-MBIgTNAQEAmwMAIeABAQCbAwAh4QEBAJsDACHjAQAApAPjASIGAwAApgMAIAwAAKcDACDNAQEAmwMAIeABAQCbAwAh4QEBAJsDACHjAQAApAPjASIGAwAAvwMAIAwAAMADACDNAQEAAAAB4AEBAAAAAeEBAQAAAAHjAQAAAOMBAg0GAAD5AwAgBwAA-gMAIAkAAPsDACALAAD8AwAgzQEBAAAAAdIBQAAAAAHjAQAAAIUCAvwBAQAAAAH-AQEAAAAB_wEBAAAAAYECAAAAgQICggICAAAAAYMCAQAAAAEDHgAAqwUAIKICAACsBQAgpgIAALwBACAEHgAA7AMAMKICAADtAwAwpgIAAPADADCnAgAA7wMAIAQeAADgAwAwogIAAOEDADCmAgAA5AMAMKcCAADjAwAgAx4AANkDACCiAgAA2gMAIKYCAAAFACAHCAAAnwMAIM0BAQAAAAHOAQEAAAAB0AFAAAAAAdEBAQAAAAHSAUAAAAAB0wFAAAAAAQIAAAAUACAeAACFBAAgAwAAABQAIB4AAIUEACAfAACEBAAgARcAAKoFADACAAAAFAAgFwAAhAQAIAIAAADoAwAgFwAAgwQAIAbNAQEAmwMAIc4BAQCbAwAh0AFAAJwDACHRAQEAmwMAIdIBQACcAwAh0wFAAJwDACEHCAAAnQMAIM0BAQCbAwAhzgEBAJsDACHQAUAAnAMAIdEBAQCbAwAh0gFAAJwDACHTAUAAnAMAIQcIAACfAwAgzQEBAAAAAc4BAQAAAAHQAUAAAAAB0QEBAAAAAdIBQAAAAAHTAUAAAAABBB4AAP0DADCiAgAA_gMAMKYCAADkAwAwpwIAAIAEACAEHgAAyAMAMKICAADJAwAwpgIAAMwDADCnAgAAywMAIAAAAAAAAAAAAAAAAagCAAAA_gECCx4AAJUEADAfAACZBAAwogIAAJYEADCjAgAAlwQAMKQCAADMAwAwpQIAAMwDADCmAgAAzAMAMKcCAACYBAAgqAIAAMwDADCpAgAAmgQAMKoCAADPAwAwDQcAAPoDACAJAAD7AwAgCgAAnwQAIAsAAPwDACDNAQEAAAAB0gFAAAAAAeMBAAAAhQIC_gEBAAAAAf8BAQAAAAGBAgAAAIECAoICAgAAAAGDAgEAAAABhQIBAAAAAQIAAAALACAeAACeBAAgAwAAAAsAIB4AAJ4EACAfAACcBAAgARcAAKkFADACAAAACwAgFwAAnAQAIAIAAADQAwAgFwAAmwQAIAnNAQEAmwMAIdIBQACcAwAh4wEAANMDhQIi_gEBAJsDACH_AQEAmwMAIYECAADSA4ECIoICAgCtAwAhgwIBAJsDACGFAgEAmwMAIQ0HAADWAwAgCQAA1wMAIAoAAJ0EACALAADYAwAgzQEBAJsDACHSAUAAnAMAIeMBAADTA4UCIv4BAQCbAwAh_wEBAJsDACGBAgAA0gOBAiKCAgIArQMAIYMCAQCbAwAhhQIBAJsDACEFHgAApAUAIB8AAKcFACCiAgAApQUAIKMCAACmBQAgpgIAAOoBACANBwAA-gMAIAkAAPsDACAKAACfBAAgCwAA_AMAIM0BAQAAAAHSAUAAAAAB4wEAAACFAgL-AQEAAAAB_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-AgAgDQAA_QIAIMoBAAD6AgAwywEAAB8AEMwBAAD6AgAwzQEBAAAAAeEBAQDCAgAh6AFAAMQCACHwAQAA_ALwASKGAgEAwgIAIYcCAQAAAAGIAgIAwwIAIYoCAAD7AooCIgIAAAAjACAXAADxBAAgAgAAAO8EACAXAADwBAAgC8oBAADuBAAwywEAAO8EABDMAQAA7gQAMM0BAQDCAgAh4QEBAMICACHoAUAAxAIAIfABAAD8AvABIoYCAQDCAgAhhwIBAMICACGIAgIAwwIAIYoCAAD7AooCIgvKAQAA7gQAMMsBAADvBAAQzAEAAO4EADDNAQEAwgIAIeEBAQDCAgAh6AFAAMQCACHwAQAA_ALwASKGAgEAwgIAIYcCAQDCAgAhiAICAMMCACGKAgAA-wKKAiIHzQEBAJsDACHoAUAAnAMAIfABAACvA_ABIoYCAQCbAwAhhwIBAJsDACGIAgIArQMAIYoCAACuA4oCIgkLAACxAwAgDQAAqwQAIM0BAQCbAwAh6AFAAJwDACHwAQAArwPwASKGAgEAmwMAIYcCAQCbAwAhiAICAK0DACGKAgAArgOKAiIJCwAAvQMAIA0AAKwEACDNAQEAAAAB6AFAAAAAAfABAAAA8AEChgIBAAAAAYcCAQAAAAGIAgIAAAABigIAAACKAgIMCAAAuwMAIAwAAN8DACDNAQEAAAABzgEBAAAAAegBQAAAAAHsAQEAAAAB7QEBAAAAAe4BAgAAAAHwAQAAAPABAvEBAQAAAAHyAQEAAAAB8wGAAAAAAQIAAAAFACAeAAD-BAAgAwAAAAUAIB4AAP4EACAfAAD9BAAgARcAAJAFADARAwAA-AIAIAgAAIkDACAMAACVAwAgygEAAJMDADDLAQAAAwAQzAEAAJMDADDNAQEAAAABzgEBAAAAAeEBAQDCAgAh6AFAAMQCACHsAQEAAAAB7QEBAMICACHuAQIAwwIAIfABAAD8AvABIvEBAQAAAAHyAQEAAAAB8wEAAJQDACACAAAABQAgFwAA_QQAIAIAAAD7BAAgFwAA_AQAIA7KAQAA-gQAMMsBAAD7BAAQzAEAAPoEADDNAQEAwgIAIc4BAQDCAgAh4QEBAMICACHoAUAAxAIAIewBAQDCAgAh7QEBAMICACHuAQIAwwIAIfABAAD8AvABIvEBAQD2AgAh8gEBAJYDACHzAQAAlAMAIA7KAQAA-gQAMMsBAAD7BAAQzAEAAPoEADDNAQEAwgIAIc4BAQDCAgAh4QEBAMICACHoAUAAxAIAIewBAQDCAgAh7QEBAMICACHuAQIAwwIAIfABAAD8AvABIvEBAQD2AgAh8gEBAJYDACHzAQAAlAMAIArNAQEAmwMAIc4BAQCbAwAh6AFAAJwDACHsAQEAmwMAIe0BAQCbAwAh7gECAK0DACHwAQAArwPwASLxAQEAtwMAIfIBAQC3AwAh8wGAAAAAAQwIAAC5AwAgDAAA3gMAIM0BAQCbAwAhzgEBAJsDACHoAUAAnAMAIewBAQCbAwAh7QEBAJsDACHuAQIArQMAIfABAACvA_ABIvEBAQC3AwAh8gEBALcDACHzAYAAAAABDAgAALsDACAMAADfAwAgzQEBAAAAAc4BAQAAAAHoAUAAAAAB7AEBAAAAAe0BAQAAAAHuAQIAAAAB8AEAAADwAQLxAQEAAAAB8gEBAAAAAfMBgAAAAAEEHgAA8wQAMKICAAD0BAAwpgIAAPcEADCnAgAA9gQAIAQeAADnBAAwogIAAOgEADCmAgAA6wQAMKcCAADqBAAgBB4AAN4EADCiAgAA3wQAMKYCAADwAwAwpwIAAOEEACAEHgAA0gQAMKICAADTBAAwpgIAANYEADCnAgAA1QQAIAQeAADGBAAwogIAAMcEADCmAgAAygQAMKcCAADJBAAgAAAAAAAFBwAAhgUAIA4AAIQFACAPAACFBQAgEAAAhwUAIBEAAIgFACADAwAAiQUAIAgAAIwFACAMAACOBQAgBgMAAIkFACAIAACMBQAgDAAAjgUAIPEBAACKBAAg8gEAAIoEACDzAQAAigQAIAYGAACPBQAgBwAAhgUAIAkAAIgEACAKAACNBQAgCwAAiwUAIPwBAACKBAAgAgQAAIkEACAJAACIBAAgAwMAAIkFACALAACLBQAgDQAAigUAIAEEAACJBAAgCs0BAQAAAAHOAQEAAAAB6AFAAAAAAewBAQAAAAHtAQEAAAAB7gECAAAAAfABAAAA8AEC8QEBAAAAAfIBAQAAAAHzAYAAAAABB80BAQAAAAHoAUAAAAAB8AEAAADwAQKGAgEAAAABhwIBAAAAAYgCAgAAAAGKAgAAAIoCAgTNAQEAAAAB3wEBAAAAAeABAQAAAAHjAQAAAOMBAgfNAQEAAAAB0gFAAAAAAdMBQAAAAAGNAkAAAAABmAIBAAAAAZkCAQAAAAGaAgEAAAABDM0BAQAAAAHSAUAAAAAB0wFAAAAAAY4CAQAAAAGPAgEAAAABkQIBAAAAAZICAQAAAAGTAgEAAAABlAJAAAAAAZUCQAAAAAGWAgEAAAABlwIBAAAAAQ0HAACBBQAgDgAA_wQAIA8AAIAFACARAACDBQAgzQEBAAAAAdIBQAAAAAHTAUAAAAAB4wEAAACgAgL6AQEAAAAB-wEBAAAAAZsCAQAAAAGcAiAAAAABngIAAACeAgICAAAAAQAgHgAAlQUAIAMAAAAdACAeAACVBQAgHwAAmQUAIA8AAAAdACAHAADDBAAgDgAAwQQAIA8AAMIEACARAADFBAAgFwAAmQUAIM0BAQCbAwAh0gFAAJwDACHTAUAAnAMAIeMBAADABKACIvoBAQCbAwAh-wEBAJsDACGbAgEAmwMAIZwCIAC-BAAhngIAAL8EngIiDQcAAMMEACAOAADBBAAgDwAAwgQAIBEAAMUEACDNAQEAmwMAIdIBQACcAwAh0wFAAJwDACHjAQAAwASgAiL6AQEAmwMAIfsBAQCbAwAhmwIBAJsDACGcAiAAvgQAIZ4CAAC_BJ4CIg0HAACBBQAgDgAA_wQAIA8AAIAFACAQAACCBQAgzQEBAAAAAdIBQAAAAAHTAUAAAAAB4wEAAACgAgL6AQEAAAAB-wEBAAAAAZsCAQAAAAGcAiAAAAABngIAAACeAgICAAAAAQAgHgAAmgUAIAMAAAAdACAeAACaBQAgHwAAngUAIA8AAAAdACAHAADDBAAgDgAAwQQAIA8AAMIEACAQAADEBAAgFwAAngUAIM0BAQCbAwAh0gFAAJwDACHTAUAAnAMAIeMBAADABKACIvoBAQCbAwAh-wEBAJsDACGbAgEAmwMAIZwCIAC-BAAhngIAAL8EngIiDQcAAMMEACAOAADBBAAgDwAAwgQAIBAAAMQEACDNAQEAmwMAIdIBQACcAwAh0wFAAJwDACHjAQAAwASgAiL6AQEAmwMAIfsBAQCbAwAhmwIBAJsDACGcAiAAvgQAIZ4CAAC_BJ4CIgcDAAC_AwAgCAAAvgMAIM0BAQAAAAHfAQEAAAAB4AEBAAAAAeEBAQAAAAHjAQAAAOMBAgIAAAAQACAeAACfBQAgAwAAAA4AIB4AAJ8FACAfAACjBQAgCQAAAA4AIAMAAKYDACAIAAClAwAgFwAAowUAIM0BAQCbAwAh3wEBAJsDACHgAQEAmwMAIeEBAQCbAwAh4wEAAKQD4wEiBwMAAKYDACAIAAClAwAgzQEBAJsDACHfAQEAmwMAIeABAQCbAwAh4QEBAJsDACHjAQAApAPjASIHCQAAhgQAIM0BAQAAAAHkAQEAAAAB5QEBAAAAAeYBAQAAAAHnAQIAAAAB6AFAAAAAAQIAAADqAQAgHgAApAUAIAMAAADtAQAgHgAApAUAIB8AAKgFACAJAAAA7QEAIAkAAMYDACAXAACoBQAgzQEBAJsDACHkAQEAmwMAIeUBAQCbAwAh5gEBAJsDACHnAQIArQMAIegBQACcAwAhBwkAAMYDACDNAQEAmwMAIeQBAQCbAwAh5QEBAJsDACHmAQEAmwMAIecBAgCtAwAh6AFAAJwDACEJzQEBAAAAAdIBQAAAAAHjAQAAAIUCAv4BAQAAAAH_AQEAAAABgQIAAACBAgKCAgIAAAABgwIBAAAAAYUCAQAAAAEGzQEBAAAAAc4BAQAAAAHQAUAAAAAB0QEBAAAAAdIBQAAAAAHTAUAAAAABBs0BAQAAAAHSAUAAAAAB4wEAAAD-AQL6AQEAAAAB-wEBAAAAAfwBAQAAAAECAAAAvAEAIB4AAKsFACAEzQEBAAAAAeABAQAAAAHhAQEAAAAB4wEAAADjAQIGzQEBAAAAAc8BAQAAAAHQAUAAAAAB0QEBAAAAAdIBQAAAAAHTAUAAAAABCgMAALwDACANAACsBAAgzQEBAAAAAeEBAQAAAAHoAUAAAAAB8AEAAADwAQKGAgEAAAABhwIBAAAAAYgCAgAAAAGKAgAAAIoCAgIAAAAjACAeAACvBQAgAwAAAB8AIB4AAK8FACAfAACzBQAgDAAAAB8AIAMAALADACANAACrBAAgFwAAswUAIM0BAQCbAwAh4QEBAJsDACHoAUAAnAMAIfABAACvA_ABIoYCAQCbAwAhhwIBAJsDACGIAgIArQMAIYoCAACuA4oCIgoDAACwAwAgDQAAqwQAIM0BAQCbAwAh4QEBAJsDACHoAUAAnAMAIfABAACvA_ABIoYCAQCbAwAhhwIBAJsDACGIAgIArQMAIYoCAACuA4oCIgMAAAAHACAeAACrBQAgHwAAtgUAIAgAAAAHACAXAAC2BQAgzQEBAJsDACHSAUAAnAMAIeMBAACTBP4BIvoBAQCbAwAh-wEBAJsDACH8AQEAmwMAIQbNAQEAmwMAIdIBQACcAwAh4wEAAJME_gEi-gEBAJsDACH7AQEAmwMAIfwBAQCbAwAhCc0BAQAAAAHSAUAAAAAB4wEAAACFAgL8AQEAAAAB_gEBAAAAAf8BAQAAAAGBAgAAAIECAoICAgAAAAGDAgEAAAABDQ4AAP8EACAPAACABQAgEAAAggUAIBEAAIMFACDNAQEAAAAB0gFAAAAAAdMBQAAAAAHjAQAAAKACAvoBAQAAAAH7AQEAAAABmwIBAAAAAZwCIAAAAAGeAgAAAJ4CAgIAAAABACAeAAC4BQAgDgYAAPkDACAJAAD7AwAgCgAAnwQAIAsAAPwDACDNAQEAAAAB0gFAAAAAAeMBAAAAhQIC_AEBAAAAAf4BAQAAAAH_AQEAAAABgQIAAACBAgKCAgIAAAABgwIBAAAAAYUCAQAAAAECAAAACwAgHgAAugUAIA0HAACBBQAgDgAA_wQAIBAAAIIFACARAACDBQAgzQEBAAAAAdIBQAAAAAHTAUAAAAAB4wEAAACgAgL6AQEAAAAB-wEBAAAAAZsCAQAAAAGcAiAAAAABngIAAACeAgICAAAAAQAgHgAAvAUAIA4GAAD5AwAgBwAA-gMAIAkAAPsDACAKAACfBAAgzQEBAAAAAdIBQAAAAAHjAQAAAIUCAvwBAQAAAAH-AQEAAAAB_wEBAAAAAYECAAAAgQICggICAAAAAYMCAQAAAAGFAgEAAAABAgAAAAsAIB4AAL4FACANBwAAgQUAIA8AAIAFACAQAACCBQAgEQAAgwUAIM0BAQAAAAHSAUAAAAAB0wFAAAAAAeMBAAAAoAIC-gEBAAAAAfsBAQAAAAGbAgEAAAABnAIgAAAAAZ4CAAAAngICAgAAAAEAIB4AAMAFACADAAAACQAgHgAAvgUAIB8AAMQFACAQAAAACQAgBgAA1QMAIAcAANYDACAJAADXAwAgCgAAnQQAIBcAAMQFACDNAQEAmwMAIdIBQACcAwAh4wEAANMDhQIi_AEBALcDACH-AQEAmwMAIf8BAQCbAwAhgQIAANIDgQIiggICAK0DACGDAgEAmwMAIYUCAQCbAwAhDgYAANUDACAHAADWAwAgCQAA1wMAIAoAAJ0EACDNAQEAmwMAIdIBQACcAwAh4wEAANMDhQIi_AEBALcDACH-AQEAmwMAIf8BAQCbAwAhgQIAANIDgQIiggICAK0DACGDAgEAmwMAIYUCAQCbAwAhAwAAAB0AIB4AAMAFACAfAADHBQAgDwAAAB0AIAcAAMMEACAPAADCBAAgEAAAxAQAIBEAAMUEACAXAADHBQAgzQEBAJsDACHSAUAAnAMAIdMBQACcAwAh4wEAAMAEoAIi-gEBAJsDACH7AQEAmwMAIZsCAQCbAwAhnAIgAL4EACGeAgAAvwSeAiINBwAAwwQAIA8AAMIEACAQAADEBAAgEQAAxQQAIM0BAQCbAwAh0gFAAJwDACHTAUAAnAMAIeMBAADABKACIvoBAQCbAwAh-wEBAJsDACGbAgEAmwMAIZwCIAC-BAAhngIAAL8EngIiAwAAAB0AIB4AALwFACAfAADKBQAgDwAAAB0AIAcAAMMEACAOAADBBAAgEAAAxAQAIBEAAMUEACAXAADKBQAgzQEBAJsDACHSAUAAnAMAIdMBQACcAwAh4wEAAMAEoAIi-gEBAJsDACH7AQEAmwMAIZsCAQCbAwAhnAIgAL4EACGeAgAAvwSeAiINBwAAwwQAIA4AAMEEACAQAADEBAAgEQAAxQQAIM0BAQCbAwAh0gFAAJwDACHTAUAAnAMAIeMBAADABKACIvoBAQCbAwAh-wEBAJsDACGbAgEAmwMAIZwCIAC-BAAhngIAAL8EngIiAwAAAB0AIB4AALgFACAfAADNBQAgDwAAAB0AIA4AAMEEACAPAADCBAAgEAAAxAQAIBEAAMUEACAXAADNBQAgzQEBAJsDACHSAUAAnAMAIdMBQACcAwAh4wEAAMAEoAIi-gEBAJsDACH7AQEAmwMAIZsCAQCbAwAhnAIgAL4EACGeAgAAvwSeAiINDgAAwQQAIA8AAMIEACAQAADEBAAgEQAAxQQAIM0BAQCbAwAh0gFAAJwDACHTAUAAnAMAIeMBAADABKACIvoBAQCbAwAh-wEBAJsDACGbAgEAmwMAIZwCIAC-BAAhngIAAL8EngIiAwAAAAkAIB4AALoFACAfAADQBQAgEAAAAAkAIAYAANUDACAJAADXAwAgCgAAnQQAIAsAANgDACAXAADQBQAgzQEBAJsDACHSAUAAnAMAIeMBAADTA4UCIvwBAQC3AwAh_gEBAJsDACH_AQEAmwMAIYECAADSA4ECIoICAgCtAwAhgwIBAJsDACGFAgEAmwMAIQ4GAADVAwAgCQAA1wMAIAoAAJ0EACALAADYAwAgzQEBAJsDACHSAUAAnAMAIeMBAADTA4UCIvwBAQC3AwAh_gEBAJsDACH_AQEAmwMAIYECAADSA4ECIoICAgCtAwAhgwIBAJsDACGFAgEAmwMAIQcEAACHBAAgzQEBAAAAAeQBAQAAAAHlAQEAAAAB5gEBAAAAAecBAgAAAAHoAUAAAAABAgAAAOoBACAeAADRBQAgDgYAAPkDACAHAAD6AwAgCgAAnwQAIAsAAPwDACDNAQEAAAAB0gFAAAAAAeMBAAAAhQIC_AEBAAAAAf4BAQAAAAH_AQEAAAABgQIAAACBAgKCAgIAAAABgwIBAAAAAYUCAQAAAAECAAAACwAgHgAA0wUAIAMAAADtAQAgHgAA0QUAIB8AANcFACAJAAAA7QEAIAQAAMcDACAXAADXBQAgzQEBAJsDACHkAQEAmwMAIeUBAQCbAwAh5gEBAJsDACHnAQIArQMAIegBQACcAwAhBwQAAMcDACDNAQEAmwMAIeQBAQCbAwAh5QEBAJsDACHmAQEAmwMAIecBAgCtAwAh6AFAAJwDACEDAAAACQAgHgAA0wUAIB8AANoFACAQAAAACQAgBgAA1QMAIAcAANYDACAKAACdBAAgCwAA2AMAIBcAANoFACDNAQEAmwMAIdIBQACcAwAh4wEAANMDhQIi_AEBALcDACH-AQEAmwMAIf8BAQCbAwAhgQIAANIDgQIiggICAK0DACGDAgEAmwMAIYUCAQCbAwAhDgYAANUDACAHAADWAwAgCgAAnQQAIAsAANgDACDNAQEAmwMAIdIBQACcAwAh4wEAANMDhQIi_AEBALcDACH-AQEAmwMAIf8BAQCbAwAhgQIAANIDgQIiggICAK0DACGDAgEAmwMAIYUCAQCbAwAhBgUADgclBA4GAg8kAxApDBEtDQMDAAEIAAUMAAMDAwABCyECDQAEAwMeAQgABQwgAwYFAAsGCAYHEQQJFQgKAAkLGgICBAwFBQAHAQQNAAIIAAUKAAkDBBcFBQAKCRYIAgQZAAkYAAIHGwAJHAABAwABAQMAAQUHMAAOLgAPLwAQMQARMgAAAAADBQATJAAUJQAVAAAAAwUAEyQAFCUAFQEDAAEBAwABAwUAGiQAGyUAHAAAAAMFABokABslABwBAwABAQMAAQMFACEkACIlACMAAAADBQAhJAAiJQAjAAAAAwUAKSQAKiUAKwAAAAMFACkkAColACsCAwABDQAEAgMAAQ0ABAUFADAkADMlADRmADFnADIAAAAAAAUFADAkADMlADRmADFnADICBq4BBgoACQIGtAEGCgAJBQUAOSQAPCUAPWYAOmcAOwAAAAAABQUAOSQAPCUAPWYAOmcAOwAAAwUAQiQAQyUARAAAAAMFAEIkAEMlAEQDAwABCAAFDAADAwMAAQgABQwAAwUFAEkkAEwlAE1mAEpnAEsAAAAAAAUFAEkkAEwlAE1mAEpnAEsAAAUFAFIkAFUlAFZmAFNnAFQAAAAAAAUFAFIkAFUlAFZmAFNnAFQCA40CAQgABQIDkwIBCAAFAwUAWyQAXCUAXQAAAAMFAFskAFwlAF0CCAAFCgAJAggABQoACQMFAGIkAGMlAGQAAAADBQBiJABjJQBkEgIBEzMBFDUBFTYBFjcBGDkBGTsPGjwQGz4BHEAPHUERIEIBIUMBIkQPJkcSJ0gWKEkMKUoMKksMK0wMLE0MLU8MLlEPL1IXMFQMMVYPMlcYM1gMNFkMNVoPNl0ZN14dOF8NOWANOmENO2INPGMNPWUNPmcPP2geQGoNQWwPQm0fQ24NRG8NRXAPRnMgR3QkSHYlSXclSnolS3slTHwlTX4lToABD0-BASZQgwElUYUBD1KGASdThwElVIgBJVWJAQ9WjAEoV40BLFiOAQNZjwEDWpABA1uRAQNckgEDXZQBA16WAQ9flwEtYJkBA2GbAQ9inAEuY50BA2SeAQNlnwEPaKIBL2mjATVqpAEFa6UBBWymAQVtpwEFbqgBBW-qAQVwrAEPca0BNnKwAQVzsgEPdLMBN3W1AQV2tgEFd7cBD3i6ATh5uwE-er0BBnu-AQZ8wAEGfcEBBn7CAQZ_xAEGgAHGAQ-BAccBP4IByQEGgwHLAQ-EAcwBQIUBzQEGhgHOAQaHAc8BD4gB0gFBiQHTAUWKAdQBAosB1QECjAHWAQKNAdcBAo4B2AECjwHaAQKQAdwBD5EB3QFGkgHfAQKTAeEBD5QB4gFHlQHjAQKWAeQBApcB5QEPmAHoAUiZAekBTpoB6wEJmwHsAQmcAe8BCZ0B8AEJngHxAQmfAfMBCaAB9QEPoQH2AU-iAfgBCaMB-gEPpAH7AVClAfwBCaYB_QEJpwH-AQ-oAYECUakBggJXqgGDAgSrAYQCBKwBhQIErQGGAgSuAYcCBK8BiQIEsAGLAg-xAYwCWLIBjwIEswGRAg-0AZICWbUBlAIEtgGVAgS3AZYCD7gBmQJauQGaAl66AZsCCLsBnAIIvAGdAgi9AZ4CCL4BnwIIvwGhAgjAAaMCD8EBpAJfwgGmAgjDAagCD8QBqQJgxQGqAgjGAasCCMcBrAIPyAGvAmHJAbACZQ"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  BookingScalarFieldEnum: () => BookingScalarFieldEnum,
  BusScalarFieldEnum: () => BusScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  DriverScalarFieldEnum: () => DriverScalarFieldEnum,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  RouteScalarFieldEnum: () => RouteScalarFieldEnum,
  ScheduleScalarFieldEnum: () => ScheduleScalarFieldEnum,
  SeatScalarFieldEnum: () => SeatScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.9.0",
  engine: "e922089b7d7502aff4249d5da3420f6fa55fc6ad"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Booking: "Booking",
  Bus: "Bus",
  Driver: "Driver",
  Payment: "Payment",
  Route: "Route",
  Seat: "Seat",
  Schedule: "Schedule"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  phone: "phone",
  emailVerified: "emailVerified",
  role: "role",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var BookingScalarFieldEnum = {
  id: "id",
  user_id: "user_id",
  schedule_id: "schedule_id",
  seat_id: "seat_id",
  total_price: "total_price",
  booking_status: "booking_status",
  payment_status: "payment_status",
  created_at: "created_at"
};
var BusScalarFieldEnum = {
  id: "id",
  busName: "busName",
  busNumber: "busNumber",
  busType: "busType",
  totalSeats: "totalSeats",
  registrationNumber: "registrationNumber",
  status: "status",
  createdAt: "createdAt",
  licenseNumber: "licenseNumber",
  routeId: "routeId"
};
var DriverScalarFieldEnum = {
  id: "id",
  name: "name",
  phone: "phone",
  licenseNumber: "licenseNumber",
  status: "status",
  createdAt: "createdAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  booking_id: "booking_id",
  transaction_id: "transaction_id",
  amount: "amount",
  payment_status: "payment_status",
  created_at: "created_at",
  user_id: "user_id",
  stripeEventId: "stripeEventId",
  transactionId: "transactionId",
  paymentGatewayData: "paymentGatewayData",
  bus_id: "bus_id"
};
var RouteScalarFieldEnum = {
  id: "id",
  from_city: "from_city",
  to_city: "to_city",
  distance: "distance",
  base_price: "base_price",
  created_at: "created_at"
};
var SeatScalarFieldEnum = {
  id: "id",
  registration_Number: "registration_Number",
  seat_number: "seat_number",
  user_id: "user_id",
  status: "status"
};
var ScheduleScalarFieldEnum = {
  id: "id",
  bus_id: "bus_id",
  route_id: "route_id",
  date: "date",
  time: "time",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/enums.ts
var Role = {
  USER: "USER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER"
};
var PaymentStatus = {
  PAID: "PAID",
  UNPAID: "UNPAID",
  PENDING: "PENDING"
};

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/lib/auth.ts
import { bearer, oAuthProxy } from "better-auth/plugins";

// src/app/config/env.ts
import dotenv from "dotenv";
import status from "http-status";

// src/app/errorHelper/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/config/env.ts
dotenv.config();
var loadEnvVariables = () => {
  const requireEnvVariable = [
    "NODE_ENV",
    "PORT",
    "FRONTEND_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "Email",
    "Password",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET"
  ];
  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError_default(
        status.OK,
        `Server configuration error: The required environment variable "${variable}" is not set. Verify your .env file or deployment environment settings.`
      );
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    FRONTEND_URL: process.env.FRONTEND_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    Email: process.env.Email,
    Password: process.env.Password,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    STRIPE: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    }
  };
};
var envVars = loadEnvVariables();

// src/app/lib/auth.ts
var auth = betterAuth({
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  baseURL: `${envVars.FRONTEND_URL}`,
  trustedOrigins: [envVars.FRONTEND_URL],
  appName: "Planora",
  user: {
    additionalFields: {
      status: {
        type: "string",
        required: true,
        defaultValue: "ACTIVE"
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "USER"
      },
      emailVerified: {
        type: "boolean",
        returned: true,
        defaultValue: true
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: ""
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true
  },
  plugins: [
    oAuthProxy(),
    bearer()
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    strategy: "jwt"
  },
  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  },
  redirectURLs: {
    signin: `${envVars.BETTER_AUTH_URL}`
  }
});

// src/app.ts
import path2 from "path";
import cors from "cors";

// src/app/routes/index.route.ts
import { Router as Router8 } from "express";

// src/app/modules/user/user.route.ts
import { Router } from "express";

// src/app/middleware/validationRequest.ts
var validateRequest = (zodSchema) => {
  return (req, res, next) => {
    if (req.body?.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (e) {
        return next(new Error("Invalid JSON in 'data' field"));
      }
    }
    const parsedResult = zodSchema.safeParse(req.body);
    if (!parsedResult.success) {
      return next(parsedResult.error);
    }
    req.body = parsedResult.data;
    next();
  };
};

// src/app/modules/user/user.validation.ts
import { z } from "zod";
var createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional()
});

// src/app/modules/user/user.controller.ts
import status3 from "http-status";

// src/app/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data
  });
};

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error({ error }, "Unhandled error in catchAsync");
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch",
        error: error.message
      });
    }
  };
};

// src/app/modules/user/user.service.ts
import status2 from "http-status";

// src/app/utils/Jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/app/utils/Cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/app/utils/token.ts
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN }
  );
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: 60 }
  );
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 60 * 24
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //7d
    maxAge: 60 * 60 * 60 * 24 * 1e3
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 60 * 24
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/app/modules/user/user.service.ts
var UserRegister = async (payload) => {
  const { name, email, phone, password } = payload;
  const userExist = await prisma.user.findUnique({
    where: { email }
  });
  if (userExist) {
    throw new AppError_default(409, "user already exist,please try another email");
  }
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      phone
    }
  });
  console.debug({ userId: data?.user?.id }, "User registration response received");
  if (!data.user) {
    throw new AppError_default(400, "User register failed");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    token: data.token,
    accessToken,
    refreshToken
  };
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (data.user.status === "BLOCKED") {
    throw new AppError_default(status2.FORBIDDEN, "User is blocked");
  }
  if (data.user.status === "INACTIVE") {
    throw new AppError_default(status2.NOT_FOUND, "User is INACTIVE");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var getMe = async (user) => {
  if (!user?.userId) {
    throw new AppError_default(status2.UNAUTHORIZED, "Unauthorized access. Please login first.");
  }
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status2.NOT_FOUND, "User not found");
  }
  return isUserExists;
};
var AuthService = {
  UserRegister,
  loginUser,
  getMe
};

// src/app/modules/user/user.controller.ts
var UserRegister2 = catchAsync(async (req, res) => {
  const payload = {
    ...req.body
  };
  const result = await AuthService.UserRegister(payload);
  const { accessToken, refreshToken, token } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status3.CREATED,
    success: true,
    message: "user registered successfully",
    data: result
  });
});
var loginUser2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);
  const { accessToken, refreshToken, token } = result;
  console.log(accessToken, "accestoek");
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status3.OK,
    success: true,
    message: "User logged in successfully",
    data: result
  });
});
var getMe2 = catchAsync(async (req, res) => {
  if (!req.user?.userId) {
    throw new AppError_default(status3.UNAUTHORIZED, "Unauthorized access. Please login first.");
  }
  const data = await AuthService.getMe(req.user);
  sendResponse(res, {
    httpStatusCode: status3.OK,
    success: true,
    message: "User data retrieved successfully",
    data
  });
});
var userController = {
  UserRegister: UserRegister2,
  loginUser: loginUser2,
  getMe: getMe2
};

// src/app/middleware/Auth.ts
import status4 from "http-status";
var auth2 = (roles) => {
  return async (req, res, next) => {
    try {
      const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
      const accessToken = CookieUtils.getCookie(req, "accessToken");
      let isAuthenticated = false;
      if (sessionToken) {
        const betterSession = await auth.api.getSession({ headers: req.headers });
        if (betterSession && betterSession.session) {
          const sessionExists = await prisma.session.findFirst({
            where: {
              token: betterSession.session.token,
              expiresAt: { gt: /* @__PURE__ */ new Date() }
            },
            include: { user: true }
          });
          if (sessionExists && sessionExists.user) {
            const user = sessionExists.user;
            const now = /* @__PURE__ */ new Date();
            const expiresAt = new Date(sessionExists.expiresAt);
            const createdAt = new Date(sessionExists.createdAt);
            const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
            const timeRemaining = expiresAt.getTime() - now.getTime();
            const percentRemaining = timeRemaining / sessionLifeTime * 100;
            if (percentRemaining < 20) {
              res.setHeader("X-Session-Refresh", "true");
              res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
            }
            if (user.status === "BLOCKED") {
              throw new AppError_default(status4.UNAUTHORIZED, "Unauthorized access! User is not active.");
            }
            if (roles.length > 0 && !roles.includes(user.role)) {
              throw new AppError_default(status4.FORBIDDEN, "Forbidden access! No permission.");
            }
            req.user = { userId: user.id, role: user.role, email: user.email };
            isAuthenticated = true;
          }
        }
      }
      if (!isAuthenticated && accessToken) {
        const verifiedToken = jwtUtils.verifyToken(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );
        if (verifiedToken.success && verifiedToken.data) {
          const userData = verifiedToken.data;
          console.log(userData, "userdata");
          console.info(`Decoded user data from access token ${userData}`);
          if (roles.length > 0 && !roles.includes(userData.role)) {
            throw new AppError_default(status4.FORBIDDEN, "Forbidden access! No permission.");
          }
          req.user = {
            userId: userData.userId,
            role: userData.role,
            email: userData.email
          };
          isAuthenticated = true;
        }
      }
      if (!isAuthenticated) {
        throw new AppError_default(status4.UNAUTHORIZED, "Unauthorized access! No valid session or token.");
      }
      next();
    } catch (error) {
      throw new AppError_default(error.statusCode || status4.BAD_REQUEST, error.message);
    }
  };
};
var Auth_default = auth2;

// src/generated/prisma/internal/prismaNamespaceBrowser.ts
import * as runtime3 from "@prisma/client/runtime/index-browser";
var NullTypes4 = {
  DbNull: runtime3.NullTypes.DbNull,
  JsonNull: runtime3.NullTypes.JsonNull,
  AnyNull: runtime3.NullTypes.AnyNull
};
var TransactionIsolationLevel2 = runtime3.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});

// src/app/modules/user/user.route.ts
var router = Router();
router.post("/register", validateRequest(createUserSchema), userController.UserRegister);
router.post("/login", userController.loginUser);
router.get("/me", Auth_default([Role.ADMIN, Role.USER, Role.MANAGER]), userController.getMe);
var AuthRouters = router;

// src/app/modules/driver/driver.route.ts
import { Router as Router2 } from "express";

// src/app/modules/driver/driver.validation.ts
import { z as z2 } from "zod";
var createDriverSchema = z2.object({
  name: z2.string().min(2, "Name must be at least 2 characters"),
  phone: z2.string().min(10, "Phone number must be valid"),
  licenseNumber: z2.string().min(3, "License number is required"),
  status: z2.enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "SUSPENDED"]).default("ACTIVE")
});
var updateDriverSchema = z2.object({
  name: z2.string().min(2).optional(),
  phone: z2.string().min(10).optional(),
  licenseNumber: z2.string().min(3).optional(),
  status: z2.enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "SUSPENDED"]).default("ACTIVE")
});

// src/app/modules/driver/driver.controller.ts
import status6 from "http-status";

// src/app/modules/driver/driver.service.ts
import status5 from "http-status";
var createDriver = async (payload) => {
  const driverExist = await prisma.driver.findUnique({
    where: { licenseNumber: payload.licenseNumber }
  });
  if (driverExist) {
    throw new AppError_default(status5.CONFLICT, "Driver with this license number already exists");
  }
  const result = await prisma.driver.create({
    data: payload
  });
  return result;
};
var getAllDrivers = async () => {
  const result = await prisma.driver.findMany({
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var getSingleDriver = async (id) => {
  const result = await prisma.driver.findUnique({
    where: { id }
  });
  if (!result) {
    throw new AppError_default(status5.NOT_FOUND, "Driver not found");
  }
  return result;
};
var updateDriver = async (id, payload) => {
  const driverExist = await prisma.driver.findUnique({ where: { id } });
  if (!driverExist) {
    throw new AppError_default(status5.NOT_FOUND, "Driver not found");
  }
  if (payload.licenseNumber) {
    const duplicate = await prisma.driver.findFirst({
      where: {
        licenseNumber: payload.licenseNumber,
        NOT: { id }
      }
    });
    if (duplicate) {
      throw new AppError_default(status5.CONFLICT, "This license number is already used by another driver");
    }
  }
  const result = await prisma.driver.update({
    where: { id },
    data: payload
  });
  return result;
};
var deleteDriver = async (id) => {
  const driverExist = await prisma.driver.findUnique({ where: { id } });
  if (!driverExist) {
    throw new AppError_default(status5.NOT_FOUND, "Driver not found");
  }
  const result = await prisma.driver.delete({
    where: { id }
  });
  return result;
};
var DriverService = {
  createDriver,
  getAllDrivers,
  getSingleDriver,
  updateDriver,
  deleteDriver
};

// src/app/modules/driver/driver.controller.ts
var createDriver2 = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  const result = await DriverService.createDriver(payload);
  sendResponse(res, {
    httpStatusCode: status6.CREATED,
    success: true,
    message: "Driver created successfully",
    data: result
  });
});
var getAllDrivers2 = catchAsync(async (req, res) => {
  const result = await DriverService.getAllDrivers();
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "Drivers retrieved successfully",
    data: result
  });
});
var getSingleDriver2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DriverService.getSingleDriver(id);
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "Driver retrieved successfully",
    data: result
  });
});
var updateDriver2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  const result = await DriverService.updateDriver(id, payload);
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "Driver updated successfully",
    data: result
  });
});
var deleteDriver2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DriverService.deleteDriver(id);
  sendResponse(res, {
    httpStatusCode: status6.OK,
    success: true,
    message: "Driver deleted successfully",
    data: result
  });
});
var driverController = {
  createDriver: createDriver2,
  getAllDrivers: getAllDrivers2,
  getSingleDriver: getSingleDriver2,
  updateDriver: updateDriver2,
  deleteDriver: deleteDriver2
};

// src/app/modules/driver/driver.route.ts
var router2 = Router2();
router2.post(
  "/",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  validateRequest(createDriverSchema),
  driverController.createDriver
);
router2.get(
  "/",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  driverController.getAllDrivers
);
router2.get(
  "/:id",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  driverController.getSingleDriver
);
router2.patch(
  "/:id",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  validateRequest(updateDriverSchema),
  driverController.updateDriver
);
router2.delete(
  "/:id",
  Auth_default([Role.ADMIN]),
  driverController.deleteDriver
);
var DriverRouters = router2;

// src/app/modules/bus/bus.route.ts
import { Router as Router3 } from "express";

// src/app/modules/bus/bus.validation.ts
import { z as z3 } from "zod";
var createBusSchema = z3.object({
  busName: z3.string().min(2, "Bus name must be at least 2 characters"),
  busNumber: z3.string().min(1, "Bus number is required"),
  busType: z3.enum(["AC", "NON_AC", "DELUXE"]),
  totalSeats: z3.number().int("Total seats must be an integer").positive("Total seats must be a positive number"),
  licenseNumber: z3.string().min(3, "License number must be at least 3 characters"),
  status: z3.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]).optional()
});
var updateBusSchema = z3.object({
  busName: z3.string().min(2).optional(),
  busNumber: z3.string().min(1).optional(),
  busType: z3.enum(["AC", "NON_AC", "DELUXE"]).optional(),
  totalSeats: z3.number().positive().optional(),
  registrationNumber: z3.string().min(1).optional(),
  status: z3.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]).optional()
});

// src/app/modules/bus/bus.controller.ts
import status8 from "http-status";

// src/app/modules/bus/bus.service.ts
import status7 from "http-status";
var ensureUniqueBusFields = async (busNumber, registrationNumber, excludeId) => {
  if (busNumber) {
    const busNumberExist = await prisma.bus.findFirst({
      where: {
        busNumber
      }
    });
    if (busNumberExist) {
      throw new AppError_default(status7.CONFLICT, "Bus number already exists, must be unique");
    }
  }
  if (registrationNumber) {
    const regNumberExist = await prisma.bus.findFirst({
      where: {
        registrationNumber
      }
    });
    if (regNumberExist) {
      throw new AppError_default(status7.CONFLICT, "Registration number already exists, must be unique");
    }
  }
};
var createBus = async (payload, from, to) => {
  const registrationNumber = `BUS-${Date.now()}`;
  await ensureUniqueBusFields(payload.busNumber, registrationNumber);
  const routeExist = await prisma.route.findFirst({ where: { from_city: from, to_city: to } });
  if (!routeExist) {
    throw new AppError_default(status7.NOT_FOUND, "Route not found");
  }
  const driverExist = await prisma.driver.findUnique({ where: { licenseNumber: payload.licenseNumber } });
  if (!driverExist) {
    throw new AppError_default(status7.NOT_FOUND, "Driver not found");
  }
  const result = await prisma.bus.create({
    data: {
      ...payload,
      totalSeats: Number(payload.totalSeats),
      routeId: routeExist.id,
      licenseNumber: driverExist.licenseNumber,
      registrationNumber
    }
  });
  return result;
};
var getAllBuses = async () => {
  const result = await prisma.bus.findMany({
    include: {
      driver: true,
      route: true
    },
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var getSingleBus = async (id) => {
  const result = await prisma.bus.findUnique({
    where: { id },
    include: {
      driver: true,
      route: true,
      seats: true,
      schedules: true
    }
  });
  if (!result) {
    throw new AppError_default(status7.NOT_FOUND, "Bus not found");
  }
  return result;
};
var deleteBus = async (id) => {
  const busExist = await prisma.bus.findUnique({ where: { id } });
  if (!busExist) {
    throw new AppError_default(status7.NOT_FOUND, "Bus not found");
  }
  const result = await prisma.bus.delete({
    where: { id }
  });
  return result;
};
var BusService = {
  createBus,
  getAllBuses,
  getSingleBus,
  deleteBus
};

// src/app/modules/bus/bus.controller.ts
var createBus2 = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  const { from, to } = req.query;
  const result = await BusService.createBus(payload, from, to);
  sendResponse(res, {
    httpStatusCode: status8.CREATED,
    success: true,
    message: "Bus created successfully",
    data: result
  });
});
var getAllBuses2 = catchAsync(async (req, res) => {
  const result = await BusService.getAllBuses();
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Buses retrieved successfully",
    data: result
  });
});
var getSingleBus2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BusService.getSingleBus(id);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Bus retrieved successfully",
    data: result
  });
});
var deleteBus2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BusService.deleteBus(id);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Bus deleted successfully",
    data: result
  });
});
var busController = {
  createBus: createBus2,
  getAllBuses: getAllBuses2,
  getSingleBus: getSingleBus2,
  deleteBus: deleteBus2
};

// src/app/modules/bus/bus.route.ts
var router3 = Router3();
router3.post(
  "/",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  validateRequest(createBusSchema),
  busController.createBus
);
router3.get(
  "/",
  Auth_default([Role.ADMIN, Role.MANAGER, Role.USER]),
  busController.getAllBuses
);
router3.get(
  "/:id",
  Auth_default([Role.ADMIN, Role.MANAGER, Role.USER]),
  busController.getSingleBus
);
router3.delete(
  "/:id",
  Auth_default([Role.ADMIN]),
  busController.deleteBus
);
var BusRouters = router3;

// src/app/modules/route/route.route.ts
import { Router as Router4 } from "express";

// src/app/modules/route/route.validation.ts
import { z as z4 } from "zod";
var createRouteSchema = z4.object({
  from_city: z4.string().min(2, "From city must be at least 2 characters"),
  to_city: z4.string().min(2, "To city must be at least 2 characters"),
  distance: z4.string().min(1, "Distance is required"),
  base_price: z4.number().positive("Base price must be a positive number")
});
var updateRouteSchema = z4.object({
  from_city: z4.string().min(2).optional(),
  to_city: z4.string().min(2).optional(),
  distance: z4.string().min(1).optional(),
  base_price: z4.number().positive().optional()
});

// src/app/modules/route/route.controller.ts
import status10 from "http-status";

// src/app/modules/route/route.service.ts
import status9 from "http-status";
var createRoute = async (payload) => {
  const routeExist = await prisma.route.findFirst({
    where: {
      from_city: payload.from_city,
      to_city: payload.to_city
    }
  });
  if (routeExist) {
    throw new AppError_default(status9.CONFLICT, "A route with this from_city and to_city already exists");
  }
  const result = await prisma.route.create({
    data: {
      ...payload,
      base_price: Number(payload.base_price)
    }
  });
  return result;
};
var getAllRoutes = async () => {
  const result = await prisma.route.findMany({
    orderBy: { created_at: "desc" }
  });
  return result;
};
var getSingleRoute = async (id) => {
  const result = await prisma.route.findUnique({
    where: { id },
    include: {
      buses: true,
      schedules: true
    }
  });
  if (!result) {
    throw new AppError_default(status9.NOT_FOUND, "Route not found");
  }
  return result;
};
var updateRoute = async (id, payload) => {
  const routeExist = await prisma.route.findUnique({ where: { id } });
  if (!routeExist) {
    throw new AppError_default(status9.NOT_FOUND, "Route not found");
  }
  if (payload.from_city || payload.to_city) {
    const duplicate = await prisma.route.findFirst({
      where: {
        from_city: payload.from_city ?? routeExist.from_city,
        to_city: payload.to_city ?? routeExist.to_city,
        NOT: { id }
      }
    });
    if (duplicate) {
      throw new AppError_default(status9.CONFLICT, "A route with this from_city and to_city already exists");
    }
  }
  const result = await prisma.route.update({
    where: { id },
    data: {
      ...payload,
      ...payload.base_price !== void 0 ? { base_price: Number(payload.base_price) } : {}
    }
  });
  return result;
};
var deleteRoute = async (id) => {
  const routeExist = await prisma.route.findUnique({ where: { id } });
  if (!routeExist) {
    throw new AppError_default(status9.NOT_FOUND, "Route not found");
  }
  const result = await prisma.route.delete({
    where: { id }
  });
  return result;
};
var RouteService = {
  createRoute,
  getAllRoutes,
  getSingleRoute,
  updateRoute,
  deleteRoute
};

// src/app/modules/route/route.controller.ts
var createRoute2 = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  const result = await RouteService.createRoute(payload);
  sendResponse(res, {
    httpStatusCode: status10.CREATED,
    success: true,
    message: "Route created successfully",
    data: result
  });
});
var getAllRoutes2 = catchAsync(async (req, res) => {
  const result = await RouteService.getAllRoutes();
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Routes retrieved successfully",
    data: result
  });
});
var getSingleRoute2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RouteService.getSingleRoute(id);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Route retrieved successfully",
    data: result
  });
});
var updateRoute2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  const result = await RouteService.updateRoute(id, payload);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Route updated successfully",
    data: result
  });
});
var deleteRoute2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RouteService.deleteRoute(id);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Route deleted successfully",
    data: result
  });
});
var routeController = {
  createRoute: createRoute2,
  getAllRoutes: getAllRoutes2,
  getSingleRoute: getSingleRoute2,
  updateRoute: updateRoute2,
  deleteRoute: deleteRoute2
};

// src/app/modules/route/route.route.ts
var router4 = Router4();
router4.post(
  "/",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  validateRequest(createRouteSchema),
  routeController.createRoute
);
router4.get(
  "/",
  Auth_default([Role.ADMIN, Role.MANAGER, Role.USER]),
  routeController.getAllRoutes
);
router4.get(
  "/:id",
  Auth_default([Role.ADMIN, Role.MANAGER, Role.USER]),
  routeController.getSingleRoute
);
router4.patch(
  "/:id",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  validateRequest(updateRouteSchema),
  routeController.updateRoute
);
router4.delete(
  "/:id",
  Auth_default([Role.ADMIN]),
  routeController.deleteRoute
);
var RouteRouters = router4;

// src/app/modules/seat/seat.route.ts
import { Router as Router5 } from "express";

// src/app/modules/seat/seat.validation.ts
import { z as z5 } from "zod";
var createSeatSchema = z5.object({
  registration_Number: z5.string().min(1, "Bus registration number is required"),
  seat_number: z5.string().min(1, "Seat number is required"),
  status: z5.enum(["AVAILABLE", "BOOKED", "BLOCKED"]).default("AVAILABLE")
});
var updateSeatSchema = z5.object({
  registration_Number: z5.string().min(1).optional(),
  seat_number: z5.string().min(1).optional(),
  user_id: z5.string().uuid().optional().nullable(),
  status: z5.enum(["AVAILABLE", "BOOKED", "BLOCKED"]).optional()
});

// src/app/modules/seat/seat.controller.ts
import status12 from "http-status";

// src/app/modules/seat/seat.service.ts
import status11 from "http-status";
var createSeat = async (payload, user) => {
  const busExist = await prisma.bus.findUnique({
    where: { registrationNumber: payload.registration_Number }
  });
  if (!busExist) {
    throw new AppError_default(status11.NOT_FOUND, "Bus not found with this registration number");
  }
  const seatExist = await prisma.seat.findFirst({
    where: {
      registration_Number: payload.registration_Number,
      seat_number: payload.seat_number
    }
  });
  if (seatExist) {
    throw new AppError_default(status11.CONFLICT, "This seat number already exists for this bus");
  }
  const userExist = await prisma.user.findUnique({ where: { email: user.email } });
  if (!userExist) {
    throw new AppError_default(status11.NOT_FOUND, "User not found");
  }
  const result = await prisma.seat.create({
    data: {
      ...payload,
      user_id: userExist.id
    }
  });
  return result;
};
var getAllSeats = async () => {
  const result = await prisma.seat.findMany({
    include: {
      bus: true,
      user: true,
      booking: true
    }
  });
  return result;
};
var getSingleSeat = async (id) => {
  const result = await prisma.seat.findUnique({
    where: { id },
    include: {
      bus: true,
      user: true,
      booking: true
    }
  });
  if (!result) {
    throw new AppError_default(status11.NOT_FOUND, "Seat not found");
  }
  return result;
};
var getSeatsByBus = async (registration_Number) => {
  const busExist = await prisma.bus.findUnique({
    where: { registrationNumber: registration_Number }
  });
  if (!busExist) {
    throw new AppError_default(status11.NOT_FOUND, "Bus not found with this registration number");
  }
  const result = await prisma.seat.findMany({
    where: { registration_Number },
    orderBy: { seat_number: "asc" }
  });
  return result;
};
var updateSeat = async (id, payload, user) => {
  const seatExist = await prisma.seat.findUnique({ where: { id } });
  if (!seatExist) {
    throw new AppError_default(status11.NOT_FOUND, "Seat not found");
  }
  if (payload.registration_Number) {
    const busExist = await prisma.bus.findUnique({
      where: { registrationNumber: payload.registration_Number }
    });
    if (!busExist) {
      throw new AppError_default(status11.NOT_FOUND, "Bus not found with this registration number");
    }
  }
  if (payload.seat_number) {
    const duplicate = await prisma.seat.findFirst({
      where: {
        registration_Number: payload.registration_Number ?? seatExist.registration_Number,
        seat_number: payload.seat_number,
        NOT: { id }
      }
    });
    if (duplicate) {
      throw new AppError_default(status11.CONFLICT, "This seat number already exists for this bus");
    }
  }
  const userExist = await prisma.user.findUnique({ where: { email: user.email } });
  if (!userExist) {
    throw new AppError_default(status11.NOT_FOUND, "User not found");
  }
  const result = await prisma.seat.update({
    where: { id },
    data: {
      ...payload,
      user_id: userExist.id
    }
  });
  return result;
};
var deleteSeat = async (id) => {
  const seatExist = await prisma.seat.findUnique({
    where: { id },
    include: { booking: true }
  });
  if (!seatExist) {
    throw new AppError_default(status11.NOT_FOUND, "Seat not found");
  }
  if (seatExist.booking) {
    throw new AppError_default(status11.BAD_REQUEST, "Cannot delete seat, an active booking exists for this seat");
  }
  const result = await prisma.seat.delete({
    where: { id }
  });
  return result;
};
var SeatService = {
  createSeat,
  getAllSeats,
  getSingleSeat,
  getSeatsByBus,
  updateSeat,
  deleteSeat
};

// src/app/modules/seat/seat.controller.ts
var createSeat2 = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  const user = req.user;
  if (!user) {
    return res.status(status12.UNAUTHORIZED).json({ success: false, message: "you are unauthorized" });
  }
  const result = await SeatService.createSeat(payload, user);
  sendResponse(res, {
    httpStatusCode: status12.CREATED,
    success: true,
    message: "Seat created successfully",
    data: result
  });
});
var getAllSeats2 = catchAsync(async (req, res) => {
  const result = await SeatService.getAllSeats();
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "Seats retrieved successfully",
    data: result
  });
});
var getSingleSeat2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SeatService.getSingleSeat(id);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "Seat retrieved successfully",
    data: result
  });
});
var getSeatsByBus2 = catchAsync(async (req, res) => {
  const { registrationNumber } = req.params;
  const result = await SeatService.getSeatsByBus(registrationNumber);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "Seats retrieved successfully for this bus",
    data: result
  });
});
var updateSeat2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  const user = req.user;
  if (!user) {
    return res.status(status12.UNAUTHORIZED).json({ success: false, message: "you are unauthorized" });
  }
  const result = await SeatService.updateSeat(id, payload, user);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "Seat updated successfully",
    data: result
  });
});
var deleteSeat2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SeatService.deleteSeat(id);
  sendResponse(res, {
    httpStatusCode: status12.OK,
    success: true,
    message: "Seat deleted successfully",
    data: result
  });
});
var seatController = {
  createSeat: createSeat2,
  getAllSeats: getAllSeats2,
  getSingleSeat: getSingleSeat2,
  getSeatsByBus: getSeatsByBus2,
  updateSeat: updateSeat2,
  deleteSeat: deleteSeat2
};

// src/app/modules/seat/seat.route.ts
var router5 = Router5();
router5.post(
  "/",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  validateRequest(createSeatSchema),
  seatController.createSeat
);
router5.get(
  "/",
  Auth_default([Role.ADMIN, Role.MANAGER, Role.USER]),
  seatController.getAllSeats
);
router5.get(
  "/:id",
  Auth_default([Role.ADMIN, Role.MANAGER, Role.USER]),
  seatController.getSingleSeat
);
router5.get(
  "/bus/:registrationNumber",
  Auth_default([Role.ADMIN, Role.MANAGER, Role.USER]),
  seatController.getSeatsByBus
);
router5.patch(
  "/:id",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  validateRequest(updateSeatSchema),
  seatController.updateSeat
);
router5.delete(
  "/:id",
  Auth_default([Role.ADMIN]),
  seatController.deleteSeat
);
var SeatRouters = router5;

// src/app/modules/shedule/shedule.route.ts
import { Router as Router6 } from "express";

// src/app/modules/shedule/shedule.validation.ts
import { z as z6 } from "zod";
var createScheduleSchema = z6.object({
  date: z6.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).transform((val) => new Date(val).toISOString()),
  time: z6.string().regex(
    /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i,
    "Time must be like 10:30 AM"
  )
});
var updateScheduleSchema = z6.object({
  date: z6.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).transform((val) => new Date(val).toISOString()),
  time: z6.string().min(1, "Time is required")
});

// src/app/modules/shedule/shedule.controller.ts
import status14 from "http-status";

// src/app/modules/shedule/shedule.service.ts
import status13 from "http-status";

// src/app/utils/parseDate.ts
function parseDateForPrisma(dateStr) {
  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format! Use YYYY-MM-DD or ISO string.");
  }
  const startOfDay = new Date(parsedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(parsedDate);
  endOfDay.setHours(23, 59, 59, 999);
  return { gte: startOfDay, lte: endOfDay };
}

// src/app/modules/shedule/shedule.service.ts
var ensureNoScheduleConflict = async (bus_id, date, time, excludeId) => {
  const conflict = await prisma.schedule.findFirst({
    where: {
      bus_id,
      date,
      time,
      ...excludeId ? { NOT: { id: excludeId } } : {}
    }
  });
  if (conflict) {
    throw new AppError_default(
      status13.CONFLICT,
      "This bus is already scheduled for the same date and time"
    );
  }
};
var createSchedule = async (payload, registrationNumber, from, to) => {
  const busExist = await prisma.bus.findUnique({ where: { registrationNumber } });
  if (!busExist) {
    throw new AppError_default(status13.NOT_FOUND, "Bus not found");
  }
  const routeExist = await prisma.route.findFirst({ where: { from_city: from, to_city: to } });
  if (!routeExist) {
    throw new AppError_default(status13.NOT_FOUND, "Route not found");
  }
  await ensureNoScheduleConflict(busExist.id, payload.date, payload.time);
  if (busExist.status === "ACTIVE") {
    throw new AppError_default(status13.CONFLICT, "This bus is already active and scheduled for another route.");
  }
  const result = await prisma.schedule.create({
    data: {
      ...payload,
      bus_id: busExist.id,
      route_id: routeExist.id
    }
  });
  if (result.bus_id === busExist.id) {
    await prisma.bus.update({
      where: { id: busExist.id },
      data: { status: "ACTIVE" }
    });
  }
  return result;
};
var getAllSchedules = async (from, to, date) => {
  const andConditions = [];
  if (date) {
    const dateRange = parseDateForPrisma(date);
    andConditions.push({ date: dateRange });
  }
  const result = await prisma.schedule.findMany({
    where: {
      AND: andConditions,
      route: {
        from_city: from,
        to_city: to
      }
    },
    include: {
      bus: true,
      route: true
    },
    orderBy: { date: "asc" }
  });
  return result;
};
var getSingleSchedule = async (id) => {
  const result = await prisma.schedule.findUnique({
    where: { id },
    include: {
      bus: true,
      route: true
    }
  });
  if (!result) {
    throw new AppError_default(status13.NOT_FOUND, "Schedule not found");
  }
  return result;
};
var updateSchedule = async (id, payload, registrationNumber, from, to) => {
  const scheduleExist = await prisma.schedule.findUnique({ where: { id } });
  if (!scheduleExist) {
    throw new AppError_default(status13.NOT_FOUND, "Schedule not found");
  }
  const busExist = await prisma.bus.findUnique({ where: { registrationNumber } });
  ;
  if (!busExist) {
    throw new AppError_default(status13.NOT_FOUND, "Bus not found");
  }
  const routeExist = await prisma.route.findFirst({ where: { from_city: from, to_city: to } });
  if (!routeExist) {
    throw new AppError_default(status13.NOT_FOUND, "Route not found");
  }
  const result = await prisma.schedule.update({
    where: { id },
    data: {
      ...payload
    }
  });
  return result;
};
var deleteSchedule = async (id) => {
  const scheduleExist = await prisma.schedule.findUnique({ where: { id } });
  if (!scheduleExist) {
    throw new AppError_default(status13.NOT_FOUND, "Schedule not found");
  }
  const result = await prisma.schedule.delete({
    where: { id }
  });
  return result;
};
var ScheduleService = {
  createSchedule,
  getAllSchedules,
  getSingleSchedule,
  updateSchedule,
  deleteSchedule
};

// src/app/modules/shedule/shedule.controller.ts
var createSchedule2 = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  const { registrationNumber, from, to } = req.query;
  console.log(registrationNumber, from, to, payload, "register");
  const result = await ScheduleService.createSchedule(payload, registrationNumber, from, to);
  sendResponse(res, {
    httpStatusCode: status14.CREATED,
    success: true,
    message: "Schedule created successfully",
    data: result
  });
});
var getAllSchedules2 = catchAsync(async (req, res) => {
  const { from, to, date } = req.query;
  const result = await ScheduleService.getAllSchedules(from, to, date);
  sendResponse(res, {
    httpStatusCode: status14.OK,
    success: true,
    message: "Schedules retrieved successfully",
    data: result
  });
});
var getSingleSchedule2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ScheduleService.getSingleSchedule(id);
  sendResponse(res, {
    httpStatusCode: status14.OK,
    success: true,
    message: "Schedule retrieved successfully",
    data: result
  });
});
var updateSchedule2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  const { registrationNumber, from, to } = req.body;
  const result = await ScheduleService.updateSchedule(id, payload, registrationNumber, from, to);
  sendResponse(res, {
    httpStatusCode: status14.OK,
    success: true,
    message: "Schedule updated successfully",
    data: result
  });
});
var deleteSchedule2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ScheduleService.deleteSchedule(id);
  sendResponse(res, {
    httpStatusCode: status14.OK,
    success: true,
    message: "Schedule deleted successfully",
    data: result
  });
});
var scheduleController = {
  createSchedule: createSchedule2,
  getAllSchedules: getAllSchedules2,
  getSingleSchedule: getSingleSchedule2,
  updateSchedule: updateSchedule2,
  deleteSchedule: deleteSchedule2
};

// src/app/modules/shedule/shedule.route.ts
var router6 = Router6();
router6.post(
  "/",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  validateRequest(createScheduleSchema),
  scheduleController.createSchedule
);
router6.get(
  "/",
  Auth_default([Role.ADMIN, Role.MANAGER, Role.USER]),
  scheduleController.getAllSchedules
);
router6.get(
  "/:id",
  Auth_default([Role.ADMIN, Role.MANAGER, Role.USER]),
  scheduleController.getSingleSchedule
);
router6.patch(
  "/:id",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  validateRequest(updateScheduleSchema),
  scheduleController.updateSchedule
);
router6.delete(
  "/:id",
  Auth_default([Role.ADMIN]),
  scheduleController.deleteSchedule
);
var ScheduleRouters = router6;

// src/app/modules/booking/booking.route.ts
import { Router as Router7 } from "express";

// src/app/modules/booking/booking.controller.ts
import status16 from "http-status";

// src/app/modules/booking/booking.service.ts
import status15 from "http-status";
import { uuidv6 } from "zod";

// src/app/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(envVars.STRIPE.STRIPE_SECRET_KEY);

// src/app/modules/booking/booking.service.ts
var createBooking = async (user, bus_id) => {
  const userExist = await prisma.user.findUnique({ where: { email: user.email } });
  if (!userExist) {
    throw new AppError_default(status15.NOT_FOUND, "User not found");
  }
  const busExist = await prisma.bus.findUnique({
    where: { id: bus_id },
    include: {
      driver: true,
      route: true,
      seats: true,
      schedules: true
    }
  });
  if (!busExist) {
    throw new AppError_default(status15.NOT_FOUND, "Bus not found");
  }
  console.log(busExist.route.base_price, "base price");
  const seatExist = await prisma.seat.findFirst({
    where: {
      registration_Number: busExist.registrationNumber,
      status: "AVAILABLE"
    }
  });
  if (!seatExist) {
    throw new AppError_default(status15.NOT_FOUND, "No available seats for this bus");
  }
  const result = await prisma.$transaction(async (tx) => {
    const resultbooking = await prisma.booking.create({
      data: {
        user_id: userExist.id,
        schedule_id: busExist.id,
        seat_id: seatExist.id,
        total_price: Number(busExist.route.base_price)
      }
    });
    const transactionId = String(uuidv6());
    const paymentData = await tx.payment.create({
      data: {
        booking_id: resultbooking.id,
        transaction_id: transactionId,
        amount: Number(busExist.route.base_price),
        user_id: userExist.id,
        bus_id: busExist.id
      }
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Ticket for ${busExist.busName} from ${busExist.route.from_city} to ${busExist.route.to_city}`
            },
            unit_amount: Number(busExist.route.base_price) * 100
          },
          quantity: 1
        }
      ],
      metadata: {
        bookingId: resultbooking.id,
        paymentId: paymentData.id
      },
      payment_intent_data: {
        metadata: {
          bookingId: resultbooking.id,
          paymentId: paymentData.id
        }
      },
      success_url: `${envVars.FRONTEND_URL}/payment/${busExist.id}?bookingId=${resultbooking.id}&paymentId=${paymentData.id}`,
      cancel_url: `${envVars.FRONTEND_URL}/payment/${busExist.id}?bookingId=${resultbooking.id}&paymentId=${paymentData.id}`
    });
    return {
      resultbooking,
      paymentData,
      paymentUrl: session.url
    };
  });
  return {
    booking: result.resultbooking,
    payment: result.paymentData,
    paymentUrl: result.paymentUrl
  };
};
var getAllBookings = async () => {
  const result = await prisma.booking.findMany({
    include: {
      user: true,
      seat: true,
      payment: true
    },
    orderBy: { created_at: "desc" }
  });
  return result;
};
var getSingleBooking = async (id) => {
  const result = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      seat: true,
      payment: true
    }
  });
  if (!result) {
    throw new AppError_default(status15.NOT_FOUND, "Booking not found");
  }
  return result;
};
var getMyBookings = async (userId) => {
  const result = await prisma.booking.findMany({
    where: { user_id: userId },
    include: {
      seat: true,
      payment: true
    },
    orderBy: { created_at: "desc" }
  });
  return result;
};
var updateBookingStatus = async (id, payload) => {
  const bookingExist = await prisma.booking.findUnique({ where: { id } });
  if (!bookingExist) {
    throw new AppError_default(status15.NOT_FOUND, "Booking not found");
  }
  const result = await prisma.booking.update({
    where: { id },
    data: payload
  });
  return result;
};
var cancelBooking = async (id, userId) => {
  const bookingExist = await prisma.booking.findUnique({ where: { id } });
  if (!bookingExist) {
    throw new AppError_default(status15.NOT_FOUND, "Booking not found");
  }
  if (bookingExist.user_id !== userId) {
    throw new AppError_default(status15.FORBIDDEN, "You can only cancel your own booking");
  }
  if (bookingExist.booking_status === "CANCELLED") {
    throw new AppError_default(status15.BAD_REQUEST, "This booking is already cancelled");
  }
  const result = await prisma.booking.update({
    where: { id },
    data: { booking_status: "CANCELLED" }
  });
  return result;
};
var BookingService = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  getMyBookings,
  updateBookingStatus,
  cancelBooking
};

// src/app/modules/booking/booking.controller.ts
var createBooking2 = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(status16.UNAUTHORIZED).json({ success: false, message: "you are unauthorized" });
  }
  const { bus_id } = req.params;
  const result = await BookingService.createBooking(user, bus_id);
  sendResponse(res, {
    httpStatusCode: status16.CREATED,
    success: true,
    message: "Seat booked successfully",
    data: result
  });
});
var getAllBookings2 = catchAsync(async (req, res) => {
  const result = await BookingService.getAllBookings();
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Bookings retrieved successfully",
    data: result
  });
});
var getSingleBooking2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BookingService.getSingleBooking(id);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Booking retrieved successfully",
    data: result
  });
});
var getMyBookings2 = catchAsync(async (req, res) => {
  if (!req.user?.userId) {
    throw new AppError_default(status16.UNAUTHORIZED, "Please login first");
  }
  const user = req.user;
  if (!user) {
    return res.status(status16.UNAUTHORIZED).json({ success: false, message: "you are unauthorized" });
  }
  const result = await BookingService.getMyBookings(user.userId);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Your bookings retrieved successfully",
    data: result
  });
});
var updateBookingStatus2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };
  const result = await BookingService.updateBookingStatus(id, payload);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Booking status updated successfully",
    data: result
  });
});
var cancelBooking2 = catchAsync(async (req, res) => {
  if (!req.user?.userId) {
    throw new AppError_default(status16.UNAUTHORIZED, "Please login first");
  }
  const { id } = req.params;
  const user = req.user;
  if (!user) {
    return res.status(status16.UNAUTHORIZED).json({ success: false, message: "you are unauthorized" });
  }
  const result = await BookingService.cancelBooking(id, user.userId);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result
  });
});
var bookingController = {
  createBooking: createBooking2,
  getAllBookings: getAllBookings2,
  getSingleBooking: getSingleBooking2,
  getMyBookings: getMyBookings2,
  updateBookingStatus: updateBookingStatus2,
  cancelBooking: cancelBooking2
};

// src/app/modules/booking/booking.route.ts
var router7 = Router7();
router7.post(
  "/:bus_id",
  Auth_default([Role.USER, Role.ADMIN, Role.MANAGER]),
  bookingController.createBooking
);
router7.get(
  "/",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  bookingController.getAllBookings
);
router7.get(
  "/me",
  Auth_default([Role.USER, Role.ADMIN, Role.MANAGER]),
  bookingController.getMyBookings
);
router7.get(
  "/:id",
  Auth_default([Role.USER, Role.ADMIN, Role.MANAGER]),
  bookingController.getSingleBooking
);
router7.patch(
  "/:id/status",
  Auth_default([Role.ADMIN, Role.MANAGER]),
  bookingController.updateBookingStatus
);
router7.patch(
  "/:id/cancel",
  Auth_default([Role.USER, Role.ADMIN, Role.MANAGER]),
  bookingController.cancelBooking
);
var BookingRouters = router7;

// src/app/routes/index.route.ts
var router8 = Router8();
router8.use("/v1/auth", AuthRouters);
router8.use("/v1/driver", DriverRouters);
router8.use("/v1/bus", BusRouters);
router8.use("/v1/route", RouteRouters);
router8.use("/v1/seat", SeatRouters);
router8.use("/v1/schedule", ScheduleRouters);
router8.use("/v1/booking", BookingRouters);
var IndexRouter = router8;

// src/app/modules/payment/payment.controller.ts
import status17 from "http-status";

// src/app/modules/payment/payment.service.ts
var deleteParticipantAndPayment = async (bookingId, paymentId) => {
  if (!bookingId || !paymentId) {
    console.error("Missing bookingId or paymentId in session metadata");
    return;
  }
  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: { id: paymentId }
    });
    await tx.booking.deleteMany({
      where: { id: bookingId }
    });
  });
  console.log(
    `Payment failed. Deleted booking ${bookingId} and payment ${paymentId}`
  );
};
var handlerStripeWebhookEvent = async (event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id
    }
  });
  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` };
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      const paymentId = session.metadata?.paymentId;
      if (!bookingId || !paymentId) {
        console.error("Missing bookingId or paymentId in session metadata");
        return {
          message: "Missing bookingId or paymentId in session metadata"
        };
      }
      const participant = await prisma.booking.findUnique({
        where: {
          id: bookingId
        }
      });
      if (!participant) {
        console.error(`Booking with id ${bookingId} not found`);
        return { message: `Booking with id ${bookingId} not found` };
      }
      if (session.payment_status !== "paid") {
        await deleteParticipantAndPayment(bookingId, paymentId);
        break;
      }
      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: {
            id: bookingId
          },
          data: {
            paymentStatus: PaymentStatus.PAID
          }
        });
        await tx.payment.update({
          where: {
            id: paymentId
          },
          data: {
            stripeEventId: event.id,
            status: PaymentStatus.PAID,
            paymentGatewayData: session
          }
        });
      });
      console.log(
        `Processed checkout.session.completed for booking ${bookingId} and payment ${paymentId}`
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      const paymentId = session.metadata?.paymentId;
      await deleteParticipantAndPayment(bookingId, paymentId);
      break;
    }
    case "payment_intent.succeeded": {
      const session = event.data.object;
      console.log(
        `Payment intent ${session.id} succeeded.`
      );
      break;
    }
    case "payment_intent.payment_failed": {
      const session = event.data.object;
      const participantId = session.metadata?.participantId;
      const paymentId = session.metadata?.paymentId;
      await deleteParticipantAndPayment(participantId, paymentId);
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      const participantId = session.metadata?.participantId;
      const paymentId = session.metadata?.paymentId;
      await deleteParticipantAndPayment(participantId, paymentId);
      break;
    }
    case "payment_intent.canceled": {
      const session = event.data.object;
      const participantId = session.metadata?.participantId;
      const paymentId = session.metadata?.paymentId;
      await deleteParticipantAndPayment(participantId, paymentId);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  return { message: `Webhook Event ${event.id} processed successfully` };
};
var PaymentService = {
  handlerStripeWebhookEvent
};

// src/app/modules/payment/payment.controller.ts
var handleStripeWebhookEvent = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return res.status(status17.BAD_REQUEST).json({ message: "Missing Stripe signature or webhook secret" });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return res.status(status17.BAD_REQUEST).json({ message: "Error processing Stripe webhook" });
  }
  try {
    const result = await PaymentService.handlerStripeWebhookEvent(event);
    sendResponse(res, {
      httpStatusCode: status17.OK,
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result
    });
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    sendResponse(res, {
      httpStatusCode: status17.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Error handling Stripe webhook event"
    });
  }
});
var PaymentController = {
  handleStripeWebhookEvent
};

// src/app/middleware/notFound.ts
import status18 from "http-status";
var notFound = (req, res) => {
  return res.status(status18.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`
  });
};

// src/app/middleware/globalError.ts
import status20 from "http-status";
import z7 from "zod";

// src/app/errorHelper/handleerror.ts
import status19 from "http-status";
var handleZodError = (err) => {
  const statusCode = status19.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      message: issue.message
    });
  });
  return {
    success: false,
    message,
    errorSources,
    statusCode
  };
};

// src/app/middleware/globalError.ts
function errorHandler(err, req, res, next) {
  let statusCode = status20.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let errorSources = [];
  let stack = void 0;
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = status20.BAD_REQUEST;
    message = "Validation Error";
    errorSources.push({ message: err.message });
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode || status20.BAD_REQUEST;
    message = err.message;
    errorSources.push({ message: err.message });
  } else if (err instanceof z7.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  }
  sendResponse(res, {
    success: false,
    message,
    httpStatusCode: statusCode,
    data: { errorSources, stack: process.env.NODE_ENV === "development" ? err.stack : stack }
  });
}
var globalError_default = errorHandler;

// src/app.ts
var app = express();
app.use(cookieParser());
app.use("/api/auth", toNodeHandler(auth));
app.set("view engine", "ejs");
app.set("views", path2.resolve(process.cwd(), `src/app/templates`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Bus management backend system is running successfully" });
});
app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent);
app.use(cookieParser());
app.use(cors({
  origin: envVars.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use("/api", IndexRouter);
app.use(notFound);
app.use(globalError_default);
var app_default = app;

// src/server.ts
var server;
var bootstrap = async () => {
  try {
    server = app_default.listen(envVars.PORT, () => {
    });
  } catch (error) {
    console.error({ error }, "Failed to start server");
  }
};
process.on("uncaughtException", (error) => {
  console.error({ error }, "Uncaught exception detected, shutting down server");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("unhandledRejection", (error) => {
  console.error({ error }, "Unhandled rejection detected, shutting down server");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});
process.on("SIGTERM", (error) => {
  console.warn({ error }, "SIGTERM detected, shutting down server");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
bootstrap();
