import {useStickyRef} from '~/components/custom/sticky-ref-context';
import {InteractiveHoverButton} from '~/components/magic-ui/ui/button';

export default function Example() {
  const stickyRef = useStickyRef();
  return (
    <>
      <InteractiveHoverButton
        ref={stickyRef as React.RefObject<HTMLButtonElement>}
      >
        Hover me!
      </InteractiveHoverButton>
    </>
  );
}
