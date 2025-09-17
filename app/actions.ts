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
    console.log(`Projet avec l'ID ${projectId} supprimé avec succès.`);
  } catch (error) {
    console.error(error);
    throw new Error();
  }
}
