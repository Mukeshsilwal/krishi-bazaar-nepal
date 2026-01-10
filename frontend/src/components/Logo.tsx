import { useSettings } from '../hooks/useSettings';

const Logo = ({ size = 40 }) => {
  const { settings } = useSettings();
  return (
    <img
      src={settings.COMPANY_LOGO || "/logo.png"}
      alt={`${settings.COMPANY_NAME || 'Kisan Sarathi'} Logo`}
      width={size}
      height={size}
      className="rounded-full object-cover"
    />
  );
};

export default Logo;
