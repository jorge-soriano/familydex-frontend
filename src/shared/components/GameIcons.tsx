import CoinSvg     from '../../assets/coin.svg?react';
import XpSvg       from '../../assets/star.svg?react';
import PokeballSvg from '../../assets/pokeball.svg?react';

interface IconProps { size?: number; style?: React.CSSProperties }

const base = (size: number, style?: React.CSSProperties): React.SVGProps<SVGSVGElement> => ({
  width: size, height: size,
  style: { display: 'inline-block', flexShrink: 0, verticalAlign: 'middle', ...style },
});

export function CoinIcon({ size = 16, style }: IconProps) {
  return <CoinSvg {...base(size, style)} />;
}

export function XpIcon({ size = 16, style }: IconProps) {
  return <XpSvg {...base(size, style)} />;
}

export function PokeballIcon({ size = 16, style }: IconProps) {
  return <PokeballSvg {...base(size, style)} />;
}
