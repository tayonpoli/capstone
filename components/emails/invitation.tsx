import {
    Body,
    Button,
    Column,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react'

interface ResetPasswordEmailProps {
    email: string
    invitationLink: string
}

const baseUrl = process.env.NEXTAUTH_URL

export const InvitationEmail = ({
    email,
    invitationLink,
}: ResetPasswordEmailProps) => {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Preview>MauManage Email Invitation</Preview>
                <Container style={container}>
                    <Img
                        src={`${baseUrl}/logo.png`}
                        width="160"
                        height="48"
                        alt="MauManage"
                    />
                    <Section>
                        <Heading style={h1}>Hello, there 👋</Heading>
                        <Text style={text}>
                            You’ve been invited to join <strong>MauManage</strong>.
                            To complete your registration and start exploring our features, please click the button below.
                        </Text>
                        <Row>
                            <Column align="left" style={text} className="h-[40px] w-1/2">
                                Invitation ID
                            </Column>
                            <Column align="right" style={text} className="h-[40px] w-1/2">
                                #INV-2025A001
                            </Column>
                        </Row>
                        <Row>
                            <Column align="left" style={text} className="h-[40px] w-1/2">
                                Valid for
                            </Column>
                            <Column align="right" style={text} className="h-[40px] w-1/2">
                                48 hours
                            </Column>
                        </Row>
                        <Row>
                            <Column align="left" style={text} className="h-[40px] w-1/2">
                                Registered Email
                            </Column>
                            <Column align="right" style={text} className="h-[40px] w-1/2">
                                {email}
                            </Column>
                        </Row>
                        <Button className='my-4' style={button} href={invitationLink}>
                            Complete Registration
                        </Button>
                        <Text style={text}>
                            If you didn&apos;t expect this email, you can ignore it or contact us at{' '}
                            <Link href="mailto:maumanage@official.com" style={anchor}>
                                support@maumanage.com
                            </Link>
                        </Text>
                        <Text style={text}>MauManage Team</Text>
                    </Section>
                    <Text style={footerText}>
                        © {new Date().getFullYear()} MauManage. All rights reserved.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    padding: '40px 0',
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

const h1 = {
    color: '#2c3e50',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
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
    margin: '4 auto'
};

const anchor = {
    textDecoration: 'underline',
};

const footerText = {
    ...text,
    fontSize: '12px',
    padding: '0 auto',
};

export default InvitationEmail;
