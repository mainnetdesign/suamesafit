import React, {useEffect, useRef, useState} from 'react';
import {
  RiLuggageCartLine,
  RiMenuLine,
  RiSearch2Line,
  RiShoppingBasketLine,
  RiUser3Line,
} from 'react-icons/ri';
import {Link} from '@remix-run/react';
import {useAside} from './Aside';
import ProfileDropdown from "app/assets/components/custom/ProfileDropdown";

const HeaderNew = ({ cartCount, shopId }: { cartCount?: number, shopId: string }) => {
  const [collapsed, setCollapsed] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const { open } = useAside();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Simulação de login (troque por seu contexto real depois)
  const isLoggedIn = false; // Troque para true para testar o outro menu
  const userEmail = "navalservice1@gmail.com";

  const toggleDropdown = () => {
    setShowAccountMenu((v) => !v);
  };

  const closeDropdown = () => {
    setShowAccountMenu(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setCollapsed(true); // scrolling down
          } else {
            setCollapsed(false); // scrolling up
          }
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        profileButtonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }
    if (showAccountMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAccountMenu]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Initial check
    handleResize(mediaQuery);

    // Add listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleResize);
    } else {
      // Safari
      /* @ts-ignore */
      mediaQuery.addListener(handleResize);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleResize);
      } else {
        /* @ts-ignore */
        mediaQuery.removeListener(handleResize);
      }
    };
  }, []);

  /* ---------- BAR WIDTH LOGIC ---------- */
  const barClasses = collapsed
    ? 'w-24 px-5 py-4'
    : isMobile
      ? 'w-full px-5 py-4'
      : 'w-full md:max-w-[calc(100vw-152px)] px-5 py-4';

  const barStyle: React.CSSProperties = isMobile
    ? {} // mobile – no minWidth to avoid shrinking below 90%
    : {minWidth: collapsed ? '96px' : '320px'}; // desktop fallback

  return (
    <header className="header-appear w-[90%] md:w-full left-1/2 -translate-x-1/2 md:max-w-[934px] h-24 fixed top-[20.28px] z-40">
      <div className="w-full h-24 relative flex items-center justify-center">
        {/* Animated yellow bar, centered and collapses from center */}
        <div
          className={`absolute top-[20.28px] left-1/2 -translate-x-1/2 mx-auto flex flex-col justify-center items-center transition-all duration-1000 ease-in-out bg-yellow-500 rounded-[40px] z-10 ${barClasses}`}
          style={barStyle}
        >
          {/* Menu and icons fade/scale out when collapsed */}
          <div
            className={`w-full inline-flex justify-between items-center transition-all duration-1000
              ${
                collapsed
                  ? 'overflow-visible opacity-0 scale-75 pointer-events-none'
                  : 'overflow-visible opacity-100 scale-100'
              }
            `}
            style={{transitionProperty: 'opacity, transform'}}
          >
            {/* Left side: Navigation links or hamburger */}
            {isMobile ? (
              <div>
                <button onClick={() => open('mobile')} className="p-2">
                  <RiMenuLine className="w-6 h-6 text-text-sub-600" />
                </button>
              </div>
            ) : (
              <div className="flex justify-start items-center gap-4">
                <a href="/collections/all">
                  <div className="justify-start text-text-sub-600 text-sm font-semibold font-sans leading-tight">
                    cardápio
                  </div>
                </a>
                <div className="justify-start text-text-sub-600 text-sm font-semibold font-sans leading-tight opacity-40">
                  parcerias
                </div>
                <div className="justify-start text-text-sub-600 text-sm font-semibold font-sans leading-tight opacity-40">
                  blog
                </div>
                <div className="justify-start text-text-sub-600 text-sm font-semibold font-sans leading-tight opacity-40">
                  sobre
                </div>
                {/* <Link to="/about" className="justify-start text-text-sub-600 text-sm font-semibold font-sans leading-tight">
                  sobre
                </Link> */}
              </div>
            )}

            {/* Right side icons */}
            <div className="flex justify-start items-center gap-3.5 relative">
              <Link
                to="/cart"
                className="w-8 relative"
                onClick={(e) => {
                  e.preventDefault();
                  open('cart');
                }}
              >
                <RiShoppingBasketLine className="w-5 h-5 text-text-sub-600" />
                {typeof cartCount === 'number' && cartCount > 0 && (
                  <span className="absolute -top-1 left-4 bg-blue-600 text-text-white-0 rounded-full px-1.5 py-0.5 text-label-xs  min-w-[16px] text-center overflow-visible ">
                    {cartCount}
                  </span>
                )}
              </Link>
              {/* Botão de busca */}
              <button onClick={() => open('search')} className="p-2">
                <RiSearch2Line className="w-5 h-5 text-text-sub-600" />
              </button>
              {!isMobile && (
                <div className="relative">
                  <ProfileDropdown
                    onLoginClick={() => (window.location.href = '/account/login')}
                    onOrdersClick={() => (window.location.href = 'https://perfil.suamesafit.com/')}
                    onProfileClick={() => (window.location.href = '/account/profile')}
                    className="w-8 h-8 flex items-center justify-center cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Center logo always visible, above the bar */}
        <div className="w-24 h-24 left-1/2 -translate-x-1/2 top-0 absolute bg-yellow-500 rounded-[100px] flex items-center justify-center z-20">
          <a href="/" className="flex items-center justify-center">
            <div
              data-svg-wrapper
              className="left-[11.50px] top-[55.33px] absolute"
            >
              <svg
                width="75"
                height="31"
                viewBox="0 0 75 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M60.372 21.3583C66.4473 16.4099 70.9295 9.49451 72.8043 1.42655H2.20068C4.07552 9.49451 8.55772 16.415 14.633 21.3583C20.9184 26.4757 28.9146 29.4877 37.5051 29.4877C46.0955 29.4877 54.0866 26.4757 60.3771 21.3583M74.3257 0.878437C72.5072 9.61745 67.7535 17.1117 61.2326 22.4186C54.7065 27.7307 46.408 30.8605 37.4999 30.8605C28.5919 30.8605 20.2934 27.7358 13.7673 22.4186C7.24635 17.1117 2.49266 9.61745 0.674164 0.878437L0.5 0.0537109C25.1649 0.0537109 49.8298 0.0537109 74.4948 0.0537109L74.3206 0.878437H74.3257Z"
                  fill="#363880"
                />
              </svg>
            </div>
            <div
              data-svg-wrapper
              className="left-[29.98px] top-[55.90px] absolute"
            >
              <svg
                width="45"
                height="20"
                viewBox="0 0 45 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M44.5189 1.02186C42.8131 6.49783 39.4271 11.0978 35.032 14.3353C30.6369 17.5676 25.2378 19.4373 19.5057 19.4373C16.0377 19.4373 12.6313 18.7458 9.48091 17.4395C6.33056 16.1333 3.43123 14.2175 0.977539 11.7638L1.95081 10.7905C4.28156 13.1213 7.02211 14.9398 10.0034 16.1743C12.9847 17.4088 16.2119 18.0645 19.5057 18.0645C24.9407 18.0645 30.0581 16.2972 34.2227 13.2339C38.3873 10.1707 41.594 5.8063 43.2076 0.617188L44.5189 1.02699V1.02186Z"
                  fill="#363880"
                />
              </svg>
            </div>
            <div
              data-svg-wrapper
              className="left-[13.28px] top-[23.61px] absolute"
            >
              <svg
                width="19"
                height="30"
                viewBox="0 0 19 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.55978 8.39194C10.1181 8.83248 10.6919 9.03226 11.2758 8.98615C11.8649 8.94517 12.3567 8.66856 12.7614 8.15119C13.166 7.63894 13.3197 7.0857 13.2224 6.49149C13.1251 5.89728 12.8023 5.38503 12.2542 4.95473C11.6959 4.5142 11.117 4.31954 10.5177 4.36564C9.91835 4.41174 9.41634 4.69861 9.00654 5.22111C8.60186 5.73336 8.45844 6.28146 8.56601 6.86543C8.67871 7.4494 9.00654 7.95653 9.55465 8.38682M14.9384 3.91486C15.1741 4.09927 15.3995 4.17611 15.6146 4.14026C15.8297 4.1044 16.0141 3.99682 16.1627 3.80729C16.2754 3.66386 16.3574 3.46408 16.4086 3.21307L18.1451 3.92511C18.1195 4.59104 17.8992 5.18525 17.4894 5.70775C17.1565 6.13291 16.7518 6.41465 16.2703 6.5632C15.7888 6.71176 15.3021 6.67078 14.8104 6.44539C15.046 6.99862 15.1126 7.57234 15.0101 8.16656C14.9077 8.76077 14.6311 9.34473 14.1854 9.91333C13.6732 10.5639 13.0687 11.0095 12.3618 11.2606C11.6549 11.5064 10.9275 11.5525 10.1745 11.3886C9.42148 11.2247 8.70433 10.8815 8.02815 10.3487C7.35198 9.816 6.84485 9.20642 6.50677 8.52C6.16868 7.82846 6.03037 7.11644 6.10208 6.37879C6.1738 5.64115 6.4709 4.93937 6.9934 4.26832C7.4032 3.74582 7.85399 3.37188 8.34575 3.14649C8.83751 2.9211 9.31902 2.8545 9.79541 2.95183L8.86311 2.21931L10.3487 0.329102L14.9282 3.93023L14.9384 3.91486ZM11.6293 13.622L10.8558 15.9016L9.66735 15.4969C9.98495 15.9169 10.1898 16.3523 10.2872 16.8031C10.3845 17.2539 10.3333 17.7713 10.1335 18.3552C9.84152 19.2107 9.34463 19.8305 8.64285 20.2096C7.94106 20.5887 7.06512 20.604 6.02525 20.2506L0.667083 18.4372L1.46108 16.0911L6.34797 17.7457C6.84485 17.9147 7.25977 17.9249 7.58761 17.7764C7.91545 17.6278 8.15108 17.3461 8.28939 16.9363C8.45843 16.4394 8.42258 15.9784 8.18182 15.5635C7.94106 15.1485 7.52613 14.8412 6.94217 14.6465L2.46509 13.1303L3.25909 10.7842L11.6293 13.6169V13.622ZM3.19761 22.8631C2.92611 23.1294 2.72122 23.4521 2.58292 23.821C2.43949 24.1898 2.36777 24.5484 2.35752 24.8916C2.34728 25.2143 2.3985 25.4653 2.51119 25.6446C2.62389 25.8239 2.7827 25.9161 3.00297 25.9212C3.22323 25.9263 3.3769 25.829 3.47423 25.6241C3.57156 25.4192 3.68938 25.0043 3.83281 24.3793C3.98649 23.7083 4.14016 23.1653 4.29383 22.7504C4.44751 22.3354 4.69852 21.9717 5.05197 21.6593C5.40543 21.3468 5.88694 21.1982 6.50677 21.2136C7.10098 21.229 7.62347 21.4031 8.07425 21.7361C8.52504 22.0691 8.86312 22.5198 9.09876 23.0936C9.32927 23.6673 9.43685 24.3076 9.42148 25.0196C9.40099 25.788 9.24218 26.5205 8.93483 27.2172C8.63261 27.9139 8.21256 28.5132 7.68494 29.0152L5.98426 27.668C6.39406 27.3094 6.71166 26.8586 6.93706 26.3156C7.16245 25.7726 7.28025 25.2502 7.29562 24.7584C7.30587 24.4254 7.25977 24.1693 7.16245 23.9798C7.06512 23.7954 6.91656 23.698 6.7219 23.6929C6.517 23.6878 6.35308 23.7851 6.24038 23.9798C6.12769 24.1795 6.00988 24.5381 5.89718 25.0606C5.75375 25.7214 5.60008 26.2747 5.43616 26.7254C5.27224 27.1762 4.99562 27.5604 4.61656 27.8934C4.23749 28.2212 3.72012 28.38 3.06443 28.3595C2.44461 28.3442 1.92722 28.1751 1.50206 27.8575C1.08201 27.5399 0.769543 27.1147 0.564642 26.5974C0.359742 26.0749 0.267527 25.5063 0.282895 24.8865C0.298262 24.2461 0.421208 23.6314 0.656844 23.0475C0.887357 22.4635 1.21521 21.9615 1.64037 21.5517L3.20786 22.8631H3.19761Z"
                  fill="#363880"
                />
              </svg>
            </div>
            <div
              data-svg-wrapper
              className="left-[31.60px] top-[13.35px] absolute"
            >
              <svg
                width="45"
                height="20"
                viewBox="0 0 45 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M36.1518 10.575C35.6601 11.0872 35.4091 11.6405 35.3937 12.2295C35.3783 12.8186 35.6089 13.336 36.0801 13.7868C36.5514 14.2376 37.0892 14.4425 37.6886 14.4066C38.2879 14.3656 38.8258 14.0941 39.3124 13.5921C39.8042 13.0799 40.0552 12.5215 40.0654 11.9222C40.0757 11.3229 39.84 10.7952 39.3585 10.3342C38.8873 9.88344 38.3545 9.68366 37.7654 9.74C37.1763 9.79635 36.6385 10.073 36.157 10.5801M40.0962 16.3532C39.8913 16.5683 39.7939 16.7835 39.8093 17.0037C39.8247 17.224 39.9169 17.4135 40.091 17.5826C40.2242 17.7106 40.4138 17.808 40.6597 17.8848L39.7888 19.5496C39.128 19.4574 38.5594 19.1859 38.0779 18.7249C37.6886 18.351 37.4427 17.9207 37.3403 17.4289C37.2378 16.9371 37.3249 16.4556 37.5964 15.9895C37.0227 16.1739 36.4489 16.1841 35.865 16.0253C35.281 15.8665 34.7278 15.5336 34.2053 15.0367C33.6059 14.4681 33.2218 13.8175 33.0425 13.0953C32.8632 12.3679 32.8888 11.6405 33.1244 10.9028C33.3601 10.1703 33.7699 9.489 34.3641 8.86918C34.9583 8.24935 35.614 7.79857 36.3311 7.52708C37.0483 7.25559 37.7757 7.18899 38.5031 7.3273C39.2305 7.47073 39.9015 7.82931 40.5162 8.4184C40.9977 8.87943 41.3256 9.36094 41.5049 9.87319C41.6842 10.3854 41.6995 10.8721 41.5561 11.3382L42.3757 10.4776L44.1174 12.1373L40.0962 16.3532ZM32.2485 6.36427C32.105 6.01081 31.895 5.69834 31.6082 5.42173C31.3213 5.15023 31.0242 4.94021 30.7117 4.79678C30.4197 4.66359 30.1687 4.61237 29.9587 4.6431C29.7487 4.67384 29.6001 4.79165 29.5079 4.98631C29.4157 5.18609 29.4465 5.3705 29.6001 5.53442C29.7487 5.70346 30.0868 5.97496 30.6093 6.3489C31.1676 6.75358 31.6082 7.10704 31.9309 7.40927C32.2536 7.71149 32.4892 8.08543 32.6378 8.53109C32.7863 8.97675 32.7351 9.47876 32.479 10.0474C32.2331 10.5903 31.8694 11.0053 31.3879 11.2921C30.9064 11.579 30.3583 11.7173 29.7384 11.7071C29.1186 11.6968 28.4886 11.5483 27.838 11.2563C27.1362 10.9387 26.5266 10.5084 26.0041 9.95516C25.4816 9.40193 25.0872 8.78722 24.8311 8.10593L26.7366 7.06093C26.9057 7.5783 27.1977 8.04446 27.6126 8.4645C28.0275 8.88455 28.4578 9.19702 28.9086 9.3968C29.2108 9.5351 29.467 9.59146 29.677 9.57609C29.887 9.5556 30.0304 9.45827 30.1124 9.2841C30.1995 9.09457 30.1687 8.91016 30.0355 8.73087C29.8972 8.55158 29.6104 8.30058 29.1698 7.99323C28.6166 7.60392 28.1658 7.24534 27.8175 6.9175C27.4692 6.58966 27.2182 6.18498 27.0645 5.70859C26.9108 5.23219 26.9672 4.69433 27.2387 4.10011C27.4948 3.53664 27.8482 3.12171 28.3093 2.86047C28.7703 2.5941 29.2774 2.47116 29.8358 2.48652C30.3941 2.50189 30.9576 2.63507 31.5211 2.8912C32.1051 3.15757 32.6224 3.51103 33.0681 3.95157C33.5137 4.3921 33.8467 4.88898 34.067 5.44221L32.2485 6.37451V6.36427ZM22.8128 3.9157C22.864 3.4137 22.7769 3.0039 22.5464 2.6863C22.3159 2.36871 21.9266 2.17405 21.3836 2.10234C20.8611 2.03574 20.4206 2.1177 20.0671 2.35333C19.7137 2.58385 19.4524 2.95779 19.2834 3.46492L22.8128 3.9157ZM19.0939 5.22707C19.2219 6.31816 19.8673 6.93799 21.0404 7.08654C21.9625 7.20436 22.7616 6.96361 23.4378 6.36939L24.4879 8.05982C23.3302 8.98699 22.0291 9.36094 20.5845 9.17653C19.6983 9.06384 18.9402 8.78209 18.3101 8.33131C17.68 7.88053 17.2241 7.30169 16.9373 6.58966C16.6504 5.87763 16.5685 5.07339 16.6812 4.17695C16.7938 3.29075 17.0807 2.51726 17.5366 1.86158C17.9976 1.20589 18.597 0.71925 19.3346 0.406776C20.0723 0.0943023 20.8919 -0.00302142 21.7883 0.114796C23.0177 0.268472 23.9295 0.770475 24.5237 1.61569C25.1231 2.46091 25.328 3.60836 25.1435 5.06315L25.0257 5.98521L19.0939 5.23219V5.22707ZM2.87083 3.06536L3.23966 4.15646C3.43943 3.13196 4.05414 2.44554 5.08377 2.09721C6.27731 1.69253 7.25572 1.91792 8.01897 2.77338C8.10093 2.19966 8.3212 1.71302 8.66953 1.31346C9.01786 0.913907 9.484 0.611682 10.0731 0.411903C10.9542 0.114797 11.7174 0.155778 12.3782 0.539966C13.0339 0.924155 13.5359 1.63618 13.8894 2.67606L15.7079 8.04958L13.3618 8.84356L11.6713 3.84399C11.5125 3.37784 11.2974 3.04488 11.0259 2.8451C10.7544 2.64532 10.4009 2.6197 9.96552 2.76826C9.51987 2.91681 9.22276 3.18319 9.07421 3.56738C8.92566 3.95157 8.95639 4.45357 9.16641 5.06827L10.7442 9.72464L8.39803 10.5186L6.70761 5.51905C6.54881 5.05291 6.33366 4.71994 6.06217 4.52017C5.79067 4.32039 5.43722 4.29477 5.0018 4.44332C4.55614 4.59188 4.25904 4.86337 4.11049 5.24243C3.96194 5.62662 3.99267 6.12863 4.20269 6.74334L5.78044 11.3997L3.43431 12.1937L0.601562 3.8235L2.88109 3.05L2.87083 3.06536Z"
                  fill="#363880"
                />
              </svg>
            </div>
            <div
              data-svg-wrapper
              className="left-[72.02px] top-[31.95px] absolute"
            >
              <svg
                width="14"
                height="8"
                viewBox="0 0 14 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.23483 2.16984L8.61902 2.01617C9.59742 1.63198 10.4836 1.61149 11.2725 1.97006C12.0613 2.32351 12.6351 2.95871 12.9937 3.87564C13.3113 4.685 13.383 5.54558 13.1986 6.45739L11.1239 6.29859C11.2213 5.85294 11.1905 5.43289 11.0368 5.03845C10.9088 4.71061 10.7141 4.47498 10.4529 4.33667C10.1967 4.19836 9.89452 4.19836 9.55643 4.33154L9.15688 4.49034L9.94062 6.47276L7.87625 7.28724L7.0925 5.30483L0.935245 7.73289L0.0234375 5.41239L6.1807 2.98433L5.58648 1.48342L7.65087 0.668945L8.24507 2.16984H8.23483Z"
                  fill="#363880"
                />
              </svg>
            </div>
            <div
              data-svg-wrapper
              className="left-[74.20px] top-[39.68px] absolute"
            >
              <svg
                width="14"
                height="6"
                viewBox="0 0 14 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.89335 1.23463L9.32877 3.67295L0.63073 5.22507L0.195312 2.78675L8.89335 1.23463ZM13.1041 1.74176C13.186 2.19254 13.1041 2.5921 12.8633 2.94555C12.6225 3.299 12.2896 3.50903 11.8593 3.58587C11.429 3.6627 11.0448 3.57562 10.6965 3.32974C10.3481 3.08386 10.1381 2.73553 10.0562 2.28475C9.9742 1.82372 10.0562 1.41392 10.2918 1.06559C10.5326 0.712134 10.8655 0.502111 11.2958 0.425273C11.7364 0.348435 12.1257 0.430398 12.4689 0.676279C12.8121 0.92216 13.0221 1.28073 13.1041 1.74176Z"
                  fill="#363880"
                />
              </svg>
            </div>
            <div
              data-svg-wrapper
              className="left-[74.62px] top-[45.08px] absolute"
            >
              <svg
                width="12"
                height="9"
                viewBox="0 0 12 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.64056 2.59562L11.8074 2.65196L11.7459 5.14151L9.5791 5.08516L9.51763 7.61056L7.29957 7.55421L7.36105 5.02881L4.23119 4.95198C3.78553 4.94173 3.44231 5.05442 3.20156 5.28494C2.9608 5.52057 2.83274 5.83817 2.82249 6.23773C2.81225 6.66289 2.93519 7.09318 3.18619 7.53884L1.33184 8.09207C0.834956 7.25198 0.599318 6.39652 0.62493 5.51033C0.650543 4.57291 0.947659 3.81989 1.51626 3.25642C2.08486 2.69294 2.86347 2.42145 3.847 2.44706L7.42252 2.53927L7.46862 0.802734L9.68666 0.859082L9.64056 2.59562Z"
                  fill="#363880"
                />
              </svg>
            </div>
            <div
              data-svg-wrapper
              className="left-[31.60px] top-[31.61px] absolute"
            >
              <svg
                width="33"
                height="34"
                viewBox="0 0 33 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.1254 33.5662C9.43206 32.5775 6.29707 30.4056 4.08926 27.5267C1.88146 24.6479 0.595703 21.0621 0.595703 17.2356C0.595703 12.569 2.48592 8.33779 5.54918 5.27965C8.60733 2.2215 12.8385 0.326172 17.5051 0.326172C20.5223 0.326172 23.4268 1.1304 25.9573 2.59544C28.4827 4.05536 30.6342 6.17096 32.1453 8.78345L30.9569 9.46474C29.5687 7.06228 27.5965 5.12084 25.2709 3.77874C22.9504 2.44177 20.2815 1.699 17.5051 1.699C13.2176 1.699 9.3296 3.43554 6.52246 6.2478C3.7102 9.06006 1.97366 12.9429 1.97366 17.2305C1.97366 20.7497 3.15185 24.0434 5.18549 26.6866C7.21401 29.3299 10.0929 31.3225 13.4891 32.2343L13.1356 33.5611L13.1254 33.5662Z"
                  fill="#363880"
                />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </header>
  );
};

export default HeaderNew;
