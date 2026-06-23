import type { SVGProps } from "react";

function baseProps(props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return {
    viewBox: "0 0 24 24",
    width: "1em",
    height: "1em",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    ...props,
  };
}

export function IconHome(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6a1 1 0 0 0-1-1H10a1 1 0 0 0-1 1v6H4a1 1 0 0 1-1-1v-10.5Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSparkles(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M12 2l1.2 4.2L17.4 7.4l-4.2 1.2L12 12.8 10.8 8.6 6.6 7.4l4.2-1.2L12 2Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path
        d="M19 11l.8 2.8 2.8.8-2.8.8L19 18l-.8-2.6-2.6-.8 2.6-.8L19 11Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M5 4.5h10.5A2.5 2.5 0 0 1 18 7v13.5H7.5A2.5 2.5 0 0 0 5 23V4.5Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path
        d="M18 20.5H7.5A2.5 2.5 0 0 0 5 23"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconNotebook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M7 4h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 0-2 2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path d="M9 8h7M9 12h7M9 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor" strokeWidth="1.6"
      />
      <path
        d="M19.4 15a7.95 7.95 0 0 0 .1-1l2-1.2-2-3.6-2.3.5a8.6 8.6 0 0 0-1.7-1l-.4-2.3H11l-.4 2.3a8.6 8.6 0 0 0-1.7 1L6.6 9.2l-2 3.6 2 1.2a7.95 7.95 0 0 0 0 2l-2 1.2 2 3.6 2.3-.5c.5.4 1.1.7 1.7 1l.4 2.3h4.2l.4-2.3c.6-.3 1.2-.6 1.7-1l2.3.5 2-3.6-2-1.2Z"
        stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLogout(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M10 7V6a2 2 0 0 1 2-2h7v16h-7a2 2 0 0 1-2-2v-1"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path
        d="M14 12H3m0 0 3-3m-3 3 3 3"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSun(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        stroke="currentColor" strokeWidth="1.6"
      />
      <path
        d="M12 2v2.2M12 19.8V22M4.2 12H2M22 12h-2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMoon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M20 14.5A7.5 7.5 0 0 1 9.5 4a6.5 6.5 0 1 0 10.5 10.5Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconTranslate(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M3 5h10M8 3v2M6 9c.5 2 2 3.5 4 4.5M10 9c-.5 2-2 3.5-4 4.5"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M12 19l2-5 2 5M13.5 17h3"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M3 19h3M19 5h2M21 5l-5 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconMic(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path
        d="M19 10a7 7 0 0 1-14 0M12 19v3M9 22h6"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
