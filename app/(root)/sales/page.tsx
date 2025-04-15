import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CirclePlusIcon } from "lucide-react"
import { Payment, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"

async function getData(): Promise<Payment[]> {
    // Fetch data from your API here.
    return [
        {
            "id": "728ed52f",
            "amount": 100000,
            "status": "pending",
            "email": "m@example.com"
        },
        {
            "id": "489e1d42",
            "amount": 125000,
            "status": "processing",
            "email": "example@gmail.com"
        },
        {
            "id": "3a7b8c2d",
            "amount": 189000,
            "status": "success",
            "email": "user1@domain.com"
        },
        {
            "id": "5e6f7a1b",
            "amount": 150000,
            "status": "failed",
            "email": "test@test.org"
        },
        {
            "id": "9c8d7e2f",
            "amount": 200000,
            "status": "processing",
            "email": "sample@mail.net"
        },
        {
            "id": "1b2c3d4e",
            "amount": 75000,
            "status": "pending",
            "email": "contact@company.io"
        },
        {
            "id": "6f5e4d3c",
            "amount": 225000,
            "status": "success",
            "email": "support@service.com"
        },
        {
            "id": "a1b2c3d4",
            "amount": 50000,
            "status": "failed",
            "email": "info@website.co"
        },
        {
            "id": "e5f6g7h8",
            "amount": 175000,
            "status": "processing",
            "email": "hello@world.ai"
        },
        {
            "id": "i9j0k1l2",
            "amount": 95000,
            "status": "pending",
            "email": "data@science.edu"
        },
        {
            "id": "m3n4o5p6",
            "amount": 110000,
            "status": "success",
            "email": "dev@project.dev"
        },
        {
            "id": "q7r8s9t0",
            "amount": 60000,
            "status": "failed",
            "email": "admin@system.gov"
        },
        {
            "id": "u1v2w3x4",
            "amount": 140000,
            "status": "processing",
            "email": "service@api.io"
        },
        {
            "id": "y5z6a7b8",
            "amount": 85000,
            "status": "pending",
            "email": "client@customer.biz"
        },
        {
            "id": "c9d0e1f2",
            "amount": 190000,
            "status": "success",
            "email": "payment@gateway.com"
        },
        {
            "id": "g3h4i5j6",
            "amount": 45000,
            "status": "failed",
            "email": "no-reply@notification.mail"
        }
    ]
}

export default async function page() {
    const data = await getData()

    return (
        <div className="m-3 p-5 bg-white rounded-md">
            <div className="grid grid-cols-2">
                <div className="text-2xl text-gray-500">
                    Sales
                </div>
                <div className="flex justify-end">
                    <Button>
                        <CirclePlusIcon /> Create New Sales
                    </Button>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="completed" className="py-10">
                <TabsList className="grid w-[400px] grid-cols-2">
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="receivable">Receivable</TabsTrigger>
                </TabsList>
                <TabsContent value="completed" className="space-y-4">
                    <div className="container mx-auto py-4">
                        <DataTable columns={columns} data={data} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}