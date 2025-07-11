import React from 'react';
import {Link} from '@remix-run/react';
import {RiInstagramLine} from 'react-icons/ri';

export function Footer({
  collections = [],
}: {
  collections?: {id: string; title: string; handle: string}[];
}) {
  return (
    <footer className="bg-yellow-500 w-full py-16 px-4">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Coluna 1 */}
        <div className="flex flex-col gap-6 min-w-[260px]">
          <div className="text-[2.5rem] text-text-sub-600 leading-none">
            sua <span className="font-normal">mesa fit</span>
          </div>
          <div className="text-text-sub-600 text-lg leading-snug">
            comida saudável, prática e saborosa
            <br />
            para o seu dia a dia.
          </div>
          <div className="flex flex-row gap-4 mt-2">
            {/* Ícones sociais (apenas placeholders) */}
            <Link
              to="https://instagram.com/suamesa.fit/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <RiInstagramLine className="w-6 h-6 text-text-sub-600" />
            </Link>
          </div>
        </div>
        {/* Coluna 2 */}
        <div className="flex flex-row flex-wrap gap-16 md:gap-8">
          <div className="flex flex-col gap-2 min-w-[120px]">
            <div className="text-text-sub-600 text-subheading-xs mb-2">
              HOME
            </div>
            <div className="text-paragraph-md text-text-sub-600">pratos</div>
            <div className="text-paragraph-md text-text-sub-600">parcerias</div>
            <div className="text-paragraph-md text-text-sub-600">blog</div>
            <div className="text-paragraph-md text-text-sub-600">sobre</div>
          </div>
          <div className="flex flex-col gap-2 min-w-[120px]">
            <div className="text-text-sub-600  text-subheading-xs mb-2">CATEGORIAS</div>
            {collections.length > 0 ? (
              collections.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/collections/${cat.handle}`}
                  className="lowercase text-paragraph-md text-text-sub-600"
                >
                  {cat.title}
                </Link>
              ))
            ) : (
              <div className="text-paragraph-sm text-text-sub-600">
                Nenhuma categoria encontrada
              </div>
            )}
          </div>
          <div className="flex opacity-30 flex-col gap-2 min-w-[120px]">
            <div className="text-text-sub-600 text-subheading-xs mb-2">SOBRE NÓS</div>
            <div className="text-paragraph-md text-text-sub-600">
              nossa historia
            </div>
            <div className="text-paragraph-md text-text-sub-600">equipe</div>
            <div className="text-paragraph-md text-text-sub-600">parcerias</div>
          </div>
          <div className="flex flex-col gap-2 min-w-[120px]">
            <div className="text-text-sub-600 text-subheading-xs mb-2">LEGAL</div>
            <div className="text-paragraph-md text-text-sub-600">
              política de privacidade
            </div>
            <div className="text-paragraph-md text-text-sub-600">
              termos de uso
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center mt-12 gap-4 text-text-sub-600 text-base">
        <div>sua marmita fit © 2025. all rights reserved</div>
        <div>
          powered by{' '}
          <a
            href="https://mainnet.design"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-text-sub-600"
          >
            mainnet™
          </a>
        </div>
      </div>
    </footer>
  );
}
