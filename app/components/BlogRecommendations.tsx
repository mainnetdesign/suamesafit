import {Link} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import * as Button from '~/components/align-ui/ui/button';

interface BlogRecommendationsProps {
  articles: ArticleItemFragment[];
  title?: string;
  showViewAll?: boolean;
}

export function BlogRecommendations({
  articles,
  title = 'leia também',
  showViewAll = true,
}: BlogRecommendationsProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="w-full px-4 flex flex-col justify-center items-center">
      <div className="max-w-[1200px] w-full flex flex-col gap-8">
        <div className="w-full flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="text-label-lg text-text-sub-600 bg-yellow-500 px-4 py-1 rounded-full w-fit">
              blog
            </div>
            <h2 className="text-title-h3 text-text-sub-600">{title}</h2>
          </div>
          {showViewAll && (
            <Button.Root
              variant="primary"
              mode="filled"
              size="medium"
              onClick={() => {
                const blogHandle = articles[0]?.blog?.handle;
                if (blogHandle) {
                  window.location.href = `/blogs/${blogHandle}`;
                }
              }}
            >
              ver todos
            </Button.Root>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((article) => {
            const publishedAt = new Intl.DateTimeFormat('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(new Date(article.publishedAt!));

            return (
              <Link
                key={article.id}
                to={`/blogs/${article.blog.handle}/${article.handle}`}
                className="group block"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                  {article.image && (
                    <div className="relative overflow-hidden w-full h-48">
                      <Image
                        alt={article.image.altText || article.title}
                        aspectRatio="16/9"
                        data={article.image}
                        loading="lazy"
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-title-h5 text-text-sub-600 mb-2 group-hover:text-green-700 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-body-sm text-text-sub-600 opacity-70 mb-3 line-clamp-3">
                        {article.contentHtml
                          ? article.contentHtml
                              .replace(/<[^>]*>/g, '')
                              .substring(0, 100)
                              .concat('...')
                          : ''}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-label-sm text-text-sub-600 opacity-60">
                        {publishedAt}
                      </span>
                      <span className="text-label-sm text-green-700 group-hover:text-green-600 flex items-center gap-1">
                        ler mais →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

