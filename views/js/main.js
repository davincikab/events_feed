//____________________________________________________________________________________________________________
mapboxgl.accessToken = 'pk.eyJ1Ijoiam11bnJvOTYiLCJhIjoiY2tkcWlqeTR0MG41bjM5bGpsNHFscndwNSJ9.2n2zQlpUWgsWUdyF-stmYQ';

var addEventDiv = document.getElementById("addEvent");
var accountMenu = document.getElementById("accountMenu");
var myEventsDiv = document.getElementById("myEvents");
var confirmLocation = document.getElementById("confirm-location");
var confirmLocationForm = document.getElementById("address");
var eventDescriptionForm = document.getElementById("event-description");
var userName = document.getElementById("user-name");
var descriptionFormTitle = document.querySelector(".description-title");
var activePopup;
var isUpdate = false;

var eventLocation = {
	street_number:"",
	street_name:"",
	postcode:"",
	locality:"",
	place:"",
	region:"",
	country:"",
	lat:0,
	lng:0,
};

var eventAddress;
var allEvents = [];
var eventMarkers = [];

var filteredEvents;
var myEvents = [];
var eventDescription = {
	event_id:0,
	added_by:"",	
	event_name:"",
	start_date:"",
	end_date:"",
	start_time:"",
	end_time:"",
	event_description:"",
	photo:"",
	video:""
};	

var updateEventObject = {};


var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11',
	center:[145.03243228257736,-37.838631649862265],
	zoom:8.7
});

// click event lister
map.on('load', function(e) {
	loadEvents();

	map.on('click', function(e) {
		if(userName.innerText == "") {
			// redirect to login
			// window.location.assign('login.php');
		}

		let location = e.lngLat;
		// update eventMarker location
		eventMarker.setLngLat(location);

		// geocode the address
		let address = location.lat +", "+ location.lng;
		console.log(address);

		triggerGeocode(address);
	});
});

var el = document.createElement("div");

	el.classList.add("custom-marker");
	el.innerHTML += "<img src='/static/img/location.png'>";

var eventMarker = new mapboxgl.Marker(
	{
		el:el,
		draggable: true
	}
)
.setLngLat([0, 0])
.addTo(map);

function onDragEnd() {
	var lngLat = eventMarker.getLngLat();

	// geocode the coordinates
}

eventMarker.on('dragend', onDragEnd);

// ___________________________________ Geocoder Control ___________________________________________________ 
var geocoderControl = new MapboxGeocoder({
	accessToken: mapboxgl.accessToken,
	mapboxgl: mapboxgl,
	reverseGeocode:true,
	marker:false,
});

map.addControl(geocoderControl);

// geocoder events
geocoderControl.on('result', function({result}) {
	console.log(result);

	// update the event location information
	let context = result.context;
	context.forEach(ctx => {
		let name = ctx.id;
		name = name.split('.')[0];

		eventLocation[name] = ctx.text;
	});

	eventLocation.lat = result.center[1]
	eventLocation.lng = result.center[0];

	// add street name and number
	let placeName = result.place_name;
	placeName = placeName.split(',')[0];

	// .endsWith("Street") || placeName.endsWith("Avenue")  || placeName.endsWith("Road")
	console.log(placeName);
	if(placeName) {
		let streetNumber = placeName.match(/([0-9]{1,7})/g);
		let streetName = placeName.match(/([a-zA-Z]{1,})/g);

		if(streetNumber[0]) {
			eventLocation.street_number = streetNumber[0];
		} 

		if(streetName[0]) {
			eventLocation.street_name = streetName.join(" ");
		}

		
	} else {
		eventLocation.street_name = "";
		eventLocation.street_number = "";
	}

	// update the location form
	updateLocationForm(eventLocation);

	// toggle confirm location form
	togglePopup(confirmLocation, 'active');

});

// ______________________ Get Events from the database ______________________________________________________
function loadEvents() {
	$.ajax({
		url:'/events/',
		type:'GET',
		success:function(response) {
			console.log(response);

			try {
				allEvents = response;
			} catch (error) {
				console.log(error);
			}

			createEventMarkers(allEvents);
		},
		error:function(error) {
			console.log(error);
		}
	});
} 

