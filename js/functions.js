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
var uuid = "100", platform = "Desktop", osVersion = "0";


// PHONEGAP ///////////////////////////////////////////////////////
document.addEventListener("deviceReady", deviceReady, false);
function deviceReady() {		
	deviceReadyDeferred.resolve();  // Wie oben benannt wird jQuery nun mitgeteilt, dass deviceReady() fertig ist
	// Fotovariablen
	var pictureSource = navigator.camera.PictureSourceType;
	var destinationType = navigator.camera.DestinationType;
}
document.addEventListener("offline", onOffline, false);
function onOffline() { navigator.notification.confirm( 'Bitte verbinde dich mit dem Internet um diese App nutzen zu können.', onConfirm, 'Fehler', 'Nochmal versuchen,Beenden' ) }
function onConfirm(buttonIndex) {
	if ( buttonIndex == "1" ) location.reload();
	if ( buttonIndex == "2" ) navigator.app.exitApp()
}


// JQUERY /////////////////////////////////////////////////////////
jQuery(document).ready(function () {
	jqmReadyDeferred.resolve();   // Hier wird jQuery mitgeteilt, dass es selbst fertig ist

	
	// MENU functions
	$('a[href="#categories"]').on("click", function(event){
		event.preventDefault();
		//$('#chooseCat').trigger('create');
		// Den ersten SELECT Eintrag löschen
		$('#categories .chooseCat .ui-btn-text').empty()
		// Manuell den Text auf das Dropdown-Select klatschen
		$('.chooseCat .ui-icon').html("Auswählen");
		$.mobile.navigate( "#categories" );
		// Den ersten SELECT Eintrag löschen
		$('#categories .chooseCat .ui-btn-text').empty()
		// Manuell den Text auf das Dropdown-Select klatschen
		$('.chooseCat .ui-icon').html("Auswählen");
		$.mobile.navigate( "#categories" );
	});
	
	$('a[href="#gallery"]').on("click", function(event){
		event.preventDefault();
		getPictureGallery();
		$.mobile.navigate( "#gallery" );
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
		$.mobile.loading('show')
		// Holt sich die Daten aller aktiven Events UND DANN erst die Usereinstellungen dazu
		// Quasi ein manueler synchroner Prozess, da JSONP das von Haus aus nicht unterstützt
		getEventsData();
		restartApp = false;
	}
	
	
	// Kommentar Counter
	$('#comment').NobleCount('#counter',{ max_chars: 140 });

	
}

/////// FUNKTIONEN AJAX //////////////////////

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
					// Accordion animation
					$('.listanimation').bind('expand', function () {
						$(this).children().slideDown(500);
						}).bind('collapse', function () {
							$(this).children().next().slideUp(500);
					});
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
					// FALLS noch keine Daten vorhanden sind
					if ( $.isEmptyObject(data) ) {
						// "Event auswählen" einblenden
						$('.yesEvent').hide();
						$('.noEvent').show();
						// Loader ausblenden
						$.mobile.loading('hide');
						// User Registrierung einblenden
						$('#start .user').fadeIn();
					}
					// Ansonsten abgefragte Daten überall einfügen
					else { $.each(data, function(i,item) {
								// Event auswählen
								$('.eventID-' + item.selectedEventID + ' .ui-btn-inner').addClass('selected');
								// Kategorien laden
								getEventCategories(item.selectedEventID);
								// Username einsetzen
								$('span.username').html(item.username);
								// Loader ausschalten
								$.mobile.loading('hide');
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

function getPictureGallery() {
	$.ajax({
		type: "GET",
		contentType: "application/json",
		dataType: "JSONP",
		jsonp: 'jsoncallback',
		url: appURL + "app.php?option=getPictureGallery" ,
		data: { userID: uuid, eventID: "2", unique: timestamp },
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
	if ($('select#chooseCat option:selected').prop('disabled') == true) {
		$('.error.takePicture').html("Du hast schon ein Bild für diese Kategorie abgegeben!").fadeIn();
	}
	else if (!$('#pictureFromCamera').attr('src')) {
		$('.error.takePicture').html("Nicht so voreilig, du musst vorher noch ein Bild aufnehmen!").fadeIn();
	}
	else {
		// Spinner anschalten
		$.mobile.loading('show');
		
		// Parameter die über POST mitgesendet werden
		var imageURI = $('#pictureFromCamera').attr("src");
		var params = new Object();
			params.userID = uuid;
			params.eventID = eventID;
			params.categoryOrder = $('select#chooseCat option:selected').val();
			params.comment = $.trim($("textarea#comment").val());
		
		// Man muss Optionen festlegen, wie und als was die Daten gesendet werden
		var options = new FileUploadOptions();
			options.fileKey = "file";
			options.fileName = imageURI.substr(imageURI.lastIndexOf('/')+1);
			options.mimeType = "image/jpeg";
			options.params = params;
		
		// Und nun hochladen
		var ft = new FileTransfer();
		ft.upload(imageURI, appURL + "app.php?option=sendPicture", sendPictureOK, sendPictureFAIL, options);
	}
	
};


/////// FUNKTIONEN PHONEGAP //////////////////////
// get from Camera
function capturePhoto() {
  navigator.camera.getPicture(onPhotoURISuccess, null, {
	quality: 90,
	targetWidth: 2048,
	targetHeight: 1536,
	correctOrientation: true,
	saveToPhotoAlbum: false,
	destinationType: Camera.DestinationType.FILE_URI });
}
function onPhotoURISuccess(imageURI) {
	// Bild in das HTML-Dokument laden
	var image = document.getElementById('pictureFromCamera');
	image.src = imageURI;
	// Bestätigung anzeigen
	$('.pictureFromCameraOK').show();
}

// Benachrichtigungen
function sendPictureOK() { 
	// UI zurücksetzen
	$('#pictureFromCamera').removeAttr("src")
	$('textarea#comment').val('');
	$('#comment').NobleCount('#counter',{ max_chars: 140 });
	$('.pictureFromCameraOK').hide();
	// Spinner ausblenden
	$.mobile.loading('hide');
	navigator.notification.alert('Dein Foto wurde abgeschickt!', true, 'Status', 'OK' );
	}
function sendPictureFAIL(error) {
	$.mobile.loading('hide');
	alert("Beim Senden ist ein Fehler aufgetreten. Fehlercode: " + error.code);
	}