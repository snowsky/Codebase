var width = height = 500,
    radius = 200,
    csvFile = "csv/cam.csv",
    tag = "body";

drawPie(csvFile, tag, width, height, radius);

function drawPie ( csvFile, tag, width, height, radius ) {
    var allData = [],
        version = {};
    // Load csv file
    d3.csv(csvFile, function (data) {
//        data.forEach(function(line, index) {
//            if(line["CenOS Release"] == "") line["CenOS Release"] = "Unknown";
//            version[line["CenOS Release"]] = version[line["CenOS Release"]] + 1 || 1;
//            console.log(version);
//        });
        if(data["CenOS Release"] == "") data["CenOS Release"] = "Unknown";
        return {
            "Version": data["CenOS Release"], 
//            "Name": data["Name"]
//            "Number": version[data["CenOS Release"]]
            "Number": 100
        };
    }, function(error, rows) {
        allData = rows;

        var d3color = d3.scale.category20c();

        // 选择tag
        var svg = d3.select(tag)
                    .append("svg:svg")
                    .data([allData])
                    .attr("width", width)
                    .attr("height", height)
                    .append("svg:g")
                    .attr("transform", "translate(" + radius + "," + radius + ")");

        var arc = d3.svg.arc()
                    .outerRadius(radius);

        var pie = d3.layout.pie()
                    .value(function(d) {
                        console.log(d);
                        return d["CenOs Release"];
                    });

        var arcs = svg.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
            .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
            .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
            .attr("class", "slice");    //allow us to style things in the slices (like text)

        arcs.append("svg:path")
            .attr("fill", function(d, i) { console.log(d, i); return d3color(i); } ) //set the color for each slice to be chosen from the color function defined above
            .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

        arcs.append("svg:text")                                     //add a label to each slice
            .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                //we have to make sure to set these before calling arc.centroid
                d.innerRadius = 0;
                d.outerRadius = r;
                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
            })
            .attr("text-anchor", "middle")                          //center the text on it's origin
            .text(function(d, i) { return data[i]["Number"]; });        //get the label from our original data array
    });
}