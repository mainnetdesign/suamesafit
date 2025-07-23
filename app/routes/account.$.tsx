import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

// fallback wild card for all unauthenticated routes in account section
export async function loader({context}: LoaderFunctionArgs) {
  try {
    // Tentar verificar status de autenticação
    await context.customerAccount.handleAuthStatus();
    
    // Se chegou até aqui e está autenticado, redirecionar para pedidos
    return redirect('/account/orders');
  } catch (error) {
    // Se não estiver autenticado ou houver erro, redirecionar para login
    return redirect('/account/login');
  }
}
