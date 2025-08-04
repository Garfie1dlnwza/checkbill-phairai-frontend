import React from "react";
import { navbarItems } from "@/constants/navbarItem";

export default function Navbar() {
  return (
    <nav className="border rounded-2xl mt-5 border-white/30 mx-auto max-w-2xl shadow-md flex py-4 justify-center backdrop-blur-xl shadow-2xl relative ">
      <div className="">
        {navbarItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className=" text-white hover:text-gray-400 font-semibold mx-10"
          >
            {item.title}
          </a>
        ))}
      </div>
    </nav>
  );
}
