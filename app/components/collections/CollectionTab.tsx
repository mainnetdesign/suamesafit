import { Link, useLocation } from '@remix-run/react';
import { Root as Button } from '~/components/align-ui/ui/button';
import { CollectionFilters } from './CollectionFilters';

interface CollectionTabProps {
  categories: Array<{
    handle: string;
    title: string;
  }>;
}

export function CollectionTab({ categories }: CollectionTabProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="max-w-[1200px] w-full items-center justify-between flex gap-2 overflow-x-auto pb-4">
      <div className="gap-2flex items-center">
      <Button
        asChild
        mode={currentPath === '/collections/all' ? 'filled' : 'lighter'}
        size="medium"
      >
        <Link to="/collections/all">todos</Link>
      </Button>

      {categories.map((category) => (
        <Button
          key={category.handle}
          asChild
          mode={currentPath === `/collections/${category.handle}` ? 'filled' : 'lighter'}
          size="medium"
          className='lowercase'
        >
          <Link to={`/collections/${category.handle}`}>{category.title}</Link>
        </Button>
      ))}
      </div>

      <CollectionFilters />
    </div>
  );
} 