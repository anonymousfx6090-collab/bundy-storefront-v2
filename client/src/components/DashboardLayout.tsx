import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { ArrowUpRight, LayoutDashboard, LogOut, Store } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation } from "wouter";

const menuItems = [{ icon: LayoutDashboard, label: "Catalog", path: "/admin" }, { icon: Store, label: "Storefront", path: "/" }];

export default function DashboardLayout({ children, requireClientAdmin = false }: { children: React.ReactNode; requireClientAdmin?: boolean }) {
  const { loading, user, logout } = useAuth();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const clientSignIn = trpc.clientAdminAuth.signIn.useMutation({
    onSuccess: async () => {
      setPassword("");
      setSignInError("");
      await utils.auth.me.invalidate();
    },
    onError: () => setSignInError("The email or password is not recognised."),
  });
  const [location, setLocation] = useLocation();
  const submitClientSignIn = (event: FormEvent) => {
    event.preventDefault();
    setSignInError("");
    clientSignIn.mutate({ email, password });
  };
  if (loading) return <div className="grid min-h-screen place-items-center bg-[#fffaf0]"><p className="bundy-label animate-pulse text-sm">Loading studio...</p></div>;
  if (!user || (requireClientAdmin && user.role !== "admin")) return <div className="grid min-h-screen place-items-center bg-[#fffaf0] p-4"><div className="max-w-md border-2 border-black bg-white p-8 shadow-[8px_8px_0_#155ec9]"><div className="mx-auto grid h-12 w-12 grid-cols-2 border-2 border-black"><span className="bg-[#e33d2d]" /><span className="bg-[#155ec9]" /><span className="bg-[#f0bd22]" /><span className="bg-black" /></div><div className="mt-6 text-center"><p className="bundy-label text-[10px] text-[#e33d2d]">Restricted area</p><h1 className="bundy-display mt-2 text-4xl uppercase">Client<br />admin.</h1><p className="mt-4 text-sm text-neutral-600">Use the pre-created client email and password. There is no public account registration.</p></div><form onSubmit={submitClientSignIn} className="mt-7 space-y-4"><label className="block text-sm font-bold">Email<input required autoComplete="username" type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 h-12 w-full border-2 border-black bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#155ec9]" /></label><label className="block text-sm font-bold">Password<input required autoComplete="current-password" type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 h-12 w-full border-2 border-black bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#155ec9]" /></label>{signInError && <p className="border-l-4 border-[#e33d2d] bg-[#fff0ed] p-3 text-sm">{signInError}</p>}<Button disabled={clientSignIn.isPending} type="submit" className="h-12 w-full rounded-none border-2 border-black bg-black text-white hover:bg-[#e33d2d]">{clientSignIn.isPending ? "Signing in..." : "Sign in"}</Button></form></div></div>;
  return <SidebarProvider><Sidebar className="border-r-2 border-black bg-[#fffaf0]"><SidebarHeader className="h-20 border-b-2 border-black px-4"><button onClick={() => setLocation("/")} className="flex items-center gap-3 text-left"><span className="grid h-8 w-8 grid-cols-2 border-2 border-black"><span className="bg-[#e33d2d]" /><span className="bg-[#155ec9]" /><span className="bg-[#f0bd22]" /><span className="bg-black" /></span><span><span className="bundy-display block text-xl uppercase">Bundy</span><span className="bundy-label text-[9px]">Owner studio</span></span></button></SidebarHeader><SidebarContent className="p-3"><SidebarMenu>{menuItems.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={location === item.path} onClick={() => setLocation(item.path)} className="h-11 rounded-none border-2 border-transparent px-3 font-bold data-[active=true]:border-black data-[active=true]:bg-[#f0bd22] hover:border-black"><item.icon className="h-4 w-4" /><span>{item.label}</span>{item.path === "/" && <ArrowUpRight className="ml-auto h-3.5 w-3.5" />}</SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter className="border-t-2 border-black p-3"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 text-left"><Avatar className="h-9 w-9 rounded-none border-2 border-black"><AvatarFallback className="rounded-none bg-[#155ec9] text-white">{user.name?.charAt(0).toUpperCase() || "O"}</AvatarFallback></Avatar><span className="min-w-0"><span className="block truncate text-sm font-bold">{user.name || "Owner"}</span><span className="bundy-label block truncate text-[9px]">{user.role}</span></span></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="rounded-none border-2 border-black"><DropdownMenuItem onClick={logout} className="cursor-pointer font-bold text-[#e33d2d]"><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter></Sidebar><SidebarInset className="bg-[#fffaf0]"><main className="min-h-screen p-4 sm:p-7">{children}</main></SidebarInset></SidebarProvider>;
}
