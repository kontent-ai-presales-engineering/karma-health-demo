import { FC } from "react";
import { Link } from "react-router-dom";

const Logo: FC = () => (
  <Link to="/">
    <div className="flex gap-4 items-center">
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="14" y="13" fill="#993265" rx="2.4px" />
        <rect width="14" height="40" x="13" fill="#993265" rx="2.4px" />
      </svg>
      <p className="text-5xl pt-1 text-azure font-libre font-bold text-nowrap">Karma Health</p>
    </div>
  </Link>
);

export default Logo;