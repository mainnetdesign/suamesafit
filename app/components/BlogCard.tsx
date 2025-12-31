import {Link} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';

interface BlogCardProps {
  article: ArticleItemFragment;
  loading?: HTMLImageElement['loading'];
  size?: 'default' | 'large';
}

export function BlogCard({
  article,
  loading = 'lazy',
  size = 'default',
}: BlogCardProps) {
  // Usar o handle do blog (dicas ou novidades) como categoria
  const categoryValue = article.blog.handle?.toLowerCase?.() || 'blog';
  
  // Todas as categorias com fundo amarelo por enquanto
  const badgeBg = '#FFC977';
  
  // Formatar o nome da categoria para exibição
  const categoryLabel: Record<string, string> = {
    dicas: 'dicas',
    novidades: 'novidades',
    receitas: 'receitas',
    nutrição: 'nutrição',
  };
  const categoryDisplay = categoryLabel[categoryValue] || categoryValue;
  const publishedAt = new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt!));

  const isLarge = size === 'large';

  return (
    <Link
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      className="group block"
    >
      <div
        className={`bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col ${
          isLarge ? 'md:flex-row' : ''
        }`}
      >
        {article.image && (
          <div
            className={`relative overflow-hidden ${
              isLarge
                ? 'md:w-1/2 h-56 sm:h-64 md:h-auto'
                : 'w-full h-48 sm:h-64'
            }`}
          >
            <Image
              alt={article.image.altText || article.title}
              aspectRatio={isLarge ? '4/3' : '16/9'}
              data={article.image}
              loading={loading}
              sizes={
                isLarge
                  ? '(min-width: 768px) 50vw, 100vw'
                  : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
              }
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            {/* Categoria (badge) */}
            <div
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-label-sm text-text-sub-600"
              style={{backgroundColor: badgeBg}}
            >
              {categoryDisplay}
            </div>
          </div>
        )}
        <div
          className={`p-6 flex flex-col justify-between flex-1 ${
            isLarge ? 'md:p-8' : ''
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              {article.author?.name && (
                <span className="text-label-sm text-text-sub-600 opacity-60">
                  por {article.author.name}
                </span>
              )}
            </div>
            <h3
              className={`text-text-sub-600 mb-3 group-hover:text-green-700 transition-colors break-words ${
                isLarge
                  ? 'text-title-h4 sm:text-title-h3 leading-[2.25rem] sm:leading-[3rem]'
                  : 'text-title-h5 sm:text-title-h4 leading-[2rem] sm:leading-[2.5rem]'
              }`}
              style={{ wordBreak: 'normal', hyphens: 'none' }}
            >
              {article.title}
            </h3>
            <p className="text-body-sm text-text-sub-600 opacity-70 mb-4">
              {article.contentHtml
                ? article.contentHtml
                    .replace(/<[^>]*>/g, '')
                    .substring(0, isLarge ? 200 : 120)
                    .concat('...')
                : ''}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-label-sm text-text-sub-600 opacity-60">
              {publishedAt}
            </span>
            <span className="text-label-md text-green-700 group-hover:text-green-600 flex items-center gap-2">
              ler mais
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:translate-x-1 transition-transform"
              >
                <path
                  d="M6 12L10 8L6 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

