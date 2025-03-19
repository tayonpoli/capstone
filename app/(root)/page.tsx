import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation";

const page = async () => {
  const session = await getServerSession(authOptions);
  console.log(session);
  if (session?.user) {
    return (
      <div>welcome {session?.user.name} </div>
    )
  } else {
    redirect("/api/auth/signin")
  }
}

export default page