import React from "react";
import type { PrettifiedActionType as PrettifiedActionType } from "~/lib/engine/HistoryManager";

import { FormulaViewer } from "~/app/components/FormulaViewer";
import AccordionSummary from "@mui/material/AccordionSummary";
import { Stack, Typography, AccordionDetails, Accordion } from "@mui/material";
import { grey } from "@mui/material/colors";

type Props = {
  action: PrettifiedActionType;
};

export function PrettifiedAction({ action }: Props) {
  const actionBattleTime = (action.battleTime / 1_000).toFixed(2);
  if (action.type === "foreground") {
    return (
      <Accordion>
        <AccordionSummary>
          <Typography variant="h6" textAlign="left">
            <Stack gap={2} direction="row" alignItems="center">
              [{actionBattleTime}]
              <div>
                {action.description}&nbsp;
                {action.totalDmg > 0
                  ? `[TotalDmg: ${action.totalDmg.toFixed(0)}] `
                  : ""}
                {action.totalHeal > 0
                  ? `[TotalHeal: ${action.totalHeal.toFixed(0)}]`
                  : ""}
              </div>
            </Stack>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {action.formulas.map((formula, index) => (
            <div key={index}>
              <FormulaViewer formula={formula} />
            </div>
          ))}
        </AccordionDetails>
      </Accordion>
    );
  } else if (action.type === "background") {
    return (
      <Accordion>
        <AccordionSummary>
          <Typography variant="h6" textAlign="left">
            <Stack gap={2} direction="row" alignItems="center">
              [{actionBattleTime}]
              <div>
                {action.description.split("\n").map((item, index, array) => (
                  <Typography
                    key={item}
                    variant="body1"
                    sx={{ color: grey[700] }}
                  >
                    {item}
                    {index == array.length - 1 ? "" : <br />}
                  </Typography>
                ))}
              </div>
            </Stack>
          </Typography>
        </AccordionSummary>
      </Accordion>
    );
  } else if (action.type === "battleEnd") {
    return (
      <Accordion>
        <AccordionSummary>
          <Typography variant="h6" textAlign="left">
            <Stack gap={2} direction="row" alignItems="center">
              [{actionBattleTime}]
              <div>
                {[...action.damagePerCharPerType.entries()].map(
                  ([creature, skillData]) => (
                    <div key={creature.name}>
                      <Typography>{creature.name} Total:</Typography>
                      {[...skillData.entries()].map(([skillType, totalDmg]) => (
                        <Typography key={skillType} pl={4}>
                          {skillType} damage:{totalDmg.toFixed(2)} dps:{" "}
                          {((totalDmg / action.battleTime) * 1_000).toFixed(2)}
                        </Typography>
                      ))}
                    </div>
                  ),
                )}
              </div>
            </Stack>
          </Typography>
        </AccordionSummary>
      </Accordion>
    );
  }
}
