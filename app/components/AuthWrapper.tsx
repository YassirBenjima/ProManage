import React from "react";
import Image from "next/image";
import { FolderGit } from "lucide-react";

type WrapperProps = {
  children: React.ReactNode;
};

const AuthWrapper = ({ children }: WrapperProps) => {
  // Here you can add authentication logic if needed
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-primary text-primary-content rounded-full p-2">
          <FolderGit className="w-8 h-8" />
        </div>
        <span className="text-3xl ml-3">
          Pro <span className="text-primary font-bold">Manage</span>
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default AuthWrapper;
