import { FC, ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
    return <div className='min-h-screen flex items-center justify-center bg-slate-100'>
        <div className='border border-gray-300 p-10 rounded-md max-w-md w-full'>{children}
        </div>
    </div>
};

export default AuthLayout;