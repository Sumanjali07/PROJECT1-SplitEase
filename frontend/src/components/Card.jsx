import React from "react";

export default function Card({ title, subtitle, right, children }) {
  return (
    <section className="card">
      {(title || subtitle || right) && (
        <div className="card-head">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {right && <div className="card-right">{right}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </section>
  );
}
