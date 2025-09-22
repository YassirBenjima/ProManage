"use server";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function checkAndAddUser(email: string, name: string) {
  if (!email) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!existingUser && name) {
      await prisma.user.create({
        data: {
          email,
          name,
        },
      });
      console.error("Error verifying user:");
    } else {
      console.error("User already present in the database");
    }
  } catch (error) {
    console.error("Error verifying user:", error);
  }
}

function generateUniqueCode(): string {
  return randomBytes(6).toString("hex");
}

export async function createProject(
  name: string,
  description: string,
  email: string
) {
  try {
    const inviteCode = generateUniqueCode();
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        inviteCode,
        createdById: user.id,
      },
    });
    return newProject;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

export async function getProjectsCreatedByUser(email: string) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        createdBy: { email },
      },
      include: {
        tasks: {
          include: {
            user: true,
            createdBy: true,
          },
        },
        users: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const formattedProjects = projects.map((project) => ({
      ...project,
      users: project.users.map((userEntry) => userEntry.user),
    }));

    return formattedProjects;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

export async function deleteProjectById(projectId: string) {
  try {
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });
    console.log(`Project with ID ${projectId} deleted successfully.`);
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

export async function addUserToProject(email: string, inviteCode: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { inviteCode },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const existingAssociation = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: project.id,
        },
      },
    });

    if (existingAssociation) {
      throw new Error("User is already associated with this project");
    }

    await prisma.projectUser.create({
      data: {
        userId: user.id,
        projectId: project.id,
      },
    });
    return "User added to the project successfully";
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

export async function getProjectsAssociatedWithUser(email: string) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        users: {
          some: {
            user: {
              email,
            },
          },
        },
      },
      include: {
        tasks: true,
        users: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const formattedProjects = projects.map((project) => ({
      ...project,
      users: project.users.map((userEntry) => userEntry.user),
    }));

    return formattedProjects;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

export async function deleteTaskById(taskId: string) {
  try {
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

export async function getProjectInfo(idProject: string, details: boolean) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: idProject,
      },
      include: details
        ? {
            tasks: {
              include: {
                user: true,
                createdBy: true,
              },
            },
            users: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            createdBy: true,
          }
        : undefined,
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return project;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

export async function createTask(
  name: string,
  description: string,
  dueDate: Date | null,
  projectId: string,
  createdByEmail: string,
  assignToEmail: string | undefined
) {
  try {
    const createdBy = await prisma.user.findUnique({
      where: { email: createdByEmail },
    });

    if (!createdBy) {
      throw new Error(`User with email ${createdByEmail} not found`);
    }

    let assignedUserId = createdBy.id;

    if (assignToEmail) {
      const assignedUser = await prisma.user.findUnique({
        where: { email: assignToEmail },
      });
      if (!assignedUser) {
        throw new Error(`User with email ${assignToEmail} not found`);
      }
      assignedUserId = assignedUser.id;
    }

    const newTask = await prisma.task.create({
      data: {
        name,
        description,
        dueDate,
        projectId,
        createdById: createdBy.id,
        userId: assignedUserId,
      },
    });

    console.log("Task created successfully:", newTask);
    return newTask;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

export async function getProjectUsers(idProject: string) {
  try {
    const projectWithUsers = await prisma.project.findUnique({
      where: {
        id: idProject,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    const users =
      projectWithUsers?.users.map((projectUser) => projectUser.user) || [];
    return users;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}

export const getTaskDetails = async (taskId: string) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        user: true,
        createdBy: true,
      },
    });
    if (!task) {
      throw new Error("Task not found");
    }

    return task;
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};

export const updateTaskStatus = async (
  taskId: string,
  newStatus: string,
  solutionDescription?: string
) => {
  try {
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      throw new Error("Task not found");
    }

    if (newStatus === "Done" && solutionDescription) {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: newStatus,
          solutionDescription,
        },
      });
    } else {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: newStatus,
        },
      });
    }
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};
