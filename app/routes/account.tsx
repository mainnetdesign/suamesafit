import {redirect} from '@shopify/remix-oxygen';

export async function loader() {
  return redirect('https://perfil.suamesafit.com');
}
