import {forwardRef} from 'react';
import Magnetic from './magnect';
import {useStickyRef} from './sticky-ref-context';

const Header = function Header(props: React.HTMLProps<HTMLDivElement>) {
  const stickyRef = useStickyRef();
  return (
    <div
      className="fixed flex w-full justify-end p-2 box-border cursor-pointer mix-blend-difference z-10"
      {...props}
    >
      <Magnetic>
        <div className="relative flex flex-col gap-2 p-8 pointer-events-none">
          {/* Burger lines */}
          <div className="w-[30px] h-[2px] bg-white mix-blend-difference" />
          <div className="w-[30px] h-[2px] bg-white mix-blend-difference" />
          <div
            ref={stickyRef}
            className="absolute left-0 top-0 w-full h-full pointer-events-auto hover:scale-150 transition-transform duration-200"
          ></div>
        </div>
      </Magnetic>
    </div>
  );
};

export default Header; 