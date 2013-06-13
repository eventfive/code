// Zeit in Millisekunden wird an jeden Request angehangen um ihn unique zu machen (Safari Bug)
var date = new Date();
var timestamp = date.getTime();
// Config & Variablen
var deviceReadyDeferred = jQuery.Deferred();
var jqmReadyDeferred = jQuery.Deferred();
var appURL = "http://voivoi.eventfive.de/"
var uuid, platform, osVersion;
var restartApp = true;
var username, eventID, forGallery, categoryOrder, galleryEventID, galleryCategoryOrder;
// Dummy Daten für lokales testen
var uuid = "69", platform = "Desktop", osVersion = "0";


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

	// lokales testen
	if ( platform = "Desktop" ) {
		if ( restartApp == true ) {
			$.mobile.loading('show');
			// Holt sich die Daten aller aktiven Events UND DANN erst die Usereinstellungen dazu
			// Quasi ein manueler synchroner Prozess, da JSONP das von Haus aus nicht unterstützt
			getEventsData(0);
			restartApp = false;
		}
	}
	
	$( '#categories' ).on( "pageshow", function( event ) {
		reloadCategories();		
	});
	
	// Bei Tap auf Gallery werden alle Bilder des Events geladen
	$('a[href="#gallery"]').on("click", function(event){
		event.preventDefault();
		$.mobile.loading('show');
		eventID = $('input#eventID').val();
		getPictureGallery(eventID,0,0);
		getEventsData(1);
	});
	
	$("#gallery").on('pageshow', function( event ) {
		// Manuell den Text auf das Dropdown-Select klatschen
		$('#eventCollapsible .step .ui-icon').html("Auswählen");	
	});
	
	// Dropdown EVENT
	$("#chooseEvent").on('change',function(){
		$.mobile.loading('show');
		// Einstellungen speichern
		galleryEventID = $(this).find(':selected').val();
		$('input#galleryEventID').val(galleryEventID);
		// Kategorien & Bilder abrufen
		getEventCategories(galleryEventID,1)
		getPictureGallery(galleryEventID,0,0);
	});
	// Dopdown KATEGORIE
	$("#chooseCatGallery").on('change',function(){
		$.mobile.loading('show');
		// Event lesen
		galleryEventID = $('input#galleryEventID').val();
		// Einstellungen speichern
		galleryCategoryOrder = $(this).find(':selected').val();
		$('input#galleryCategoryOrder').val(galleryCategoryOrder);
		// Nur Bilder aus der Kategorie abrufen
		getPictureGallery(galleryEventID,galleryCategoryOrder,0);
	});
	$('a#onlyUserPictures').on("click", function(event){
		event.preventDefault();
		$.mobile.loading('show');
		galleryEventID = $('input#galleryEventID').val();
		getPictureGallery(galleryEventID,0,1);
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
		getEventsData(0);
		restartApp = false;
	}
		
}

/////// FUNKTIONEN AJAX //////////////////////

