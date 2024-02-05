const defaultSettings = {
  canvas: {
    show_errors: true,
    lower_padding: 10,
    upper_padding: 10,
    left_padding: 10,
    right_padding: 10
  },
  funnel: {
    chart_type: "PR",
    od_adjust: "no",
    multiplier: 1,
    sig_figs: 2,
    transformation: "none",
    ttip_show_numerator: true,
    ttip_label_numerator: "Numerator",
    ttip_show_denominator: true,
    ttip_label_denominator: "Denominator",
    ttip_show_value: true,
    ttip_label_value: "Automatic",
    ll_truncate: <number>null,
    ul_truncate: <number>null,
  },
  scatter: {
    use_group_text: false,
    scatter_text_font: "'Arial', sans-serif",
    scatter_text_size: 10,
    scatter_text_colour: "#000000",
    scatter_text_opacity: 1,
    scatter_text_opacity_unselected: 0.2,
    size: 3,
    colour: "#000000",
    opacity: 1,
    opacity_unselected: 0.2
  },
  lines: {
    show_99: true,
    show_95: true,
    show_68: false,
    show_target: true,
    show_alt_target: false,
    width_99: 2,
    width_95: 2,
    width_68: 2,
    width_target: 1.5,
    width_alt_target: 1.5,
    type_99: "10 10",
    type_95: "2 5",
    type_68: "2 5",
    type_target: "10 0",
    type_alt_target: "10 0",
    colour_99: "#6495ED",
    colour_95: "#6495ED",
    colour_68: "#6495ED",
    colour_target: "#000000",
    colour_alt_target: "#000000",
    ttip_show_99: true,
    ttip_show_95: false,
    ttip_show_68: false,
    ttip_show_target: true,
    ttip_show_alt_target: true,
    ttip_label_99: "99% Limit",
    ttip_label_95: "95% Limit",
    ttip_label_68: "68% Limit",
    ttip_label_target: "Centerline",
    ttip_label_alt_target: "Additional Target",
    alt_target: <number>(null)
  },
  x_axis: {
    xlimit_colour: "#000000",
    xlimit_ticks: true,
    xlimit_tick_font: "'Arial', sans-serif",
    xlimit_tick_size: 10,
    xlimit_tick_colour: "#000000",
    xlimit_tick_rotation: 0,
    xlimit_tick_count: <number>null,
    xlimit_label: <string>null,
    xlimit_label_font: "'Arial', sans-serif",
    xlimit_label_size: 10,
    xlimit_label_colour: "#000000",
    xlimit_l: <number>null,
    xlimit_u: <number>null
  },
  y_axis: {
    ylimit_colour: "#000000",
    ylimit_ticks: true,
    ylimit_sig_figs: <number>(null),
    ylimit_tick_font: "'Arial', sans-serif",
    ylimit_tick_size: 10,
    ylimit_tick_colour: "#000000",
    ylimit_tick_rotation: 0,
    ylimit_tick_count: <number>null,
    ylimit_label: <string>null,
    ylimit_label_font: "'Arial', sans-serif",
    ylimit_label_size: 10,
    ylimit_label_colour: "#000000",
    ylimit_l: <number>null,
    ylimit_u: <number>null
  },
  outliers: {
    process_flag_type: "both",
    improvement_direction: "increase",
    three_sigma: false,
    three_sigma_colour_improvement: "#289DE0",
    three_sigma_colour_deterioration: "#FAB428",
    three_sigma_colour_neutral_low: "#361475",
    three_sigma_colour_neutral_high: "#361475",
    two_sigma: false,
    two_sigma_colour_improvement: "#289DE0",
    two_sigma_colour_deterioration: "#FAB428",
    two_sigma_colour_neutral_low: "#361475",
    two_sigma_colour_neutral_high: "#361475"
  }
}

export const settingsPaneGroupings = {
  lines: {
    "Target": ["show_target", "width_target", "type_target", "colour_target", "ttip_show_target", "ttip_label_target"],
    "Alt. Target": ["show_alt_target", "width_alt_target", "type_alt_target", "colour_alt_target", "ttip_show_alt_target", "ttip_label_alt_target"],
    "68% Limits": ["show_68", "width_68", "type_68", "colour_68", "ttip_show_68", "ttip_label_68"],
    "95% Limits": ["show_95", "width_95", "type_95", "colour_95", "ttip_show_95", "ttip_label_95"],
    "99% Limits": ["show_99", "width_99", "type_99", "colour_99", "ttip_show_99", "ttip_label_99"]
  },
  x_axis: {
    "Axis": ["xlimit_colour", "xlimit_l", "xlimit_u"],
    "Ticks": ["xlimit_ticks", "xlimit_tick_count", "xlimit_tick_font", "xlimit_tick_size", "xlimit_tick_colour", "xlimit_tick_rotation"],
    "Label": ["xlimit_label", "xlimit_label_font", "xlimit_label_size", "xlimit_label_colour"]
  },
  y_axis: {
    "Axis": ["ylimit_colour", "ylimit_sig_figs", "ylimit_l", "ylimit_u"],
    "Ticks": ["ylimit_ticks", "ylimit_tick_count", "ylimit_tick_font", "ylimit_tick_size", "ylimit_tick_colour", "ylimit_tick_rotation"],
    "Label": ["ylimit_label", "ylimit_label_font", "ylimit_label_size", "ylimit_label_colour"]
  }
}

export const settingsPaneToggles = {
  funnel: {
    "ttip_show_numerator": ["ttip_label_numerator"],
    "ttip_show_denominator": ["ttip_label_denominator"],
    "ttip_show_value": ["ttip_label_value"]
  },
  scatter: {
    "use_group_text": ["scatter_text_font", "scatter_text_size", "scatter_text_colour", "scatter_text_opacity", "scatter_text_opacity_unselected"]
  },
  lines: {
    "Target": {
      "show_target": ["width_target", "type_target", "colour_target", "ttip_show_target", "ttip_label_target"],
      "ttip_show_target": ["ttip_label_target"]
    },
    "Alt. Target": {
      "show_alt_target": ["alt_target", "width_alt_target", "type_alt_target", "colour_alt_target", "ttip_show_alt_target", "ttip_label_alt_target"],
      "ttip_show_alt_target": ["ttip_label_alt_target"]
    },
    "68% Limits": {
      "show_68": ["width_68", "type_68", "colour_68", "ttip_show_68", "ttip_label_68"],
      "ttip_show_68": ["ttip_label_68"]
    },
    "95% Limits": {
      "show_95": ["width_95", "type_95", "colour_95", "ttip_show_95", "ttip_label_95"],
      "ttip_show_95": ["ttip_label_95"]
    },
    "99% Limits": {
      "show_99": ["width_99", "type_99", "colour_99", "ttip_show_99", "ttip_label_99"],
      "ttip_show_99": ["ttip_label_99"]
    }
  }
}

export default defaultSettings;
