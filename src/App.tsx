import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Balance from './pages/Balance';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import Disputes from './pages/Disputes';
import Subscriptions from './pages/Subscriptions';
import Developers from './pages/Developers';
import DevEntry from './pages/DevEntry';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="balance" element={<Balance />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/developers" element={<Developers />} />
        <Route path="dev" element={<DevEntry />} />
        <Route path="dispute" element={<Disputes />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="*" element={<Placeholder />} />
      </Route>
    </Routes>
  );
}
