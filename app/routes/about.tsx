import {Image, Video} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';
import testimonial1 from '../assets/about-us/hero.jpg';
import erikaImage from '../assets/about-us/erika.jpg';
import janainaImage from '../assets/about-us/janaina.jpg';

export default function About() {
  const [activeId, setActiveId] = useState('saude');

  const handleTocClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
      setActiveId(id);
      // Atualiza o hash sem recarregar
      history.replaceState(null, '', `#${id}`);
    }
  };

  useEffect(() => {
    const ids = ['saude', 'praticidade', 'transparencia'];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      {root: null, rootMargin: '-45% 0px -45% 0px', threshold: 0.01},
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <div className="about scroll-smooth">
      <div className="hero py-16 flex flex-col items-center justify-center">
        <div className="container  max-w-[1200px]">
          <h1 className="text-title-h1 text-center text-text-sub-600">
            juntos por uma alimentação saudável, prática e cheia de sabor para
            você!
          </h1>
          <Image
            className="rounded-3xl"
            src={testimonial1}
            alt="Testimonial 1"
          />
        </div>
      </div>

      {/* o que é a sua mesa fit? */}
      <div className="flex flex-col items-center justify-center">
        <div className="container  max-w-[1200px]">
          <h1 className="text-title-h1 text-center text-text-sub-600">
            o que é a sua mesa fit?
          </h1>
        </div>
      </div>

      {/* quem somos nós? */}
      <div className="py-16 bg-cream">
        <div className="container max-w-[1200px] mx-auto">
          <h2 className="text-title-h2 text-center text-text-sub-600 mb-12">
            quem somos nós?
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* 1st Person */}
            <div className="flex flex-col items-center">
                             <div className="w-full h-[300px] rounded-lg overflow-hidden mb-6">
                 <Image
                   src={erikaImage}
                   alt="Erika Kenzler - Fundadora e CEO"
                   className="w-full object-top"
                 />
               </div>
              <h4 className="w-full text-title-h5 text-left font-semibold text-text-sub-600 mb-4">
                Erika Kenzler
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 text-left">
                <div>
                  <p>
                    Fundadora e CEO, apaixonada por alimentação saudável e
                    inovação.
                  </p>
                </div>
                <div>
                  <p>
                    Lidera o desenvolvimento de novos produtos e a experiência
                    do cliente.
                  </p>
                </div>
              </div>
            </div>

            {/* 2nd Person */}
            <div className="flex flex-col  items-center">
                             <div className="w-full h-[300px] rounded-lg overflow-hidden mb-6">
                 <Image
                   src={janainaImage}
                   alt="Janaína Cipriano - Co-fundadora e Diretora de Operações"
                   className="w-full object-top"
                 />
               </div>
              <h4 className="w-full text-title-h5 text-left font-semibold text-text-sub-600 mb-4">
                Janaína Cipriano
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 text-left">
                <div>
                  <p>
                    Co-fundadora e Diretora de Operações, responsável pela
                    gestão da produção
                  </p>
                </div>
                <div>
                  <p>
                    e logística, garantindo qualidade e pontualidade nas
                    entregas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* valores / toc + conteúdo */}
      <div className="py-20">
        <div className="container max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[400px_minmax(0,1fr)] items-start gap-4">
          {/* TOC (esquerda) */}
          <aside className="md:sticky md:top-24 h-max bg-transparent shadow-none md:w-[400px]">
            <nav aria-label="Conteúdo">
              <ul className="space-y-8">
                {[
                  {
                    id: 'saude',
                    title: 'Saúde em Primeiro Lugar',
                    desc:
                      'Marmitas feitas por nutricionistas, com ingredientes frescos e naturais.',
                  },
                  {
                    id: 'praticidade',
                    title: 'Praticidade com Sabor',
                    desc:
                      'Refeições equilibradas, prontas e deliciosas para facilitar seu dia a dia.',
                  },
                  {
                    id: 'transparencia',
                    title: 'Transparência e Confiança',
                    desc:
                      'Ingredientes e informações nutricionais claras para escolhas seguras.',
                  },
                ].map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => handleTocClick(e, item.id)}
                      className={`group block pl-4 border-l-2 bg-transparent shadow-none hover:bg-transparent no-underline hover:no-underline transition-none ${
                        activeId === item.id
                          ? 'border-[#E26438] text-text-sub-600 opacity-100'
                          : 'border-gray-300 text-text-sub-600 opacity-50'
                      }`}
                    >
                      <h4 className="text-title-h5 mb-2">{item.title}</h4>
                      <p className="text-sm text-current/80">{item.desc}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Conteúdo (direita) */}
          <div className="w-full min-w-0 space-y-24">
            <section id="saude" className="scroll-mt-28">
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src={testimonial1}
                  alt="Prato saudável"
                  className="w-full h-[320px] md:h-[460px] object-cover object-top"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <h3 className="text-title-h3 text-text-sub-600">Saúde em Primeiro Lugar</h3>
                <p className="text-text-sub-500">
                  Na sua marmitafit, acreditamos que uma alimentação saudável transforma vidas. Nossos pratos são
                  desenvolvidos por nutricionistas e preparados com ingredientes frescos e naturais, sem conservantes
                  ou aditivos artificiais.
                </p>
              </div>
            </section>

            <section id="praticidade" className="scroll-mt-28">
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src={testimonial1}
                  alt="Praticidade com sabor"
                  className="w-full h-[320px] md:h-[460px] object-cover object-top"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <h3 className="text-title-h3 text-text-sub-600">Praticidade com Sabor</h3>
                <p className="text-text-sub-500">
                  Queremos facilitar o seu dia a dia sem abrir mão do sabor. Nossas marmitas são práticas, equilibradas e
                  deliciosas, ideais para uma rotina mais leve e nutritiva.
                </p>
              </div>
            </section>

            <section id="transparencia" className="scroll-mt-28">
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src={testimonial1}
                  alt="Transparência e confiança"
                  className="w-full h-[320px] md:h-[460px] object-cover object-top"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <h3 className="text-title-h3 text-text-sub-600">Transparência e Confiança</h3>
                <p className="text-text-sub-500">
                  Valorizamos a confiança: informamos ingredientes e valores nutricionais de cada prato para escolhas
                  conscientes e seguras.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
