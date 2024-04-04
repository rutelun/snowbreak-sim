import { Formula } from "~/lib/engine/Formula";
import { Text } from "@chakra-ui/react";
import { useState } from "react";

type Props = {
  formula: Formula;
  deep?: number;
};

const colorDeep = ["yellow.50", "green.50", "purple.50", "teal.50", "pink.50"];

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
            <Text
              color="blue.800"
              as="span"
              borderBottomStyle="dashed"
              borderBottomWidth={2}
              onClick={() => {
                setIsDetailsVisible((val) => !val);
              }}
            >
              {formula.description}: {resultValue}
            </Text>
          </>
        ) : (
          <>
            <Text color="gray.800" as="span">
              {resultValue}
            </Text>
            (
            <Text
              color="blue.800"
              as="span"
              borderBottomStyle="dashed"
              borderBottomWidth={2}
              onClick={() => {
                setIsDetailsVisible((val) => !val);
              }}
            >
              {formula.description}
            </Text>
            )
          </>
        )
      ) : (
        ""
      )}
      <Text
        color="gray.600"
        as="span"
        display={isDetailsVisible ? "inline" : "none"}
        background={colorDeep[deep % colorDeep.length]}
      >
        {showSummarize && formula.parts.length > 0 ? "[" : ""}
        {formula.parts.map((part, index) => (
          <span key={index}>
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
                  <Text color="gray.400" as="span">
                    ({part.description})
                  </Text>
                ) : (
                  ""
                )}
              </>
            )}
            {index !== formula.parts.length - 1 ? formula.action : ""}
          </span>
        ))}
        {showSummarize && formula.parts.length > 0 ? "]" : ""}
      </Text>
    </>
  );
}
