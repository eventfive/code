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
	// Fotovariablen
	var pictureSource = navigator.camera.PictureSourceType;
	var destinationType = navigator.camera.DestinationType;
}


// JQUERY /////////////////////////////////////////////////////////
jQuery(document).ready(function () {
	jqmReadyDeferred.resolve();   // Hier wird jQuery mitgeteilt, dass es selbst fertig ist
	

	// START screen
	if ( restartApp == true ) {
		// Holt sich die Daten aller aktiven Events UND DANN erst die Usereinstellungen dazu
		// Quasi ein manueler synchroner Prozess, da JSONP das von Haus aus nicht unterstützt
		getEventsData();
		restartApp = false;
	}

	// MENU functions
	$('a[href="#categories"]').on("click", function(event){
		event.preventDefault();
		// Den ersten SELECT Eintrag löschen
		$('#categories .chooseCat .ui-btn-text').empty()
		// Manuell den Text auf das Dropdown-Select klatschen
		$('.chooseCat .ui-icon').html("Auswählen");
		$.mobile.navigate( "#categories" );
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
		// Holt sich die Daten aller aktiven Events UND DANN erst die Usereinstellungen dazu
		// Quasi ein manueler synchroner Prozess, da JSONP das von Haus aus nicht unterstützt
		getEventsData();
		restartApp = false;
	}
	
	
	// Accordion animation
	$('.listanimation').bind('expand', function () {
		$(this).children().slideDown(500);
		}).bind('collapse', function () {
			$(this).children().next().slideUp(500);
	});
	
	// Kommentar Counter
	$('#comment').NobleCount('#counter',{ max_chars: 140 });


	// Benachrichtigungen
	function sendPictureOK() { navigator.notification.alert('Dein Foto wurde abgeschickt!', true, 'Status', 'OK' ); };
	
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
		async: false,
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
					// UND HIER DIE USERDATEN HOLEN
					getUserData();
				  }
	});
};

function getUserData() {
	$.ajax({
		type: "GET",
		contentType: "application/json",
    	dataType: "JSONP",
		crossDomain: true,
		async: false,
		jsonp: 'jsoncallback',
		url: appURL + "app.php?option=getUserData",
		data: { userID: uuid, unique: timestamp },
		cache: false,
		success: function(data){
					if ( $.isEmptyObject(data) ) $('#start .user').fadeIn();
					else { $.each(data, function(i,item) {
								// Event auswählen
								$('.eventID-' + item.selectedEventID + ' .ui-btn-inner').addClass('selected');
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

function getEventCategories(eventID) {
	$('select#chooseCat option').remove();
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
						// Kategerien ausgeben
						$('select#chooseCat').append('<option id="' + item.categoryOrder + '" value="' + item.categoryOrder + '">' + item.categoryTitle + '</option>');
						// ABSCHICKEN Button konfigurieren
						var onClickEventID = "sendPicture(" + item.eventID + ")";
						$("a#sendPicture").attr("onClick", onClickEventID);
					})
					// VERBRAUCHTE Kategorien laden
					getSentPictures(eventID);
				}
	});
}

function getSentPictures(eventID) {
	$.ajax({
		type: "GET",
		contentType: "application/json",
		dataType: "JSONP",
		jsonp: 'jsoncallback',
		url: appURL + "app.php?option=getSentPictures" ,
		data: { userID: uuid, eventID: eventID, unique: timestamp },
		cache: false,
		success: function(data) {
					$.each(data, function(i,item) {
						var disableOption = "select#chooseCat option#" + item.categoryOrder + "";
						$(disableOption).attr('disabled', 'disabled');						
					});
				}
	});
}

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
					// Vorhandene alte Auswahl löschen
					$('.ui-collapsible .ui-btn-inner').removeClass('selected');
					// Neue Auswahl setzen
					$('.eventID-' + eventID + '.ui-collapsible .ui-btn-inner').addClass('selected');
					// Animation wieder anschalten
					$('#categories .chooseCat .ui-btn-text').empty();
					// Alles zuklappen
					$('.listanimation').trigger('collapse');
					// Kategorien der neuen Auswahl laden
					getEventCategories(eventID);
					// Ladespinner ausblenden
					$.mobile.loading('hide');
				 }
	});
}




function sendPicture(eventID) {
	categoryOrder = $('select#chooseCat option:selected').val();
	comment = $.trim($("textarea#comment").val());
	
	if ($('select#chooseCat option:selected').prop('disabled') == true) {
		$('.error.takePicture').html("Du hast schon ein Bild für diese Kategorie abgegeben!").fadeIn();
	}
	else {
		$.ajax({
			type: "POST",
			contentType: "application/json",
    		dataType: "JSONP",
			jsonp: 'jsoncallback',
			url: appURL + "app.php?option=sendPicture" ,
			data: { userID: uuid, eventID: eventID, categoryOrder: categoryOrder, comment: comment, unique: timestamp },
			beforeSend: function() { 
				$.mobile.loading('show');
				$('.error.takePicture').empty()
				},
			cache: false,
			success: function() {
						// Abgebebenes Foto deaktieren
						var selected = "select#chooseCat option[value=" + categoryOrder + "]";
						$('select#chooseCat option:selected').attr('disabled', 'disabled');
						// UI wieder zurücksetzen
						$('#categories .chooseCat .ui-btn-text').empty()
						$('textarea#comment').val("");
						// Benachrichtigung
						sendPictureOK();
						$.mobile.loading('hide');
					 }
		});
	}
};


// Camera ////////////////////////////////////////////////////////////
//Photo URI
function onPhotoURISuccess(imageURI) {
  alert("success");
}
// get from Camera
function capturePhoto() {
  navigator.camera.getPicture(onPhotoURISuccess, null, {
	quality: 75,
	targetWidth: 1024,
	targetHeight: 768,
	correctOrientation: true,
	saveToPhotoAlbum: true,
	destinationType: Camera.DestinationType.FILE_URI });
}