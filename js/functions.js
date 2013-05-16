// Zeit in Millisekunden wird an jeden Request angehangen um ihn unique zu machen (Safari Bug)
var date = new Date();
var timestamp = date.getTime();
// Config & Variablen
var deviceReadyDeferred = jQuery.Deferred();
var jqmReadyDeferred = jQuery.Deferred();
var appURL = "http://kiste.eventfive.de/asd/"
var uuid, platform, osVersion;
var restartApp = true;
var username, eventID;
// Dummy Daten für lokales testen
var uuid = "10", platform = "Desktop", osVersion = "0";


// PHONEGAP ///////////////////////////////////////////////////////
document.addEventListener("deviceReady", deviceReady, false);
function deviceReady() {		
	deviceReadyDeferred.resolve();  // Wie oben benannt wird jQuery nun mitgeteilt, dass deviceReady() fertig ist
}


// JQUERY /////////////////////////////////////////////////////////
jQuery(document).ready(function () {
	jqmReadyDeferred.resolve();   // Hier wird jQuery mitgeteilt, dass es selbst fertig ist
	
	// Accordion animation
	$('.listanimation').bind('expand', function () {
		$(this).children().slideDown(500);
		}).bind('collapse', function () {
			$(this).children().next().slideUp(500);
	});
	
	// Kommentar Counter
	$('#comment').NobleCount('#counter',{ max_chars: 140 });
	
	
	
			

	// MENU functions
	$('a[href="#welcome"]').on("click", function(event){
		// Seitenwechsel abbrechen
		// event.preventDefault();
	});
	$('a[href="#events"]').on("click", function(event){
		/*event.preventDefault();
		getEventsData();
		$.mobile.navigate( "#events" );*/
	});

});


// PHONEGAP & JQUERY //////////////////////////////////////////////
// Hier legen wir fest, dass sobald jQuery und PhoneGap bereit sind, die Funktion "doWhenBothFrameworksLoaded" aufgerufen wird
jQuery.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);
// Ab hier können alle App-Funktionen laufen!
function doWhenBothFrameworksLoaded() {
	
	// GeräteInfos auslesen
	uuid = device.uuid;
	platform = device.platform;
	osVersion = device.version;


	// START screen
	if ( restartApp == true ) {
		getEventsData();
		getUserData();
		restartApp = false;
	}
	
	
}

/////// FUNKTIONEN //////////////////////

function getEventsData() {
	// Vorher 
	$('#eventCollapsible').empty()
	$.ajax({
		type: "GET",
		contentType: "application/json",
    	dataType: "JSONP",
		crossDomain: true,
		jsonp: 'jsoncallback',
		url: appURL + "app.php?option=getEventsData",
		data: { userID: uuid, unique: timestamp },
		//beforeSend: function() { $.mobile.loading('show') },
		cache: false,
		success: function(data){
			$.each(data, function(i,item){
				$('#eventCollapsible').append(
				'<div data-role="collapsible" class="listanimation eventID-' + item.eventID +'">' +
					'<h3>' + item.eventTitle + '</h3>' +
					'<div class="description">' +
						'<div class="logo"><img src="' + appURL + 'events/' + item.eventID + '/' + item.eventLogo + '" width="100%"/></div>' +
						'<div class="time">' +
							'<span class="date">' + item.eventDate + '</span>' +
                            '<span class="clock">' + item.eventTime + '</span>' +
                        '</div>' +
						'<br class="clear" />' +
						'<div class="text">' + item.eventDescription + '</div>' +
                    '</div>' +
					'<div class="select"><a class="button" onClick="selectEvent(' + item.eventID + ')">Auswählen</a></div>' +
					'<br class="clear" />' +
				'</div>'
				).trigger('create');
			})
		},
	});
};

function getUserData() {
	$.ajax({
		type: "GET",
		contentType: "application/json",
    	dataType: "JSONP",
		crossDomain: true,
		jsonp: 'jsoncallback',
		url: appURL + "app.php?option=getUserData",
		data: { userID: uuid, unique: timestamp },
		cache: false,
		success: function(data){
					if ( $.isEmptyObject(data) ) $('#start .user').fadeIn();
					else { $.each(data, function(i,item) {
								// Event auswählen
								$('.eventID-' + item.selectedEventID + '.ui-collapsible .ui-btn-inner').addClass('selected');
								// Kategorien laden
								getEventCategories(item.selectedEventID);
								// Username einsetzen
								$('span.username').html(item.username);
								// Weiterleitung
								$.mobile.navigate( "#welcome" );
							})
					}
			}
	});
};
	

function saveName() {
	username = $.trim($("input#username").val());
	if ( username.length > 0 ) {
		$.ajax({
			type: "POST",
			contentType: "application/json",
    		dataType: "JSONP",
			jsonp: 'jsoncallback',
			url: appURL + "app.php?option=saveName" ,
			data: { userID: uuid, platform: platform, osVersion: osVersion, username: username, unique: timestamp },
			beforeSend: function() { $.mobile.loading('show') },
			cache: false,
			success: function() {
				$('span.username').html(username);
				$.mobile.navigate( "#welcome" );
				}
		});
	}
	else { $('.error.username').hide().html("Bitte nenn uns doch einen Namen").fadeIn(); }
};


function selectEvent(eventID) {
	$.ajax({
		type: "POST",
		contentType: "application/json",
		dataType: "JSONP",
		jsonp: 'jsoncallback',
		url: appURL + "app.php?option=selectEvent" ,
		data: { userID: uuid, eventID: eventID, unique: timestamp },
		beforeSend: function() { $.mobile.loading('show') },
		cache: false,
		success: function() {
			$('.ui-collapsible .ui-btn-inner').removeClass('selected');
			$('.eventID-' + eventID + '.ui-collapsible .ui-btn-inner').addClass('selected');
			$('.listanimation').trigger('collapse');
			getEventCategories(eventID);
			$.mobile.loading('hide');
			}
	});
}

function getEventCategories(eventID) {
	$('.categoryOption').remove();
	$.ajax({
		type: "GET",
		contentType: "application/json",
		dataType: "JSONP",
		jsonp: 'jsoncallback',
		url: appURL + "app.php?option=getEventCategories" ,
		data: { userID: uuid, eventID: eventID, unique: timestamp },
		cache: false,
		success: function(data) {
					$.each(data, function(i,item) {
						$('select#chooseCat').append('<option class="categoryOption" value="' + i + '">' + item.categoryTitle + '</option>');
					});
				}
	});
}