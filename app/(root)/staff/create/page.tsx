import StaffForm from "@/components/staff/StaffForm";

const page = () => {
    return (
        <div className="h-full m-3 p-5 rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Contacts
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Add New Staff
                </div>
            </div>
            <StaffForm />
        </div>
    );
};

export default page;