function getEventsData(forGallery) {
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
		data: { userID: uuid, forGallery: forGallery, unique: timestamp },
		//beforeSend: function() { $.mobile.loading('show') },
		cache: false,
		success: function(data){
					// Falls KEINE AKTIVEN Veranstaltungen verfügbar sind
					if ( $.isEmptyObject(data) ) {
						// "Kein Event verfügbar" einblenden
						$('.noEventActive').show();
					}
					// Ansonsten abgefragte Daten überall einfügen
					else { 
						if ( forGallery == 1 ) {
							// Alte Events löschen
							$('select#chooseEvent').empty()
							$.each(data, function(i,item){
								// Kategerien ausgeben
								$('select#chooseEvent').append('<option id="' + item.eventID + '" value="' + item.eventID + '">' + item.eventTitle + '</option>');
							})
						}
						// Ansonsten nur die aktivierten Evets zum Auswählen holen...
						else {
							$.each(data, function(i,item){
								$('#eventCollapsible').append(
									'<div data-role="collapsible" class="listanimation eventID-' + item.eventID +'">' +
										'<h3>' + item.eventTitle + '</h3>' +
										'<div class="description">' +
											'<div class="logo"><img src="' + appURL + 'events/' + item.eventID + '/' + item.eventLogo + '" width="100%"/></div>' +
											'<div class="time">' +
												'<span class="date">' + item.eventDate + '</span>' +
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
					}
					// Accordion animation
					$(document).on('expand', '.ui-collapsible', function() {
						$(this).children().next().hide();
						$(this).children().next().slideDown(500);
					})
					$(document).on('collapse', '.ui-collapsible', function() {
						$(this).children().next().slideUp(500);
					});
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
					// Falls noch KEIN Username vorhanden ist
					if ( $.isEmptyObject(data) ) {
						// UI ausblenden
						$('.eventSelected').hide();
						// "Event auswählen" einblenden
						$('.eventMissing').show();
						// Loader ausblenden
						$.mobile.loading('hide');
						// User Registrierung einblenden
						$('#start .user').fadeIn();
					}
					// Ansonsten abgefragte Daten überall einfügen
					else { $.each(data, function(i,item) {
								// Falls noch GARKEIN Event jemals ausgewählt wurde
								if ( item.selectedEventID == null ) {
									// UI ausblenden
									$('.eventSelected').hide();
									// "Event auswählen" einblenden
									$('.eventMissing').show();
								}
								else {
									// Falls schonmal ein Event ausgewählt wurde, aber ABGELAUFEN ist
									if ( item.eventDisabled == "1" ) {
										// UI ausblenden
										$('.eventSelected').hide();
										// "Event auswählen" einblenden
										$('.eventMissing').show();
									}
									else {
										// Event auswählen
										$('.eventID-' + item.selectedEventID + ' .ui-btn-inner').addClass('selected');
										// Ausgewähltes Event speichern
										$('input#eventID').val(item.selectedEventID);
										// Kategorien laden
										getEventCategories(item.selectedEventID,false);
									}
									// Username einsetzen
									$('span.username').html(item.username);
								}
								// Loader ausschalten
								$.mobile.loading('hide');
								// Weiterleitung
								$.mobile.navigate( "#welcome" );
							})
					}
				}
	});
};

function getEventCategories(eventID,forGallery) {
	$('select#chooseCat option').remove();
	$.ajax({
		type: "GET",
		contentType: "application/json",
		dataType: "JSONP",
		jsonp: 'jsoncallback',
		url: appURL + "app.php?option=getEventCategories" ,
		data: { userID: uuid, eventID: eventID, forGallery: forGallery, unique: timestamp },
		cache: false,
		success: function(data) {
					if ( forGallery == 1 ) {
						// Alte Kategorien löschen
						$('select#chooseCatGallery').empty()
						$.each(data, function(i,item) {
							// Kategerien ausgeben
							$('select#chooseCatGallery').append('<option id="' + item.categoryOrder + '" value="' + item.categoryOrder + '">' + item.categoryTitle + '</option>');
						})
					}
					else {
						$.each(data, function(i,item) {
							// Kategerien ausgeben
							$('select#chooseCat').append('<option id="' + item.categoryOrder + '" value="' + item.categoryOrder + '">' + item.categoryTitle + '</option>');
							// ABSCHICKEN Button konfigurieren
							var onClickEventID = "sendPicture(" + item.eventID + ")";
							$("a#sendPicture").attr("onClick", onClickEventID);
						})
						// VERBRAUCHTE Kategorien laden
						getSentPictures();
					}
				}
	});
}

function getSentPictures() {
	// Aktuelle EventID lesen
	eventID = $('input#eventID').val();
	
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

function getPictureGallery(eventID,categoryOrder,onlyUsersPictures) {
	// Alte Fotos löschen
	$('.content.list.images').empty()
	// Neue Fotos holen
	$.ajax({
		type: "GET",
		contentType: "application/json",
		dataType: "JSONP",
		jsonp: 'jsoncallback',
		url: appURL + "app.php?option=getPictureGallery" ,
		data: { userID: uuid, eventID: eventID, categoryOrder: categoryOrder, onlyUsersPictures: onlyUsersPictures, unique: timestamp },
		cache: false,
		success: function(data) {
					// Alte Bilder löschen
					$('#categories .chooseCat .ui-btn-text').empty();
					// Neue Laden
					$.each(data, function(i,item) {
						// Gallerie Titel ändern
						$('h1#eventTitle').html(item.eventTitle);
						// Bilder laden
						$('.content.list.images').append(
							'<div class="imageWrapper">' +
								'<a href="' + appURL + 'events/' + item.eventID + '/uploads/' + item.categoryOrder + '_' + item.userID + '.jpg" rel="external" category="' + item.categoryTitle + '">' +
									'<div class="thumbnail">' +
										'<img src="res/app/background.gif" data-original="' + appURL + 'events/' + item.eventID + '/uploads/' + item.categoryOrder + '_' + item.userID + '.jpg" />' +
										'<div class="details">' +
											'<h2>' + item.categoryTitle + '</h2>' +
											'<span>Von: ' + item.username + '</span>' +
											'<span class="text">Kommentar: ' + item.comment + '</span>' +
											'<span class="time">' + item.timestamp + '</span>' +
										'</div>' +
									'</div>' +
								'</a>' +
							'</div>'
							);
					});
					// Lazyload aktivieren
					$(".imageWrapper").find("img").lazyload( {
						effect: "fadeIn",
					});
					// Lazyload funktioniert erst ab dem SCROLL Event, also 1px scrollen damit die Bilder geladen werden
					$.mobile.silentScroll(1);
					// Popup aktivieren
					$('.imageWrapper a').magnificPopup({ 
					  type: 'image',
					  image: { titleSrc: 'category', }
					});
					// Zur Ansicht wechseln
					$.mobile.navigate( "#gallery" );
					// Spinner ausblenden
					$.mobile.loading('hide');
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
			beforeSend: function() {
				$(".user").hide();
				$.mobile.loading('show')
				},
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
					// EventID abspeichern
					$('input#eventID').val(eventID);
					// Kategorien der neuen Auswahl laden
					getEventCategories(eventID);
					// "Event auswählen" ausblenden
					$('.eventMissing').hide();
					// UI einblenden
					$('.eventSelected').show();
					// Ladespinner ausblenden
					$.mobile.loading('hide');
				 }
	});
}

function sendMail() {
	var contactName = $.trim($("#contactName").val());
	var contactEmail = $.trim($("#contactEmail").val());
	var contactMessage = $.trim($("#contactMessage").val());
	var contactVersion = $.trim($("#contactVersion").val());
	
	$.ajax({
		type: "GET",
		contentType: "application/json",
		dataType: "JSONP",
		jsonp: 'jsoncallback',
		url: appURL + "mail.php?option=fromApp" ,
		data: { contactName: contactName, contactEmail: contactEmail, contactMessage: contactMessage, contactVersion: contactVersion, unique: timestamp },
		beforeSend: function() { $.mobile.loading('show') },
		cache: false,
		success: function() {
					$.mobile.loading('hide');
					navigator.notification.alert('Deine Nachricht wurde abgeschickt!', true, 'Fertig', 'OK' );
				 }
	});
}


function sendPicture() {
	// Aktuelle EventID lesen
	eventID = $('input#eventID').val();
	
	// Warnungen
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
		ft.upload(imageURI, appURL + "app.php?option=sendPicture", sendPictureOK, sendPictureFAIL, options, true);
	}
	
};

// Kategorieansicht immer wieder zurücksetzen...
function reloadCategories() {
	// Verbrauchte Kategorien laden
	getSentPictures();
	// Den ersten SELECT Eintrag löschen
	$('#categories .chooseCat .ui-btn-text').empty()
	// Manuell den Text auf das Dropdown-Select klatschen
	$('.chooseCat .ui-icon').html("Auswählen");
	// Kommentar entfernen
	$('textarea#comment').val('');
	// Kommentar Counter zurücksetzen
	$('#comment').NobleCount('#counter',{ max_chars: 140 });
	// Altes Bild aus dem TEMP löschen
	$('#pictureFromCamera').removeAttr("src")
	// "Bild aufgenommen"-Meldung ausblenden
	$('.pictureFromCameraOK').hide();
	// Warnungen ausblenden
	$('.error.takePicture').empty();
}


/////// FUNKTIONEN PHONEGAP //////////////////////
// get from Camera
function capturePhoto() {
  navigator.camera.getPicture(onPhotoURISuccess, null, {
	quality: 60,
	targetWidth: 1024,
	targetHeight: 768,
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
	navigator.notification.alert('Dein Foto wurde abgeschickt!', reloadCategories(), 'Fertig', 'OK' );
	// Spinner ausblenden
	$.mobile.loading('hide');
	}
function sendPictureFAIL(error) {
	$.mobile.loading('hide');
	navigator.notification.alert("Beim Senden ist ein Fehler aufgetreten. Fehlercode: " + error.code + ". Versuch es noch einmal!", true, 'Fehler', 'OK' );
	}
	