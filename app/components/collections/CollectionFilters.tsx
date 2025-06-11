import {Root as Button} from '~/components/align-ui/ui/button';
import * as Input from '~/components/align-ui/ui/input';
import * as Select from '~/components/align-ui/ui/select';
import {useSearchParams} from '@remix-run/react';
import {RiSearch2Line} from '@remixicon/react';

export function CollectionFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      searchParams.set('q', value);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const handleSort = (value: string) => {
    if (value) {
      searchParams.set('sort', value);
    } else {
      searchParams.delete('sort');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="flex flex-col items-center md:flex-row gap-4 px-4">
      <Select.Root
        defaultValue={searchParams.get('sort') ?? ''}
        onValueChange={handleSort}
      >
        <Select.Trigger>
          <Select.Value placeholder="Ordenar por" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="price-asc">Menor preço</Select.Item>
          <Select.Item value="price-desc">Maior preço</Select.Item>
          <Select.Item value="title-asc">Nome A-Z</Select.Item>
          <Select.Item value="title-desc">Nome Z-A</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  );
}
