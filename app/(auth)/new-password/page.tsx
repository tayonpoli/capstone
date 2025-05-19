import NewPasswordForm from '@/components/form/NewPasswordForm'
import { Metadata } from 'next';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function NewPasswordPage(props: {
    params: Params;
    searchParams: SearchParams;
}) {
    const searchParams = await props.searchParams;
    const token = Array.isArray(searchParams.token)
        ? searchParams.token[0]
        : searchParams.token;

    return (
        <div className='w-full'>
            <NewPasswordForm token={token || null} />
        </div>
    );
}