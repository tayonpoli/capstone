import SignUpForm from '@/components/form/SignUpForm';

export default function SignUpPage({
    searchParams = {},
}: {
    searchParams?: { token?: string }
}) {
    return (
        <div className='w-full'>
            <SignUpForm token={searchParams?.token || null} />
        </div>

    );
};
