import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  glyph: string;
  title: string;
  description: ReactNode;
  to: string;
};

const FeatureList: FeatureItem[] = [
  {
    glyph: '風',
    title: '選風打位 Wind Draw',
    description: <>Randomly assign seats and prevailing wind at the start of a session.</>,
    to: '/docs/features/wind-draw',
  },
  {
    glyph: '⚄',
    title: '掷骰子 Dice Roll',
    description: <>Roll dice to decide who breaks the wall and where play starts.</>,
    to: '/docs/features/dice-roll',
  },
  {
    glyph: '⚅',
    title: '掷骰开墩 In-Game Dice Roll',
    description: <>Roll dice mid-game for draws, self-draw checks, and other in-game calls.</>,
    to: '/docs/features/in-game-dice-roll',
  },
  {
    glyph: '台',
    title: '台數計算 Tai Payout',
    description: <>Calculate payouts for a hand based on stake, tai count, and shooter rules.</>,
    to: '/docs/features/fan-payout',
  },
  {
    glyph: '花',
    title: '花獸槓計算 Side Bets',
    description: <>Work out flower, animal, and kong side-bet payouts at the table.</>,
    to: '/docs/features/side-bets',
  },
  {
    glyph: '績',
    title: '秋後算績 Player Results',
    description: <>Track scores across rounds and settle up at the end of the session.</>,
    to: '/docs/features/player-results',
  },
  {
    glyph: '招',
    title: '招兵買馬 Beckon Invite',
    description: <>Organize a session and generate a copy-ready invite for chat.</>,
    to: '/docs/features/beckon-invite',
  },
  {
    glyph: '胡',
    title: '特別牌型 Special Hands',
    description: <>Look up common tai values and winning-layout examples for special hands.</>,
    to: '/docs/features/special-hands',
  },
];

function Feature({glyph, title, description, to}: FeatureItem) {
  return (
    <Link to={to} className={styles.featureCard}>
      <span className={styles.featureGlyph} aria-hidden="true">{glyph}</span>
      <Heading as="h4">{title}</Heading>
      <p>{description}</p>
    </Link>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featureGrid}>
          {FeatureList.map((props) => (
            <Feature key={props.to} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
