import { Card } from '@/components/ui/card';
import { FC, ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
    return <div className='min-h-screen flex items-center justify-center'>
        <Card className='max-w-md w-full p-10'>
            {children}
        </Card>
        {/* <div className='border border-gray-300 p-10 rounded-md max-w-md w-full'>
        </div> */}
    </div>
};

export default AuthLayout;