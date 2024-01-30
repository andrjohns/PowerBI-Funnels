import * as d3 from "./D3 Modules";
import { abs } from "../Functions";
import type { axisProperties } from "../Classes";
import type { svgBaseType, Visual } from "../visual";

export default function drawXAxis(selection: svgBaseType, visualObj: Visual, refresh?: boolean) {
  const xAxisProperties: axisProperties = visualObj.viewModel.plotProperties.xAxis;
  const xAxis: d3.Axis<d3.NumberValue> = d3.axisBottom(visualObj.viewModel.plotProperties.xScale);

  if (xAxisProperties.ticks) {
    if (xAxisProperties.tick_count) {
      xAxis.ticks(xAxisProperties.tick_count)
    }
  } else {
    xAxis.tickValues([]);
  }

  const plotHeight: number = visualObj.viewModel.plotProperties.height;
  const xAxisHeight: number = plotHeight - visualObj.viewModel.plotProperties.yAxis.start_padding;
  const displayPlot: boolean = visualObj.viewModel.plotProperties.displayPlot;
  const xAxisGroup = selection.select(".xaxisgroup") as d3.Selection<SVGGElement, unknown, null, undefined>;

  xAxisGroup
      .call(xAxis)
      .attr("color", displayPlot ? xAxisProperties.colour : "#FFFFFF")
      // Plots the axis at the correct height
      .attr("transform", `translate(0, ${xAxisHeight})`);
  let tickGroup = xAxisGroup
      .selectAll(".tick text")
      .attr("transform","rotate(" + xAxisProperties.tick_rotation + ")")
      .attr("text-anchor", "middle")
      .attr("dx", null)
      .style("font-size", xAxisProperties.tick_size)
      .style("font-family", xAxisProperties.tick_font)
      .style("fill", displayPlot ? xAxisProperties.tick_colour : "#FFFFFF");

  console.log(xAxisProperties.tick_rotation)
  if (xAxisProperties.tick_rotation != 0) {
    const textAnchor = xAxisProperties.tick_rotation < 0.0 ? "end" : "start";
    const dx = xAxisProperties.tick_rotation < 0.0 ? "-.8em" : ".8em";
    const dy = xAxisProperties.tick_rotation < 0.0 ? "-.15em" : ".15em";
    tickGroup.attr("text-anchor", textAnchor)
              .attr("dx", dx);
  }
  const xAxisNode: SVGGElement = selection.selectAll(".xaxisgroup").node() as SVGGElement;
  if (!xAxisNode) {
    selection.select(".xaxislabel")
              .style("fill", displayPlot ? xAxisProperties.label_colour : "#FFFFFF");
    return;
  }
  const xAxisCoordinates: DOMRect = xAxisNode.getBoundingClientRect() as DOMRect;

  // Update padding and re-draw axis if large tick values rendered outside of plot
  const tickBelowPadding: number = xAxisCoordinates.bottom - xAxisHeight;
  const tickLeftofPadding: number = xAxisCoordinates.left - xAxisProperties.start_padding;

  if ((tickBelowPadding > 0 || tickLeftofPadding < 0)) {
    if (!refresh) {
      if (tickBelowPadding > 0) {
        visualObj.viewModel.plotProperties.yAxis.start_padding += abs(tickBelowPadding);
      }
      if (tickLeftofPadding < 0) {
        visualObj.viewModel.plotProperties.xAxis.start_padding += abs(tickLeftofPadding)
      }
      visualObj.viewModel.plotProperties.initialiseScale();
      selection.call(drawXAxis, visualObj, true);
      return;
    }
  }

  const bottomMidpoint: number = plotHeight - ((plotHeight - xAxisCoordinates.bottom) / 2);

  selection.select(".xaxislabel")
            .attr("x",visualObj.viewModel.plotProperties.width / 2)
            .attr("y", bottomMidpoint)
            .style("text-anchor", "middle")
            .text(xAxisProperties.label)
            .style("font-size", xAxisProperties.label_size)
            .style("font-family", xAxisProperties.label_font)
            .style("fill", displayPlot ? xAxisProperties.label_colour : "#FFFFFF");
}
