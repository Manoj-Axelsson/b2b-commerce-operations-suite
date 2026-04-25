import "better-auth";

declare module "better-auth" {
    interface User {
        role?: string;
        isApproved?: boolean;
    }
    interface Session {
        user: User;
    }
}
