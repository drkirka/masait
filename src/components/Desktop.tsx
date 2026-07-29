import { useEffect, useMemo, useRef, useState } from "react";
import {
  projectBySlug,
  projects,
  type Project,
} from "../data/projects";
import FaultyTerminal from "./FaultyTerminal";
import Noise from "./Noise";
import ProjectWindowContent from "./ProjectWindowContent";

type CoreWindowId = "projects" | "skills" | "about" | "cv" | "contact";
type ProjectWindowId = `project:${string}`;
type WindowId = CoreWindowId | ProjectWindowId;
type DesktopItemId = CoreWindowId;

type Position = {
  x: number;
  y: number;
};

type WindowState = {
  id: WindowId;
  minimized: boolean;
  maximized: boolean;
  position: Position;
};

type SelectionBox = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

type WindowMeta = {
  title: string;
  path: string;
  kind: "standard" | "project" | "cv";
  marker: string;
};

const LINKEDIN_URL = "https://at.linkedin.com/in/ir-bil";
const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const CV_URL = publicAsset("documents/Irina_Bilinskaia_CV.pdf");
const CV_PAGE_URL = publicAsset(
  "documents/Irina_Bilinskaia_CV-page-1.png",
);
const MONKEY_URL = publicAsset("images/github-monkey.jpg");
const LOGIN_SESSION_KEY = "irina-portfolio-entered-v4";
const ICON_STORAGE_KEY = "irina-desktop-icon-offsets-v2";

const coreWindowAccents: Record<CoreWindowId, string> = {
  projects: "#ff5d9d",
  skills: "#5ac8fa",
  about: "#ffd45c",
  cv: "#ff7968",
  contact: "#67e8a4",
};

const initialIconOffsets: Record<DesktopItemId, Position> = {
  projects: { x: 0, y: 0 },
  skills: { x: 0, y: 0 },
  about: { x: 0, y: 0 },
  cv: { x: 0, y: 0 },
  contact: { x: 0, y: 0 },
};

const initialWindowPositions: Record<CoreWindowId, Position> = {
  projects: { x: -150, y: -10 },
  skills: { x: 110, y: 18 },
  about: { x: -90, y: 52 },
  cv: { x: 0, y: -22 },
  contact: { x: 140, y: 60 },
};

const skillGroups = [
  {
    label: "Languages",
    items: ["Python", "C", "C++", "JavaScript", "HTML/CSS"],
  },
  {
    label: "AI / ML",
    items: ["PyTorch", "scikit-learn", "NumPy", "Transformers"],
  },
  {
    label: "Vision & robotics",
    items: ["OpenCV", "Arduino", "Niryo Robots", "Sensor integration"],
  },
  {
    label: "Systems & tools",
    items: ["Flask", "REST APIs", "Git", "Linux", "Docker", "Jupyter"],
  },
];

