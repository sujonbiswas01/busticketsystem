import AppError from "../../errorHelper/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { UserCreateInput } from "./user.interface";
const UserRegister = async (payload: UserCreateInput) => {
  const { name, email, phone,password } = payload;
  const userExist = await prisma.user.findUnique({
    where: { email: email },
  });
  if (userExist) {
    throw new AppError(409, "user already exist,please try another email");
  }
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      phone,
    },
  });
  console.debug({ userId: data?.user?.id }, "User registration response received");
  if (!data.user) {
    throw new AppError(400, "User register failed");
  }

    const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified,
  });

  return {
    ...data,
    token: data.token,
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  UserRegister
};