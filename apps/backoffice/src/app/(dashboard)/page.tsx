'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Package, Star, Megaphone, TrendingDown } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import Encabezado from './_inicio/Encabezado';
import PuestaEnMarcha from './_inicio/PuestaEnMarcha';
import ParaHacerHoy from './_inicio/ParaHacerHoy';
import Resumen30 from './_inicio/Resumen30';
import type { Hoy, PasoPuestaEnMarcha } from './_inicio/tipos';
import { esRutaOculta } from '@/components/layout/navegacion';

// Con un módulo apagado (packages/marca/marca.json) no se muestran sus números.
const CON_GASTOS = !esRutaOculta('/gastos');
const CON_RESENAS = !esRutaOculta('/reviews');

function ExpensesCard({ expensesStats }: { expensesStats: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" />Gastos por categoria (30 dias)</h2>
      {expensesStats.byCategory.length > 0 ? (
        <div className="space-y-3">
          {expensesStats.byCategory.map((cat: any) => (
            <div key={cat.category} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{cat.category}</span>
              <span className="text-sm font-semibold text-red-500">{formatPrice(cat.amount)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Total 30 dias</span>
            <span className="text-sm font-bold text-red-600">{formatPrice(expensesStats.total30)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Total historico</span>
            <span className="text-xs text-gray-400">{formatPrice(expensesStats.totalAllTime)}</span>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-sm text-center py-10">No hay gastos registrados en los ultimos 30 dias</p>
      )}
    </div>
  );
}

function RecentOrdersCard({ orders }: { orders: any[] }) {
  return (
    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Pedidos recientes</h2>
      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{order.number}</p>
                <p className="text-xs text-gray-400">{order.customer} - {formatDate(order.date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm text-center py-10">No hay pedidos todavia</p>
      )}
    </div>
  );
}

function TopProductsCard({ products }: { products: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Top Productos</h2>
      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.rank} className="flex items-center gap-3">
              <span className={'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ' + (p.rank === 1 ? 'bg-[#B3855C] text-[#1A1A1A]' : 'bg-gray-100 text-gray-500')}>{p.rank}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.units} unidades</p>
              </div>
              <span className="text-sm font-semibold text-gray-700 shrink-0">{formatPrice(p.revenue)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm text-center py-10">No hay ventas todavia</p>
      )}
    </div>
  );
}

function SummaryStatsRow({ productsStats, reviewsStats, marketingStats }: { productsStats: any; reviewsStats: any; marketingStats: any }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-gray-500" />Productos</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-semibold">{productsStats.total}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Activos</span><span className="font-semibold text-green-600">{productsStats.active}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Sin stock</span><span className="font-semibold text-red-600">{productsStats.outOfStock}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Stock bajo</span><span className="font-semibold text-orange-600">{productsStats.lowStock}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Por encargo</span><span className="font-semibold text-purple-600">{productsStats.madeToOrder}</span></div>
        </div>
      </div>

      {CON_RESENAS && <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-gray-500" />Reviews</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-semibold">{reviewsStats.total}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Pendientes</span><span className="font-semibold text-amber-600">{reviewsStats.pending}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Promedio</span><span className="font-semibold">{reviewsStats.avgRating} / 5</span></div>
        </div>
      </div>}

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><Megaphone className="w-4 h-4 text-gray-500" />Marketing</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Newsletter</span><span className="font-semibold">{marketingStats.newsletterSubscribers}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Promociones activas</span><span className="font-semibold">{marketingStats.activePromotions}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Cupones activos</span><span className="font-semibold">{marketingStats.activeCoupons}</span></div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [hoy, setHoy] = useState<Hoy | null>(null);
  const [pasos, setPasos] = useState<PasoPuestaEnMarcha[]>([]);
  const [expensesStats, setExpensesStats] = useState({ total30: 0, totalAllTime: 0, byCategory: [] as any[] });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [productsStats, setProductsStats] = useState({ total: 0, active: 0, outOfStock: 0, lowStock: 0, madeToOrder: 0 });
  const [reviewsStats, setReviewsStats] = useState({ total: 0, pending: 0, avgRating: 0 });
  const [marketingStats, setMarketingStats] = useState({ newsletterSubscribers: 0, activePromotions: 0, activeCoupons: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, resHoy, resPasos] = await Promise.all([api.get('/dashboard/stats'), api.get('/dashboard/hoy'), api.get('/dashboard/puesta-en-marcha')]);
      const data = res.data;
      setHoy(resHoy.data);
      setPasos(Array.isArray(resPasos.data) ? resPasos.data : []);
      setExpensesStats(data.expensesStats || { total30: 0, totalAllTime: 0, byCategory: [] });
      setRecentOrders(data.recentOrders || []);
      setTopProducts(data.topProducts || []);
      setProductsStats(data.productsStats || {});
      setReviewsStats(data.reviewsStats || {});
      setMarketingStats(data.marketingStats || {});
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <Encabezado />
      <PuestaEnMarcha pasos={pasos} />
      {hoy && <ParaHacerHoy tareas={hoy.tareas} />}
      {hoy && <Resumen30 datos={hoy.ultimos30} />}
      {CON_GASTOS && <ExpensesCard expensesStats={expensesStats} />}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <RecentOrdersCard orders={recentOrders} />
        <TopProductsCard products={topProducts} />
      </div>

      <SummaryStatsRow productsStats={productsStats} reviewsStats={reviewsStats} marketingStats={marketingStats} />
    </div>
  );
}