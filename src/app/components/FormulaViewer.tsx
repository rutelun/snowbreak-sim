import { Formula } from "~/lib/engine/Formula";
import { Fragment, useState } from "react";
import { Link, Typography } from "@mui/material";
import { green, purple, grey, yellow } from "@mui/material/colors";

type Props = {
  formula: Formula;
  deep?: number;
};

const colorDeep = [yellow[50], green[50], purple[50]];

const isLowerPriority = (previousAction: string, newAction: string) => {
  return ["+", "-"].includes(newAction) && ["*", "/"].includes(previousAction);
};
export function FormulaViewer({ formula, deep = 0 }: Props) {
  const resultValue = formula.visibleAsPercent
    ? `${Number(((formula.cachedResult ?? 0) * 100).toFixed(3))}%`
    : Number((formula.cachedResult ?? 0).toFixed(3));

  const showSummarize = !!formula.description;

  const [isDetailsVisible, setIsDetailsVisible] = useState(!showSummarize);

  return (
    <>
      {showSummarize ? (
        deep === 0 ? (
          <>
            <Link
              variant="body1"
              style={{ display: "inline", cursor: "pointer" }}
              onClick={() => {
                setIsDetailsVisible((val) => !val);
              }}
            >
              {formula.description}: {resultValue}
            </Link>
          </>
        ) : (
          <>
            <Typography variant="body1" style={{ display: "inline" }}>
              {resultValue}
            </Typography>
            (
            <Link
              variant="body1"
              style={{ display: "inline", cursor: "pointer" }}
              onClick={() => {
                setIsDetailsVisible((val) => !val);
              }}
            >
              {formula.description}
            </Link>
            )
          </>
        )
      ) : (
        ""
      )}
      <Typography
        variant="body1"
        style={{
          display: isDetailsVisible ? "inline" : "none",
          backgroundColor: colorDeep[deep % colorDeep.length],
          cursor: "default",
        }}
      >
        {showSummarize && formula.parts.length > 0 ? "[" : ""}
        {formula.parts.map((part, index) => (
          <Fragment key={index}>
            {part instanceof Formula ? (
              <>
                {isLowerPriority(formula.action, part.action) &&
                part.parts.length > 1
                  ? "("
                  : ""}
                <FormulaViewer
                  formula={part}
                  deep={part.description ? deep + 1 : deep}
                />
                {isLowerPriority(formula.action, part.action) &&
                part.parts.length > 1
                  ? ")"
                  : ""}
              </>
            ) : (
              <>
                {Number(
                  (part.visibleAsPercent
                    ? 100 * part.value
                    : part.value
                  ).toFixed(3),
                )}
                {part.visibleAsPercent ? "%" : ""}
                {part.description ? (
                  <Typography
                    variant="body2"
                    style={{ display: "inline", color: grey[700] }}
                  >
                    [{part.description}]
                  </Typography>
                ) : (
                  ""
                )}
              </>
            )}
            {index !== formula.parts.length - 1 ? formula.action : ""}
          </Fragment>
        ))}
        {showSummarize && formula.parts.length > 0 ? "]" : ""}
      </Typography>
    </>
  );
}
