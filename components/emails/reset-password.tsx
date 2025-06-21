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
} from '@react-email/components';
import * as React from 'react'

interface ResetPasswordEmailProps {
    userFirstName?: string
    resetPasswordLink: string
}

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

export const ResetPasswordEmail = ({
    userFirstName = "test",
    resetPasswordLink,
}: ResetPasswordEmailProps) => {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Preview>Reset password for your MauManage account</Preview>
                <Container style={container}>
                    <Img
                        src={`${baseUrl}/images/logo.png`}
                        width="40"
                        height="33"
                        alt="MauManage"
                    />
                    <Section>
                        <Text style={text}>Hi {userFirstName},</Text>
                        <Text style={text}>
                            Someone recently requested a password change for your MauManage
                            account. If this was you, you can set a new password here:
                        </Text>
                        <Button style={button} href={resetPasswordLink}>
                            Reset password
                        </Button>
                        <Text style={text}>
                            This link will expire for 1 hours for the security reason.
                        </Text>
                        <Text style={text}>
                            If you don&apos;t want to change your password or didn&apos;t
                            request this, just ignore and delete this message.
                        </Text>
                        <Text style={text}>
                            To keep your account secure, please don&apos;t forward this email
                            to anyone. See our Help Center for{' '}
                            <Link href="mailto:support@maumanage.com" style={anchor}>
                                support@maumanage.com
                            </Link>
                        </Text>
                        <Text style={text}>MauManage Team</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: '#f6f9fc',
    padding: '10px 0',
};

const container = {
    backgroundColor: '#ffffff',
    border: '1px solid #f0f0f0',
    padding: '45px',
};

const text = {
    fontSize: '16px',
    fontFamily:
        "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
    fontWeight: '300',
    color: '#404040',
    lineHeight: '26px',
};

const button = {
    backgroundColor: '#007ee6',
    borderRadius: '4px',
    color: '#fff',
    fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
    fontSize: '15px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '210px',
    padding: '14px 7px',
};

const anchor = {
    textDecoration: 'underline',
};

export default ResetPasswordEmail;


