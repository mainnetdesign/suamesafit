import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context}: LoaderFunctionArgs) {
  // Verificar se o cliente está logado antes de redirecionar
  await context.customerAccount.handleAuthStatus();
  
  // Redirecionar para a página de pedidos local ao invés do domínio externo
  return redirect('/account/orders');
}
