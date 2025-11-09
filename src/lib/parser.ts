import { derivative, integrate, evaluate, parse, det, inv, eigs } from "mathjs";

export function computeExpression(expr: string): any {
  try {
    const s = expr.trim();

    if (s.startsWith("d/dx")) {
      const inner = s.replace("d/dx", "").trim();
      return { type: "derivative", fn: derivative(inner, "x").toString() };
    }

    if (s.startsWith("∫")) {
      const inner = s.replace("∫", "").replace(/dx\s*$/i, "").trim();
      return { type: "integral", fn: integrate(parse(inner), "x").toString() };
    }

    if (s.startsWith("det(")) {
      const inner = s.slice(4, -1);
      return { type: "matrix", fn: s, eval: det(evaluate(inner)) };
    }

    if (s.startsWith("inv(")) {
      const inner = s.slice(4, -1);
      return { type: "matrix", fn: s, eval: inv(evaluate(inner)) };
    }

    if (s.startsWith("eigenvalues(")) {
      const inner = s.replace("eigenvalues(", "").replace(/\)\s*$/, "");
      const E = eigs(evaluate(inner));
      return { type: "eigen", fn: s, eval: E.values };
    }

    return { type: "normal", fn: s };
  } catch (err) {
    return { type: "error", fn: "Parse error" };
  }
}
