import { FC } from "react";

type MicrositeFooterProps = {
  title: string;
};

const MicrositeFooter: FC<MicrositeFooterProps> = ({ title }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-libre font-semibold">{title}</p>
          <p className="text-sm text-gray-400">
            &copy; {currentYear} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default MicrositeFooter;
