import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./user.service";
import { tokenUtils } from "../../utils/token";

const UserRegister = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body
};
  const result = await AuthService.UserRegister(payload);

    const { accessToken, refreshToken, token } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);



  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "user registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);

  const { accessToken, refreshToken, token } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

export const userController={
    UserRegister,
    loginUser
}