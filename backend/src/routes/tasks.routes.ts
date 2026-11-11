import { Router } from "express"
import { getTasks, patchTask, postTask, removeTask } from "../controllers/tasks.controller"
import { requireAuth } from "../middleware/require-auth"

export const tasksRouter = Router()

tasksRouter.use(requireAuth)
tasksRouter.get("/", getTasks)
tasksRouter.post("/", postTask)
tasksRouter.patch("/:id", patchTask)
tasksRouter.delete("/:id", removeTask)
