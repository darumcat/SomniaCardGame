import { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';

const Leaderboard = () => {
  const { contracts } = useWeb3();
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      // В реальном проекте здесь будет вызов вашего API или контракта
      const mockLeaders = [
        { address: '0x123...456', score: 15000 },
        { address: '0x789...012', score: 12000 },
        // ... другие игроки
      ];
      setLeaders(mockLeaders);
    };

    fetchLeaders();
  }, []);

  return (
    <div className="leaderboard">
      <h2>Топ 100 игроков</h2>
      <table>
        <thead>
          <tr>
            <th>Место</th>
            <th>Адрес</th>
            <th>Очки</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((player, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{player.address}</td>
              <td>{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;