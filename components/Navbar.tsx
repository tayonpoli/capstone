import Image from "next/image";
import Link from 'next/link';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMagnifyingGlass,
    faClockRotateLeft,
    // Import other icons as needed
} from '@fortawesome/free-solid-svg-icons';
import {
    faCommentDots,
    faCircleQuestion,
    faBell,
    faUser
} from '@fortawesome/free-regular-svg-icons';
import { Button, buttonVariants } from './ui/button';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";

const Navbar = async () => {
    const session = await getServerSession(authOptions);

    return (
        <div className='bg-white border-b flex items-center justify-between p-4'>
            {/* SEARCH BAR */}
            {/* <div className='hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2'>
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className={`w-4 h-4 text-gray-400`}
                />
                <input type="text" placeholder="Search..." className="w-[200px] p-2 bg-transparent outline-none" />
            </div> */}
            {/* ICONS AND USER */}
            <div className='flex items-center gap-4 justify-end w-full'>
                <Button variant="outline" size="icon">
                    <FontAwesomeIcon icon={faCommentDots} />
                </Button>
                <Button variant="outline" size="icon">
                    <FontAwesomeIcon icon={faClockRotateLeft} />
                </Button>
                <Button variant="outline" size="icon">
                    <FontAwesomeIcon icon={faCircleQuestion} />
                </Button>
                <div className='flex items-center justify-center cursor-pointer relative'>
                    <Button variant="outline" size="icon">
                        <FontAwesomeIcon icon={faBell} />
                    </Button>
                    <div className='absolute -top-1 -right-1 w-3 h-3 flex items-center justify-center bg-red-500 text-white rounded-full text-xs'></div>
                </div>
                <div className='flex flex-col'>
                    <span className="text-xs leading-3 font-medium"> {session?.user.name} </span>
                    <span className="text-[10px] text-gray-500 text-right">MauNgopi</span>
                </div>
                {/* <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full" /> */}
                <Button variant="outline" size="icon">
                        <FontAwesomeIcon icon={faUser} />
                    </Button>
                {session?.user ? (
                    <UserAccountNav />
                ) : (
                    <Link className={buttonVariants()} href='/sign-in'>
                        Sign in
                    </Link>
                )}

            </div>
        </div>
    )
}

export default Navbar