"use strict";

import "core-js/stable";
import "regenerator-runtime/runtime";
import "../style/visual.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;
import makeDots from "./Plotting Functions/makeDots";
import makeLines from "./Plotting Functions/makeLines";
import updateSettings from "./Plot Settings/updateSettings";
import getViewModel from "../src/getViewModel";
import initSettings from "./Plot Settings/initSettings";
import initTooltipTracking from "./Plotting Functions/initTooltipTracking";
import * as d3 from "d3";
import highlightIfSelected from "./Selection Helpers/highlightIfSelected";
import { LimitLines } from "./Interfaces"
import { ViewModel } from "./Interfaces"
import { ScatterDots } from "./Interfaces"

type LineType = d3.Selection<d3.BaseType, LimitLines[], SVGElement, any>;
type MergedLineType = d3.Selection<SVGPathElement, LimitLines[], SVGElement, any>;

export class Visual implements IVisual {
    private host: IVisualHost;
    private svg: d3.Selection<SVGElement, any, any, any>;
    private dotGroup: d3.Selection<SVGElement, any, any, any>;
    private dots: d3.Selection<any, any, any, any>;
    private UL99Group: d3.Selection<SVGElement, any, any, any>;
    private listeningRect: d3.Selection<SVGElement, any, any, any>;
    private LL99Group: d3.Selection<SVGElement, any, any, any>;
    private UL95Group: d3.Selection<SVGElement, any, any, any>;
    private LL95Group: d3.Selection<SVGElement, any, any, any>;
    private targetGroup: d3.Selection<SVGElement, any, any, any>;
    private alttargetGroup: d3.Selection<SVGElement, any, any, any>;
    private xAxisGroup: d3.Selection<SVGGElement, any, any, any>;
    private xAxisLabels: d3.Selection<SVGGElement, any, any, any>;
    private yAxisGroup: d3.Selection<SVGGElement, any, any, any>;
    private yAxisLabels: d3.Selection<SVGGElement, any, any, any>;
    private viewModel: ViewModel;

    // Method for notifying PowerBI of changes in the visual to propagate to the
    //   rest of the report
    private selectionManager: ISelectionManager;

    // Settings for plot aesthetics
    private settings = initSettings();

    constructor(options: VisualConstructorOptions) {
        // Add reference to host object, for accessing environment (e.g. colour)
        this.host = options.host;

                    // Get reference to element object for manipulation
                    //   (reference to html container for visual)
        this.svg = d3.select(options.element)
                    // Create new svg element inside container
                     .append("svg")
                     .classed("funnelchart", true);
        this.listeningRect = this.svg.append("g")
                                .classed("listen-group", true);
        this.UL99Group = this.svg.append("g")
                                 .classed("line-group", true);
        this.LL99Group = this.svg.append("g")
                                 .classed("line-group", true);
        this.UL95Group = this.svg.append("g")
                                 .classed("line-group", true);
        this.LL95Group = this.svg.append("g")
                                 .classed("line-group", true);
        this.targetGroup = this.svg.append("g")
                                   .classed("line-group", true);
        this.alttargetGroup = this.svg.append("g")
                                      .classed("line-group", true);
        this.dotGroup = this.svg.append("g")
                                .classed("dotGroup", true);

        // Add a grouping ('g') element to the canvas that will later become the x-axis
        this.xAxisGroup = this.svg.append("g")
                                  .classed("x-axis", true);
        this.xAxisLabels = this.svg.append("text");

        // Add a grouping ('g') element to the canvas that will later become the y-axis
        this.yAxisGroup = this.svg.append("g")
                                  .classed("y-axis", true);
        this.yAxisLabels = this.svg.append("text");

        // Request a new selectionManager tied to the visual
        this.selectionManager = this.host.createSelectionManager();

        // Update dot highlighting on initialisation
        this.selectionManager.registerOnSelectCallback(() => {
            highlightIfSelected(this.dots,
                                this.selectionManager.getSelectionIds() as ISelectionId[],
                                this.settings.scatter.opacity.value,
                                this.settings.scatter.opacity_unselected.value);
        })
    }

