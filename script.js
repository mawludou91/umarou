const GAME_URL = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
	const MOVIE_URL = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
	const KICK_URL = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"

	const fullwidth = 1000;
	const fullheight = 1000;
	const padding = 25;
	const width = fullwidth - 2*padding;
	const height = fullheight - 6*padding;
	
	//Create toolTips DIV
	var toolTips = d3.select("body").append("div")
	  .attr("class", "tooltip")
	  .attr("id", "tooltip")
	  .style("background", "Beige")
	  .style("color", "Black")
	  .style("opacity", 0);	//Hide until mouseover
	  
	Promise.all([
	  d3.json(MOVIE_URL),	//Load Movie Sale Data
	  d3.json(GAME_URL), 	//Load Game Sale Data
	  d3.json(KICK_URL), 	//Load Kickstarter Data
	])
	.then(([movieDataSet,gameDataSet,kickDataSet]) =>  {


		buildSVG("#graph1", movieDataSet);
		buildSVG("#graph2", gameDataSet);
		buildSVG("#graph3", kickDataSet);
		console.log("Script Completed");

	});
	
function buildSVG(svgLocation, dataSet, testSet)
{
	//Create Scales
		
	var colorDomain = dataSet.children.map( function (d) { 
			return d.name; 
		});
//		console.log("colorScale Domain: " + colorDomain);	//Testing - Show all values for ordinal scale			
	
	//Recreate schemeCategory20, which has been deprecated in D3 v5
	var colorRange = ["#1f77b4","#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"];  
	colorRange.sort(function(a, b){return 0.5 - Math.random()});	//Put the array in a random order to mix it up a bit. Makes the colors different each load
//		console.log(colorRange);	//Testing - Show all values for the ordinal range
	
	var colorScale = d3.scaleOrdinal()
		.domain(colorDomain)
		.range(colorRange);	

	//Create SVG
	var svg = d3.select(svgLocation)
		.append("svg")
		.attr("width", fullwidth)
		.attr("height", fullheight)
		.append("g");
	
	
	//Build D3 TreeMap
	var rootNode = d3.hierarchy(dataSet);
	rootNode.sum((d)=> d.value);

	var treemapLayout = d3.treemap()
	  .size([width, height])
	  .paddingOuter(1)
	  .paddingInner(1);

	
	var nodes = rootNode.descendants();
	treemapLayout(rootNode);
	
	var nodes = svg.selectAll('g')
		.data(rootNode.leaves())
		.enter()
		.append('g')
		.attr('transform', (d) => 'translate(' + [(d.x0), (d.y0)] + ')');
	//Add rectangles
	nodes.append('rect')
		.attr("class", "tile")
		.attr("data-name", (d)=> d.data.name)
		.attr("data-category", (d)=> d.data.category)
		.attr("data-value", (d)=> d.data.value)
		.attr('width', (d)=>  (d.x1 - d.x0))
		.attr('height', (d)=> (d.y1 - d.y0))
		.attr("fill", (d)=> colorScale(d.data.category))		
		//Tooltips Mouseover 
		.on("mousemove", function(d,i) {
			toolTips.html("Name: " + d.data.name + "<br/>Category: " + d.data.category + "<br/>Value: " + d.data.value)
			.attr("data-name", d.data.name)
			.attr("data-category", d.data.category)
			.attr("data-value", d.data.value)
			.style("left", (d3.event.pageX + 15) + "px")
			.style("top", (d3.event.pageY - 50) + "px")
			.style("background", colorScale(d.data.category))				
			.style("opacity", 0.9);	//Reveal on mouseover		
		})
		.on("mouseout", function(d,i) {
			toolTips.style("opacity", 0);	//Hide until mouseover		
		});		
		
	//Add label names
	
	//Use foreign object to allow browser to do the word wrapping for us.
	nodes.append("foreignObject")
		.attr("class", "foreignObject")
		.attr("width", (d)=> (d.x1 - d.x0)-0)
		.attr("height", (d)=> (d.y1 - d.y0)-0)
		.style("margin-top", "0")
		//Tooltips Mouseover
		.on("mousemove", function(d,i) {
			toolTips.html("Name: " + d.data.name + "<br/>Category: " + d.data.category + "<br/>Value: " + d.data.value)
			.attr("data-name", d.data.name)
			.attr("data-category", d.data.category)
			.attr("data-value", d.data.value)
			.style("left", (d3.event.pageX + 15) + "px")
			.style("top", (d3.event.pageY - 50) + "px")
			.style("background", colorScale(d.data.category))				
			.style("opacity", 0.9);	//Reveal on mouseover		
		})
		.on("mouseout", function(d,i) {
			toolTips.style("opacity", 0);	//Hide until mouseover		
		})			
		//Add text labels
		.append("xhtml:body")
			.attr("class", "labelbody")
			.append("div")
				.style("background-color", (d)=> colorScale(d.data.category))
				.style("margin", "0")
				.attr("class", "label")
				.attr('class', 'tile-text')	
				.text((d)=> d.data.name)
				.attr("text-anchor", "middle");	
			
	
	//Add SVG Legend 
	var legendSize = 20;
	var legend = svg.append("g")
		.attr("class", "legend")
		.attr("id", "legend");
	
	//Add colored rectangles to legend		
	var currentLabelY = 0;
	var currentLabelX = 0;
	for (var i = 0; i<colorDomain.length; ++i)
	{
		legend.append("rect")
			.attr("class", "legend-item")
			.style("stroke", "black")
			.style("stroke-width", 1.0)
			.attr("x", (d) => currentLabelX*legendSize*5+1)
			.attr("y", (d) => fullheight - padding-1.5*legendSize*currentLabelY)
			.attr("width", (d) => (legendSize*5+1))
			.attr("height",(d) =>  legendSize/2)
			.style("fill", (d) =>  colorScale(colorDomain[i]));
			if ((i+1) % 5 == 0)
			{
				++currentLabelY;
				currentLabelX = 0;
			}
			else 
			{
				currentLabelX = (i+1)%5;
			}
				
	}

	//Add text to legend
	currentLabelY = 0;	
	currentLabelX = 0;
	for (var k = 0; k<colorDomain.length; ++k)
	{
		legend.append("text")
			.attr("x", (d) => currentLabelX*legendSize*5+1)
			.attr("y", (d) => fullheight - padding-5-1.5*legendSize*currentLabelY)
			.text(colorDomain[k]);
		if ((k+1) % 5 == 0)
		{
			++currentLabelY;
			currentLabelX = 0;
		}
		else 
		{
			currentLabelX = (k+1)%5;
		}
	}
		
}
