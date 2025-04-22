import PurchaseForm from "@/components/purchase/PurchaseForm";

const page = () => {
    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Purchase
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Create New Purchase
                </div>
            </div>
            <PurchaseForm />
        </div>
    );
};

export default page;