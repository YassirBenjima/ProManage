import React, { FC } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

interface UserInfoProps {
  role: string;
  email: string | null;
  name: string | null;
}

const UserInfo: FC<UserInfoProps> = ({ role, email, name }) => {
  const { user } = useUser();

  return (
    <div className="flex items-center">
      <div className="avatar">
        <div className="ring-primary ring-offset-base-100 w-9 rounded-full ring ring-offset-2 ">
          <Image
            src={user?.imageUrl || "/profile.avif"}
            alt={"profile image"}
            height={500}
            width={500}
          />
        </div>
      </div>
      <div className="flex flex-col ml-4">
        <span className="text-xs text-gray-400">{role}</span>
        <span className="text-sm">{email || ""}</span>
        <span className="text-sm italic font-bold ">{name || ""}</span>
      </div>
    </div>
  );
};

export default UserInfo;
