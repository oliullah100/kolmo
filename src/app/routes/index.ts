import express from "express";
import { MessageRoutes } from "../modules/message/message.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { adminRoutes } from "../modules/admin/admin.route";

const router = express.Router();

const moduleRoutes = [
    {
        path: "/messages",
        route: MessageRoutes,
    },
    {
        path: "/auth",
        route: AuthRoutes,
    },
    {
        path: "/admin",
        route: adminRoutes,
    },
]

moduleRoutes
  .filter((route) => route.route)
  .forEach((route) => router.use(route.path, route.route));

export default router;