import React from "react";

export function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

export function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
export function ThemiracleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            width="24"
            height="24"
            version="1.1"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">

            <g transform="translate(-4.0345 -2.475)" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16.034 14.475c-1-4-6-6-9-3-3 3 1.0625 10.861 9 12.96 7.9375-2.2381 11-9.9597 9-12.96-2-3-8-1-9 3z" strokeWidth="2" />
                <ellipse cx="16.034" cy="5.9407" rx="7.033" ry="1.4657" strokeWidth="2" />
            </g>
        </svg>
    )
}
export function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}

export function Spinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl", className?: string }) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
        xl: "h-16 w-16"
    };

    const containerClasses = {
        sm: "p-2",
        md: "p-4",
        lg: "p-6",
        xl: "p-8"
    };

    return (
        <div className={`flex items-center justify-center ${containerClasses[size]} ${className}`}>
            <div className="relative">
                {/* Outer rotating ring */}
                <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 border-t-transparent animate-spin`}></div>

                {/* Inner pulsing dot */}
                <div className={`absolute inset-0 flex items-center justify-center`}>
                    <div className={`${size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : size === "lg" ? "w-3 h-3" : "w-4 h-4"} bg-linear-to-r from-purple-500 to-blue-500 rounded-full animate-pulse`}></div>
                </div>

                {/* Gradient border overlay */}
                <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-transparent bg-linear-to-r from-purple-500 via-blue-500 to-purple-500 animate-spin`}
                    style={{
                        background: `conic-gradient(from 0deg, transparent, rgba(147, 51, 234, 0.8), transparent)`,
                        mask: `radial-gradient(circle, transparent 60%, black 61%, black 100%)`,
                        WebkitMask: `radial-gradient(circle, transparent 60%, black 61%, black 100%)`
                    }}>
                </div>
            </div>
        </div>
    );
}

export function Logo() {
    return (
        <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="text-gray-100"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="100%" height="100%" rx="16" fill="currentColor" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
                fill="black"
            />
        </svg>
    );
}