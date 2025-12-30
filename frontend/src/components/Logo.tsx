const Logo = ({ size = 40 }) => {
  return (
    <img
      src="/logo.png"
      alt="Kisan Sarathi Logo"
      width={size}
      height={size}
      className="rounded-full object-cover"
    />
  );
};

export default Logo;
