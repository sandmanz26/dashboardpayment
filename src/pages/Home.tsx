import { useNavigate } from 'react-router-dom';
import { ChevronDown, CircleArrowDown, CircleArrowUp, CirclePlus, Check, Info } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Flag from '../components/Flag';
import BalanceChart from '../components/BalanceChart';
import { balances, fmt, totalBalance, transactions } from '../data/mock';

const steps = ['Create Account', 'Submit Business Details', 'Verification in Progress', 'Verification Successful'];
const currentStep = 1; // zero-based

function Onboarding() {
  return (
    <section className="onboarding">
      <h2>Verify your business details</h2>
      <p>Submit your business details and get verified in a few days.</p>
      <ol className="steps">
        {steps.map((s, i) => {
          const done = i < currentStep, current = i === currentStep;
          return (
            <li key={s} className={done ? 'done' : current ? 'current' : ''}>
              <div className="step-track">
                <span className="dot">{done ? <Check size={16} strokeWidth={2} /> : i + 1}</span>
                <span className="bar" />
              </div>
              <div className="step-label">{s}</div>
              {current && <button className="btn primary sm">Continue</button>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default function Home() {
  const nav = useNavigate();
  const recent = transactions.slice(0, 5);
  return (
    <>
      <PageHeader title="Home" />
      <Onboarding />

      <section className="balance-block">
        <div>
          <div className="label">Total Balance in IDR <Info size={14} strokeWidth={1.5} /></div>
          <div className="amount">IDR {fmt(totalBalance)}</div>
        </div>
        <div className="actions">
          <button className="btn outline"><CirclePlus size={16} strokeWidth={1.5} />Top Up</button>
          <button className="btn outline"><CircleArrowDown size={16} strokeWidth={1.5} />Receive</button>
          <button className="btn outline"><CircleArrowUp size={16} strokeWidth={1.5} />Send</button>
        </div>
      </section>

      <div className="currency-cards">
        {balances.map((b) => (
          <div key={b.code} className="currency-card">
            <Flag />
            <div className="cname">{b.name}</div>
            {b.isDefault && <span className="badge green">Default</span>}
            <div className="camount">{b.code} {fmt(b.available)}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Overview</h2>
      <div className="pills">
        <button className="pill">Last 3 months <ChevronDown size={16} strokeWidth={1.5} /></button>
        <button className="pill">Closing Balance <ChevronDown size={16} strokeWidth={1.5} /></button>
      </div>
      <BalanceChart />

      <h2 className="section-title">Recent Transactions</h2>
      <table className="table recent">
        <colgroup>{[17.8, 17.8, 17.8, 28.8, 17.8].map((w, i) => <col key={i} style={{ width: `${w}%` }} />)}</colgroup>
        <thead>
          <tr><th>Created on</th><th>Amount</th><th>Type</th><th>Channel / Account</th><th>Status</th></tr>
        </thead>
        <tbody>
          {recent.map((t) => (
            <tr key={t.id} onClick={() => nav('/transactions')} className="clickable">
              <td><div>Today</div><div className="sub">11:17 AM</div></td>
              <td>{t.currency} {fmt(t.amount)}</td>
              <td className="muted">{t.type.replace(' ', '').replace('U', 'u')}</td>
              <td>{t.channel}</td>
              <td><span className="badge green">{t.status === 'Successful' ? 'Success' : t.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ height: 40 }} />
    </>
  );
}
