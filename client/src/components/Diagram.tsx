import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import DiagramGenerator from "./DiagramGenerator";

export default function Diagram() {
  const [showTips, setShowTips] = useState(true);

  return (
    <div className="space-y-6">
      {showTips && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Diagram Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm space-y-2">
              <p>
                Create diagrams to visualize concepts, processes, and
                relationships for your study group.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Use <strong>Flowcharts</strong> for processes and decision
                  trees
                </li>
                <li>
                  Use <strong>Mind Maps</strong> for brainstorming and
                  organizing ideas
                </li>
                <li>
                  Use <strong>Sequence Diagrams</strong> for interactions
                  between components
                </li>
                <li>
                  Use <strong>Gantt Charts</strong> for project timelines and
                  schedules
                </li>
              </ul>
              <p className="pt-2">
                You can export your diagrams as PNG or SVG files to share with
                your study group or include in your notes.
              </p>
            </CardDescription>
            <button
              className="text-xs text-muted-foreground hover:text-primary mt-2"
              onClick={() => setShowTips(false)}
            >
              Dismiss tips
            </button>
          </CardContent>
        </Card>
      )}

      <DiagramGenerator />
    </div>
  );
}
