//*
//* main.js		26-Feb-17 	Randy Sincoular	Lab 2: D3 Coordinated Visualization
//*				26-Mar-17					Start adding code to create chart	
//* 

console.log("in main.js");

//* Self executing anonymous function to use local variables
(function() {  // add Sat 25-Mar-17
	
//* Data Join
var attrArray = ["AVG_ELEC","ENERGY_CONSUMED","ENERGY_EXPEND","ENERGY_PROD","NG_PRICES"];
		
var expressed = attrArray[0];	// initial attribute

//* Chart frame dimensions
var chartWidth = window.innerWidth * .425;
	chartHeight = 463,	// This is the bottom of the chart.  
	leftPadding = 30,	// 2-apr-17 changed from 25 to 30
	rightPadding = 2,
	topBottomPadding = 5,
	chartInnerWidth = chartWidth - leftPadding - rightPadding,
	chartInnerHeight = chartHeight - topBottomPadding * 2,
	translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

	
//* Create a Second SVG Element to Hold the Bar Chart
//* copy here 1-apr-17

	
	/* comment out sat, 1-apr-17 */
	/*
//* Create a chart and draw border around it
var chart = d3.select("body")
		.append("svg")
		.attr("width",chartWidth)
		.attr("height", chartHeight)
		.attr("class", "chart");	
	
//* Chart Title		//* moved here 1-apr-17

//* Display the Chart Title inside the border of the chart
var chartTitle = chart.append("text")
		.attr("x", 40)
		.attr("y", 40)
		.attr("class", "chartTitle")
		.text("Number of Variable " + expressed[3] + " in each state");
*/
	
//* Create a scale to size bars proportionally to frame and for axis
/* 2-apr-17 comment out
var yScale = d3.scaleLinear()
	.range([463,0])
	.domain([0,110]);
*/		
//* 2-apr-17 changed '463' = chartHeight
var yScale = d3.scaleLinear()
	.range([chartHeight,0])		// changed 463 = chartHeight
	.domain([0,35]);			// 2-apr-17 changed 110 to: 210
		
window.onload = setMap();
	
//* Run this script when the window is loaded
//* window.onload = function() {

function setMap(){
	
	
	console.log("in setMap() ...");
	
	
	//* Map frame dimensions
	
	var width = window.innerWidth *.4,		// Sunday, 26-Mar-17
		height = 460;
	
	
	//* Create a new SVG container for the map
	//* and draw a border around the map
	var map = d3.select("body")
		.append("svg")
		.attr("class","map")
		.attr("width", width)
		.attr("height", height);
	
	//* Create an Albers Equal Area Projection
	//* .center(longitude, latitude)
	var projection = d3.geoAlbers()
		// .center([11.73,40.87])  //* increasing center longitude moves map to left  // Tues. 4-apr-17
		.center([7.73,40.87])  //* increasing center longitude moves map to left
	
		.rotate([101.64,4.55,0])
		.parallels([15.41,48.13])
		//* .scale(352)  // comment out Tuesday, 4-apr-17
		.scale(425)
	
		.translate([width /2, height / 2]);
	
	//* Create a geoPath to draw the projected data
	var path = d3.geoPath()
		.projection(projection);
	
	
	//* Use queue to parallelize asynchronous data loading
	d3.queue() 
		.defer(d3.csv, "data/US_Energy_Stats.csv") 	// Load attributes
		.defer(d3.json,"data/US_States.topojson")	// Load choropleth data
	
		//* The callback function fires when all the data has loaded 
		//* Data is then sent to the callback() function
		.await(callback);
	
		
	//* This function is called when the data has loaded
	function callback(error, csvData,usStates) {
		// console.log("in callback(): Error: ",error);
		console.log("++++++  in callback(): csvData: ",csvData);
		console.log("++++++ in callback(): USA: ",usStates);
		
		console.log(" converting back to geoJSON ...");
		
		//* Case Sensitive!
		
		//* -----------------------------------------------
		//* Convert the topoJSON back to geoJSON features
		
		//* usStates = variable containing converted objects
		//* US_States = name of the *.topoJSON file
		//* -----------------------------------------------
		var usStates = topojson.feature(usStates, usStates.objects.US_States).features;
		
		
		//* Join CSV Data to US Shapes  Saturday, 23-Mar-17
		usStates = joinData(usStates,csvData);
		
		
		//* Create the color scale
		var colorScale = makeColorScale(csvData);
		
		//* Add enumerations units to the map  Saturday, 23-Mar-17
		//* Draw the actual state polygons
		setEnumerationUnits(usStates, map, path,colorScale);
		
		
		//* Add Chart to the map and display bars in the chart
		setChart(csvData,colorScale);
		
		//* Display Menu to Make Attribute Selection
		createDropdown(csvData);
		
		console.log(" +++  drawing state boundaries ++++ ");
		

		
		console.log(" done drawing the United States Polygons ...");
		
	};  //* end callback()
	
	
	//* Add Saturday, 25-Mar-17
	
	function setEnumerationUnits(usStates, map, path, colorScale) {
			
		console.log("in setEnumerations()");
		
		console.log(" +++  drawing state boundaries ++++ ");
		
		//* 31-Mar-17 try changing map.selectAll(".State") to: (".STATE_ABBR")
		//* so that both the state polys and chart bars both work
		
		// var usa2 = map.selectAll(".State")		// 31-Mar-17
		var usa2 = map.selectAll(".STATE_ABBR")		// add 31-Mar-17
			.data(usStates)
			.enter()
			.append("path")
			.attr("class",function(d) {
				
				//* Print state name
				console.log("state: ",d.properties.State, " STATE_ABBR: ", d.properties.STATE_ABBR)
				
				//* The return string below, "state" is
				//* the element name to use in the CSS
				
				//return "state " + d.properties.State;  		// 31-Mar-17
				return "state " + d.properties.STATE_ABBR;		// 31-Mar-17
				
			})
			.attr("d",path)
		
			//* This is where each state gets drawn a specific color
		
			.style("fill", function colorStates(d) {
				// return colorScale(d.properties[expressed]);  // Sun
				return choropleth(d.properties,colorScale);
				
			})
			
			//* Add mouseover event listener for map
			//* Pass 'properties' object to anonymous function to 
			//* call 'highlight()' function
		
			.on("mouseover",function(d) {
				highlight(d.properties);
			})
		
			.on("mouseout", function(d){	//* Friday, 31-Mar-17
				dehighlight(d.properties);
			})
		
			//* listener for labeling each state or bar
			.on("mousemove", moveLabel);
		
		
		//* Add a style descriptor to each path  // add 31-Mar-17 (Friday)
		var desc = usa2.append("desc")
			.text('{"stroke": "#000", "stroke-widht": "0.5px"}');
		
			
		
		
	}; //* end setEnumerationUnits()
	
	
	function joinData(usStates,csvData) {
		
		console.log("in joinData() ... ")
		
		//* Columns used to Join data to US States
		var attrArray = ["AVG_ELEC","ENERGY_CONSUMED","ENERGY_EXPEND","ENERGY_PROD","NG_PRICES"];
		
		//* This will contain one of the Attribute Values
		//* Like: AVG_ELEC, ENERGY_CONSUMED ...
		var expressed = attrArray[1];	// initial attribute
		
		console.log(" done Converting to geoJSON: ", usStates);
		
		console.log(" draw the United States Polygons");
		
		//* Draw the United States

	
		//* Loop through csv to assign each set of csv attribute 
		//* values to geojson State
		for (var i = 0; i < csvData.length; i++){
		
			//* Current State
			var csvState = csvData[i]; 
			
			//* Primary key of CSV/Attribute file
			//* Ex. AK, AL, etc
			var csvKey = csvState.STATE_ABBR;
			
			var test = usStates[i].properties;
		
		
			
			//* Loop through the US States to find matching attribute
			for (var a = 0; a < usStates.length; a++){

			
				//* Current US State 
				var geojsonProps = usStates[a].properties;
			
				//* Primary key of the CSV/Attribute File
				var geojsonKey = geojsonProps.STATE_ABBR;
			
			
				if (geojsonKey == csvKey) {
				
					console.log("Match found ...");
				
					attrArray.forEach(function(attr) {
					
						//* Get CSV attribute value
						var val = parseFloat(csvState[attr]);
					
						//* Assign attribute and value to geojson properties
						geojsonProps[attr] = val;
						
						console.log(" state: ", geojsonProps.STATE_ABBR, " attr : ",attr, " ", geojsonProps[attr])
					});
					
				}; // end if (geojsonKey)
				
			}; //* end for loop usStates()
			
		}; //* end for loop csvData.length()
		
		return usStates;
	}; 
	
};  //* end setMap()


//* Color Scale Generator
function makeColorScale(data) {
	
	console.log(" in makeColorScale()");
	
	//* Maroon/red color scheme
	/*
	var colorClasses = [
		"#D4B9DA",
		"#C994C7",
		"#DF65B0",
		"#DD1C77",
		"#980043"
	];
	*/
	
	//* Green Color Scheme
	
	var colorClasses = [
		"#edf8e9",
		"#bae4b3",
		"#74c476",
		"#31a354",
		"#006d2c"
	];
	
	
	//* Blue Green Multi-hue Color Scheme
	/*
	var colorClasses = [
		"#f6eff7",
		"#bdc9e1",
		"#67a9cf",
		"#1c9099",
		"#016c59"
	];
	*/
	
	//* Create quantile color scale generator
	
	var colorScale = d3.scaleQuantile()
	 	.range(colorClasses);
	

	//* Build array of all values of the expressed attribute
	var domainArray = [];
	for (var i = 0;i < data.length; i++) {
		var val = parseFloat(data[i][expressed]);
		domainArray.push(val);
	};
	
	
	//* Assign array of expressed values as scale domain
	colorScale.domain(domainArray);
	
	
	console.log("Colorscale: ", colorScale.quantiles());
	
	return colorScale;
	
	
}; //* end makeColorScale()


	
//* Draw Chart with Y Axis
function setChart(csvData,colorScale) {
	
	/* comment out Wed, 29-Mar-17 */
	/* moved to global area */
	//* Chart Frame Dimensions
	//* Set chart Width = 42.5% of map frame
	/*
	 var chartWidth = window.innerWidth * .425,
	 	 chartHeight = 473,
		 leftPadding = 25,
		 rightPadding = 2,
		 topBottomPadding = 5,
		 chartInnerWidth = chartWidth - leftPadding - rightPadding,
		 chartInnerHeight = chartHeight - topBottomPadding * 2,
		 translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
	*/
	
	//* Create a Second SVG Element to Hold the Bar Chart
	
	//* Create a chart and draw a border around it
	var chart = d3.select("body")
		.append("svg")
		.attr("width",chartWidth)
		.attr("height", chartHeight)
		.attr("class", "chart");
	
	/* Wed 3/29/17 */
	//* Create a Rectangle for Chart Background Fill
	var chartBackground = chart.append("rect")
		.attr("class", "chartBackground")
		.attr("width", chartInnerWidth)
		.attr("height", chartInnerHeight)
		.attr("transform", translate);
	


	
	/* uncomment 1-apr-17 */
	//* Create a Scale to Size Bars Proportionally to Frame
	/* 2-apr-17 comment out
	var yScale = d3.scaleLinear()
		.range([463,0])
		.domain([0,100]);
	*/
	
	//* 2-apr-17 changed 463 = chartHeight
	var yScale = d3.scaleLinear()
		.range([chartHeight,0])		//* changed 463 = chartHeight
		.domain([0,100]);		// 2-apr-17 try changing 1oo to: 200
								//* this changes the max value on the 'y' scale
	
	
	//* Set Bars for each State
	var bars = chart.selectAll(".bar")
		.data(csvData)
		.enter()
		.append("rect")
	
		//* Sort attribute values of bar
		.sort(function(a, b) {
			
			//* Order the bars largest to smallest
			return b[expressed] - a[expressed]
		})
	
		//* Create a bar for each state using state abbreviation
		.attr("class", function(d){
			return "bar " + d.STATE_ABBR;
		})
	
		.attr("width", chartInnerWidth / csvData.length - 1)
	
		//* Add mouseover on bars in the chart
		//* Pass the name of the 'highlight' function
		.on("mouseover", highlight)
	
		.on("mouseout", dehighlight)	//* Add Friday, 31-Mar-17
	
		//* listener for labeling each bar
		.on("mousemove", moveLabel);	
	
	
	//* Add style descriptor to each rect	// Friday, 31-Mar-17
	var desc = bars.append("desc")
		.text('{"stroke": "none", "stroke-width": "0px"}');
	
	//* Display the Chart Title inside the border of the chart
	//* Draw the title after the bar chart to keep title on top/in front
	var chartTitle = chart.append("text")
		.attr("x", 50)
		.attr("y", 40)
		.attr("class", "chartTitle")
		.text("Number of Variable " + expressed[3] + " in each state");
		
	
	//* Create Vertical (Y) Axis Generator
	var yAxis = d3.axisLeft()
		.scale(yScale);
		// .orient("left");
	
	
	//* Display the Y Axis on the bar chart
	//* on left side of chart
	
	var axis = chart.append("g")
		.attr("class","axis")
		.attr("transform", translate)
		.call(yAxis);					// 2-apr-17 this draws y-axis
	/*
	//* Create Frame for Chart Border
	var chartFrame = chart.append("rect")
		.attr("class", "chartFrame")
		.attr("width", chartInnerWidth)
		.attr("height", chartInnerHeight)
		.attr("transform", translate);
*/
	//* Set Bar Position, heights and colors  3/29/17 Wed
	updateChart(bars, csvData.length, colorScale);
	
	
}; //* end setChart()
	
//* Function to reset the element style on mouseout	// Friday, 31-Mar-17
function dehighlight(props) {
	
	var selected = d3.selectAll("." + props.STATE_ABBR)
		.style("stroke", function() {
			return getStyle(this,"stroke")	
		})
		.style("stroke-width", function() {
			return getStyle(this,"stroke-width")
		})
	
		.style("opacity", function(){			// add 1-apr-17
			return getStyle(this,"opacity")
		});	// add 1-apr-17
	
	//* Remove info label		// 1-Apr-17
	d3.select(".infolabel")
		.remove();
	
	
	function getStyle(element, styleName) {
		
		//* Arguments
		//* element = current element in the DOM, represented by keyword 'this'
		//* styleName = style property
		
		var styleText = d3.select(element)
			.select("desc")
			.text();	// return the text content
		
		var styleObject = JSON.parse(styleText);
		
		return styleObject[styleName];	// return the text content
		
	};
}; //* end dehighlight()
	
	
//* Function to Test for Data Value and Return a color
function choropleth(props, colorScale) {
	
	console.log("in choropleth() ...");
	
	//* Make sure attribute value is a number
	var val = parseFloat(props[expressed]);
	
	//* If Attribute Value Exists, Assign a Color; otherwise assign gray
	if (typeof val == 'number' && !isNaN(val)) {
		return colorScale(val);
	} else {
		return "#CCC";
	}; // end if/else
	
}; //* end choropleth()

	
//* Function to Create a Dropdown Menu for Attribute Selection
function createDropdown(csvData){
	
	console.log("in createDropdown() ...");
	
	//* Add Selected Element
	var dropdown = d3.select("body")
		.append("select")
		.attr("class", "dropdown")
		.on("change", function() {		//* listener for new selection
			changeAttribute(this.value,csvData)
		});
	
	//* Add Initial Option
	var titleOption = dropdown.append("option")
		.attr("class", "titleOption")
		.attr("disabled", "true")
		.text("Select Attribute");
	
	//* Add Attribute Name Choices from CSV Data File
	//* using pseudo-global variable: "attrArray"
	var attrOptions = dropdown.selectAll("attrOptions")
		.data(attrArray)
		.enter()
		.append("option")
		.attr("value", function(d) { return d})
		.text(function(d){ return d});
	
}; //* end createDropdown()
	
//* Function to position, size and color bars in the chart
//* Called from both: setChart() and changeAttribute()

function updateChart(bars, n, colorScale) {
	//* Arguments
	//*  bars = what attribute is selected
	//*  n = # of records in the csvData
	//*  colorScale
	
	console.log("in updateChart() ");
	
	//* 2-apr-17 copied here from updateChart()
	
	//* Create Vertical (Y) Axis Generator
	var yAxis = d3.axisLeft()
		.scale(yScale);
	
	//* Position bars
	bars.attr("x", function(d,i){
		return i * (chartInnerWidth / n) + leftPadding;
		
		})
	
		//* Resize bars
		//* console.log("+++height: ",str(d[expressed]));
		//* this actualldraws the bars from the top down.
		.attr("height", function(d,i){
			return 463 - yScale(parseFloat(d[expressed]));
			
		})
		//* this then re-draws the bars from the bottom up (which is correct)
		.attr("y", function(d,i) {
			console.log(" yScale(parseFloat(d[expressed])): ",yScale(parseFloat(d[expressed])));
		
			return yScale(parseFloat(d[expressed])) + topBottomPadding;
		})
	
		//* Color bars
		.style("fill", function(d) {
			return choropleth(d,colorScale);
	});
	
	
	//* 2-apr-17 try to change domain/extent of y-axis based on the 
	//* attribute selected
	
	//* Set New Domain Values for Y-Axis
	/*
	//yScale = d3.scaleLinear()
		.domain([0,11000]);
	*/
	//* Trick for Drawing New Y-Axis
	//* Draw Y-Axis with New Domain Values
	var axis = d3.selectAll(".axis")
		.call(yAxis);
	
	
	//* Update Chart Title
	if (expressed == "AVG_ELEC") {
		newTitle = "Average Retail Price of Electric";
		secondTitle = "(cents/kWh)";
		
	} else if (expressed == "ENERGY_CONSUMED") {
		newTitle = "Total Energy Consumed per Capita";
		secondTitle = "(in million Btu's)";
		
	} else if (expressed == "ENERGY_EXPEND") {
		newTitle = "Total Energy Expenditures per Capita";
		secondTitle = "(in $)";
		
	} else if (expressed == "ENERGY_PROD") {
		newTitle = "Total Energy Production"; 
		secondTitle = "(in trillion Btu's)";
	} else {
		newTitle = "Natural Gas Residential Prices";
		secondTitle = "($/thousand cu ft)";
	};
		
	
	var chartTitle = d3.select(".chartTitle")
		.text(newTitle)
		/* .append("text") */
		/* .append("tspan") */
		.attr("x","50");
	
	chartTitle.append("tspan")
		 .attr("x","50") 
		.attr("dy","20")
		.text(secondTitle);
	/*
	chartTitle.append("tspan")
		.attr("x","45")
		.attr("dy","15")
		.text("third line");
	*/
	
	//* Display the Chart Title inside the border of the chart
	//* Draw the title after the bar chart to keep title on top/in front
	/*
	var chartTitle2 = d3.select(".chartTitle")
		.attr("x", 50)
		.attr("y", 80)
		.attr("class", "chartTitle")
		.text("This is the second line of text")
		.append("text");
	*/
	
}; //* end updateChart()
	
//* ------------
//* highlight()
//* ------------
//* Function to highlight states and bars
function highlight(props) {
	
	console.log("in highlight()");
	
	//* Change the stroke for the selected state or bar
	//* 31-Mar-17 Changed: props.State to: props.STATE_ABBR
	//* so that the mouseover works for both state polys and bar chart
	
	//* props.State only works for poly outlines
	//* props.STATE_ABBR only works for the chart bars
	
	// var selected = d3.selectAll("." + props.State)	// 31-Mar-17
	var selected = d3.selectAll("." + props.STATE_ABBR)	// 31-Mar-17
		.style("stroke", "red")		//* change stroke color
		// .style("fill", "blue")		//* fill color
		.style("opacity", .5)			//* add 1-apr-17
		.style("stroke-width","2");		//* change stroke width
	
	
	//* Call function to label selected state 	1-Apr-17
	setLabel(props);
	
	console.log(" props.State: ",props.State, " STATE_ABBR: ", props.STATE_ABBR);
	
};  //* end highlight()
	
	
//* -----------------
//* changeAttribute()
//* -----------------
	
//* Dropdown Select Change Listener Handler
function changeAttribute(attribute, csvData) {
	
	//* This function gets called the 2nd and subsequent times.  
	//* Each time the dropdown attribute is called, this function 
	//* gets called.
	
	console.log("in changeAttribute() ...");
	
	//* Set 'expressed' equal to the attribute selected in
	//* the dropdown menu
	expressed = attribute;
	
	//* Re-create the color scale
	var colorScale = makeColorScale(csvData);
	
	
	//* Get the max value for the selected attribute
	//* Add Wed 3/29/17
	
	//* 2-Apr-17 comment out to add 'parseFloat'
	/*
	var max = d3.max(csvData,function(d){
		return + d[expressed];
	});
	*/
	
	//* modify 2-apr-17.  Add 'parseFloat' function
	var max = d3.max(csvData,function(d){
		return + parseFloat(d[expressed]);
	});

	//* This helps to scale the max bar height 
	//* based on the different attribute values
	/* 2-apr-17 comment out
	yScale = d3.scaleLinear()
		.range([0,chartHeight])
		.domain([0,max]);
	*/
	//* Modify 2-Apr-17 Sunday. change .range order of .range arguments
	//* Set Domain (Max Value of the Y-Axis)
	yScale = d3.scaleLinear()
		.range([chartHeight,0])
		.domain([0,max])
		.nice();
	
	//* 2-apr-17 setting max = 100; the avg_elec scales correctly but does not 
	//* work when attributes have values > 100
	
	/*
		yScale = d3.scaleLinear()
		.range([chartHeight,0])
		.domain([0,100]);
	*/
	
	/* Saturday, 1-Apr-17 try to get changeAttribute to work and draw states w/ new attr */
	
	//* ----------------------------------------------------
	//* Re-color States
	/*  Sat 1-apr-17
	var state = d3.selectAll(".State")		// Friday, 31-Mar-17
	// var state = d3.selectAll(".STATE_ABBR")		// Friday, 31-Mar-17
		.transition()		//* Create a transition from current map
							//* state to target state. Chart is not affected
	
		.duration(1000)		//* Duration in milleseconds
		.style("fill", function chngAttrDrawStates(d) {
			console.log("changeAttribute() d.properties: ", d.properties);
			
			return choropleth(d.properties,colorScale)
		});
	*/  /* Sat 1-apr-17 */
	
	//* ----------------------------------------------------
	
	//* Sat 1-Apr-17  Modified like older code
	/*
	var state = d3.selectAll(".state")
	
		//* Here is where each state gets re-drawn in a new color
		.style("fill", function(d) {
			console.log("changeAttributes() d.properties: ", d.properties);
			
			return choropleth(d.properties,colorScale);
		});
	*/
	//* ---------------------------------------------------
	
		//* Sat 1-Apr-17  Modified like older code
		//* add transitions
	
	var state = d3.selectAll(".state")
	
		.transition()
		.duration(1000)
		//* Here is where each state gets re-drawn in a new color
		.style("fill", function(d) {
			console.log("changeAttributes() d.properties: ", d.properties);
			
			return choropleth(d.properties,colorScale);
		});
	//* ---------------------------------------------------
	
	//* Re-sort, resize and recolor bars
	//* Add Wed, 29-Mar-17
	
	var bars = d3.selectAll(".bar")
	
	//* Re-sort bars from largest to smallest (b - a)
	.sort(function(a,b){
		return b[expressed] - a[expressed];
		
	})
	
	//* These 3 lines create errors when picking a new attribute from
	//* the dropdown.
	//* Error: <rect> attribute y: expected length, "NaN".  
	//* Chart still looks ok after it redraws.
	
	.transition() 			//* Create a transition from current chart
							//* to to new chart.
	
	.delay(function(d,i) {
		
		console.log(" d: ", d + " i: ",i);
		
		//* Delay start of animation for 20 milliseconds
		return i * 20
	})
	.duration(1000);
	
	
	/*
	.attr("x",function(d,i){
		return i * (chartInnerWidth / csvData.length) + leftPadding;
		
	})
	
	//* Resize bars
	.attr("height", function(d,i) {
		return 463 - yScale(parseFloat(d[expressed]));
		
	})
	
	//* Reset the height of the bars
	.attr("y", function(d,i) {
		return yScale(parseFloat(d[expressed])) + topBottomPadding;
	})
	
	//* Re-color bars
	.style("fill", function(d) {
		return choropleth(d,colorScale);
	});
	*/
	
	//* Update bars in graph
	updateChart(bars, csvData.length, colorScale);
	
	
	
} //* end changeAttribute()
	
function setLabel(props) {
	
	//* Label attributes
	//* Create an HTML string with <h1> element that contains the selected dropdown attribute
	var labelAttribute = "<h1>" + props[expressed] + "</h1><b>" + expressed + "</b>";
	
	//* Create Info Label div
	var infolabel = d3.select("body")
		.append("div")
		.attr("class", "infolabel")
		.attr("id", props.STATE_ABBR + "_label")
		.html(labelAttribute);
	
	var stateName = infolabel.append("div")
		.attr("class", "labelname")
		.html(props.STATE_ABBR);
	
}; //* end setLabel()

//* Function to move infolabel with mouse
function moveLabel() {
	
	console.log("in moveLabel() ");
	
	//* Get Width of label
	var labelWidth = d3.select(".infolabel")
		.node()
		.getBoundingClientRect()
		.width;
	
	//* User coordinates of mousemove to set label coordinates
	//* d3.event.clientX/Y = position of mouse
	var x1 = d3.event.clientX + 10,
		y1 = d3.event.clientY - 75,
		x2 = d3.event.clientX - labelWidth - 10,
		y2 = d3.event.clientY + 25;
	
	//* Horizontal label coordinates
	//* Test for overflow
	var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
	
	//* Vertical label coordinate
	//* Test for overflow
	var y = d3.event.clientY < 75 ? y2 : y1;
	
	
	
	
	d3.select(".infolabel")
		.style("left", x + "px")
		.style("top", y + "px");
	
}; //* end moveLabel()
	
	
	
})();  //* end self-executing anonymous function
