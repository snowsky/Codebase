// Pie chart for version
var width = height = 1500,
    radius = 400,
    csvFile = "csv/cam.csv",
    tag = "body";

var pie;

var update_graph = function(option) {
    switch(option) {
        case "version":
            pie_graph(csvFile, tag, width, height, radius);
            console.log(option);
            break;
        case "cpu":
            bar_graph(csvFile, tag, "cpu", width, height);
            console.log(option);
            break;
        case "memory":
            bar_graph(csvFile, tag, "memory", width, height);
            console.log(option);
            break;
        case "harddisk":
            bar_graph(csvFile, tag, "harddisk", width, height);
            console.log(option);
            break;
    }

}

var hideAll = function () {
    $("#pie").hide();
    $("#bar").empty();
    $("#machine_list").hide();
};

var getCSVFile = function() {
    //http://127.0.0.1:60525/map/versions_pie.html?dc=lon&g=pie
    if (window.location.href.indexOf("?") != -1) {
        url = window.location.href.split("?")[1].split("&");
        dc = _.find(url, function(dc) {
            return dc.indexOf("dc") != -1;
        });
        return "csv/"+dc.split("=")[1]+".csv";
    }
    return csvFile;
};

var obj2arr = function (obj) {
    var arr = [];
    for ( var i in obj ) {
        arr.push({ "label": i, "value": obj[i]});
    }
    return arr;
};

var bar_graph = function(csvFile, tag, name, width, height) {
    
    hideAll();
    csvFile = getCSVFile();
    color = d3.scale.category20c();
    
    d3.csv(csvFile, function(data) {
        data = data.sort(function(a, b) {
            switch(name) {
                case "cpu":
                    return d3.descending(+a.CPUCount, +b.CPUCount);
                case "memory":
                    return d3.descending(+a.MemoryGB, +b.MemoryGB);
                case "harddisk":
                    return d3.descending(+a.DiskCapacity, +b.DiskCapacity);
            }
        });
        console.log(data);
        
        var canvas = d3.select("#bar").append("svg")
            .attr("width", width)
            .attr("height", data.length * 25);
        canvas.selectAll("rect")
            .data(data)
            .enter()
                .append("rect")
                .attr("width", function(d){
                    switch(name) {
                        case "cpu":
                            return d.CPUCount * 100;
                        case "memory":
                            return d.MemoryGB * 10;
                        case "harddisk":
                            return d.DiskCapacity;
                    }
                })
                .attr("height", 20)
                .attr("y", function(d, i){ return i * 22; })
                .attr("fill", function(d, i) { return color(i); } );
        canvas.selectAll("text")
            .data(data)
            .enter()
                .append("text")
                .attr("fill", "black")
                .attr("y", function(d, i){ return i * 22 + 13; })
                .attr("x", function(d, i){ return 50; })
                .text(function(d) { 
                    switch(name) {
                        case "cpu":
                            return d.Name+" : "+d.CPUCount;;
                        case "memory":
                            return d.Name+" : "+d.MemoryGB+"GB";
                        case "harddisk":
                            return d.Name+" : "+d.DiskCapacity+"GB";
                    }
                });
    });
    $("#bar").show();
};

var pie_graph = function(csvFile, tag, width, height, radius) {
    
    hideAll();
    var allData = [],
        version = {};

    $("#pie").show();
    $("#machine_list").hide();

    csvFile = getCSVFile();
    // Load csv file
    d3.csv(csvFile, function (data) {
        data.forEach(function(line, index) {
            if(line["CenOS Release"] == "") line["CenOS Release"] = "Unknown";
            version[line["CenOS Release"]] = version[line["CenOS Release"]] + 1 || 1;
        });
    //    console.log(version);
        allData = obj2arr(version);

        if(pie) return;
        
        pie = new d3pie("pie", {
            header: {
                title: {
                  text: "OS"
                },
                location: "pie-center"
            },
            size: {
                pieInnerRadius: "60%"
            },
            data: {
                sortOrder: "label-asc",
                content: allData
            },
            tooltips:{
                enabled: true,
                type: "placeholder",
                string: "{label}"+"({value})"
            },
            callbacks: {
                onClickSegment: function(a) {
                    $("#pie").toggle();
                    $("#machine_list").toggle();
                    $("#machine_list").append(a.data["label"]+":<br>");
                    data.forEach(function(line, index) {
                        $("#machine_list").append(function() {
                            if(line["CenOS Release"] == a.data["label"])
                                return line["Name"]+"<br>";
                        });
                    });
                }
            }
        });
    });
};

pie_graph(csvFile, tag, width, height, radius);