const coreWindowMeta: Record<CoreWindowId, WindowMeta> = {
  projects: {
    title: "Projects",
    path: "~/Desktop/Projects",
    kind: "standard",
    marker: "DIR",
  },
  skills: {
    title: "Skills",
    path: "~/Desktop/Skills",
    kind: "standard",
    marker: "</>",
  },
  about: {
    title: "About me.txt",
    path: "~/Desktop/About me.txt",
    kind: "standard",
    marker: "TXT",
  },
  cv: {
    title: "Irina_Bilinskaia_CV.pdf",
    path: "~/Desktop/Irina_Bilinskaia_CV.pdf",
    kind: "cv",
    marker: "PDF",
  },
  contact: {
    title: "Contact",
    path: "~/Desktop/Contact",
    kind: "standard",
    marker: "@",
  },
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const projectWindowId = (slug: string): ProjectWindowId => `project:${slug}`;

const isProjectWindowId = (id: WindowId): id is ProjectWindowId =>
  id.startsWith("project:");

const projectFromWindowId = (id: WindowId): Project | undefined => {
  if (!isProjectWindowId(id)) return undefined;
  return projectBySlug.get(id.slice("project:".length));
};

const getWindowAccent = (id: WindowId) =>
  projectFromWindowId(id)?.accent ??
  coreWindowAccents[id as CoreWindowId] ??
  "#67e8a4";

const getWindowMeta = (id: WindowId): WindowMeta => {
  if (!isProjectWindowId(id)) return coreWindowMeta[id];
  const project = projectFromWindowId(id);
  return {
    title: project?.title ?? "Project",
    path: `~/Desktop/Projects/${project?.slug ?? "unknown"}`,
    kind: "project",
    marker: project?.number ?? "PRJ",
  };
};

const getInitialWindowPosition = (id: WindowId): Position => {
  if (!isProjectWindowId(id)) return initialWindowPositions[id];
  const project = projectFromWindowId(id);
  const index = Math.max(
    0,
    projects.findIndex((item) => item.slug === project?.slug),
  );
  return {
    x: -56 + index * 24,
    y: -4 + (index % 3) * 22,
  };
};

const createWindowState = (id: WindowId): WindowState => ({
  id,
  minimized: false,
  maximized: false,
  position: getInitialWindowPosition(id),
});

function FolderGlyph({ open = false }: { open?: boolean }) {
  return (
    <span className={`folder-glyph ${open ? "is-open" : ""}`} aria-hidden="true">
      <span className="folder-paper folder-paper-one" />
      <span className="folder-paper folder-paper-two" />
      <span className="folder-back" />
      <span className="folder-front" />
    </span>
  );
}

function FileGlyph({ type }: { type: "pdf" | "text" | "contact" }) {
  if (type === "contact") {
    return (
      <span className="contact-glyph" aria-hidden="true">
        <span className="contact-glyph-flap" />
      </span>
    );
  }

  return (
    <span className={`file-glyph file-glyph-${type}`} aria-hidden="true">
      <span className="file-fold" />
      <span className="file-mark">
        {type === "pdf" ? "PDF" : "TXT"}
      </span>
      <span className="file-line file-line-one" />
      <span className="file-line file-line-two" />
    </span>
  );
}

function DesktopIcon({
  id,
  label,
  kind,
  accent,
  active,
  selected,
  offset,
  onOpen,
  onMove,
  onSelect,
}: {
  id: DesktopItemId;
  label: string;
  kind: "folder" | "pdf" | "text" | "contact";
  accent: string;
  active: boolean;
  selected: boolean;
  offset: Position;
  onOpen: () => void;
  onMove: (id: DesktopItemId, position: Position) => void;
  onSelect: (id: DesktopItemId, additive: boolean) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const suppressClickRef = useRef(false);
  const dragRef = useRef<{
    pointerId: number;
    pointerX: number;
    pointerY: number;
    startOffset: Position;
    startRect: DOMRect;
    moved: boolean;
  } | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      startOffset: offset,
      startRect: event.currentTarget.getBoundingClientRect(),
      moved: false,
    };
    onSelect(id, event.shiftKey);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const rawX = event.clientX - drag.pointerX;
    const rawY = event.clientY - drag.pointerY;
    if (!drag.moved && Math.hypot(rawX, rawY) < 5) return;

    drag.moved = true;
    setIsDragging(true);

    const minimumX = 8 - drag.startRect.left;
    const maximumX = window.innerWidth - 8 - drag.startRect.right;
    const minimumY = 44 - drag.startRect.top;
    const maximumY = window.innerHeight - 8 - drag.startRect.bottom;

    onMove(id, {
      x:
        drag.startOffset.x +
        clamp(rawX, minimumX, Math.max(minimumX, maximumX)),
      y:
        drag.startOffset.y +
        clamp(rawY, minimumY, Math.max(minimumY, maximumY)),
    });
  };

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    setIsDragging(false);
  };

  return (
    <button
      className={`desktop-icon${active ? " is-open" : ""}${
        selected ? " is-selected" : ""
      }${isDragging ? " is-dragging" : ""}`}
      type="button"
      data-desktop-item={id}
      style={
        {
          "--icon-x": `${offset.x}px`,
          "--icon-y": `${offset.y}px`,
          "--item-accent": accent,
        } as React.CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onClick={() => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        onOpen();
      }}
      aria-label={`Open ${label}`}
    >
      <span className="desktop-icon-visual">
        {kind === "folder" ? (
          <FolderGlyph open={active} />
        ) : (
          <FileGlyph type={kind} />
        )}
      </span>
      <span className="desktop-icon-label">{label}</span>
    </button>
  );
}

