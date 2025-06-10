import React from 'react';
import SplitText from '~/components/react-bits/text-animations/SplitText/SplitText';
import {ScrollVelocity} from '~/components/react-bits/text-animations/ScrollVelocity/ScrollVelocity';
import {Link} from '@remix-run/react';
import pratoImage from '~/assets/about-us/1-NASUAMARMITA-THIAGOFARIAS-43.png';
import {useCursorColor} from '~/components/shad-cn/ui/CursorContext';
import * as Button from '~/components/align-ui/ui/button';

export function AboutUs() {
  const {setColor, setBorderColor} = useCursorColor();

  return (
    <section
      className="gap-8   relative flex flex-col items-center justify-center min-h-[70vh] py-32 bg-[#F9F6EC] overflow-hidden"
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
      <span className="text-title-h3 text-primary-base ">
          quem somos nós?
        </span>
      <div className="bg-orange-100 p-16 rounded-3xl relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto gap-5">
        <div className="w-full flex flex-col items-center absolute top-1/2 -translate-y-[45%]">
          <ScrollVelocity
            texts={[
              (
                <SplitText
                  text="sabores leves que nutrem sua rotina"
                  repeat={2}
                  repeatDelay={150}
                  className="text-title-h1 text-primary-base"
                />
              ) as unknown as string,
            ]}
            velocity={60}
            className="text-title-h1 text-primary-base text-center"
            numCopies={2}
            parallaxClassName="mb-4"
          />
        </div>
        

        <div className="w-full overflow-hidden shadow-lg ">
          <img
            src={"images/equipe.png"}
            alt="Prato saudável"
            className="object-cover w-full h-full rounded-lg  aspect-[492/326.47]"
            loading="lazy"
          />
        </div>
        
      </div>
      <p className="w-[296px] text-paragraph-lg text-center justify-start text-text-sub-600">
        Janaina e Erika são duas profissionais apaixonadas que se uniram em um projeto incrível: a criação de marmitas fitness saudáveis e saborosas
        </p>
        {/* <Button.Root>
          saber mais
        </Button.Root> */}
    </section>
  );
}

export default AboutUs;
  