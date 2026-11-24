/**
 * Extra prompt rules and examples for oui.rebel.army: dashboards built from
 * Grid, Card and Chart, and the Excalidraw Whiteboard component.
 */

export const exampleDashboard = `root = Col([head, kpis, charts, table])
$range = "12 months"
head = Row([Col([Title("Shop performance", "xl"), Caption("Sample data, " + $range)], 1), Spacer(), SegmentedControl($range, ["6 months", "12 months"])], 3)
months = [{m: "Jan", revenue: 42000, orders: 310}, {m: "Feb", revenue: 39000, orders: 290}, {m: "Mar", revenue: 47000, orders: 345}, {m: "Apr", revenue: 51000, orders: 372}, {m: "May", revenue: 55000, orders: 398}, {m: "Jun", revenue: 61000, orders: 430}, {m: "Jul", revenue: 58000, orders: 410}, {m: "Aug", revenue: 63000, orders: 452}, {m: "Sep", revenue: 66000, orders: 470}, {m: "Oct", revenue: 70000, orders: 501}, {m: "Nov", revenue: 74000, orders: 530}, {m: "Dec", revenue: 88000, orders: 612}]
rows = $range == "6 months" ? @Slice(months, 6, 12) : months
kpis = Grid([kpi1, kpi2, kpi3], 3, 160, 3)
kpi1 = Card([Caption("Revenue"), Title(@Format(@Sum(rows.revenue), "currency"), "2xl"), Badge("+18% vs last period", "success", "trending-up")], "soft")
kpi2 = Card([Caption("Orders"), Title(@Sum(rows.orders) + "", "2xl"), Badge("+11%", "success", "trending-up")], "soft")
kpi3 = Card([Caption("Avg order"), Title(@Format(@Sum(rows.revenue) / @Sum(rows.orders), "currency"), "2xl"), Badge("Flat", null, "minus")], "soft")
charts = Grid([Card([Title("Revenue", "md"), Chart("area", rows, "m", ["revenue"])]), Card([Title("Orders", "md"), Chart("bar", rows, "m", ["orders"])])], 2, 280, 3)
table = Card([Title("By month", "md"), Table(["Month", "Revenue", "Orders"], @Each(rows, "r", [r.m, @Format(r.revenue, "currency"), r.orders]))])`;

export const exampleWhiteboard = `root = Col([title, board])
title = Title("Login flow", "lg")
board = Whiteboard([{type: "rectangle", x: 0, y: 0, width: 160, height: 70, text: "User opens app", fill: "#a5d8ff"}, {type: "arrow", x: 160, y: 35, x2: 240, y2: 35}, {type: "diamond", x: 240, y: -15, width: 170, height: 100, text: "Signed in?", fill: "#ffec99"}, {type: "arrow", x: 410, y: 35, x2: 490, y2: 35, text: "yes"}, {type: "rectangle", x: 490, y: 0, width: 160, height: 70, text: "Home", fill: "#b2f2bb"}, {type: "arrow", x: 325, y: 85, x2: 325, y2: 160, text: "no"}, {type: "rectangle", x: 245, y: 160, width: 160, height: 70, text: "Login form", fill: "#ffc9c9"}], "Editable: drag, add or redraw anything", 380)`;

export const extraRules = [
  'For a dashboard (metrics, KPIs, a report, "how is X doing"), lay it out as: a header Row with the Title and a SegmentedControl or Select filter in a $variable; a Grid of KPI Cards (Caption label, big Title number, a Badge for the change); a Grid of Cards each holding one Chart; then a Table. Derive every number and chart from one data list through the filter $variable, so the filter changes the whole page.',
  "Pick the Chart type for the data: line or area for a trend over time, bar for comparing categories, stacked bar for parts across categories, pie or donut for shares of one whole (at most 6 slices), scatter for two measures. Put two to four Charts side by side in a Grid rather than one long column.",
  'Use Whiteboard for diagrams the user may want to edit or keep drawing on: flowcharts, mind maps, architecture and network sketches, user journeys, brainstorming boards, sticky-note retros. Place elements on a loose grid (about 160x70 boxes, 80px apart), connect them with arrows whose x/y start and x2/y2 end touch the boxes\' edges, label boxes with text, and use soft fills like "#a5d8ff", "#b2f2bb", "#ffec99", "#ffc9c9", "#d0bfff". Use Svg instead for small fixed illustrations inside an answer.',
];

export const extraExamples = [
  `Example: A filtered dashboard with KPI cards, two charts and a table:\n\n${exampleDashboard}`,
  `Example: A flowchart on an editable whiteboard:\n\n${exampleWhiteboard}`,
];
