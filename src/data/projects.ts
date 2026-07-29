export type ProjectVisual =
  | "robot-vision"
  | "language-model"
  | "client-server"
  | "state-machine"
  | "live-vision";

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  year: string;
  kind: string;
  accent: string;
  accentSoft: string;
  summary: string;
  role: string;
  problem: string;
  solution: string;
  stack: string[];
  pipeline: Array<{
    label: string;
    detail: string;
  }>;
  notes: string[];
  visual: ProjectVisual;
  links?: ProjectLink[];
};

export const projects: Project[] = [
  {
    slug: "robot-vision",
    number: "01",
    title: "Robot Vision Web Service",
    shortTitle: "Robot Vision",
    year: "2026",
    kind: "AAU lab project",
    accent: "#73e6a5",
    accentSoft: "rgba(115, 230, 165, 0.13)",
    summary:
      "A Python control system for a Niryo robot that detects objects on a conveyor, coordinates sensor events, and exposes the workflow through a browser.",
    role:
      "Vision pipeline, Flask controls, system integration, testing, and documentation.",
    problem:
      "Several asynchronous inputs — camera frames, IR sensors, speech commands, and robot state — had to become one predictable sorting workflow.",
    solution:
      "Perception, control, and interface work run in coordinated threads. The useful states and configuration are exposed through a small Flask interface.",
    stack: ["Python", "Flask", "OpenCV", "pyniryo", "threading", "IR sensors"],
    pipeline: [
      { label: "IR sensor", detail: "Object arrives" },
      { label: "Camera", detail: "Frame captured" },
      { label: "OpenCV", detail: "Object classified" },
      { label: "Niryo", detail: "Pick and place" },
    ],
    notes: [
      "Multithreaded control logic",
      "Live monitoring and configuration",
      "Speech-command interaction",
      "Configurable sorting rules",
    ],
    visual: "robot-vision",
    links: [
      {
        label: "Repository",
        href: "https://github.com/drkirka/masait",
      },
      {
        label: "Project page",
        href: "https://drkirka.github.io/masait",
      },
    ],
  },
  {
    slug: "language-assistant",
    number: "02",
    title: "LLM Language Learning Assistant",
    shortTitle: "LLM Assistant",
    year: "2026",
    kind: "Team project",
    accent: "#6ec8ff",
    accentSoft: "rgba(110, 200, 255, 0.13)",
    summary:
      "A local NLP assistant built around Mistral 3B for Japanese–English translation and language-learning workflows.",
    role:
      "Prompt design, multilingual data preparation, evaluation, and basic LoRA fine-tuning.",
    problem:
      "The goal was a useful learning workflow around a compact local model, with a setup the team could inspect and reproduce.",
    solution:
      "We tested structured prompts, compared translation behaviour, and adapted the model on multilingual examples with a lightweight LoRA setup.",
    stack: ["Python", "PyTorch", "Transformers", "Mistral 3B", "LoRA"],
    pipeline: [
      { label: "Dataset", detail: "Multilingual examples" },
      { label: "Prompt tests", detail: "Task and feedback format" },
      { label: "Mistral 3B", detail: "Local inference" },
      { label: "LoRA", detail: "Parameter-efficient tuning" },
    ],
    notes: [
      "Runs with a compact local model",
      "Japanese–English workflow",
      "Structured prompt experiments",
      "Basic parameter-efficient fine-tuning",
    ],
    visual: "language-model",
  },
  {
    slug: "gym-system",
    number: "03",
    title: "Gym Client–Server System",
    shortTitle: "Gym System",
    year: "2026",
    kind: "Team project",
    accent: "#ff6ba8",
    accentSoft: "rgba(255, 107, 168, 0.13)",
    summary:
      "A C++ fitness application with a client–server architecture, PostgreSQL persistence, and an interactive terminal interface.",
    role:
      "Client–server implementation, persistence integration, terminal UI, and containerized setup.",
    problem:
      "A stateful application had to stay understandable across the client, server, object mapping, and database boundary.",
    solution:
      "The system uses a clear C++ client–server split, maps domain objects through ODB, and packages services with Docker Compose.",
    stack: ["C++", "CMake", "ODB", "PostgreSQL", "FTXUI", "Docker"],
    pipeline: [
      { label: "FTXUI client", detail: "Interactive terminal UI" },
      { label: "C++ server", detail: "Application logic" },
      { label: "ODB", detail: "Object mapping" },
      { label: "PostgreSQL", detail: "Persistent data" },
    ],
    notes: [
      "Typed C++ domain model",
      "Interactive terminal interface",
      "PostgreSQL persistence",
      "Reproducible Docker Compose setup",
    ],
    visual: "client-server",
  },
  {
    slug: "matchmaking-bot",
    number: "04",
    title: "Matchmaking Telegram Bot",
    shortTitle: "Matchmaking Bot",
    year: "2025",
    kind: "Personal project",
    accent: "#ffc35d",
    accentSoft: "rgba(255, 195, 93, 0.13)",
    summary:
      "A Telegram bot in Python that guides users through a questionnaire and pairs compatible profiles.",
    role:
      "Conversation flow, state management, matching logic, and profile pairing.",
    problem:
      "A multi-step conversation needed to remain coherent when a user paused, restarted, or left profile data incomplete.",
    solution:
      "Each questionnaire step is explicit state, while profile collection and pairing logic remain separate.",
    stack: ["Python", "Telegram Bot API", "State machines", "Matching logic"],
    pipeline: [
      { label: "Profile", detail: "Start or continue" },
      { label: "Questions", detail: "Collect preferences" },
      { label: "Score", detail: "Compare profiles" },
      { label: "Pair", detail: "Return a match" },
    ],
    notes: [
      "Questionnaire-based onboarding",
      "Explicit conversation states",
      "Automated profile pairing",
      "Designed for interrupted sessions",
    ],
    visual: "state-machine",
  },
  {
    slug: "interactive-vision",
    number: "05",
    title: "Interactive Vision Web App",
    shortTitle: "Vision Web App",
    year: "2026",
    kind: "Personal project",
    accent: "#b49cff",
    accentSoft: "rgba(180, 156, 255, 0.13)",
    summary:
      "A browser-based computer vision experiment for real-time face, smile, and gesture detection from a live webcam feed.",
    role:
      "Live video pipeline, OpenCV detectors, browser interaction, and interface design.",
    problem:
      "Real-time detections had to become understandable feedback instead of an opaque stream of changing values.",
    solution:
      "Webcam frames feed several OpenCV detectors and recognition results are translated into immediate interface feedback.",
    stack: ["HTML", "CSS", "JavaScript", "OpenCV", "Webcam APIs"],
    pipeline: [
      { label: "Webcam", detail: "Live browser frames" },
      { label: "OpenCV", detail: "Visual processing" },
      { label: "Detectors", detail: "Face, smile, gesture" },
      { label: "Interface", detail: "Immediate feedback" },
    ],
    notes: [
      "Live webcam processing",
      "Multiple visual detectors",
      "Immediate interface feedback",
      "Built as an interactive experiment",
    ],
    visual: "live-vision",
  },
];

export const projectBySlug = new Map(
  projects.map((project) => [project.slug, project]),
);
