import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 4C6.895 4 6 4.895 6 6V34C6 35.105 6.895 36 8 36H32C33.105 36 34 35.105 34 34V6C34 4.895 33.105 4 32 4H8ZM8 2C5.791 2 4 3.791 4 6V34C4 36.209 5.791 38 8 38H32C34.209 38 36 36.209 36 34V6C36 3.791 34.209 2 32 2H8Z"
            />
            <path d="M10 10H30V12H10V10Z" />
            <path d="M10 16H26V18H10V16Z" />
            <path d="M10 22H28V24H10V22Z" />
            <path d="M10 28H24V30H10V28Z" />
            <circle cx="30" cy="30" r="6" fill="currentColor" opacity="0.2" />
            <path d="M28 30C28 28.895 28.895 28 30 28C31.105 28 32 28.895 32 30C32 31.105 31.105 32 30 32C28.895 32 28 31.105 28 30Z" />
        </svg>
    );
}
