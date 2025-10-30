import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction, Link} from '@remix-run/react';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {BlogRecommendations} from '~/components/BlogRecommendations';
import type {ArticleItemFragment} from 'storefrontapi.generated';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `Sua Mesa Fit | ${data?.article.title ?? ''}`},
    {
      name: 'description',
      content: data?.article.seo?.description || data?.article.title,
    },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: LoaderFunctionArgs) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 3,
  });

  const [{blog}, relatedArticlesResponse] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    context.storefront.query(BLOG_ARTICLES_QUERY, {
      variables: {
        blogHandle,
        ...paginationVariables,
      },
    }),
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  const article = blog.articleByHandle;
  
  // Filtrar o artigo atual da lista de recomendações
  const relatedArticles = relatedArticlesResponse.blog?.articles?.nodes?.filter(
    (a: ArticleItemFragment) => a.id !== article.id
  ) || [];

  return {article, relatedArticles};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Article() {
  const {article, relatedArticles} = useLoaderData<typeof loader>();
  const {title, image, contentHtml, author, blog} = article;

  const publishedDate = new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <div className="w-full flex flex-col items-center justify-start gap-12">
      {/* Breadcrumb */}
      <div className="w-full px-4 max-w-[800px] pt-8">
        <nav className="flex items-center gap-2 text-label-md text-text-sub-600 opacity-70">
          <Link to="/" className="hover:opacity-100 transition-opacity">
            início
          </Link>
          <span>/</span>
          <Link to="/blogs" className="hover:opacity-100 transition-opacity">
            blog
          </Link>
          <span>/</span>
          <Link 
            to={`/blogs/${blog.handle}`} 
            className="hover:opacity-100 transition-opacity"
          >
            {blog.title}
          </Link>
          <span>/</span>
          <span className="opacity-100">{title}</span>
        </nav>
      </div>

      {/* Article Header */}
      <div className="w-full px-4 max-w-[800px] flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <span className="text-label-lg text-text-sub-600 bg-yellow-500 px-4 py-1 rounded-full">
            blog
          </span>
          {author?.name && (
            <span className="text-label-md text-text-sub-600 opacity-60">
              por {author.name}
            </span>
          )}
        </div>
        
        <h1 className="text-title-h1 text-text-sub-600 leading-tight">
          {title}
        </h1>

        <div className="flex items-center gap-4 text-label-md text-text-sub-600 opacity-60">
          <time dateTime={article.publishedAt}>{publishedDate}</time>
        </div>
      </div>

      {/* Featured Image */}
      {image && (
        <div className="w-full px-4 max-w-[1000px]">
          <div className="relative w-full rounded-3xl overflow-hidden aspect-video">
            <Image
              data={image}
              sizes="(min-width: 1000px) 1000px, 100vw"
              loading="eager"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="w-full px-4 max-w-[800px]">
        <div
          dangerouslySetInnerHTML={{__html: contentHtml}}
          className="article-content"
        />
      </article>

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="w-full bg-gray-50 py-16">
          <BlogRecommendations
            articles={relatedArticles}
            title="continue lendo"
            showViewAll={true}
          />
        </div>
      )}
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      title
      handle
      articleByHandle(handle: $articleHandle) {
        id
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
        blog {
          title
          handle
        }
      }
    }
  }
` as const;

const BLOG_ARTICLES_QUERY = `#graphql
  query BlogArticlesForRecommendations(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
` as const;
