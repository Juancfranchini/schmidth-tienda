import Link from 'next/link';

export default function CheckoutEmptyCart() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center">
      <div className="text-center">
        <p className="text-fg-muted mb-4">Tu carrito esta vacio</p>
        <Link href="/catalogo" className="bg-accent text-on-accent px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-hover transition-colors">Ir al catálogo</Link>
      </div>
    </div>
  );
}
