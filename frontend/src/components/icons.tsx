import type { SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      {...props}
    />
  );
}

export const DashboardIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75a3 3 0 0 1 3-3h10.5a3 3 0 0 1 3 3v10.5a3 3 0 0 1-3 3H6.75a3 3 0 0 1-3-3V6.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25v7.5M15 8.25v3.75" />
  </Icon>
);

export const MonitorIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5v10.5H3.75zM8.25 20.25h7.5M12 15.75v4.5" />
  </Icon>
);

export const ChartIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16v-4M12 16V8M17 16v-7" />
  </Icon>
);

export const CameraIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25a2 2 0 0 1 2-2h1.379a1 1 0 0 0 .857-.485l.85-1.415A2 2 0 0 1 8.9 3.375h6.2a2 2 0 0 1 1.564.973l.85 1.415a1 1 0 0 0 .857.485H19.75a2 2 0 0 1 2 2v9.5a2 2 0 0 1-2 2H4.25a2 2 0 0 1-2-2v-9.5Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
  </Icon>
);

export const AlertIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3h.008M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.3 2.25h17.76a1.5 1.5 0 0 0 1.3-2.25L13.71 3.86a1.5 1.5 0 0 0-2.42 0Z" />
  </Icon>
);

export const IncidentIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </Icon>
);

export const ReportIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 3h6M9 9h1.5M6.75 3.75h10.5A2.25 2.25 0 0 1 19.5 6v14.25l-3-1.5-2.25 1.5-2.25-1.5-2.25 1.5-3-1.5V6a2.25 2.25 0 0 1 2.25-2.25Z" />
  </Icon>
);

export const UsersIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </Icon>
);

export const AuditIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75s-5.25-3.022-5.25-6.75c0-1.047.83-1.867 1.867-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c1.472 0 2.882.265 4.185.75M12 12.75c-1.472 0-2.882.265-4.185.75M4.05 6.75a24.3 24.3 0 0 1 15.9 0M9 6.75v-.75a3 3 0 1 1 6 0v.75" />
  </Icon>
);

export const LogoutIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3" />
  </Icon>
);

export const PlayIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M8 5.14v13.72a1 1 0 0 0 1.5.87l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.87Z" />
  </svg>
);

export const SunIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-2.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </Icon>
);

export const MoonIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </Icon>
);

export const BellIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </Icon>
);
