import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useTransactionsContext from '@/contexts/TransactionsContext';
import useUsersContext from '@/contexts/UsersContext';
import './StatisticPage.css';

const PALETTE = ['#2dd4bf', '#818cf8', '#f59e0b', '#fb7185', '#38bdf8', '#a3e635', '#c084fc'];
const OTHER_COLOR = '#3f4656';
const SPEND_COLOR = '#fb7185';
const INCOME_COLOR = '#34d399';
const GRID = '#232a3a';
const MAX_ITEMS = 5;
const WEEKDAYS = ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön'];

const fmt = (n: number) => Math.round(n).toLocaleString('sv-SE');
const compact = (n: number) => (Math.abs(n) >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n));
const dayLabel = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const axisProps = { tickLine: false, axisLine: false, tick: { fill: '#9aa3b2', fontSize: 12 } } as const;
const cursor = { fill: 'rgba(255, 255, 255, 0.05)' };

interface TipItem { name?: string | number; value?: unknown; color?: string; fill?: string; payload?: { fill?: string } }

/** Hover popup: a dot in the series color before each name, biggest first. */
function ChartTooltip({ active, payload, label, unit = 'kr', formatTitle }: {
    active?: boolean; payload?: readonly TipItem[]; label?: unknown; unit?: string; formatTitle?: (l: string) => string;
}) {
    if (!active || !payload?.length) return null;
    const rows = payload
        .map((p) => ({
            name: String(p.name ?? ''),
            value: Number(p.value ?? 0),
            color: p.color ?? p.payload?.fill ?? p.fill ?? '#9aa3b2',
        }))
        .filter((r) => r.value > 0)
        .sort((a, b) => b.value - a.value);
    if (!rows.length) return null;
    return (
        <div className="tip">
            {label != null && <div className="tip-title">{formatTitle ? formatTitle(String(label)) : String(label)}</div>}
            {rows.map((r) => (
                <div className="tip-row" key={r.name}>
                    <span className="dot" style={{ background: r.color }} />
                    <span className="tip-name">{r.name}</span>
                    <span className="tip-val">{fmt(r.value)} {unit}</span>
                </div>
            ))}
        </div>
    );
}

