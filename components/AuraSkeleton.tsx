type Props = {
  width?: number | string;
  height?: number | string;
  radius?: number;
};

export default function AuraSkeleton({
  width = "100%",
  height = 20,
  radius = 12
}: Props) {
  return <div aria-hidden="true" className="aura-skeleton" style={{width,height,borderRadius:radius,flexShrink:0}} />;
}
