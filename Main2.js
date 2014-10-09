var checkit = window.check_var;
if(checkit === undefined){ //file never entered. the global var was not set.
    window.check_var = 1;
}
else {
    //your functions.js content 
$(document).ready(function () {
	
	
	//global variables
	var cities;
	var mapYear = 2006;
	var map = L.map('map', {
		center: [37.8, -96],
		zoom: 4,
		minZoom: 4});
control = L.control.layers().addTo(map);
var baseTiles= L.tileLayer('http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png',{
	attribution: 'Acetate tileset from GeoIQ layer'
}).addTo(map)
var altTiles= L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ //'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png'
		attribution: 'Acetate tileset from GeoIQ layer'
	});
control.addBaseLayer(baseTiles,"Basic Basemap")
control.addBaseLayer(altTiles,"OpenStreet Map Basemap")
group = L.featureGroup([])//what is the brackets inside the parenthesis 
//makeCircles()
//function makeCircles(){

$.getJSON("data/airplane.geojson")
	.done(function(data){	

		var info = processData(data);
		console.log(info.timestamps)
		createLegend(info.min,info.max);
		createPropSymbols(info.timestamps, data);



	function createPropSymbols(timestamps, data){

	for(years in timestamps){
		cities = L.geoJson(data,{
			onEachFeature: function(feature, layer){
				
				layer.bindPopup('<b>' + "Airport: " + '</b>' + feature.properties.Airport + " <br>" +
					'<b>' + "Passengers Served: " + '</b>' +Math.round(feature.properties[timestamps[years]] )+" Million"
					);
			},
			pointToLayer: function(feature, latlng){
				return L.circleMarker(latlng, {	
					radius: calcPropRadius(feature.properties[timestamps[years]]),
					fillColor: '#8A2BE2',
					color: '#451671',
				});
			}
			
		 })
		cities._leaflet_id = timestamps[years]
	group.addLayer(cities)
	}
	group.getLayer(mapYear).addTo(map)
	};
	
	function processData(data){

		var timestamps = [];
		
			var min = Infinity; //start at the highest number and then loop to get to the lowest
			var max = -Infinity; //start with the lowest number and loop through to get to highest

		for (var feature in data.features){
			var attributes = data.features[feature].properties;
			for(var attribute in attributes){ //goes through each attribute of the entire feature
				if (attribute != "Airport" &&
					attribute != "City" &&
					attribute !="Code" &&
					attribute != "ID")
				{
					if (attributes[attribute] < min){
						min = attributes[attribute];
					}
					if (attributes[attribute] > max){
						max = attributes[attribute];
					}
					
					if ($.inArray(attribute, timestamps)== -1){
					timestamps.push(attribute); //if the current attribute is not in the timestamps array yet then it will be placed in the value
				}
					 //pushes the value into the array as the next value 
			}
		}; //something is going wrong here
	
	}; //end of processData function 
	return {
		timestamps : timestamps,
		min : Math.round(min),
		max : Math.round(max)	
	};
	}
	function createLegend(min,max){
		var legend = L.control({position: "bottomright"});
		console.log(max)
		console.log(min)

		legend.onAdd = function(map){
			var legendContainer = L.DomUtil.create("div", "legend"); //outter box of legent
			var symbolsContainer = L.DomUtil.create("div", "symbolsContainer");
			var	classes = [min,min+((max-min)/2), max];
			var	legendCircle;
			var	lastRadius = 0;
			var currentRadius;
			var margin;

			L.DomEvent.addListener(legendContainer, 'mousedown', function(e) { //when you click on the legend it wont effect the map, e is the event it is passing
				L.DomEvent.stopPropagation(e); //everything else that was assigned to the leaflet wont be affected in this box
			})

			$(legendContainer).append("<h2 id='legendTitle'>Number of Passengers</h2>"); //add the title

			for (var i=0; i<classes.length; i++){
				
				
				legendCircle = L.DomUtil.create("div", "legendCircle");

				currentRadius = calcPropRadius(classes[i]);

				margin = -currentRadius - lastRadius - 2; //will center the circles within eachother by using the differnt of the radius

				$(legendCircle).css({
					"width" : currentRadius*2 + "px",
					"height" : currentRadius*2 + "px",
					"margin-left" : margin + "px" 
				});
					
				$(legendCircle).append("<span class='legendValue'>"+classes[i]+ " Million" + "<span>");

				$(symbolsContainer).append(legendCircle);

				lastRadius = currentRadius;

			}
			$(legendContainer).append(symbolsContainer);

			return legendContainer;
		};
		
		legend.addTo(map);
		
	}
	});

	function calcPropRadius(attributeValue){
		var scaleFactor = 40;
		var area = attributeValue*scaleFactor;
		return Math.sqrt(area/Math.PI);
	}
	function createSliderUI(){
		console.log("what the hell")
		$( ".selector" ).slider( { min:2006,max: 2013,value: 2006,})
		$( ".selector" ).on( "slidechange", function( event, ui ) {
		
		map.removeLayer(group.getLayer(mapYear))
		mapYear = ui.value
		map.addLayer(group.getLayer(mapYear))
		
		
		//group.getLayer(mapYear).addTo(map)
	
	})
	}
	createSliderUI();
	
	})


}

//layer.setRadius(calcPropRadius(layer.feature.properties[2006]))
