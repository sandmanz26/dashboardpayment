import { Settings } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Flag from '../components/Flag';
import { balances, fmt, totalBalance } from '../data/mock';

export default function Balance() {
  return (
    <>
      <PageHeader title="Balances" />
      <section className="total-available">
        <div className="tlabel">Total Available Balance:</div>
        <div className="tamount">IDR {fmt(totalBalance)}<sup>.00</sup></div>
      </section>

      <div className="row-between">
        <h2 className="section-title flat">Your Balances</h2>
        <button className="btn outline"><Settings size={16} strokeWidth={1.5} />Manage Balances</button>
      </div>

      <table className="table balances">
        <thead><tr><th>Currency</th><th>Available Balance</th></tr></thead>
        <tbody>
          {balances.map((b) => (
            <tr key={b.code}>
              <td>
                <div className="cur">
                  <Flag size={34} />
                  <div>
                    <div className="cur-top">{b.code}{b.isDefault && <span className="badge green">Default</span>}</div>
                    <div className="sub">{b.name}</div>
                  </div>
                </div>
              </td>
              <td><span className="cur-code">{b.code}</span>{fmt(b.available, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
