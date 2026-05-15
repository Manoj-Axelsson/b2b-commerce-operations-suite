import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkIsAdmin } from "@/lib/utils";

export default async function AdminHomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAdmin = checkIsAdmin(session?.user);
  if (!session || !isAdmin) {
    redirect("/login");
  }

  redirect("/admin/inventory");
}
