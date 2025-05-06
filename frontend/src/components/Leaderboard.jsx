import { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';

const Leaderboard = () => {
  const { contracts } = useWeb3();
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const transferEvents = await contracts.usdcardContract.queryFilter("Transfer");
      const balances = {};
      
      transferEvents.forEach(event => {
        const [from, to, value] = event.args;
        balances[to] = (balances[to] || 0) + value;
      });
      
      const sorted = Object.entries(balances)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100);
      
      setLeaders(sorted);
    };

    if (contracts) fetchLeaders();
  }, [contracts]);

  return (
    <div className="leaderboard">
      <h2>Top 100 Players</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Address</th>
            <th>USDC Balance</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map(([address, balance], index) => (
            <tr key={address}>
              <td>{index + 1}</td>
              <td>{`${address.slice(0, 6)}...${address.slice(-4)}`}</td>
              <td>{ethers.formatUnits(balance, 18)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
