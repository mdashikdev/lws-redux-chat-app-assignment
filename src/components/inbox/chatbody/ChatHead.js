import getAvatar from "gravatar-url";
import { useSelector } from "react-redux";

export default function ChatHead({ message }) {
    const { user } = useSelector((state) => state.auth) || {};
    const { sender, receiver } = message || {};

    const partnerEmail = sender?.email === user?.email ? receiver?.email : sender?.email;
    const partnerName = sender?.email === user?.email ? receiver?.name : sender?.name;

    return (
        <div className="relative flex items-center p-3 border-b border-gray-300">
            {/* <img
                className="object-cover w-10 h-10 rounded-full"
                src={getAvatar(partnerEmail || "test@gmail.com", {
                    size: 80,
                })}
                alt={partnerName}
            /> */}
            <span className="block ml-2 font-bold text-gray-600">
                {partnerName}
            </span>
        </div>
    );
}
