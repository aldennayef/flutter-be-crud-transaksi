import prisma from "../../../prisma/prisma.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Mendapatkan daftar user dengan pagination & select field yang aman
 */
export const getUsers = async ({ page = 1, limit = 10 } = {}) => {
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [total, users] = await Promise.all([
        prisma.users.count(),
        prisma.users.findMany({
            skip,
            take: limitNum,
            select: {
                id: true,
                username: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        }),
    ]);

    return {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        data: users,
    };
};

export const getUserById = async (userId) => {
    return await prisma.users.findUnique({
        where: {
            id: BigInt(userId),
        },
        select: {
            id: true,
            username: true,
            created_at: true,
            updated_at: true,
        },
    });
};

export const getUserByUsername = async (username) => {
    return await prisma.users.findUnique({
        where: {
            username: username,
        },
        select: {
            id: true,
            username: true,
            created_at: true,
            updated_at: true,
        },
    });
};

export const createUser = async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    return await prisma.users.create({
        data: {
            username: data.username,
            password: hashedPassword,
        },
        select: {
            id: true,
            username: true,
            created_at: true,
            updated_at: true,
        },
    });
};

export const deleteUser = async (id) => {
    return await prisma.users.delete({
        where: {
            id: BigInt(id),
        },
        select: {
            id: true,
            username: true,
        },
    });
};

export const updateUser = async (data, id) => {
    const updatePayload = {
        ...(data.username && { username: data.username }),
    };

    if (data.password) {
        updatePayload.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    return await prisma.users.update({
        data: updatePayload,
        where: {
            id: BigInt(id),
        },
        select: {
            id: true,
            username: true,
            created_at: true,
            updated_at: true,
        },
    });
};