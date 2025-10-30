import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {BlogTab} from '~/components/collections/BlogTab';
import {BlogCard} from '~/components/BlogCard';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import blogHeroImage from '~/assets/home/hero1.jpg';

export const meta: MetaFunction = () => {
  return [{title: `Sua Mesa Fit | Blog`}];
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
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const selectedBlog = url.searchParams.get('blog');

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  // Buscar todos os blogs disponíveis
  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
  ]);

  // Se um blog específico foi selecionado, buscar seus artigos
  let articles = null;
  if (selectedBlog && selectedBlog !== 'all') {
    const {blog} = await context.storefront.query(BLOG_ARTICLES_QUERY, {
      variables: {
        blogHandle: selectedBlog,
        ...paginationVariables,
      },
    });
    articles = blog?.articles || null;
  } else {
    // Buscar todos os artigos de todos os blogs
    const allArticlesPromises = blogs.nodes.map((blog: any) =>
      context.storefront.query(BLOG_ARTICLES_QUERY, {
        variables: {
          blogHandle: blog.handle,
          ...paginationVariables,
        },
      }),
    );

    const allBlogsData = await Promise.all(allArticlesPromises);
    
    // Combinar todos os artigos
    const allArticles = allBlogsData
      .map((data: any) => data.blog?.articles?.nodes || [])
      .flat()
      .sort((a: any, b: any) => {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });

    articles = {
      nodes: allArticles,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
    };
  }

  return {blogs, articles, selectedBlog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Blogs() {
  const {blogs, articles, selectedBlog} = useLoaderData<typeof loader>();

  return (
    <div className="w-full flex flex-col items-center justify-start">
      {/* Hero Header */}
      <div className="px-4 flex flex-col items-center justify-center w-full">
        <div className="w-full flex justify-center items-center">
          <div className="w-full max-w-[1200px] relative rounded-3xl inline-flex flex-col justify-center items-center overflow-hidden">
            <Image
              src={blogHeroImage}
              alt="Blog Sua Mesa Fit"
              className="z-0 absolute object-cover w-full h-full"
              width={1200}
              height={400}
              loading="eager"
            />

            <div className="items-center z-10 self-stretch h-[280px] sm:h-[361px] p-6 sm:p-8 bg-gradient-to-b from-[#3D724A]/0 to-[#3D724A]/100 flex flex-col justify-end">
              <h1 className="lowercase w-full text-text-white-0 text-center text-title-h3 sm:text-title-h2">
                blog
              </h1>
              <p className="w-full max-w-[416px] text-text-white-0 text-center text-paragraph-md">
                dicas, receitas e tudo sobre alimentação saudável
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Tabs */}
      <div className="w-full px-4 max-w-[1200px] items-center justify-center">
        <BlogTab blogs={blogs.nodes} />
      </div>

      {/* Articles Grid */}
      <div className="w-full px-4 max-w-[1200px] items-center justify-center pb-12">
        {articles && articles.nodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.nodes.map((article: ArticleItemFragment, index: number) => (
              <BlogCard
                key={article.id}
                article={article}
                loading={index < 3 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-body-lg text-text-sub-600">
              Nenhum artigo encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
` as const;

const BLOG_ARTICLES_QUERY = `#graphql
  query BlogArticles(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      handle
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
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
