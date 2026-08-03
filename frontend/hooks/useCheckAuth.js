import useMe from "./useMe"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default () => {
    const [user, isLoading] = useMe();
    
    const router = useRouter();

    useEffect(() => {
        if(isLoading && !user){
            router.replace("/");
        }
    }, [user, isLoading]);
}