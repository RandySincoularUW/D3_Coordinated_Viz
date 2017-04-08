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
	chartHeight = 473,
	leftPadding = 25,
	rightPadding = 2,
	topBottomPadding = 5,
	chartInnerWidth = chartWidth - leftPadding - rightPadding,
	chartInnerHeight = chartHeight - topBottomPadding * 2,
	translate = "translate(" + leftPadding + "," + topBottomPadding +")";

//* Createa a scale to size bars proportionally to frame and for axis
var yScale = d3.scaleLinear()
	.range([463,0])
	.domain([0,110]);
		
		
window.onload = setMap();
	
//* Run this script when the window is loaded
//* window.onload = function() {

function setMap(){
	
	
	console.log("in setMap() ...");
	
	
	//* Map frame dimensions
	
	var width = window.innerWidth *.4,		// Sunday, 26-Mar-17
		height = 460;
	
	
	//* Create a new SVG container for the map
	var map = d3.select("body")
		.append("svg")
		.attr("class","map")
		.attr("width", width)
		.attr("height", height);
	
	//* Create an Albers Equal Area Projection
	//* .center(longitude, latitude)
	var projection = d3.geoAlbers()
		.center([11.73,40.87])  //* increasing center longitude moves map to left
		.rotate([101.64,4.55,0])
		.parallels([15.41,48.13])
		.scale(352)
		.translate([width /2, height / 2]);
	
	//* Create a geoPath to draw the projected data
	var path = d3.geoPath()
		.projection(projection);
	
	
	//* Use queue to parallelize asynchronous data loading
	d3.queue() 
		.defer(d3.csv, "data/us_energy_stats.csv") 	// Load attributes
		.defer(d3.json,"data/us_states.topojson")	// Load choropleth data
	
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
		setEnumerationUnits(usStates, map, path,colorScale);
		
		
		//* Add Chart to the map
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
			.style("fill", function(d) {
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
			});
		
		
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
	
	
	/*
	//* Create a Scale to Size Bars Proportionally to Frame
	var yScale = d3.scaleLinear()
		.range([463,0])
		.domain([0,100]);
	*/
	
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
	
		.on("mouseout", dehighlight);	//* Add Friday, 31-Mar-17
	
	
	//* Add style descriptor to each rect	// Friday, 31-Mar-17
	var desc = bars.append("desc")
		.text('{"stroke": "none", "stroke-width": "0px"}');
	
	
	
	/* comment out 29-Mar-17 (Wed)
		.attr("x", function(d,i) {
			return i * (chartInnerWidth / csvData.length) + leftPadding;
			
		})
		//* Apply the yScale to each attribute value to set bar height
		.attr("height", function(d, i) {
			return 463 - yScale(parseFloat(d[expressed]));
			
		})
		.attr("y", function(d,i){
			return yScale(parseFloat(d[expressed])) + topBottomPadding;
		})
		//* Show where class breaks are
		.style("fill", function(d) {
			return choropleth(d,colorScale);
		});
*/
	

	
	/*
	//* Create Vertical Axis Generator
	var yAxis = d3.axisLeft()
		.scale(yScale);
		// .orient("left");
	
	
	//* Place Y Axis
	var axis = chart.append("g")
		.attr("class","axis")
		.attr("transform", translate)
		.call(yAxis);
	
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
		});
	
	
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
	
	//* Position bars
	bars.attr("x", function(d,i){
		return i * (chartInnerWidth / n) + leftPadding;
		
		})
	
		//* Resize bars
		//* console.log("+++height: ",str(d[expressed]));
	
		.attr("height", function(d,i){
			return 463 - yScale(parseFloat(d[expressed]));
			
		})
	
		.attr("y", function(d,i) {
			return yScale(parseFloat(d[expressed])) + topBottomPadding;
		})
	
	/* this does not work
		//* Modify 30-Mar-17
		.attr("y", function(d,i) {
			return chartHeight - yScale(parseFloat(d[expressed])) + topBottomPadding;
		})
	*/
		//* Color bars
		.style("fill", function(d) {
			return choropleth(d,colorScale);
	});
	
	/*
	//* Chart Title
	var chartTitle = chart.append("text")
		.attr("x", 40)
		.attr("y", 40)
		.attr("class", "chartTitle")
		.text("Number of Variable " + expressed[3] + " in each state");
	*/
	
	//* Update Chart Title
	var chartTitle = d3.select(".chartTitle")
		.text("Number of Variable " + expressed[3] + " in each state");
	
	
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
		.style("stroke", "blue")		//* change stroke color
		// .style("fill", "blue")		//* fill color
		.style("stroke-width","2");		//* change stroke width
	
	console.log(" props.State: ",props.State, " STATE_ABBR: ", props.STATE_ABBR);
	
};  //* end highlight()
	
	
//* -----------------
//* changeAttribute()
//* -----------------
	
//* Dropdown Select Change Listener Handler
function changeAttribute(attribute, csvData) {
	
	console.log("in changeAttribute() ...");
	
	//* Set 'expressed' equal to the attribute selected in
	//* the dropdown menu
	expressed = attribute;
	
	//* Re-create the color scale
	var colorScale = makeColorScale(csvData);
	
	
	//* Get the max value for the selected attribute
	//* Add Wed 3/29/17
	
	var max = d3.max(csvData,function(d){
		return + d[expressed];
	});
	
	//* This helps to scale the max bar height 
	//* based on the different attribute values
	yScale = d3.scaleLinear()
		.range([0,chartHeight])
		.domain([0,max]);
	
	//* Re-color States
	// var state = d3.selectAll(".State")		// Friday, 31-Mar-17
	var state = d3.selectAll(".STATE_ABBR")		// Friday, 31-Mar-17
		.transition()		//* Create a transition from current map
							//* state to target state. Chart is not affected
	
		.duration(1000)		//* Duration in milleseconds
		.style("fill", function(d) {
			console.log("changeAttribute() d.properties: ", d.properties);
			
			return choropleth(d.properties,colorScale)
		});
	
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
	

	
	
})();  //* end self-executing anonymous function
