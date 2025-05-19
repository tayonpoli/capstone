// components/emails/reset-password.tsx
import {
    Body,
    Button,
    Container,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components'
import * as React from 'react'

interface ResetPasswordEmailProps {
    userName?: string
    resetPasswordLink: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const ResetPasswordEmail = ({
    userName,
    resetPasswordLink,
}: ResetPasswordEmailProps) => {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Preview>Reset password untuk akun MauManage Anda</Preview>
                <Container style={container}>
                    <Img
                        src={`${baseUrl}/images/logo.png`}
                        width="120"
                        height="auto"
                        alt="MauManage"
                        style={logo}
                    />
                    <Section>
                        <Text style={text}>Halo {userName},</Text>
                        <Text style={text}>
                            Kami menerima permintaan untuk mengatur ulang password akun MauManage Anda.
                            Jika Anda yang membuat permintaan ini, silakan klik tombol di bawah:
                        </Text>
                        <Button style={button} href={resetPasswordLink}>
                            Atur Ulang Password
                        </Button>
                        <Text style={text}>
                            Jika Anda tidak meminta pengaturan ulang password, abaikan email ini.
                        </Text>
                        <Text style={text}>
                            Link ini akan kadaluarsa dalam 1 jam untuk alasan keamanan.
                        </Text>
                        <Text style={text}>
                            Butuh bantuan? Hubungi tim support kami di{' '}
                            <Link href="mailto:support@maumanage.com" style={link}>
                                support@maumanage.com
                            </Link>
                        </Text>
                        <Text style={footer}>Tim MauManage</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: '#f6f9fc',
    padding: '20px 0',
    fontFamily: "'Inter', sans-serif",
}

const container = {
    backgroundColor: '#ffffff',
    border: '1px solid #f0f0f0',
    borderRadius: '8px',
    padding: '45px',
    maxWidth: '600px',
    margin: '0 auto',
}

const logo = {
    margin: '0 auto 20px',
    display: 'block',
}

const text = {
    fontSize: '16px',
    color: '#525f7f',
    lineHeight: '1.5',
    margin: '0 0 20px',
}

const button = {
    backgroundColor: '#6366f1',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '500',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '100%',
    padding: '12px 24px',
    margin: '0 auto 20px',
}

const link = {
    color: '#6366f1',
    textDecoration: 'underline',
}

const footer = {
    fontSize: '14px',
    color: '#8898aa',
    margin: '20px 0 0',
}