function createEventMarkers(events) {
	events.forEach(event => {
		addEventToMap(event);
	});
	
}

function addEventToMap(event) {
	let lngLat = {lng:event.longitude,lat:event.latitude};

	// Create popup content
	var docFrag = document.createDocumentFragment();
	var div = document.createElement("div");

	let address = event.street_number + ' ' + event.street_name + ', ' +event.suburb + ', ' + event.city +', ' +
		event.state +', ' +event.country;

	// inner content
	div.innerHTML += 
		"<div class='popup-header'>"+
		"<h5>"+event.event_name+"</h5>"+
		"<p>"+address+"</p>"+
		"</div>"+
		"<div class='popup-body'>"+
		"<p class='item'><b>Start Date</b>"+event.start_date+"</p>"+
		"<p class='item'><b>End Date</b>"+event.end_date+"</p>"+
		"<p class='item'><b>Time</b>"+event.start_time+ " - "+event.end_time+"</p>"+
		"<p class='item'><b>Added by </b>"+event.added_by+"</p>"+
		"<p class='description'><b>Description</b><br>"+event.event_description+"</p>"+
		"<div class='media-section'>"+
		"<img src='"+event.photo+"'>"+
		"<video width='100%' height='120' controls>"+
		"<source src='"+event.video+"' type='video/mp4'>"+
		"Your browser does not support the video tag."+
		"</video>"+
		"<div>"+
		"</div>";

	docFrag.appendChild(div);

	// read more / read less button
	let button = document.createElement("span");
	button.classList.add("btn");
	button.id = "read-more";

	button.innerHTML = "Read more ...";
	$(button).on("click", function(e) {
		expandPopup();
	});

	docFrag.appendChild(button);

	// event popup
	var popup = new mapboxgl.Popup()
	.setDOMContent(docFrag);

	// custom marker
	var el = document.createElement("div");

	el.classList.add("custom-marker");
	el.innerHTML += "<img src='/static/img/location.png'>";

	console.log(event);

	if(event.added_by) {
		let usersLength = event.added_by.split(',').length;
		if(usersLength > 1) {
			el.innerHTML +=  "<p class='user-count'>"+usersLength+"</p>";
		}
	}
	

	// events marker
	var marker = new mapboxgl.Marker(el)
		.setLngLat(lngLat)
		.setPopup(popup)
		.addTo(map);
	
	eventMarkers.push(marker);
	
	el.addEventListener('click', function(e) {
		if(activePopup) {
			activePopup.remove();
		}

		// display update button and section
		updateEventObject = event;
		toggleUpdateSections(event);

		marker.togglePopup();

		activePopup = popup;
		e.stopPropagation();
	});

	popup.on("close", function(e){
		descriptionFormTitle.innerText = "Add Event";
		$("#event-description button").text("Add Event");

		updateEventButton.classList.toggle("d-none");
		addEventButton.classList.toggle("d-none");
	});

}

function expandPopup(e) {
	// get popup element
	let popup = $(".popup-body");

	console.log(popup);

	if(popup.hasClass("expand-popup")) {
		$("#read-more").text("Read more ...");
	} else {
		$("#read-more").text("Read less");
	}
	// update the class expand
	popup.toggleClass("expand-popup");
	
}

function updateEventMarkers() {
	eventMarkers.forEach(marker => {
		marker.remove();
	});

	loadEvents();
}

// _______________________________ Update section _____________________________________________________________
var updateEventButton = document.getElementById("update-event");
var addEventButton = document.getElementById("add-event");

$(addEventButton).on("click", function(e) {
	map.getCanvas().style.cursor = "url(/static/img/add_button.png), auto";
});

$(updateEventButton).on("click", function(e) {
	isUpdate = true;
	descriptionFormTitle.innerHTML = "Update Event";
	$("#event-description button").text("Update Event");

	console.log(updateEventObject);
	let event = updateEventObject;
	if(event.event_name) {
		// populate update form with data section
		updateEventDescriptionForm(event);

		// event listener to display the update form
		togglePopup(addEventDiv, "active");
	}

});