    public update(options: VisualUpdateOptions) {
        // Update settings object with user-specified values (if present)
        updateSettings(this.settings, options.dataViews[0].metadata.objects);

        // Insert the viewModel object containing the user-input data
        //   This function contains the construction of the funnel
        //   control limits
        this.viewModel = getViewModel(options, this.settings, this.host);

        // Get the width and height of plotting space
        let width: number = options.viewport.width;
        let height: number = options.viewport.height;

        // Add appropriate padding so that plotted data doesn't overlay axis
        let xAxisPadding: number = this.settings.axispad.x.padding.value;
        let yAxisPadding: number = this.settings.axispad.y.padding.value;
        let xAxisEndPadding: number = this.settings.axispad.x.end_padding.value;
        let yAxisEndPadding: number = this.settings.axispad.y.end_padding.value;
        let data_type: string = this.settings.funnel.data_type.value;
        let multiplier: number = this.settings.funnel.multiplier.value;
        let xAxisMin: number = this.settings.axis.xlimit_l.value ? this.settings.axis.xlimit_l.value : 0;
        let xAxisMax: number = this.settings.axis.xlimit_u.value ? this.settings.axis.xlimit_u.value : this.viewModel.maxDenominator;
        let yAxisMin: number = this.settings.axis.ylimit_l.value ? this.settings.axis.ylimit_l.value : 0;
        let yAxisMax: number = this.settings.axis.ylimit_u.value ? this.settings.axis.ylimit_u.value : this.viewModel.maxRatio;

        // Dynamically scale chart to use all available space
        this.svg.attr("width", width)
                .attr("height", height);

        // Define axes for chart.
        //   Takes a given plot axis value and returns the appropriate screen height
        //     to plot at.
        let yScale: d3.ScaleLinear<number, number, never>
            = d3.scaleLinear()
                .domain([yAxisMin, yAxisMax])
                .range([height - xAxisPadding, xAxisEndPadding]);
        let xScale: d3.ScaleLinear<number, number, never>
            = d3.scaleLinear()
                .domain([xAxisMin, xAxisMax])
                .range([yAxisPadding, width - yAxisEndPadding]);

        initTooltipTracking(this.svg, this.listeningRect, width, height - xAxisPadding,
                            xScale, yScale, this.host.tooltipService, this.viewModel);
        
        // Specify inverse scaling that will return a plot axis value given an input
        //   screen height. Used to display line chart tooltips.
        let yScale_inv: d3.ScaleLinear<number, number, never>
            = d3.scaleLinear()
                .domain([height - xAxisPadding, 0])
                .range([yAxisMin, yAxisMax]);
        let xScale_inv: d3.ScaleLinear<number, number, never>
            = d3.scaleLinear()
                .domain([yAxisPadding, width])
                .range([xAxisMin, xAxisMax]);

        let yAxis: d3.Axis<d3.NumberValue>
            = d3.axisLeft(yScale)
                .tickFormat(
                    d => {
                      // If axis displayed on % scale, then disable axis values > 100%
                      let prop_limits: boolean = data_type == "PR" && multiplier == 1;
                      return prop_limits ? (d <= 1 ? (<number>d * 100).toFixed(2) + "%" : "" ) : <string><unknown>d;
                    } 
                );
        let xAxis: d3.Axis<d3.NumberValue> = d3.axisBottom(xScale);

        // Draw axes on plot
        this.yAxisGroup
            .call(yAxis)
            .attr("transform", "translate(" +  yAxisPadding + ",0)");

        this.xAxisGroup
            .call(xAxis)
            // Plots the axis at the correct height
            .attr("transform", "translate(0, " + (height - xAxisPadding) + ")")
            .selectAll("text")
            // Rotate tick labels
            .attr("transform","rotate(-35)")
            // Right-align
            .style("text-anchor", "end")
            // Scale font
            .style("font-size","x-small");

        this.xAxisLabels.attr("x",width/2)
            .attr("y",height - xAxisPadding/10)
            .style("text-anchor", "middle")
            .text(this.settings.axis.xlimit_label.value);
        this.yAxisLabels
            .attr("x",yAxisPadding)
            .attr("y",height/2)
            .attr("transform","rotate(-90," + yAxisPadding/3 +"," + height/2 +")")
            .text(this.settings.axis.ylimit_label.value)
            .style("text-anchor", "end");

        // Bind input data to dotGroup reference
        this.dots = this.dotGroup
                        // List all child elements of dotGroup that have CSS class '.dot'
                        .selectAll(".dot")
                        .data(this.viewModel
                                  .scatterDots
                                  .filter(d => (d.ratio >= yAxisMin
                                                && d.ratio <= yAxisMax
                                                && d.denominator >= xAxisMin
                                                && d.denominator <= xAxisMax)));
        // Plotting of scatter points
        makeDots(this.dots, this.settings,
                 this.viewModel.highlights, this.selectionManager,
                 this.host.tooltipService, xScale, yScale,
                 this.svg);

        // Bind calculated control limits and target line to respective plotting objects
        let linesLL99: LineType
            = this.LL99Group
                  .selectAll(".line")
                  .data([this.viewModel
                             .lowerLimit99
                             .filter(d => (d.limit != -9999 * multiplier)
                                          && (d.limit >= yAxisMin))]);
        let linesUL99: LineType
            = this.UL99Group
                  .selectAll(".line")
                  .data([this.viewModel
                             .upperLimit99
                             .filter(d => (d.limit != -9999 * multiplier)
                                          && (d.limit <= yAxisMax))]);
        let linesUL95: LineType
            = this.UL95Group
                  .selectAll(".line")
                  .data([this.viewModel
                             .upperLimit95
                             .filter(d => (d.limit != -9999 * multiplier)
                                          && (d.limit <= yAxisMax))]);
        let linesLL95: LineType
            = this.LL95Group
                  .selectAll(".line")
                  .data([this.viewModel
                             .lowerLimit95
                             .filter(d => (d.limit != -9999 * multiplier)
                                          && (d.limit >= yAxisMin))]);
        let lineTarget: LineType
            = this.targetGroup
                  .selectAll(".line")
                  .data([this.viewModel.upperLimit99]);
        let lineAltTarget: LineType
            = this.alttargetGroup
                  .selectAll(".line")
                  .data([this.viewModel.upperLimit99]);

        // Initial construction of lines, run when plot is first rendered.
        //   Text argument specifies which type of line is required (controls aesthetics),
        //   inverse scale objects used to display tooltips on drawn control limits 
        [
         [linesLL99, "99.8%"], [linesLL95, "95%"],
         [linesUL95, "95%"], [linesUL99, "99.8%"],
         [lineTarget, "target"], [lineAltTarget, "alt_target"]
        ].map(d => makeLines(<LineType>d[0], this.settings,
                             xScale, yScale, <string>d[1],
                             this.viewModel, this.host.tooltipService,
                             xScale_inv, yScale_inv));

        this.svg.on('contextmenu', () => {
        const eventTarget: EventTarget = (<any>d3).event.target;
        let dataPoint: ScatterDots = <ScatterDots>(d3.select(<d3.BaseType>eventTarget).datum());
        this.selectionManager.showContextMenu(dataPoint ? dataPoint.identity : {}, {
            x: (<any>d3).event.clientX,
            y: (<any>d3).event.clientY
        });
        (<any>d3).event.preventDefault();
        });
    }

