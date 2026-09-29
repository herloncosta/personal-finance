type P = { className?: string };

const base = {
  fill: 'none',
  viewBox: '0 0 24 24',
  strokeWidth: 1.8,
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export const HomeIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
  </svg>
);

export const SwapIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

export const WalletIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M3 7.5A2.25 2.25 0 015.25 5.25h11.25c1.243 0 2.25 1.007 2.25 2.25v9.75c0 1.243-1.007 2.25-2.25 2.25H5.25A2.25 2.25 0 013 17.25V7.5zM3 7.5V6a2.25 2.25 0 012.25-2.25h12A2.25 2.25 0 0119.5 6v1.5M15.75 12.75h.008v.008h-.008v-.008z" />
  </svg>
);

export const TagIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z" />
  </svg>
);

export const OutIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

export const PlusIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const XIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const PencilIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const SparkIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

export const AlertIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export const BulbIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

export const UpIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M7 17L17 7M7 7h10v10" />
  </svg>
);

export const ChevronLeftIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

export const ChevronRightIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export const DownIcon = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden>
    <path d="M17 7L7 17M17 17H7V7" />
  </svg>
);
