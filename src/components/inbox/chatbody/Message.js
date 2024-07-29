export default function Message({ justify, message }) {
    return (
        <li className={`flex justify-${justify} `}>
            <div className={`relative max-w-xl px-4 py-2 ${justify === 'end' && 'bg-violet-700'} rounded-lg text-gray-700 shadow`}>
                <span className={`block ${justify === "end" && ' text-white'}`}>{message}</span>
            </div>
        </li>
    );
}
