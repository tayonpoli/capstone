import SupplierForm from "@/components/supplier/SupplierForm";

const page = () => {
    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Supplier
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Add New Supplier
                </div>
            </div>
            <SupplierForm />
        </div>
    );
};

export default page;