    // Function to render the properties specified in capabilities.json to the properties pane
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): 
        VisualObjectInstanceEnumeration {
            let propertyGroupName: string = options.objectName;
            // Object that holds the specified settings/options to be rendered
            let properties: VisualObjectInstance[] = [];

            // Call a different function for each specified property group
            switch (propertyGroupName) {
                // Specify behaviour for x-axis settings
                case "funnel":
                    // Add y-axis settings to object to be rendered
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            data_type: this.settings.funnel.data_type.value,
                            od_adjust: this.settings.funnel.od_adjust.value,
                            multiplier: this.settings.funnel.multiplier.value,
                            transformation: this.settings.funnel.transformation.value,
                            alt_target: this.settings.funnel.alt_target.value
                        },
                        selector: null
                    });
                break; 
                case "scatter":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            size: this.settings.scatter.size.value,
                            colour: this.settings.scatter.colour.value,
                            opacity: this.settings.scatter.opacity.value,
                            opacity_unselected: this.settings.scatter.opacity_unselected.value
                        },
                        selector: null
                    });
                break; 
                case "lines":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            width_99: this.settings.lines.width_99.value,
                            width_95: this.settings.lines.width_95.value,
                            width_target: this.settings.lines.width_target.value,
                            width_alt_target: this.settings.lines.width_alt_target.value,
                            colour_99: this.settings.lines.colour_99.value,
                            colour_95: this.settings.lines.colour_95.value,
                            colour_target: this.settings.lines.colour_target.value,
                            colour_alt_target: this.settings.lines.colour_alt_target.value
                        },
                        selector: null
                    });
                break; 
                case "axis":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            xlimit_label: this.settings.axis.xlimit_label.value,
                            ylimit_label: this.settings.axis.ylimit_label.value,
                            ylimit_l: this.settings.axis.ylimit_l.value,
                            ylimit_u: this.settings.axis.ylimit_u.value,
                            xlimit_l: this.settings.axis.xlimit_l.value,
                            xlimit_u: this.settings.axis.xlimit_u.value
                        },
                        selector: null
                    });
                break; 
            };
            return properties;
        }
}