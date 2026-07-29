import type { Project } from "../data/projects";

function ProjectLinks({ project }: { project: Project }) {
  if (!project.links?.length) return null;

  return (
    <div className="project-links" aria-label={`${project.title} links`}>
      {project.links.map((link) => (
        <a
          href={link.href}
          key={link.href}
          target="_blank"
          rel="noreferrer"
        >
          {link.label}
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}

function RobotVisionDiagram({ project }: { project: Project }) {
  return (
    <section className="robot-vision-diagram" aria-label="Robot vision flow">
      <div className="robot-sensor">
        <span className="sensor-beam" />
        <small>trigger</small>
      </div>
      {project.pipeline.map((stage, index) => (
        <div className="robot-stage" key={stage.label}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{stage.label}</strong>
          <small>{stage.detail}</small>
        </div>
      ))}
      <div className="robot-arm" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}

function LanguageModelPanel({ project }: { project: Project }) {
  return (
    <section className="model-workbench">
      <div className="model-config">
        <p>training/config.py</p>
        <pre>
          <code>{`base_model = "Mistral 3B"
task = "Japanese ↔ English"
adapter = "LoRA"
runtime = "local"`}</code>
        </pre>
      </div>
      <div className="model-steps" aria-label="Language model workflow">
        {project.pipeline.map((stage) => (
          <div key={stage.label}>
            <span />
            <strong>{stage.label}</strong>
            <small>{stage.detail}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClientServerMap({ project }: { project: Project }) {
  return (
    <section className="client-server-map" aria-label="Client server map">
      <span className="docker-boundary">docker compose</span>
      {project.pipeline.map((stage, index) => (
        <div className={`service-node service-node-${index + 1}`} key={stage.label}>
          <span>{index === 0 ? "$" : index === 3 ? "DB" : "{}"}</span>
          <strong>{stage.label}</strong>
          <small>{stage.detail}</small>
        </div>
      ))}
      <span className="service-link service-link-1" aria-hidden="true" />
      <span className="service-link service-link-2" aria-hidden="true" />
      <span className="service-link service-link-3" aria-hidden="true" />
    </section>
  );
}

function StateMachineFlow({ project }: { project: Project }) {
  return (
    <section className="bot-state-flow" aria-label="Bot conversation states">
      <div className="bot-message bot-message-in">
        <span>user</span>
        <p>Starts or continues the questionnaire</p>
      </div>
      <div className="state-track">
        {project.pipeline.map((stage, index) => (
          <div key={stage.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{stage.label}</strong>
            <small>{stage.detail}</small>
          </div>
        ))}
      </div>
      <div className="bot-message bot-message-out">
        <span>bot</span>
        <p>Returns a match after the profile is complete</p>
      </div>
    </section>
  );
}

function LiveVisionFrame({ project }: { project: Project }) {
  return (
    <section className="vision-frame" aria-label="Live vision interface sketch">
      <div className="vision-camera">
        <span className="camera-corner camera-corner-a" />
        <span className="camera-corner camera-corner-b" />
        <span className="face-box face-box-large">
          <small>face</small>
        </span>
        <span className="face-box face-box-small">
          <small>gesture</small>
        </span>
        <p>LIVE / 24 FPS</p>
      </div>
      <div className="vision-events">
        <p>detectors</p>
        {project.pipeline.slice(1).map((stage, index) => (
          <div key={stage.label}>
            <span className={index === 1 ? "is-active" : ""} />
            <strong>{stage.label}</strong>
            <small>{stage.detail}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectVisual({ project }: { project: Project }) {
  switch (project.visual) {
    case "robot-vision":
      return <RobotVisionDiagram project={project} />;
    case "language-model":
      return <LanguageModelPanel project={project} />;
    case "client-server":
      return <ClientServerMap project={project} />;
    case "state-machine":
      return <StateMachineFlow project={project} />;
    case "live-vision":
      return <LiveVisionFrame project={project} />;
  }
}

export default function ProjectWindowContent({
  project,
}: {
  project: Project;
}) {
  return (
    <article
      className={`project-view project-view-${project.visual}`}
      style={
        {
          "--project-accent": project.accent,
          "--project-accent-soft": project.accentSoft,
        } as React.CSSProperties
      }
    >
      <header className="project-heading">
        <div className="project-heading-meta">
          <span>{project.number}</span>
          <p>
            {project.kind} · {project.year}
          </p>
        </div>
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
        <ProjectLinks project={project} />
      </header>

      <ProjectVisual project={project} />

      <div className="project-detail-grid">
        <section>
          <p className="project-label">My part</p>
          <p>{project.role}</p>
        </section>
        <section>
          <p className="project-label">What had to work</p>
          <p>{project.problem}</p>
        </section>
        <section className="project-detail-wide">
          <p className="project-label">Implementation</p>
          <p>{project.solution}</p>
        </section>
      </div>

      <footer className="project-footer">
        <div className="project-stack" aria-label="Technology stack">
          {project.stack.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <ul>
          {project.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
