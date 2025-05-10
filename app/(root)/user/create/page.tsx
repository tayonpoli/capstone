import InviteForm from "@/components/form/InviteForm";

const page = () => {
    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Users
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Invite New User
                </div>
            </div>
            <InviteForm />
        </div>
    );
};

export default page;