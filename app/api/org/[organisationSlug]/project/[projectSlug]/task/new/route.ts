

import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";
import { TaskStatus, TaskPriority, TaskType, TaskMemberRole, MemberRole } from "@prisma/client";

type Params = { organisationSlug: string, projectSlug: string };

export async function POST(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    try {
        const body = await req.json();
        const { title, description, assignedTo, deadline, status, priority, type } = body ?? {};
        const user = await getUser();
        const { organisationSlug, projectSlug } = await params;
        
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const project = await prisma.project.findFirst({
            where: {
                slug: projectSlug,
                workspace: { slug: organisationSlug },
            },
            select: { id: true },
        });
        
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const organisation = await prisma.organization.findUnique({
            where: {
                slug: organisationSlug,
            },
            select: { members: true }
        });

        function generateSlug(length: number = 20): string {
            const chars = 'abcdefghijklmnopqrstuvwxyz';
            let result = ''
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            return result
        }

        const slug = generateSlug();

        const created = await prisma.task.create({
            data: {
                projectId: project.id,
                slug: slug,
                title: title,
                description: description,
                assignedTo: assignedTo || null,
                deadline: deadline ? new Date(deadline) : null,
                status: status || TaskStatus.TODO,
                priority: priority || TaskPriority.NONE,
                type: type || TaskType.TASK,
                createdById: user.id,
                taskMembers: { create: [{ userId: user.id, role: TaskMemberRole.ADMIN }] },
            },
        });

        if (assignedTo && assignedTo !== user.id) {
            await prisma.taskMember.create({
                data: {
                    taskId: created.id,
                    userId: assignedTo,
                    role: TaskMemberRole.EDITOR,
                },
            });
        }

        for (const member of organisation?.members || []) {
            if (member.userId === user.id || member.userId === assignedTo) {
                continue;
            }

            let taskRole: TaskMemberRole;

            if (member.role === MemberRole.OWNER || member.role === MemberRole.ADMIN) {
                taskRole = TaskMemberRole.ADMIN;
            } else if (member.role === MemberRole.MEMBER) {
                taskRole = TaskMemberRole.EDITOR;
            } else if (member.role === MemberRole.VIEWER) {
                taskRole = TaskMemberRole.VIEWER;
            } else {
                return NextResponse.json({ error: "Invalid member role" }, { status: 400 });
            }

            await prisma.taskMember.create({
                data: {
                    taskId: created.id,
                    userId: member.userId,
                    role: taskRole,
                },
            });
        }

        return NextResponse.json(created, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
}
