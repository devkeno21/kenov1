import { SignIn } from "@clerk/nextjs";
 
export default function Page() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <SignIn appearance={{
        elements: {
          footerAction : "hidden",
          formButtonPrimary:
              "bg-slate-500 hover:bg-slate-600 text-sm normal-case",
          
        }
      }}/>
    </div>
  );
}