import {Link, useLocation} from '@remix-run/react';
import {Root as Button} from '~/components/align-ui/ui/button';

interface BlogTabProps {
  blogs: Array<{
    handle: string;
    title: string;
  }>;
}

export function BlogTab({blogs}: BlogTabProps) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentBlog = searchParams.get('blog') || 'all';

  return (
    <div className="w-full py-8">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            asChild
            mode={currentBlog === 'all' ? 'filled' : 'lighter'}
            size="medium"
          >
            <Link to="/blogs">todos</Link>
          </Button>

          {blogs.map((blog) => (
            <Button
              key={blog.handle}
              asChild
              mode={currentBlog === blog.handle ? 'filled' : 'lighter'}
              size="medium"
              className="lowercase"
            >
              <Link to={`/blogs?blog=${blog.handle}`}>{blog.title}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

