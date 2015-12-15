$(document).ready(function() {
    $('form').validator().on('submit', function (e) {
        if (e.isDefaultPrevented()) {
            e.stopImmediatePropagation();
            console.log("stopImmediatePropagation");
        }        
    });
});
// $(document).ready(function() {
//     
//     
//     
//                    $("#grid").kendoGrid({
//                        dataSource: {
//                            type: "odata",
//                            transport: {
//                                read: "//demos.telerik.com/kendo-ui/service/Northwind.svc/Products"
//                            },
//                            schema:{
//                                model: {
//                                    fields: {
//                                        UnitsInStock: { type: "number" },
//                                        ProductName: { type: "string" },
//                                        UnitPrice: { type: "number" },
//                                        UnitsOnOrder: { type: "number" },
//                                        UnitsInStock: { type: "number" }
//                                    }
//                                }
//                            },
//                            pageSize: 7,
//                            group: {
//                                     field: "UnitsInStock", aggregates: [
//                                        { field: "ProductName", aggregate: "count" },
//                                        { field: "UnitPrice", aggregate: "sum"},
//                                        { field: "UnitsOnOrder", aggregate: "average" },
//                                        { field: "UnitsInStock", aggregate: "count" }
//                                     ]
//                                   },
//
//                            aggregate: [ { field: "ProductName", aggregate: "count" },
//                                          { field: "UnitPrice", aggregate: "sum" },
//                                          { field: "UnitsOnOrder", aggregate: "average" },
//                                          { field: "UnitsInStock", aggregate: "min" },
//                                          { field: "UnitsInStock", aggregate: "max" }]
//                        },
//                        sortable: true,
//                        scrollable: false,
//                        pageable: true,
//                        columns: [
//                            { field: "ProductName", title: "Product Name", aggregates: ["count"], footerTemplate: "Total Count: #=count#", groupFooterTemplate: "Count: #=count#" },
//                            { field: "UnitPrice", title: "Unit Price", aggregates: ["sum"] },
//                            { field: "UnitsOnOrder", title: "Units On Order", aggregates: ["average"], footerTemplate: "Average: #=average#",
//                                groupFooterTemplate: "Average: #=average#" },
//                            { field: "UnitsInStock", title: "Units In Stock", aggregates: ["min", "max", "count"], footerTemplate: "<div>Min: #= min #</div><div>Max: #= max #</div>",
//                                groupHeaderTemplate: "Units In Stock: #= value # (Count: #= count#)" }
//                        ]
//                    });
//                });
//
//        function createChart() {
//            $("#chart").kendoChart({
//                dataSource: {
//                    transport: {
//                        read: {
//                            url: "assets/kendoui.2015.3.1111/content/spain-electricity.json",
//                            dataType: "json"
//                        }
//                    },
//                    sort: {
//                        field: "year",
//                        dir: "asc"
//                    }
//                },
//                title: {
//                    text: "Spain electricity production (GWh)"
//                },
//                series: [{
//                    field: "nuclear",
//                    name: "Nuclear"
//                }, {
//                    field: "hydro",
//                    name: "Hydro"
//                }, {
//                    field: "wind",
//                    name: "Wind"
//                }],
//                categoryAxis: {
//                    field: "year",
//                    majorGridLines: {
//                        visible: false
//                    }
//                },
//                valueAxis: {
//                    labels: {
//                        format: "N0"
//                    },
//                    majorUnit: 10000,
//                    plotBands: [{
//                        from: 10000,
//                        to: 30000,
//                        color: "#c00",
//                        opacity: 0.3
//                    }, {
//                        from: 30000,
//                        to: 30500,
//                        color: "#c00",
//                        opacity: 0.8
//                    }],
//                    max: 70000,
//                    line: {
//                        visible: false
//                    }
//                },
//                tooltip: {
//                    visible: true,
//                    format: "N0"
//                }
//            });
//        }
//
//        $(document).ready(createChart);
//        $(document).bind("kendo:skinChange", createChart);