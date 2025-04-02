import { useParams } from "next/navigation";

export const useInviteCode = () => {
    const params = useParams();
    return params.inviteCode as string; // Fixed from InviteCode to inviteCode to match the URL param
};
