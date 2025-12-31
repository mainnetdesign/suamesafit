import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {BlogCard} from '~/components/BlogCard';
import {BlogTab} from '~/components/collections/BlogTab';
import blogHeroImage from '~/assets/home/hero1.jpg';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Sua Mesa Fit | ${data?.blog.title ?? ''}`}];
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
async function loadCriticalData({
  context,
  request,
  params,
}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}, {blogs}] = await Promise.all([
    context.storefront.query(BLOG_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    context.storefront.query(ALL_BLOGS_QUERY, {
      variables: {
        first: 10,
      },
    }),
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  return {blog, blogs};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Blog() {
  const {blog, blogs} = useLoaderData<typeof loader>();
  const {articles} = blog;

  return (
    <div className="w-full flex flex-col items-center justify-start">
      {/* Hero Header com imagem de fundo */}
      <div className="px-4 flex flex-col items-center justify-center w-full">
        <div className="w-full flex justify-center items-center">
          <div className="w-full max-w-[1200px] relative rounded-3xl inline-flex flex-col justify-center items-center overflow-hidden">
            <Image
              src={blogHeroImage}
              alt={blog.title}
              className="z-0 absolute object-cover w-full h-full"
              width={1200}
              height={400}
              loading="eager"
            />

            <div className="items-center z-10 self-stretch h-[280px] sm:h-[361px] p-6 sm:p-8 bg-gradient-to-b from-[#3D724A]/0 to-[#3D724A]/100 flex flex-col justify-end">
              <div className="text-label-lg text-text-white-0 bg-yellow-500 px-4 py-1 rounded-full mb-4">
                blog
              </div>
              <h1 className="lowercase w-full text-text-white-0 text-center text-title-h3 sm:text-title-h2">
                {blog.title}
              </h1>
              {blog.seo?.description && (
                <p className="w-full max-w-[416px] text-text-white-0 text-center text-paragraph-md mt-2">
                  {blog.seo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Blog Tabs para navegação */}
      <div className="w-full px-4 max-w-[1200px] items-center justify-center">
        <BlogTab blogs={blogs.nodes} />
      </div>

      {/* Articles Grid */}
      <div className="w-full px-4 max-w-[1200px] items-center justify-center pb-12">
        <PaginatedResourceSection
          connection={articles}
          resourcesClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {({node, index}) => {
            const a = node as any;
            return (
              <BlogCard
                key={a.id}
                article={a}
                loading={index < 3 ? 'eager' : 'lazy'}
              />
            );
          }}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOG_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      seo {
        title
        description
      }
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
    tags
    category: metafield(namespace: "custom", key: "category") {
      value
    }
  }
` as const;

const ALL_BLOGS_QUERY = `#graphql
  query AllBlogs(
    $first: Int
    $language: LanguageCode
  ) @inContext(language: $language) {
    blogs(first: $first) {
      nodes {
        title
        handle
      }
    }
  }
` as const;
