import type powerbi from "powerbi-visuals-api"
import formatPrimitiveValue from "./formatPrimitiveValue";
type DataViewValueColumn = powerbi.DataViewValueColumn;
type DataViewCategorical = powerbi.DataViewCategorical;
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

type TargetT = number[] | string[] | number | string | VisualTooltipDataItem[][];

function extractKeys(inputView: DataViewCategorical): string[] {
  const primitiveKeyColumns = inputView.categories.filter(viewColumn => viewColumn.source?.roles?.["key"])
  const primitiveKeyValues = primitiveKeyColumns?.[0]?.values;
  const primitiveKeyTypes = primitiveKeyColumns?.[0]?.source?.type;
  return formatPrimitiveValue(primitiveKeyValues, primitiveKeyTypes)
}

function extractTooltips(inputView: DataViewCategorical): VisualTooltipDataItem[][] {
  const tooltipColumns = inputView.values.filter(viewColumn => viewColumn.source.roles.tooltips);
  return tooltipColumns?.[0]?.values?.map((_, idx) => {
    return tooltipColumns.map(viewColumn => {
      const tooltipValueFormatted: string = formatPrimitiveValue(viewColumn?.values?.[idx], viewColumn.source.type)

      return <VisualTooltipDataItem>{
        displayName: viewColumn.source.displayName,
        value: tooltipValueFormatted
      }
    })
  })
}

export default function extractDataColumn<T extends TargetT>(inputView: DataViewCategorical,
                                              name: string): T {
  if (name === "key") {
    return extractKeys(inputView) as Extract<T, string[]>;
  } else if (name === "tooltips") {
    return extractTooltips(inputView) as Extract<T, VisualTooltipDataItem[][]>;
  } else {
    // Assumed that any other requested columns are numeric columns for plotting
    const columnRaw = inputView.values.filter(viewColumn => viewColumn?.source?.roles?.[name]) as DataViewValueColumn[];
    return columnRaw?.[0]?.values?.map(d => d === null ? null : Number(d)) as T
  }
}
