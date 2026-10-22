import { useAppSelector } from '../../store/hooks';
import DreamCard from './DreamCard';

export default function DreamsFeed() {
  const dreams = useAppSelector((state) => state.dreams.items);

  return (
    <main className="feed">
      {dreams.map((dream) => (
        <DreamCard key={dream.id} dream={dream} />
      ))}
    </main>
  );
}
