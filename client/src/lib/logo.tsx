const Logo = ({ className }: { className: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 92 100"
      className={className}
    >
      <defs>
        <linearGradient id="SvgjsLinearGradient1895">
          <stop id="SvgjsStop1896" stopColor="#2d388a" offset="0" />
          <stop id="SvgjsStop1897" stopColor="#00aeef" offset="1" />
        </linearGradient>
      </defs>
      <g
        id="SvgjsG1891"
        //@ts-ignore
        featureKey="symbolFeature-0"
        transform="matrix(0.9101964477704314,0,0,0.9101964477704314,-7.466341523559079,-2.92809763926685)"
        fill="url(#SvgjsLinearGradient1895)"
      >
        <g>
          <path d="M8.203,42.885l44.208,53.898c0,0-11.808-53.9,5.148-93.566L8.203,42.885z" />
          <path d="M54.326,32.822c0,0-6.759,30.048-0.702,55.786c0,0-2.12-29.068,31.49-66.616L54.326,32.822z" />
          <path d="M55.752,93.512c0,0-0.625-21.529,12.094-41.182h23.951C91.797,52.33,71.204,63.594,55.752,93.512z" />
        </g>
      </g>
    </svg>
  );
};

export default Logo;
