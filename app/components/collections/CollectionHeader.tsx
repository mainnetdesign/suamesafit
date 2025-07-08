import {Image} from '@shopify/hydrogen';

interface CollectionHeaderProps {
  title: string;
  description: string;
  image: string | {src: string};
}

export function CollectionHeader({
  title,
  description,
  image,
}: CollectionHeaderProps) {
  const imageSrc = typeof image === 'string' ? image : image.src;

  return (
    <div className="px-4 flex flex-col items-center justify-center w-full">
      <div className="w-full flex justify-center items-center">
        <div className="w-full max-w-[1200px] relative rounded-3xl inline-flex flex-col justify-center items-center overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            className="z-0 absolute  object-cover w-full h-full"
            width={1200}
            height={400}
            loading="eager"
          />

          <div className="items-center  z-10 self-stretch h-[361px] p-8 bg-gradient-to-b from-[#3D724A]/0 to-[#3D724A]/100 flex flex-col justify-end">
            <h2 className="lowercase w-full text-text-white-0 text-center text-title-h2">
              {title}
            </h2>
            <p className="w-full max-w-[416px] text-text-white-0 text-center text-paragraph-md">{description}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
