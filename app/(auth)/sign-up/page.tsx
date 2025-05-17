import SignUpForm from '@/components/form/SignUpForm';
import { Metadata } from 'next';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(props: {
    params: Params;
    searchParams: SearchParams;
}) {
    const searchParams = await props.searchParams;
    const token = Array.isArray(searchParams.token)
        ? searchParams.token[0]
        : searchParams.token;

    return {
        title: token ? 'Accept Invitation' : 'Sign Up',
        description: token
            ? 'Accept your invitation to join our platform'
            : 'Create a new account',
    } satisfies Metadata;
}

export default async function SignUpPage(props: {
    params: Params;
    searchParams: SearchParams;
}) {
    const searchParams = await props.searchParams;
    const token = Array.isArray(searchParams.token)
        ? searchParams.token[0]
        : searchParams.token;

    return (
        <div className='w-full'>
            <SignUpForm token={token || null} />
        </div>
    );
}