const StatisticPage = () => {
    const { transactions, isLoadingTransactions } = useTransactionsContext();
    const { getUserFromUserId } = useUsersContext();

    const stats = useMemo(() => {
        const live = transactions.filter((t) => !t.removed);
        const purchases = live.filter((t): t is Purchase => t.type === 'purchase');
        const deposits = live.filter((t): t is Deposit => t.type === 'deposit');

        const spent = purchases.reduce((s, p) => s + p.total, 0);
        const deposited = deposits.reduce((s, d) => s + d.total, 0);

        // Spending and deposits per day
        const dayMap = new Map<string, { day: string; spent: number; deposited: number }>();
        const bump = (t: ITransaction, key: 'spent' | 'deposited', value: number) => {
            const day = new Date(t.createdTime).toLocaleDateString('sv-SE'); // YYYY-MM-DD, local time
            const entry = dayMap.get(day) ?? { day, spent: 0, deposited: 0 };
            entry[key] += value;
            dayMap.set(day, entry);
        };
        purchases.forEach((p) => bump(p, 'spent', p.total));
        deposits.forEach((d) => bump(d, 'deposited', d.total));
        const perDay = [...dayMap.values()].sort((a, b) => a.day.localeCompare(b.day));

        // Item share by quantity: top few, the rest folded into "Other"
        const itemMap = new Map<string, number>();
        for (const p of purchases) {
            for (const line of p.items) {
                itemMap.set(line.item.displayName, (itemMap.get(line.item.displayName) ?? 0) + line.quantity);
            }
        }
        const ranked = [...itemMap.entries()].sort((a, b) => b[1] - a[1]);
        const itemShare = ranked.slice(0, MAX_ITEMS).map(([name, value], i) => ({ name, value, fill: PALETTE[i] }));
        const otherQty = ranked.slice(MAX_ITEMS).reduce((s, [, v]) => s + v, 0);
        if (otherQty > 0) itemShare.push({ name: 'Other', value: otherQty, fill: OTHER_COLOR });
        const itemTotal = itemShare.reduce((s, i) => s + i.value, 0);

        // Purchases per weekday, Monday first
        const counts = Array<number>(7).fill(0);
        for (const p of purchases) counts[(new Date(p.createdTime).getDay() + 6) % 7]++;
        const busiest = counts.indexOf(Math.max(...counts));
        const perWeekday = WEEKDAYS.map((day, i) => ({ day, purchases: counts[i], busiest: i === busiest && counts[i] > 0 }));

        // Top spenders
        const buyerMap = new Map<string, number>();
        for (const p of purchases) buyerMap.set(p.createdFor, (buyerMap.get(p.createdFor) ?? 0) + p.total);
        const topBuyers = [...buyerMap.entries()]
            .map(([id, total]) => ({ id, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 6);

        return {
            spent, deposited,
            purchaseCount: purchases.length,
            average: purchases.length ? spent / purchases.length : 0,
            perDay, itemShare, itemTotal, perWeekday, topBuyers,
        };
    }, [transactions]);

    if (isLoadingTransactions && transactions.length === 0) {
        return <div className="statistic-page page"><h1>Statistic</h1><p className="muted">Loading…</p></div>;
    }
    if (transactions.length === 0) {
        return <div className="statistic-page page"><h1>Statistic</h1><div className="card empty">No transactions to show.</div></div>;
    }

    const maxBuyer = stats.topBuyers[0]?.total ?? 1;

    return (
        <div className="statistic-page page">
            <h1>Statistic</h1>
            <p className="muted">Based on the {transactions.length} transactions currently loaded.</p>

            <div className="kpis">
                <div className="card kpi"><div className="label">Total spent</div><div className="value spent">{fmt(stats.spent)}<small>kr</small></div></div>
                <div className="card kpi"><div className="label">Total deposited</div><div className="value income">{fmt(stats.deposited)}<small>kr</small></div></div>
                <div className="card kpi"><div className="label">Purchases</div><div className="value">{stats.purchaseCount}</div></div>
                <div className="card kpi"><div className="label">Average purchase</div><div className="value">{fmt(stats.average)}<small>kr</small></div></div>
            </div>

            <div className="stack">
                <section className="card">
                    <div className="card-head">
                        <div>
                            <h2>Spending over time</h2>
                            <p className="muted">Purchases and deposits per day.</p>
                        </div>
                        <div className="legend">
                            <span><span className="dot" style={{ background: SPEND_COLOR }} />Spent</span>
                            <span><span className="dot" style={{ background: INCOME_COLOR }} />Deposited</span>
                        </div>
                    </div>
                    <div className="chart">
                        <ResponsiveContainer>
                            <AreaChart data={stats.perDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={SPEND_COLOR} stopOpacity={0.45} />
                                        <stop offset="100%" stopColor={SPEND_COLOR} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={INCOME_COLOR} stopOpacity={0.4} />
                                        <stop offset="100%" stopColor={INCOME_COLOR} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke={GRID} />
                                <XAxis dataKey="day" tickFormatter={dayLabel} {...axisProps} />
                                <YAxis tickFormatter={compact} width={44} {...axisProps} />
                                <Tooltip content={<ChartTooltip formatTitle={dayLabel} />} cursor={{ stroke: '#3f4656' }} />
                                <Area type="monotone" dataKey="deposited" name="Deposited" stroke={INCOME_COLOR} strokeWidth={2} fill="url(#gradIncome)" />
                                <Area type="monotone" dataKey="spent" name="Spent" stroke={SPEND_COLOR} strokeWidth={2} fill="url(#gradSpent)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <div className="grid-2">
                    <section className="card">
                        <h2>Most purchased items</h2>
                        <p className="muted">Share of items bought, by quantity.</p>
                        <div className="donut">
                            <div className="chart small">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={stats.itemShare} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none">
                                            {stats.itemShare.map((s) => <Cell key={s.name} fill={s.fill} />)}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip unit="st" />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="donut-center">
                                    <div className="big">{fmt(stats.itemTotal)}</div>
                                    <div className="muted">items</div>
                                </div>
                            </div>
                            <ul className="legend-list">
                                {stats.itemShare.map((s) => (
                                    <li key={s.name}>
                                        <span className="dot" style={{ background: s.fill }} />
                                        <span className="name" title={s.name}>{s.name}</span>
                                        <span className="amt">{s.value} st</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="card">
                        <h2>Purchases per weekday</h2>
                        <p className="muted">The busiest day is highlighted.</p>
                        <div className="chart small">
                            <ResponsiveContainer>
                                <BarChart data={stats.perWeekday} barCategoryGap="22%">
                                    <CartesianGrid vertical={false} stroke={GRID} />
                                    <XAxis dataKey="day" {...axisProps} />
                                    <YAxis allowDecimals={false} width={32} {...axisProps} />
                                    <Tooltip content={<ChartTooltip unit="st" />} cursor={cursor} />
                                    <Bar dataKey="purchases" name="Purchases" radius={[6, 6, 0, 0]}>
                                        {stats.perWeekday.map((d) => <Cell key={d.day} fill={d.busiest ? PALETTE[0] : PALETTE[1]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                <section className="card">
                    <h2>Top spenders</h2>
                    <p className="muted">By total spent.</p>
                    <ol className="toplist">
                        {stats.topBuyers.map((b) => {
                            const name = getUserFromUserId(b.id).nick;
                            return (
                                <li key={b.id}>
                                    <span className="name" title={name}>{name}</span>
                                    <span className="amt">{fmt(b.total)} kr</span>
                                    <span className="track"><span className="fill" style={{ width: `${(b.total / maxBuyer) * 100}%` }} /></span>
                                </li>
                            );
                        })}
                    </ol>
                </section>
            </div>
        </div>
    );
};

export default StatisticPage;
