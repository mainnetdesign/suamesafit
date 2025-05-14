import React from 'react';
import SplitText from '~/components/react-bits/text-animations/SplitText/SplitText';
import {ScrollVelocity} from '~/components/react-bits/text-animations/ScrollVelocity/ScrollVelocity';
import {Link} from '@remix-run/react';
import pratoImage from '~/assets/about-us/1-NASUAMARMITA-THIAGOFARIAS-43.png';
import {useCursorColor} from '~/components/shad-cn/ui/CursorContext';

export function AboutUs() {
  const {setColor, setBorderColor} = useCursorColor();

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[70vh] py-32 bg-[#F9F6EC] overflow-hidden"
      onMouseEnter={() => {
        setColor('#DF5627');
        setBorderColor('#303172');
      }}
      onMouseLeave={() => {
        setColor('black');
        setBorderColor('#303172');
      }}
    >
      {/* Ornamentos laterais (simples, pode ser SVG ou divs absolutas se necessário) */}
      <div className="block absolute left-0 top-1/4 z-0">
        {/* Ornamento esquerdo */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M60 0C93.1371 0 120 26.8629 120 60C120 93.1371 93.1371 120 60 120C26.8629 120 0 93.1371 0 60C0 26.8629 26.8629 0 60 0Z"
            fill="#D96B2B"
            fillOpacity="0.18"
          />
        </svg>
      </div>
      <div className=" block absolute right-0 bottom-0 z-0">
        {/* Ornamento direito */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M60 0C93.1371 0 120 26.8629 120 60C120 93.1371 93.1371 120 60 120C26.8629 120 0 93.1371 0 60C0 26.8629 26.8629 0 60 0Z"
            fill="#D96B2B"
            fillOpacity="0.18"
          />
        </svg>
      </div>
      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto px-4 gap-5">
        <div className="w-full flex flex-col items-center absolute top-1/2 -translate-y-[45%]">
          <ScrollVelocity
            texts={[
              (
                <SplitText
                  text="sabores leves que nutrem sua rotina"
                  repeat={2}
                  repeatDelay={150}
                  className="text-3xl font-bold text-[#DF5627]"
                />
              ) as unknown as string,
            ]}
            velocity={60}
            className="!text-[2.2rem] md:!text-[2.8rem] font-semibold text-[#D96B2B] leading-tight text-center"
            numCopies={2}
            parallaxClassName="mb-4"
          />
        </div>
        <span className="self-stretch text-center justify-start text-black text-[26px] font-normal font-sans leading-[18px]">
          who we are
        </span>

        <div className="w-[296px] h-[326.475px] overflow-hidden shadow-lg ">
          <img
            src={pratoImage}
            alt="Prato saudável"
            className="object-cover w-full h-full rounded-lg  aspect-[296.00/326.47]"
            loading="lazy"
          />
        </div>
        <p className="w-[296px] text-center justify-start text-[#303172] text-base font-medium font-sans leading-[19px]">
          experimente refeições saudáveis, práticas e saborosas, preparadas com
          ingredientes naturais e pensadas para facilitar o seu dia a dia. Cada
          marmita é criada para elevar seu bem-estar, trazendo equilíbrio e
          praticidade para sua alimentação.
        </p>
        <Link
          to="/collections/limited-offer"
          className="bg-[#df5627] h-[30px] hover:bg-[#b95a22] text-white rounded-[10px] p-2.5 text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#D96B2B] focus:ring-offset-2 inline-flex justify-center items-center gap-1 overflow-hidden"
        >
          <div className="px-1 flex justify-center items-center">
            <div className="justify-center text-white text-sm font-medium font-sans leading-tight">
              ver opções
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default AboutUs;