function toggleUpdateSections() {
	// displAy the button
	updateEventButton.classList.remove("d-none");
	addEventButton.classList.add("d-none");
}

function updateEventDescriptionForm(event) {
	// select all the event form input element
	let inputs = document.querySelectorAll("#event-description input");
	let textArea = document.querySelector("#event-description textarea");

	// update description
	textArea.value = event.event_description;

	// update the form input values
	inputs.forEach(input => {
		let name = input.name;
		if(input.type == "file") {
			return input;
		}

		if(event[name]) {
			input.value = event[name]
		}

		return input;
	});
}

// ______________________ Search events by Name _______________________________________________________________
var searchEventInput = document.getElementById("search-event");
var eventSuggestions = $("#suggestions");

$(searchEventInput).on("input", function(e) {
	let text = this.value;

	if(text == "") {
		eventSuggestions.empty();
		eventSuggestions.html("");

		// hide the suggestion tab
		eventSuggestions.addClass("collapse-suggestions");

		return;
	}

	filterEvents(text);
	eventSuggestions.removeClass("collapse-suggestions");

});

function filterEvents(value) {
	console.log(value);
	let events = JSON.parse(JSON.stringify(allEvents));
	// console.log(events);

	events = events.filter(event => {
		let name = event.event_name.toLowerCase()
		if(name.includes(value.toLowerCase())) {
			return event;
		}
	});

	// create a list of filterd items
	createListItems(events);
}

function createListItems(filteredEvents) {
	console.log(filteredEvents);

	if(filteredEvents.length == 0) {
		eventSuggestions.empty();
		eventSuggestions.html("<p class='text-danger'>No results Found</p>");
	}else {
		let docFrag = document.createDocumentFragment();

		// create a list of items
		filteredEvents.forEach(event => {
			let coordinates = [event.longitude, event.latitude];
			address = event.street_number + " " + event.street_name + " " + event.suburb +
			" " + event.city + event.country;

			var list = document.createElement('li');
            list.className = 'address'
            list.setAttribute('data-coord', coordinates);
            list.setAttribute('data-zoom', 16);
			list.setAttribute('data-title', event.event_name);

			list.innerHTML = event.event_name;
			// <small>'+ address;+'</small>';

            list.addEventListener('click',flyToMarker);

            docFrag.appendChild(list);
		});

		// append the document frag to suggestions tab
		eventSuggestions.empty();
		eventSuggestions.append(docFrag);
	}
}

function flyToMarker(e) {
	let coordinate = this.getAttribute('data-coord');
	let coordinates = coordinate.split(',').map(coord => parseFloat(coord));
	

	const zoom = this.getAttribute('data-zoom');
	
	// update the input with clicked label
	searchEventInput.value = this.getAttribute("data-title");

	// hide the 
	eventSuggestions.addClass("collapse-suggestions");

	// fly to the give location
	map.flyTo({
        center:coordinates,
        essential:true,
        zoom:parseFloat(zoom)
    });
}

// ______________________ Confirm location popup ________________________________________________________________
var confirmLocationInput = document.querySelectorAll("#event-location > input");

confirmLocationInput.forEach(input => {
	// add event listener on input
	input.addEventListener("input", inputEventListener);
});

function inputEventListener(e) {
	console.log(e);

	let target = e.target;
	let name = target.name;
	let value = target.value;

	// update event location object
	eventLocation[name] = value;

	// update the address
	updateEventAddress(eventLocation);
}

function updateEventAddress(locationObject) {
	let values = Object.values(locationObject);

	values = values.slice(0,-2);
	eventAddress = values.join(', ');

	triggerGeocode(eventAddress);
}

// update location form
function updateLocationForm(eventLocation) {
	confirmLocationInput.forEach(input => {
		let name = input.name;

		input.value = eventLocation[name];
	});
}


