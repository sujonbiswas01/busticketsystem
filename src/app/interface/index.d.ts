import { IRequestUser } from "./requestuser.interface";

declare global {
    namespace Express{
        interface Request {
            user : IRequestUser;
        }
    }
}