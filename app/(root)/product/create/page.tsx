import ProductForm from "@/components/form/ProductForm";

const page = () => {
    return (
        <div className="h-full m-3 p-5 bg-white rounded-md">
            <div className="p-3">
                <div className='text-sm font-light text-gray-400'>
                    Inventory
                </div>
                <div className='mb-10 text-3xl font-semibold'>
                    Add New Item
                </div>
            </div>
            <ProductForm />
        </div>
    );
};

export default page;