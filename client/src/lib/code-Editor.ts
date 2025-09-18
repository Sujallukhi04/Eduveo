import { StreamLanguage } from "@codemirror/language";

// Replace the Mermaid language definition with a CodeMirror StreamLanguage definition
export const mermaidLanguage = StreamLanguage.define({
  name: "mermaid",
  token: (stream, state) => {
    // Handle comments
    if (stream.match("%%")) {
      stream.skipToEnd();
      return "comment";
    }

    // Handle strings
    if (stream.match(/"/) || stream.match(/'/)) {
      //@ts-ignore
      state.tokenize = tokenString(stream.current());
      //@ts-ignore
      return state.tokenize(stream, state);
    }

    // Handle diagram-specific keywords
    if (
      stream.match(
        /\b(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|gantt|pie|mindmap|journey|gitGraph|requirementDiagram|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|quadrantChart|timeline|xychart-beta)\b/
      )
    ) {
      return "keyword";
    }

    // Handle direction keywords
    if (stream.match(/\b(LR|RL|TB|BT|TD|DT)\b/)) {
      return "keyword";
    }

    // Handle flowchart and common keywords
    if (
      stream.match(
        /\b(subgraph|end|participant|actor|note|loop|alt|opt|par|rect|activate|deactivate|title|accTitle|accDescr|section|class|interface|state|autonumber|link|click|callback|call|style|linkStyle|classDef|direction|namespace|theme|default|wrap|pan|zoom)\b/
      )
    ) {
      return "keyword";
    }

    // Handle sequence diagram specific keywords
    if (
      stream.match(
        /\b(box|alt|else|opt|par|and|loop|break|critical|rect|activate|deactivate|destroy|note|links|link|properties|details)\b/
      )
    ) {
      return "keyword";
    }

    // Handle class diagram specific keywords
    if (
      stream.match(
        /\b(class|interface|extends|implements|association|aggregation|composition|dependency|lollipop|abstract|static|method|field|private|protected|public|return|override|final|package|inner|enum|<<|>>)\b/
      )
    ) {
      return "keyword";
    }

    // Handle state diagram specific keywords
    if (
      stream.match(
        /\b(state|as|hide empty description|direction|note|--|\[\*\]|fork|join|choice|history|history\*|concurrent|note right of|note left of|note top of|note bottom of)\b/
      )
    ) {
      return "keyword";
    }

    // Handle ER diagram specific keywords
    if (
      stream.match(
        /\b(entity|relationship|one to one|one to many|many to one|many to many|key|attribute|PK|FK|UK|non-identifying|identifying)\b/
      )
    ) {
      return "keyword";
    }

    // Handle gantt chart specific keywords
    if (
      stream.match(
        /\b(dateFormat|axisFormat|todayMarker|excludes|includes|title|section|task|done|active|crit|milestone|after|before)\b/
      )
    ) {
      return "keyword";
    }

    // Handle gitGraph specific keywords
    if (
      stream.match(
        /\b(commit|branch|merge|checkout|cherry-pick|reset|revert|tag)\b/
      )
    ) {
      return "keyword";
    }

    // Handle journey specific keywords
    if (
      stream.match(
        /\b(title|section|task|as|scorecard|complete|done|failed|critical|neutral|happy|sad|high|low|medium)\b/
      )
    ) {
      return "keyword";
    }

    // Handle class names (capitalized words)
    if (stream.match(/\b[A-Z][A-Za-z0-9_]*\b/)) {
      return "variable-2";
    }

    // Handle arrows with more comprehensive patterns
    if (
      stream.match(
        /(-[.-]->|--[>x]|===>|<==|<===|x--|o--|<->|<-[.-]|\.-[>x]|<\.-|-\.-[>x]|<-\.-|<===>|<\.->|<-\.>|===|--|-.->|==|<-->|<--[>x]|[.-]-[>x]|[.-]--[>x]|<-[.-]-[>x]|===|<==|>==|<-->|<-\.->)/
      )
    ) {
      return "operator";
    }

    // Handle shapes
    if (
      stream.match(
        /(\[\]|\[$$|$$\]|\{\}|\{\{|\}\}|\[\[|\]\]|\[$$|$$\]|\[\||\|\]|\[\\|\\\]|\[\/|\/\]|$$\(|$$\)|$$\[\]$$|\{\{\}\}|\[\[\]\]|\[$$$$\]|>\]|\[<|\{\|\}|\{\{\}\}|$$\($$\)|\[\[\]\]|\[\\\/\]|\[$$[$$\]]|\[\/\\\]|\[\\\]|$$$$)/
      )
    ) {
      return "atom";
    }

    // Handle numbers
    if (stream.match(/\b\d+(\.\d+)?\b/)) {
      return "number";
    }

    // Handle punctuation
    if (stream.match(/[{}[\];(),.:\-_]/)) {
      return "punctuation";
    }

    // Handle operators
    if (stream.match(/[>|&<=>+\-*/]/)) {
      return "operator";
    }

    // Handle special characters
    if (stream.match(/[#@$%^&*!~`]/)) {
      return "meta";
    }

    // Skip whitespace
    if (stream.eatSpace()) {
      return null;
    }

    // Handle any other character
    stream.next();
    return null;
  },
  startState: () => {
    return {
      tokenize: null,
    };
  },
});

// Helper function for string tokenization
export function tokenString(quote: string) {
  //@ts-ignore
  return (stream, state) => {
    let escaped = false,
      next;
    while ((next = stream.next()) != null) {
      if (next === quote && !escaped) {
        state.tokenize = null;
        break;
      }
      escaped = !escaped && next === "\\";
    }
    return "string";
  };
}

export const diagramTemplates = {
  flowchart: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`,
  sequence: `sequenceDiagram
    participant User
    participant System
    participant Database
    
    User->>System: Request Data
    System->>Database: Query
    Database-->>System: Return Results
    System-->>User: Display Data`,
  mindmap: `mindmap
    root((Main Topic))
      Topic 1
        Subtopic 1.1
        Subtopic 1.2
      Topic 2
        Subtopic 2.1
        Subtopic 2.2`,
  gantt: `gantt
    title Project Schedule
    dateFormat  YYYY-MM-DD
    section Planning
    Research           :a1, 2023-01-01, 30d
    Design             :a2, after a1, 20d
    section Development
    Implementation     :a3, after a2, 40d
    Testing            :a4, after a3, 15d`,
  classDiagram: `classDiagram
    class Animal {
      +String name
      +makeSound()
    }
    class Dog {
      +fetch()
    }
    class Cat {
      +scratch()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
};

export const darkModeStyles = `
      .dark .mermaid .flowchart-link {
        stroke: #8fa4b7 !important;
      }
      .dark .mermaid .actor {
        fill: #1e293b !important;
        stroke: #64748b !important;
      }
      .dark .mermaid .sequenceNumber {
        fill: #cbd5e1 !important;
      }
      .dark .mermaid .labelBox {
        fill: #1e293b !important;
        stroke: #64748b !important;
      }
      .dark .mermaid .labelText, .dark .mermaid .labelText > tspan {
        fill: #f1f5f9 !important;
        stroke: none !important;
      }
      .dark .mermaid .loopText, .dark .mermaid .loopText > tspan {
        fill: #f1f5f9 !important;
        stroke: none !important;
      }
      .dark .mermaid .loopLine {
        stroke: #64748b !important;
      }
      .dark .mermaid text {
        fill: #f1f5f9 !important;
        stroke: none !important;
      }
      .dark .mermaid .note {
        fill: #1e40af !important;
        stroke: #3b82f6 !important;
      }
      .dark .mermaid .noteText, .dark .mermaid .noteText > tspan {
        fill: #e2e8f0 !important;
        stroke: none !important;
      }
      .dark .mermaid .activation0, .dark .mermaid .activation1, .dark .mermaid .activation2 {
        fill: #334155 !important;
        stroke: #64748b !important;
      }
      .dark .mermaid .messageLine0, .dark .mermaid .messageLine1 {
        stroke: #e2e8f0 !important;
      }
      .dark .mermaid .messageText {
        fill: #e2e8f0 !important;
        stroke: none !important;
      }
      .dark .mermaid .sectionTitle {
        fill: #e2e8f0 !important;
      }
      .dark .mermaid .grid .tick {
        stroke: #475569 !important;
      }
      .dark .mermaid .grid .tick text {
        fill: #cbd5e1 !important;
      }
      .dark .mermaid .task {
        stroke: #64748b !important;
      }
      .dark .mermaid .taskText {
        fill: #f1f5f9 !important;
      }
      .dark .mermaid .taskTextOutsideRight {
        fill: #f1f5f9 !important;
      }
      .dark .mermaid .node rect, .dark .mermaid .node circle, .dark .mermaid .node polygon {
        fill: #1e293b !important;
        stroke: #64748b !important;
      }
      .dark .mermaid .node .label {
        background: none !important;
      }
      .dark .mermaid .cluster rect {
        fill: #0f172a !important;
        stroke: #334155 !important;
      }
      .dark .mermaid .cluster text {
        fill: #f1f5f9 !important;
      }
      .dark .mermaid .classDiagram .classTitle {
        fill: #e2e8f0 !important;
      }
      .dark .mermaid .classLabel .box {
        fill: #1e293b !important;
        stroke: #475569 !important;
      }
      .dark .mermaid .classLabel .label {
        fill: #f1f5f9 !important;
      }
      .dark .mermaid .relation {
        stroke: #94a3b8 !important;
      }
      .dark .mermaid .stateDiagram-state {
        fill: #1e293b !important;
        stroke: #475569 !important;
      }
      .dark .mermaid .stateDiagram-state .label {
        fill: #f1f5f9 !important;
      }
      .dark .mermaid .stateDiagram-state .description {
        fill: #e2e8f0 !important;
      }
      .dark .mermaid .edgePath .path {
        stroke: #94a3b8 !important;
      }
      .dark .mermaid .edgeLabel {
        background-color: #334155 !important;
        color: #f1f5f9 !important;
      }
      .dark .mermaid .edgeLabel rect {
        fill: #334155 !important;
      }
      .dark .mermaid .cluster rect {
        fill: #0f172a !important;
        stroke: #334155 !important;
      }
      .dark .mermaid .cluster span {
        color: #f1f5f9 !important;
      }
      .dark .mermaid .journey-section {
        fill: #1e293b !important;
      }
      
      /* For light mode, ensure contrasts are appropriate */
      .mermaid .actor {
        fill: #f8fafc !important;
        stroke: #64748b !important;
      }
      .mermaid text {
        fill: #0f172a !important;
      }
      .mermaid .note {
        fill: #dbeafe !important;
        stroke: #3b82f6 !important;
      }
    `;


    