function WindowContent({
  id,
  onOpenWindow,
}: {
  id: WindowId;
  onOpenWindow: (id: WindowId) => void;
}) {
  const project = projectFromWindowId(id);

  if (project) return <ProjectWindowContent project={project} />;

  if (id === "projects") {
    return (
      <div className="project-file-list">
        <div className="file-list-heading" aria-hidden="true">
          <span>Name</span>
          <span>Context</span>
          <span>Year</span>
        </div>
        {projects.map((item) => (
          <button
            className="project-file"
            type="button"
            key={item.slug}
            onClick={() => onOpenWindow(projectWindowId(item.slug))}
            style={
              {
                "--project-accent": item.accent,
              } as React.CSSProperties
            }
          >
            <span className="project-file-index">{item.number}</span>
            <span className="project-file-copy">
              <strong>{item.title}</strong>
              <small>{item.kind}</small>
            </span>
            <span className="project-file-year">{item.year}</span>
          </button>
        ))}
      </div>
    );
  }

  if (id === "skills") {
    return (
      <div className="skills-window-grid">
        {skillGroups.map((group) => (
          <section className="skill-group" key={group.label}>
            <p>{group.label}</p>
            <ul>
              {group.items.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  if (id === "about") {
    return (
      <article className="about-window">
        <p className="text-file-name">About me.txt</p>
        <h2>Hi, I&apos;m Irina.</h2>
        <p>
          I study Artificial Intelligence &amp; Robotics at the University of
          Klagenfurt. Most of my projects involve Python, cameras, sensors or
          robots — sometimes all four.
        </p>
        <p>
          Recently I&apos;ve also been doing CTF challenges and learning more
          electronics than I originally planned.
        </p>
        <dl>
          <div>
            <dt>Location</dt>
            <dd>Klagenfurt, Austria</dd>
          </div>
          <div>
            <dt>Languages</dt>
            <dd>English C1 · German B2</dd>
          </div>
          <div>
            <dt>University</dt>
            <dd>AAU Klagenfurt</dd>
          </div>
        </dl>
      </article>
    );
  }

  if (id === "contact") {
    return (
      <address className="contact-window">
        <p className="text-file-name">Contact</p>
        <h2>Based in Klagenfurt, Austria.</h2>
        <p>
          Student roles around robotics, computer vision, backend, or applied
          AI are the best fit.
        </p>
        <a href="mailto:kirkaera@gmail.com">
          <span>Email</span>
          <strong>kirkaera@gmail.com</strong>
          <small>write ↗</small>
        </a>
        <a href="https://github.com/drkirka" target="_blank" rel="noreferrer">
          <span>GitHub</span>
          <strong>github.com/drkirka</strong>
          <small>open ↗</small>
        </a>
        <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
          <span>LinkedIn</span>
          <strong>linkedin.com/in/ir-bil</strong>
          <small>open ↗</small>
        </a>
      </address>
    );
  }

  return (
    <div className="cv-window">
      <img
        className="cv-page-image"
        src={CV_PAGE_URL}
        width={1241}
        height={1754}
        alt="Page 1 of Irina Bilinskaia's CV"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function DesktopWindow({
  state,
  focused,
  zIndex,
  onClose,
  onFocus,
  onMinimize,
  onMove,
  onToggleMaximize,
  onOpenWindow,
}: {
  state: WindowState;
  focused: boolean;
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  onMove: (position: Position) => void;
  onToggleMaximize: () => void;
  onOpenWindow: (id: WindowId) => void;
}) {
  const meta = getWindowMeta(state.id);
  const titleId = `title-${state.id.replace(":", "-")}`;
  const elementId = `window-${state.id}`;
  const dragRef = useRef<{
    pointerId: number;
    pointerX: number;
    pointerY: number;
    startX: number;
    startY: number;
    startRect: DOMRect;
  } | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onFocus();
    if (state.maximized || window.innerWidth <= 760 || event.button !== 0) {
      return;
    }
    if ((event.target as HTMLElement).closest("button, a")) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: state.position.x,
      startY: state.position.y,
      startRect: event.currentTarget.parentElement!.getBoundingClientRect(),
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.pointerX;
    const deltaY = event.clientY - drag.pointerY;
    const minimumDeltaX = 124 - drag.startRect.right;
    const maximumDeltaX = window.innerWidth - 124 - drag.startRect.left;
    const minimumDeltaY = 40 - drag.startRect.top;
    const maximumDeltaY = window.innerHeight - 76 - drag.startRect.top;

    onMove({
      x:
        drag.startX +
        clamp(deltaX, minimumDeltaX, Math.max(minimumDeltaX, maximumDeltaX)),
      y:
        drag.startY +
        clamp(deltaY, minimumDeltaY, Math.max(minimumDeltaY, maximumDeltaY)),
    });
  };

  const finishDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      dragRef.current &&
      event.currentTarget.hasPointerCapture(dragRef.current.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(dragRef.current.pointerId);
    }
    dragRef.current = null;
  };

  return (
    <section
      id={elementId}
      className={`desktop-window is-${meta.kind}-window${
        focused ? " is-focused" : ""
      }${state.maximized ? " is-maximized" : ""}`}
      style={
        {
          "--window-x": `${state.position.x}px`,
          "--window-y": `${state.position.y}px`,
          "--window-accent": getWindowAccent(state.id),
          zIndex,
        } as React.CSSProperties
      }
      data-window-id={state.id}
      hidden={state.minimized}
      tabIndex={-1}
      onPointerDown={onFocus}
      aria-labelledby={titleId}
    >
      <div
        className="window-titlebar"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDragging}
        onPointerCancel={finishDragging}
        onDoubleClick={(event) => {
          if ((event.target as HTMLElement).closest("button, a")) return;
          onToggleMaximize();
        }}
      >
        <span className="window-app-mark" aria-hidden="true">
          {meta.marker}
        </span>
        <strong className="window-title" id={titleId}>
          {meta.title}
        </strong>
        <div className="window-controls">
          <button
            type="button"
            onClick={onMinimize}
            aria-label={`Minimize ${meta.title}`}
            title="Minimize"
          >
            <span aria-hidden="true">—</span>
          </button>
          <button
            type="button"
            onClick={onToggleMaximize}
            aria-label={`${state.maximized ? "Restore" : "Maximize"} ${
              meta.title
            }`}
            title={state.maximized ? "Restore" : "Maximize"}
          >
            <span aria-hidden="true">{state.maximized ? "❐" : "□"}</span>
          </button>
          <button
            className="window-close"
            type="button"
            onClick={onClose}
            aria-label={`Close ${meta.title}`}
            title="Close"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>

      <div className="window-location">
        <span>{meta.path}</span>
        {state.id === "cv" && (
          <a href={CV_URL} download="Irina_Bilinskaia_CV.pdf">
            Download PDF <span aria-hidden="true">↓</span>
          </a>
        )}
      </div>

      <div className="window-content">
        <WindowContent id={state.id} onOpenWindow={onOpenWindow} />
      </div>
    </section>
  );
}

function LoginScreen({
  clock,
  date,
  leaving,
  onEnter,
}: {
  clock: string;
  date: string;
  leaving: boolean;
  onEnter: () => void;
}) {
  return (
    <section
      className={`login-screen${leaving ? " is-leaving" : ""}`}
      aria-label="Portfolio welcome screen"
    >
      <FaultyTerminal
        scale={1.36}
        gridMul={[2, 1]}
        digitSize={1.32}
        timeScale={0.48}
        scanlineIntensity={0.62}
        glitchAmount={0.72}
        flickerAmount={0.46}
        noiseAmp={0.88}
        curvature={0.035}
        tint="#63f2a6"
        mouseStrength={0.14}
        pageLoadAnimation
        brightness={1}
      />
      <div className="login-scrim" aria-hidden="true" />

      <div className="login-clock" aria-label={`${date}, ${clock}`}>
        <strong>{clock}</strong>
        <span>{date}</span>
      </div>

      <div className="login-user">
        <img
          src={MONKEY_URL}
          width={460}
          height={460}
          alt=""
          loading="eager"
          decoding="async"
        />
        <h1>Irina Bilinskaia</h1>
        <p>Robotics &amp; AI portfolio</p>
        <button type="button" onClick={onEnter}>
          View portfolio <span aria-hidden="true">→</span>
        </button>
      </div>

      <p className="login-note">Klagenfurt, Austria</p>
    </section>
  );
}

function LinuxPanel({
  windows,
  foregroundWindow,
  clock,
  date,
  onShowDesktop,
  onToggleWindow,
}: {
  windows: WindowState[];
  foregroundWindow: WindowId | null;
  clock: string;
  date: string;
  onShowDesktop: () => void;
  onToggleWindow: (id: WindowId) => void;
}) {
  return (
    <header className="linux-panel">
      <button
        className="workspace-button"
        type="button"
        onClick={onShowDesktop}
        aria-label="Show desktop"
      >
        <span>1</span>
        portfolio
      </button>

      <nav className="window-task-list" aria-label="Open windows">
        {windows.length === 0 ? (
          <span className="empty-task-list">~/Desktop</span>
        ) : (
          windows.map((windowState) => {
            const meta = getWindowMeta(windowState.id);
            return (
              <button
                type="button"
                key={windowState.id}
                className={`${foregroundWindow === windowState.id ? "is-active" : ""}${
                  windowState.minimized ? " is-minimized" : ""
                }`}
                style={
                  {
                    "--window-accent": getWindowAccent(windowState.id),
                  } as React.CSSProperties
                }
                onClick={() => onToggleWindow(windowState.id)}
                title={meta.title}
              >
                <span>{meta.marker}</span>
                {meta.title}
              </button>
            );
          })
        )}
      </nav>

      <div className="panel-clock">
        <span>{date}</span>
        <strong>{clock}</strong>
      </div>
    </header>
  );
}

function DesktopDock({
  windows,
  foregroundWindow,
  onShowDesktop,
  onToggleWindow,
}: {
  windows: WindowState[];
  foregroundWindow: WindowId | null;
  onShowDesktop: () => void;
  onToggleWindow: (id: WindowId) => void;
}) {
  const items: Array<{
    label: string;
    accent: string;
    onClick: () => void;
    icon: React.ReactNode;
    windowId?: CoreWindowId;
  }> = [
    {
      label: "Home",
      accent: "#f2f0e9",
      onClick: onShowDesktop,
      icon: <span className="dock-home-glyph" aria-hidden="true">⌂</span>,
    },
    {
      label: "Projects",
      accent: coreWindowAccents.projects,
      windowId: "projects",
      onClick: () => onToggleWindow("projects"),
      icon: (
        <FolderGlyph
          open={windows.some((windowState) => windowState.id === "projects")}
        />
      ),
    },
    {
      label: "Skills",
      accent: coreWindowAccents.skills,
      windowId: "skills",
      onClick: () => onToggleWindow("skills"),
      icon: <span className="dock-code-glyph" aria-hidden="true">&lt;/&gt;</span>,
    },
    {
      label: "About",
      accent: coreWindowAccents.about,
      windowId: "about",
      onClick: () => onToggleWindow("about"),
      icon: <FileGlyph type="text" />,
    },
    {
      label: "CV",
      accent: coreWindowAccents.cv,
      windowId: "cv",
      onClick: () => onToggleWindow("cv"),
      icon: <FileGlyph type="pdf" />,
    },
    {
      label: "Contact",
      accent: coreWindowAccents.contact,
      windowId: "contact",
      onClick: () => onToggleWindow("contact"),
      icon: <FileGlyph type="contact" />,
    },
  ];

  return (
    <nav className="desktop-dock" aria-label="Desktop shortcuts">
      {items.map((item) => {
        const running =
          item.windowId !== undefined &&
          windows.some((windowState) => windowState.id === item.windowId);
        const foreground = item.windowId === foregroundWindow;

        return (
          <button
            type="button"
            className={`dock-item${running ? " is-running" : ""}${
              foreground ? " is-foreground" : ""
            }`}
            key={item.label}
            onClick={item.onClick}
            aria-label={item.label}
            aria-pressed={item.windowId ? foreground : undefined}
            style={
              {
                "--dock-accent": item.accent,
              } as React.CSSProperties
            }
          >
            <span className="dock-tooltip">{item.label}</span>
            <span className="dock-icon">{item.icon}</span>
            {running && <span className="dock-running" aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}

export default function Desktop({
  initialProjectSlug,
}: {
  initialProjectSlug?: string;
}) {
  const initialProjectId =
    initialProjectSlug && projectBySlug.has(initialProjectSlug)
      ? projectWindowId(initialProjectSlug)
      : null;
  const [openWindows, setOpenWindows] = useState<WindowState[]>(() =>
    initialProjectId ? [createWindowState(initialProjectId)] : [],
  );
  const [loginVisible, setLoginVisible] = useState(true);
  const [loginLeaving, setLoginLeaving] = useState(false);
  const [clock, setClock] = useState("--:--");
  const [iconOffsets, setIconOffsets] =
    useState<Record<DesktopItemId, Position>>(initialIconOffsets);
  const [selectedItems, setSelectedItems] = useState<DesktopItemId[]>([]);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [positionsReady, setPositionsReady] = useState(false);
  const shellRef = useRef<HTMLElement>(null);
  const selectionRef = useRef<SelectionBox | null>(null);

  useEffect(() => {
    const updateClock = () => {
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };
    updateClock();
    const timer = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        if (window.sessionStorage.getItem(LOGIN_SESSION_KEY) === "1") {
          setLoginVisible(false);
        }
      } catch {
        // storage unavailable
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const savedPositions = window.localStorage.getItem(ICON_STORAGE_KEY);
        if (savedPositions) {
          const parsed = JSON.parse(savedPositions) as Partial<
            Record<DesktopItemId, Position>
          >;
          setIconOffsets((current) => {
            const next = { ...current };
            (Object.keys(initialIconOffsets) as DesktopItemId[]).forEach(
              (id) => {
                const value = parsed[id];
                if (
                  value &&
                  Number.isFinite(value.x) &&
                  Number.isFinite(value.y)
                ) {
                  next[id] = value;
                }
              },
            );
            return next;
          });
        }
      } catch {
        try {
          window.localStorage.removeItem(ICON_STORAGE_KEY);
        } catch {
          // storage unavailable
        }
      } finally {
        setPositionsReady(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!positionsReady) return;
    try {
      window.localStorage.setItem(
        ICON_STORAGE_KEY,
        JSON.stringify(iconOffsets),
      );
    } catch {
      // keep positions in memory
    }
  }, [iconOffsets, positionsReady]);

  useEffect(() => {
    if (!positionsReady || loginVisible) return;

    let frame = 0;
    const keepIconsOnScreen = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const shell = shellRef.current;
        if (!shell) return;

        setIconOffsets((current) => {
          let changed = false;
          const next = { ...current };

          (
            Object.keys(initialIconOffsets) as DesktopItemId[]
          ).forEach((id) => {
            const element = shell.querySelector<HTMLElement>(
              `[data-desktop-item="${id}"]`,
            );
            if (!element) return;
            const rect = element.getBoundingClientRect();
            let shiftX = 0;
            let shiftY = 0;
            if (rect.left < 8) shiftX = 8 - rect.left;
            if (rect.right > window.innerWidth - 8) {
              shiftX = window.innerWidth - 8 - rect.right;
            }
            if (rect.top < 42) shiftY = 42 - rect.top;
            if (rect.bottom > window.innerHeight - 8) {
              shiftY = window.innerHeight - 8 - rect.bottom;
            }
            if (shiftX || shiftY) {
              next[id] = {
                x: current[id].x + shiftX,
                y: current[id].y + shiftY,
              };
              changed = true;
            }
          });

          return changed ? next : current;
        });
      });
    };

    keepIconsOnScreen();
    window.addEventListener("resize", keepIconsOnScreen);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", keepIconsOnScreen);
    };
  }, [loginVisible, positionsReady]);

  const desktopDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }).format(new Date()),
    [],
  );

  const loginDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  const foregroundWindow =
    [...openWindows].reverse().find((windowState) => !windowState.minimized)
      ?.id ?? null;

  const focusWindowElement = (id: WindowId) => {
    window.requestAnimationFrame(() => {
      document.getElementById(`window-${id}`)?.focus({ preventScroll: true });
    });
  };

  const openDesktopWindow = (id: WindowId) => {
    setOpenWindows((current) => {
      const existing = current.find((windowState) => windowState.id === id);
      if (!existing) return [...current, createWindowState(id)];
      return [
        ...current.filter((windowState) => windowState.id !== id),
        { ...existing, minimized: false },
      ];
    });
    focusWindowElement(id);
  };

  const focusWindow = (id: WindowId) => {
    setOpenWindows((current) => {
      const existing = current.find((windowState) => windowState.id === id);
      if (!existing || current[current.length - 1]?.id === id) return current;
      return [
        ...current.filter((windowState) => windowState.id !== id),
        existing,
      ];
    });
  };

  const closeWindow = (id: WindowId) => {
    setOpenWindows((current) =>
      current.filter((windowState) => windowState.id !== id),
    );
  };

  const minimizeWindow = (id: WindowId) => {
    setOpenWindows((current) =>
      current.map((windowState) =>
        windowState.id === id
          ? { ...windowState, minimized: true }
          : windowState,
      ),
    );
  };

  const toggleMaximize = (id: WindowId) => {
    setOpenWindows((current) =>
      current.map((windowState) =>
        windowState.id === id
          ? { ...windowState, maximized: !windowState.maximized }
          : windowState,
      ),
    );
  };

  const moveWindow = (id: WindowId, position: Position) => {
    setOpenWindows((current) =>
      current.map((windowState) =>
        windowState.id === id ? { ...windowState, position } : windowState,
      ),
    );
  };

  const toggleTaskWindow = (id: WindowId) => {
    const state = openWindows.find((windowState) => windowState.id === id);
    if (state && !state.minimized && foregroundWindow === id) {
      minimizeWindow(id);
      return;
    }
    openDesktopWindow(id);
  };

  const showDesktop = () => {
    setOpenWindows((current) =>
      current.map((windowState) => ({
        ...windowState,
        minimized: true,
      })),
    );
  };

  const enterDesktop = () => {
    if (loginLeaving) return;
    setLoginLeaving(true);
    try {
      window.sessionStorage.setItem(LOGIN_SESSION_KEY, "1");
    } catch {
      // storage unavailable
    }
    window.setTimeout(() => setLoginVisible(false), 520);
  };

  const moveIcon = (id: DesktopItemId, position: Position) => {
    setIconOffsets((current) => ({ ...current, [id]: position }));
  };

  const selectIcon = (id: DesktopItemId, additive: boolean) => {
    setSelectedItems((current) => {
      if (!additive) return [id];
      return current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
    });
  };

  const beginSelection = (event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (
      target.closest(
        "button, a, .desktop-window, .linux-panel, .desktop-dock",
      )
    ) {
      return;
    }

    const shell = shellRef.current;
    if (!shell) return;
    const shellRect = shell.getBoundingClientRect();
    const nextSelection = {
      startX: event.clientX - shellRect.left,
      startY: event.clientY - shellRect.top,
      currentX: event.clientX - shellRect.left,
      currentY: event.clientY - shellRect.top,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    selectionRef.current = nextSelection;
    setSelectionBox(nextSelection);
    setSelectedItems([]);
  };

  const updateSelection = (event: React.PointerEvent<HTMLElement>) => {
    const selection = selectionRef.current;
    const shell = shellRef.current;
    if (!selection || !shell) return;

    const shellRect = shell.getBoundingClientRect();
    const nextSelection = {
      ...selection,
      currentX: clamp(event.clientX - shellRect.left, 0, shellRect.width),
      currentY: clamp(event.clientY - shellRect.top, 38, shellRect.height),
    };
    selectionRef.current = nextSelection;
    setSelectionBox(nextSelection);

    const left =
      shellRect.left +
      Math.min(nextSelection.startX, nextSelection.currentX);
    const right =
      shellRect.left +
      Math.max(nextSelection.startX, nextSelection.currentX);
    const top =
      shellRect.top +
      Math.min(nextSelection.startY, nextSelection.currentY);
    const bottom =
      shellRect.top +
      Math.max(nextSelection.startY, nextSelection.currentY);

    setSelectedItems(
      Array.from(
        shell.querySelectorAll<HTMLElement>("[data-desktop-item]"),
      )
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.left < right &&
            rect.right > left &&
            rect.top < bottom &&
            rect.bottom > top
          );
        })
        .map((element) => element.dataset.desktopItem as DesktopItemId),
    );
  };

  const finishSelection = (event: React.PointerEvent<HTMLElement>) => {
    if (!selectionRef.current) return;
    selectionRef.current = null;
    setSelectionBox(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (loginVisible) {
    return (
      <main className="desktop-shell login-shell">
        <LoginScreen
          clock={clock}
          date={loginDate}
          leaving={loginLeaving}
          onEnter={enterDesktop}
        />
      </main>
    );
  }

  return (
    <main
      className="desktop-shell"
      ref={shellRef}
      onPointerDown={beginSelection}
      onPointerMove={updateSelection}
      onPointerUp={finishSelection}
      onPointerCancel={finishSelection}
    >
      <div className="desktop-atmosphere" aria-hidden="true" />
      <Noise fps={8} patternAlpha={14} />

      <LinuxPanel
        windows={openWindows}
        foregroundWindow={foregroundWindow}
        clock={clock}
        date={desktopDate}
        onShowDesktop={showDesktop}
        onToggleWindow={toggleTaskWindow}
      />

      {selectionBox && (
        <div
          className="selection-marquee"
          aria-hidden="true"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY),
          }}
        />
      )}

      <section className="identity-widget" aria-label="Portfolio introduction">
        <p>~/portfolio</p>
        <h1>Irina Bilinskaia</h1>
        <span>AI &amp; Robotics · AAU Klagenfurt</span>
        <small>Python, computer vision, robotics, and embedded experiments.</small>
      </section>

      <section className="desktop-icon-grid" aria-label="Desktop files">
        <DesktopIcon
          id="projects"
          label="Projects"
          kind="folder"
          accent={coreWindowAccents.projects}
          active={openWindows.some((item) => item.id === "projects")}
          selected={selectedItems.includes("projects")}
          offset={iconOffsets.projects}
          onOpen={() => openDesktopWindow("projects")}
          onMove={moveIcon}
          onSelect={selectIcon}
        />
        <DesktopIcon
          id="skills"
          label="Skills"
          kind="folder"
          accent={coreWindowAccents.skills}
          active={openWindows.some((item) => item.id === "skills")}
          selected={selectedItems.includes("skills")}
          offset={iconOffsets.skills}
          onOpen={() => openDesktopWindow("skills")}
          onMove={moveIcon}
          onSelect={selectIcon}
        />
        <DesktopIcon
          id="about"
          label="About me.txt"
          kind="text"
          accent={coreWindowAccents.about}
          active={openWindows.some((item) => item.id === "about")}
          selected={selectedItems.includes("about")}
          offset={iconOffsets.about}
          onOpen={() => openDesktopWindow("about")}
          onMove={moveIcon}
          onSelect={selectIcon}
        />
        <DesktopIcon
          id="cv"
          label="Irina_CV.pdf"
          kind="pdf"
          accent={coreWindowAccents.cv}
          active={openWindows.some((item) => item.id === "cv")}
          selected={selectedItems.includes("cv")}
          offset={iconOffsets.cv}
          onOpen={() => openDesktopWindow("cv")}
          onMove={moveIcon}
          onSelect={selectIcon}
        />
        <DesktopIcon
          id="contact"
          label="Contact"
          kind="contact"
          accent={coreWindowAccents.contact}
          active={openWindows.some((item) => item.id === "contact")}
          selected={selectedItems.includes("contact")}
          offset={iconOffsets.contact}
          onOpen={() => openDesktopWindow("contact")}
          onMove={moveIcon}
          onSelect={selectIcon}
        />
      </section>

      <p className="desktop-hint">
        drag files to move · drag empty space to select
      </p>

      <DesktopDock
        windows={openWindows}
        foregroundWindow={foregroundWindow}
        onShowDesktop={showDesktop}
        onToggleWindow={toggleTaskWindow}
      />

      {openWindows.map((windowState, index) => (
        <DesktopWindow
          key={windowState.id}
          state={windowState}
          focused={foregroundWindow === windowState.id}
          zIndex={20 + index}
          onClose={() => closeWindow(windowState.id)}
          onFocus={() => focusWindow(windowState.id)}
          onMinimize={() => minimizeWindow(windowState.id)}
          onMove={(position) => moveWindow(windowState.id, position)}
          onToggleMaximize={() => toggleMaximize(windowState.id)}
          onOpenWindow={openDesktopWindow}
        />
      ))}
    </main>
  );
}
