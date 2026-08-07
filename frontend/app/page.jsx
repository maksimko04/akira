"use client"

import Lending from "@/components/NoAuth/Lending";
import Header from "../components/NoAuth/Header";
import useMe from "@/hooks/useMe";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default () => {
  const [user, isLoading] = useMe();

  const router = useRouter();

  useEffect(() => {
    if(!isLoading && user){
      router.replace("/chats/");
    }
  }, [isLoading, user, router]);

  if(isLoading || user){
    return (<p>Wait...</p>)
  }

  return (<>
    <Header />
    <Lending />
  </>)
}
//ToDo... Make waiting page