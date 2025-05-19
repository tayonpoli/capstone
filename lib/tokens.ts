
import crypto from 'crypto'
import { addHours } from 'date-fns'
import { prisma } from './prisma'

export const generatePasswordResetToken = async (email: string) => {
    const token = crypto.randomBytes(32).toString('hex')
    const expires = addHours(new Date(), 1) // Token berlaku 1 jam

    // Hapus token yang sudah ada untuk email ini
    await prisma.passwordReset.deleteMany({
        where: { email }
    })

    // Buat token baru
    const passwordResetToken = await prisma.passwordReset.create({
        data: {
            email,
            token,
            expires
        }
    })

    return passwordResetToken
}

export const getPasswordResetTokenByToken = async (token: string) => {
    try {
        const passwordResetToken = await prisma.passwordReset.findUnique({
            where: { token }
        })

        return passwordResetToken
    } catch {
        return null
    }
}

export const verifyPasswordResetToken = async (token: string) => {
    const existingToken = await getPasswordResetTokenByToken(token)

    if (!existingToken) {
        return { error: "Token tidak valid" }
    }

    const hasExpired = new Date(existingToken.expires) < new Date()

    if (hasExpired) {
        return { error: "Token sudah kadaluarsa" }
    }

    return { success: true, token: existingToken }
}