$(confirmLocationForm).on('submit' , function(e) {
	e.preventDefault();

	// toggle event form
	togglePopup(confirmLocation, "active");

	// update the database with event location
	commitEventLocationToDb(eventLocation);

	// toggle event description tab
	togglePopup(addEventDiv, "active");
});


function commitEventLocationToDb(eventLocation) {
	let street = {};

	let data = {
		street_number:eventLocation.street_number,
		street_name:eventLocation.street_name,	
		added_by:userName.innerText,
		suburb:eventLocation.locality,
		city:eventLocation.place,
		state:eventLocation.region,
		country:eventLocation.country,	
		latitude:eventLocation.lat,
		longitude:eventLocation.lng
	};

	console.log(data);

	// ajax call
	$.ajax({
		url:'files/eventLocation.php',
		data:{data:data},
		type:'POST',
		success:function(response) {
			console.log(response);

			try {
				let res = JSON.parse(response);

				// update eventDescription object
				eventDescription.event_id = res.id;
			} catch (error) {
				console.log(error);
			}
		
		},
		error:function(error) {

		}
	});

}

// _____________________________________ Event Description ______________________________________________________
$(eventDescriptionForm).on("submit", function(e) {
	e.preventDefault();
	
	// get the form data
	let data = $(this).serializeArray();

	console.log(data);

	// update event description
	data.forEach(datum => {
		let name = datum.name;
		eventDescription[name] = datum.value; 
	});

	// 
	let url = 'files/eventDescription.php';
	eventDescription.added_by = userName.innerText;

	 if(isUpdate) {
		url = 'files/eventDescriptionUpdate.php';
		eventDescription.event_id = updateEventObject.event_id;
		eventDescription.description_id = updateEventObject.description_id;
		eventDescription.added_by = updateEventObject.added_by;

		let user = userName.innerText;
		if(eventDescription.added_by.indexOf(user) == -1) {
			eventDescription.added_by += "," + user;
		}
	}

	console.log(eventDescription);

	// create a FormData object
	var fd = new FormData();

	Object.keys(eventDescription).forEach(key => {
		fd.append(key, eventDescription[key]);
	});

	// add file
	var files = $('#file')[0].files[0];
	fd.append('file',files);

	console.log(fd);

	// submit the data
	$.ajax({
		url:url,
		type:'POST',
		data:fd,
		dataType: 'json',
		contentType: false,
		processData:false,
		success:function(response) {
			console.log(response);
			if(response.message.includes="success") {
				updateEventMarkers();
				togglePopup(addEventDiv, "active");
			} else {
				alert(response.message);
			}

			// reset the form values
			eventDescriptionForm.reset();

			if(isUpdate) {
				// toggle create section
				descriptionFormTitle.innerText = "Add Event";
				$("#event-description button").text("Add Event");

				updateEventButton.classList.toggle("d-none");
				addEventButton.classList.toggle("d-none");

				// update the markers and popup
				isUpdate = false;
				updateEventObject = {};

				// togglePopup(addEventDiv, "active");
			}

			// toggle the form
			// togglePopup(addEventDiv, "active");
			
		},
		error:function(error) {
			// alert("error");
			console.log(error);
		}
	});

});

// ______________________________________________________________________________________________________________
function account(){
	accountMenu.classList.toggle("active");
}

function addEvent(){
	// change the map pointer
	// map.getCanvas().style.cursor = 'url(img/location.png), auto;'
	map.getCanvas().style.cursor = 'crosshair';

	// geocode the data and update the marker


	// addEventButton.classList.toggle("active");
}

function myEvents(){

	// read events from the database.
	myEventsButton.classList.toggle("active");
}


//________________________________________________________ Helper function ________________________________________________
function togglePopup(element, toggleClass="active") {
	element.classList.toggle(toggleClass);
}

function triggerGeocode(address) {
	map.setZoom(8.2);
	// update the input
	geocoderControl.setInput(address);

	// query the
	geocoderControl.query(address);
}

// ______________________________________________________________________________________________________________



//  TODO: Style the popup and call loadEvents on add or update;



